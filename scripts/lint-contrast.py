#!/usr/bin/env python3
"""WCAG contrast lint — hits every route, fails on any text element below 4.5:1.

Usage:
    python3 scripts/lint-contrast.py [--base http://localhost:3000]
                                     [--gateway http://localhost:8081]
                                     [--email owner@demo.choopoo.cn]

Exits non-zero if any page has at least one violation. Prints a deduplicated
list (one row per unique class+fg+bg combination per page) so the same rule
firing 30 times doesn't drown you.

This script is the load-bearing check behind docs/design.md — see
docs/decisions.md (2026-04-17) for the worked example.
"""
from __future__ import annotations
import argparse
import json
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.stderr.write("playwright not installed. Run: pip install playwright && playwright install chromium\n")
    sys.exit(2)

ROUTES = [
    "/",
    "/?view=materials",
    "/materials",
    "/materials/TDI",
    "/products",
    "/macro",
    "/copilot",
    "/sources",
    "/status",
    "/goals/new",
]

# Ratio threshold. Tailwind/Bloomberg-feel mono caps labels at 11px get a
# slight pass for being uppercase + tracked, but we don't carve that out here.
THRESHOLD = 4.5

# Inlined into the page so we can scrape contrast without 50 round-trips.
SCRAPE_JS = """() => {
    function lin(c){ c=c/255; return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4); }
    function lum(rgb){ return .2126*lin(rgb[0])+.7152*lin(rgb[1])+.0722*lin(rgb[2]); }
    function ratio(a,b){ const A=lum(a)+.05, B=lum(b)+.05; return Math.max(A,B)/Math.min(A,B); }
    function parse(s){
        const m = s.match(/rgba?\\(([^)]+)\\)/);
        if (!m) return null;
        const p = m[1].split(',').map(x => parseFloat(x.trim()));
        if (p.length < 3) return null;
        if (p.length === 4 && p[3] < 0.5) return null;
        return [p[0], p[1], p[2]];
    }
    function bgOf(el){
        let cur = el;
        while (cur) {
            const cs = getComputedStyle(cur);
            const bg = parse(cs.backgroundColor);
            if (bg) return bg;
            cur = cur.parentElement;
        }
        return [11, 12, 15];
    }
    const fails = [];
    for (const el of document.querySelectorAll('*')) {
        if (!el.textContent || el.textContent.trim().length === 0) continue;
        // Skip wrappers — we only want elements whose own text is rendered.
        if (el.children.length > 0
            && [...el.childNodes].every(n => n.nodeType !== 3 || !n.textContent.trim())) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const fg = parse(cs.color);
        if (!fg) continue;
        const bg = bgOf(el);
        const r = ratio(fg, bg);
        if (r < %THRESHOLD%) {
            fails.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className.toString() || '').slice(0, 80),
                fg, bg,
                ratio: Math.round(r * 100) / 100,
                text: el.textContent.trim().slice(0, 60),
            });
        }
    }
    const seen = new Map();
    for (const f of fails) {
        const k = `${f.cls}|${f.fg.join(',')}|${f.bg.join(',')}`;
        if (!seen.has(k)) seen.set(k, f);
    }
    return [...seen.values()];
}"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://localhost:3000")
    ap.add_argument("--gateway", default="http://localhost:8081")
    ap.add_argument("--email", default="owner@demo.choopoo.cn")
    args = ap.parse_args()

    js = SCRAPE_JS.replace("%THRESHOLD%", str(THRESHOLD))
    total_fails = 0
    by_page: dict[str, list] = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1400, "height": 900})
        page = ctx.new_page()

        # Magic-link login (dev mode).
        res = page.request.post(
            f"{args.gateway}/auth/magic-link",
            data=json.dumps({"email": args.email}),
            headers={"Content-Type": "application/json"},
        )
        if not res.ok:
            sys.stderr.write(f"magic-link request failed: {res.status}\n")
            sys.exit(2)
        body = res.json()
        page.goto(body["dev_link"], wait_until="networkidle")

        for route in ROUTES:
            page.goto(f"{args.base}{route}", wait_until="networkidle")
            page.wait_for_timeout(400)
            bad = page.evaluate(js)
            by_page[route] = bad
            total_fails += len(bad)

        browser.close()

    if total_fails == 0:
        print(f"OK · {len(ROUTES)} routes · 0 contrast violations (threshold {THRESHOLD})")
        return 0

    print(f"FAIL · {total_fails} unique violation(s) across {len(ROUTES)} routes\n")
    for route, fails in by_page.items():
        if not fails:
            continue
        print(f"  {route}")
        for f in fails:
            print(f"    {f['ratio']:>5.2f}  <{f['tag']} class=\"{f['cls']}\">  fg={tuple(f['fg'])} bg={tuple(f['bg'])}  \"{f['text']}\"")
        print()
    return 1


if __name__ == "__main__":
    sys.exit(main())
