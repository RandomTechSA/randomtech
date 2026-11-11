from pathlib import Path

root = Path(__file__).parent
files = ["contact.html", "tracking.html", "shipping.html", "returns.html", "privacy.html", "admin.html"]
old_font_900 = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap"
old_font = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
new_font = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
fa = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">'
brand_link = fa + '\n    <link rel="stylesheet" href="css/brand.css">'

old_logo = """<a href="index.html" class="flex items-center gap-2.5 shrink-0">
                <div>
                    <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Random<span class="text-emerald-600">tech</span></span>"""
new_logo = """<a href="index.html" class="flex items-center gap-2.5 shrink-0">
                <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v3M12 18v3M4.9 6.5l2.1 2.1M17 15.4l2.1 2.1M3 12h3M18 12h3M4.9 17.5 7 15.4M17 8.6l2.1-2.1"/><circle cx="12" cy="12" r="4.2"/></svg></span>
                <div>
                    <span class="text-xl font-black text-gray-900 dark:text-white tracking-tight">Random<span class="text-emerald-600">tech</span></span>"""

for name in files:
    p = root / name
    t = p.read_text(encoding="utf-8")
    t = t.replace(old_font_900, new_font)
    t = t.replace(old_font, new_font)
    t = t.replace(
        "fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] }",
        "fontFamily: { sans: ['Outfit', 'sans-serif'], display: ['Instrument Serif', 'serif'] }",
    )
    if "css/brand.css" not in t and fa in t:
        t = t.replace(fa, brand_link, 1)
    t = t.replace(
        "bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900",
        "utility-bar text-emerald-100 text-xs py-2.5 px-4 border-b border-white/5",
    )
    t = t.replace(
        "sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors",
        "sticky top-0 z-40 glass-nav transition-colors",
    )
    t = t.replace(
        'footer class="bg-gray-900 text-gray-400 py-16 border-t border-gray-800',
        'footer class="site-footer text-gray-400 py-16 border-t border-white/5',
    )
    t = t.replace(old_logo, new_logo)
    t = t.replace("&copy; 2024 Randomtech. All rights reserved.", "&copy; 2026 Randomtech. All rights reserved.")
    if name != "admin.html" and "wa-fab" not in t:
        t = t.replace(
            "</body>",
            '    <a href="https://wa.me/27827263274?text=Hello%20Randomtech,%20I%20need%20help." target="_blank" class="wa-fab" aria-label="Chat on WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>\n</body>',
        )
    p.write_text(t, encoding="utf-8")
    print("updated", name)
