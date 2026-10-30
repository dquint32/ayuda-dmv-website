# AYUDA DMV

A bilingual, client-friendly website for AYUDA DMV, offering document preparation, notary services, certified translations, and administrative support. This project highlights clear communication, accessible design, and culturally informed support for Colorado residents.

## Services Featured
- Document preparation (DMV, legal, administrative)
- Notary Public services
- Certified translations (USCIS, DMV, state agencies)
- Appointment support and form guidance

## Languages and SEO
- Spanish pages live at the root (`/`), English pages in `en/`.
- English text is kept in each Spanish page's `data-en` attributes. After editing a Spanish page, run `python tools/build_en.py` to regenerate `en/` (needs `pip install beautifulsoup4`), then commit both.
- Business schema (JSON-LD) source: `tools/schema-business.json`. It is pasted into the `<head>` of every page; update all pages if it changes.
- `sitemap.xml` lists both languages with hreflang alternates.

## Technologies Used
- HTML5
- CSS3 (custom stylesheet)
- JavaScript (vanilla)
- Responsive design techniques

## Author
David Matthew Quintana  
Bilingual Web Developer | Notary Public | HCIS Student  
Castle Rock, Colorado
