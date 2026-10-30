#!/usr/bin/env python3
"""Build the English site (/en/) from the Spanish pages at the repo root.

Why: search engines index one language per URL. The Spanish pages carry the
English text in data-en attributes; this script writes that text into real
English pages under en/, with English titles, descriptions, hreflang and
schema, so Google and AI search can read them.

Usage (from the repo root):   python tools/build_en.py
Needs: Python 3 and BeautifulSoup  (pip install beautifulsoup4)

Workflow: edit the Spanish page (and its data-en text), run this script,
then commit both the Spanish page and the regenerated en/ page.
"""
import html, json, os, re
from bs4 import BeautifulSoup

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "en")
SITE = "https://ayudadmv.com/"
EMAIL = "placasfirmas.david@gmail.com"
PHONE = "(303) 500-4122"

# English <title> (<= 60 chars) and meta description (<= 155 chars) per page.
EN = {
    "index.html": ("Bilingual DMV Help Denver | Proxy, Notary, Translations",
                   "Bilingual DMV paperwork help in Denver: forms typed from $55, DMV proxy from $95, $10 notary at Community Hubs. Call or WhatsApp (303) 500-4122."),
    "services.html": ("DMV Prep, Proxy, Notary & Translation Prices | Ayuda DMV",
                      "Flat prices for Colorado DMV paperwork: forms typed from $55, DMV proxy from $95, bonded title prep $150, notary and certified translations."),
    "about.html": ("About David Quintana, Colorado Notary Public | Ayuda DMV",
                   "Meet David Quintana, founder of Ayuda DMV: commissioned Colorado Notary Public offering bilingual DMV help and certified translations in Denver."),
    "contact.html": ("Contact & Appointments | Ayuda DMV (303) 500-4122",
                     "Book an appointment with Ayuda DMV. Call, text, or WhatsApp (303) 500-4122 for bilingual DMV paperwork help, notary services, and translations."),
    "faq.html": ("FAQ: DMV Paperwork, Bonded Titles & Notary | Ayuda DMV",
                 "Answers about appointments, pricing, the DR 2175 power of attorney, Colorado bonded title prep, notary services, and certified translations."),
}
# Spanish alt text that needs an English version.
ALT = {
    "David Quintana, Notary Public bilingüe de Colorado en Denver": "David Quintana, bilingual Colorado Notary Public in Denver",
    "David Quintana, Notary Public bilingüe de Colorado": "David Quintana, bilingual Colorado Notary Public",
}
SKIP = ("http:", "https:", "#", "mailto:", "tel:", "data:", "/", "javascript:")


def page_path(name):
    return "" if name == "index.html" else name


def esc(s):
    return html.escape(s, quote=True)


def head_swap(s, name):
    title, desc = EN[name]
    assert len(title) <= 60 and len(desc) <= 155, (name, len(title), len(desc))
    p = page_path(name)
    t, d = esc(title), esc(desc)
    rules = [
        (r'<html lang="es">', '<html lang="en">'),
        (r'<title>.*?</title>', f'<title>{t}</title>'),
        (r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{d}">'),
        (r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{t}">'),
        (r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{d}">'),
        (r'<meta name="twitter:title" content="[^"]*">', f'<meta name="twitter:title" content="{t}">'),
        (r'<meta name="twitter:description" content="[^"]*">', f'<meta name="twitter:description" content="{d}">'),
        (r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{SITE}en/{p}">'),
        (r'<meta property="og:locale" content="es_US">', '<meta property="og:locale" content="en_US">'),
        (r'<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="es_US">'),
        (r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{SITE}en/{p}">'),
        (r'<a id="lang-toggle"[^>]*>EN</a>',
         f'<a id="lang-toggle" class="lang-toggle-button" href="/{p}" hreflang="es" lang="es" aria-label="Versión en español de esta página">ES</a>'),
    ]
    for pat, rep in rules:
        s, n = re.subn(pat, lambda m: rep, s, count=1, flags=re.S)
        assert n == 1, (name, pat)
    return s


def faq_schema(soup, item_sel, q_sel, a_sel):
    items = []
    for d in soup.select(item_sel):
        q, a = d.select_one(q_sel), d.select_one(a_sel)
        if q and a:
            items.append({"@type": "Question", "name": q.get_text(" ", strip=True),
                          "acceptedAnswer": {"@type": "Answer", "text": a.get_text(" ", strip=True)}})
    return {"@context": "https://schema.org", "@type": "FAQPage", "inLanguage": "en-US", "mainEntity": items}


def build(name):
    src = open(os.path.join(ROOT, name), encoding="utf8").read()
    soup = BeautifulSoup(head_swap(src, name), "html.parser")

    # 1. Write the English text into every bilingual element (mirrors js/global.js).
    for el in soup.select("[data-en][data-es]"):
        text = (el["data-en"].replace("\\n\\n", "<br><br>").replace("\n\n", "<br><br>")
                .replace("{email}", f'<a href="mailto:{EMAIL}">{EMAIL}</a>')
                .replace("{phone}", f'<a href="tel:+13035004122">{PHONE}</a>'))
        if el.name in ("input", "textarea"):
            el["placeholder"] = text
        else:
            el.clear()
            el.append(BeautifulSoup(text, "html.parser"))

    # 2. Point assets one folder up; keep page links inside /en/.
    for tag in soup.find_all(["a", "link", "script", "img", "source"]):
        for attr in ("href", "src"):
            v = tag.get(attr)
            if not v or v.startswith(SKIP):
                continue
            if v == "index.html":
                tag[attr] = "./"
            elif re.match(r"^[\w.-]+\.html(#.*)?$", v):
                continue
            else:
                tag[attr] = "../" + v

    # 3. English alt text.
    for img in soup.find_all("img"):
        if img.get("alt") in ALT:
            img["alt"] = ALT[img["alt"]]

    # 4. FAQPage schema in English, built from the visible English questions.
    for sc in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(sc.string)
        except (TypeError, ValueError):
            continue
        if data.get("@type") == "FAQPage":
            if soup.select("details.faq-item"):
                new = faq_schema(soup, "details.faq-item", "summary", ".faq-answer")
            else:
                new = faq_schema(soup, "details.hfaq__item", "summary", "p")
            sc.string = "\n" + json.dumps(new, ensure_ascii=False, indent=2) + "\n    "

    out = str(soup)
    out = out.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!-- Generated by tools/build_en.py from /" + name +
                      ". Edit the Spanish page and its data-en text, then re-run the script. -->", 1)
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, name), "w", encoding="utf8", newline="\n") as f:
        f.write(out)
    print("built en/" + name)


if __name__ == "__main__":
    for page in EN:
        build(page)
