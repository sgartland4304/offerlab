#!/usr/bin/env python3
"""
Download featured product images for 20 showcase brands.
v3 - og:image only with Firecrawl API fallback for stubborn sites.

Usage:
    pip install requests beautifulsoup4
    export FIRECRAWL_API_KEY=fc-xxx   # optional, enables Firecrawl fallback
    python download_showcase_images.py
"""

import os
import re
import json
import time
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

FIRECRAWL_API_KEY = os.environ.get("FIRECRAWL_API_KEY", "")

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
              "image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
})

# Each product: filename, display name, list of page URLs to try (in order)
PRODUCTS = [
    # ---------- BEAUTY & SKINCARE ----------
    ("35-tatcha-dewy-skin-cream", "Tatcha The Dewy Skin Cream", [
        "https://tatcha.com/products/the-dewy-skin-cream",
    ]),
    ("36-ilia-super-serum-skin-tint", "ILIA Super Serum Skin Tint SPF 40", [
        "https://iliabeauty.com/products/super-serum-skin-tint-spf-40-tinted-moisturizer",
    ]),
    ("37-youth-to-the-people-superfood-cleanser", "Youth To The People Superfood Cleanser", [
        "https://www.youthtothepeople.com/skincare/cleansers/superfood-cleanser/YTTP-10100.html",
    ]),
    ("38-saie-glowy-super-gel", "Saie Glowy Super Gel", [
        "https://saiehello.com/products/glowy-super-gel-luminizer",
    ]),
    ("39-dieux-forever-eye-mask", "Dieux Forever Eye Mask", [
        "https://www.dieuxskin.com/products/forever-eye-mask",
    ]),
    ("40-dae-signature-shampoo", "Dae Signature Shampoo", [
        "https://daehair.com/products/signature-shampoo-full-size-10oz",
    ]),

    # ---------- FOOD & BEVERAGE ----------
    ("41-poppi-strawberry-lemon", "Poppi Strawberry Lemon Prebiotic Soda", [
        "https://drinkpoppi.com/products/strawberry-lemon",
    ]),
    ("42-recess-pomegranate-hibiscus", "Recess Pomegranate Hibiscus", [
        "https://takearecess.com/shop/sparkling-water/pomegranate-hibiscus",
    ]),
    ("43-ghia-le-spritz-ghia-soda", "Ghia Le Spritz Ghia Soda", [
        "https://drinkghia.com/products/ghia-soda",
        "https://drinkghia.com/products/le-spritz-blood-orange",
    ]),
    ("44-omsom-thai-larb-starter", "Omsom Thai Larb Starter", [
        "https://omsom.com/products/thai-larb-starter-pack",
    ]),
    ("45-immi-tom-yum-shrimp-ramen", "Immi Tom Yum Shrimp Ramen", [
        "https://shop.immieats.com/products/tom-yum-shrimp-ramen",
    ]),

    # ---------- HOME & KITCHEN ----------
    ("46-caraway-cookware-set", "Caraway Ceramic Cookware Set", [
        "https://www.carawayhome.com/products/cookware-sets",
    ]),
    ("47-great-jones-the-dutchess", "Great Jones The Dutchess Dutch Oven", [
        "https://greatjonesgoods.com/products/the-dutchess",
    ]),
    ("48-brightland-awake-olive-oil", "Brightland Awake Olive Oil", [
        "https://brightland.co/products/awake",
    ]),
    ("49-otherland-daybed-candle", "Otherland Daybed Candle", [
        "https://www.otherland.com/products/daybed",
    ]),

    # ---------- APPAREL & LIFESTYLE ----------
    ("50-parachute-linen-venice-set", "Parachute Linen Venice Sheet Set", [
        "https://www.parachutehome.com/products/linen-venice-set",
    ]),
    ("51-vuori-ponto-performance-pant", "Vuori Ponto Performance Pant", [
        "https://vuoriclothing.com/products/ponto-performance-pant-heather-grey",
        "https://vuoriclothing.com/products/ponto-performance-pant-black-heather",
    ]),
    ("52-rothys-the-point", "Rothy's The Point Flat", [
        "https://rothys.com/products/the-point-black-solid",
        "https://rothys.com/products/the-point-ecru",
    ]),

    # ---------- WELLNESS & TECH ----------
    ("53-ritual-essential-for-women-18", "Ritual Essential for Women 18+", [
        "https://ritual.com/products/essential-for-women-multivitamin",
    ]),
    ("54-oura-ring-gen3-horizon-silver", "Oura Ring Gen3 Horizon Silver", [
        "https://ouraring.com/product/rings/oura-gen3/horizon/silver",
        "https://ouraring.com/product/rings/oura-gen3/heritage",
    ]),
]


def get_extension(url, content_type=None):
    path = urlparse(url).path.lower()
    for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]:
        if ext in path:
            return ext
    if content_type:
        ct = content_type.lower()
        if "jpeg" in ct or "jpg" in ct:
            return ".jpg"
        if "png" in ct:
            return ".png"
        if "webp" in ct:
            return ".webp"
    return ".jpg"


def download_image(image_url, filepath):
    try:
        if "cdn.shopify.com" in image_url:
            image_url = re.sub(r'_\d+x\d+', '', image_url)
            image_url = re.sub(r'\?v=\d+', '', image_url)
            image_url += ("&" if "?" in image_url else "?") + "width=1200"

        resp = SESSION.get(image_url, timeout=30, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        if "text/html" in content_type:
            print(f"    -> Got HTML instead of image, skipping")
            return False

        ext = get_extension(image_url, content_type)
        base = os.path.splitext(filepath)[0]
        filepath = base + ext

        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_kb = os.path.getsize(filepath) / 1024
        if size_kb < 1:
            os.remove(filepath)
            print(f"    -> File too small ({size_kb:.1f} KB), skipping")
            return False

        print(f"    -> Saved: {os.path.basename(filepath)} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"    -> Download failed: {e}")
        return False


def extract_image_from_html(html, page_url):
    """Pull the best product image URL out of raw HTML."""
    soup = BeautifulSoup(html, "html.parser")

    # og:image
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        url = og["content"]
        if url.startswith("//"):
            url = "https:" + url
        if url.startswith("http"):
            return ("og:image", url)

    # twitter:image
    for attr in [{"name": "twitter:image"}, {"property": "twitter:image"}]:
        tw = soup.find("meta", attrs=attr)
        if tw and tw.get("content"):
            url = tw["content"]
            if url.startswith("//"):
                url = "https:" + url
            if url.startswith("http"):
                return ("twitter:image", url)

    # JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            ld = json.loads(script.string)
            if isinstance(ld, list):
                ld = ld[0]
            img = ld.get("image")
            if img:
                if isinstance(img, list):
                    img = img[0]
                if isinstance(img, dict):
                    img = img.get("url") or img.get("contentUrl", "")
                if img and img.startswith("http"):
                    return ("JSON-LD", img)
        except (json.JSONDecodeError, AttributeError, TypeError):
            continue

    # CSS selectors
    for selector in [
        'img[class*="product"]', 'img[class*="hero"]',
        'img[class*="featured"]', 'img[class*="pdp"]',
        '.product-image img', '.product__image img',
        '[data-testid*="product"] img', 'img[data-src]',
    ]:
        img = soup.select_one(selector)
        if img:
            url = (
                img.get("src") or img.get("data-src")
                or img.get("srcset", "").split(",")[0].split(" ")[0]
            )
            if url and not url.startswith("data:"):
                if url.startswith("//"):
                    url = "https:" + url
                elif url.startswith("/"):
                    parsed = urlparse(page_url)
                    url = f"{parsed.scheme}://{parsed.netloc}{url}"
                if url.startswith("http"):
                    return (f"selector '{selector}'", url)

    return (None, None)


def try_direct_scrape(page_url, filepath):
    """Strategy 1: direct requests.get + parse HTML."""
    try:
        resp = SESSION.get(page_url, timeout=15, allow_redirects=True)
        resp.raise_for_status()
        source, image_url = extract_image_from_html(resp.text, page_url)
        if image_url:
            print(f"    Direct scrape found via {source}: {image_url[:100]}...")
            return download_image(image_url, filepath)
    except requests.exceptions.HTTPError as e:
        print(f"    Direct scrape HTTP error: {e.response.status_code}")
    except Exception as e:
        print(f"    Direct scrape failed: {e}")
    return False


def try_firecrawl(page_url, filepath):
    """Strategy 2: use Firecrawl API to bypass bot protection."""
    if not FIRECRAWL_API_KEY:
        return False
    try:
        print(f"    Trying Firecrawl API...")
        resp = requests.post(
            "https://api.firecrawl.dev/v1/scrape",
            headers={
                "Authorization": f"Bearer {FIRECRAWL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "url": page_url,
                "formats": ["html"],
                "onlyMainContent": False,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()

        # Try metadata.ogImage first (Firecrawl surfaces this directly)
        metadata = data.get("data", {}).get("metadata", {})
        og_image = metadata.get("ogImage") or metadata.get("og:image")
        if og_image:
            print(f"    Firecrawl found og:image: {og_image[:100]}...")
            return download_image(og_image, filepath)

        # Otherwise parse the HTML ourselves
        html = data.get("data", {}).get("html", "")
        if html:
            source, image_url = extract_image_from_html(html, page_url)
            if image_url:
                print(f"    Firecrawl HTML found via {source}: {image_url[:100]}...")
                return download_image(image_url, filepath)

        print(f"    Firecrawl returned no usable image data")
    except requests.exceptions.HTTPError as e:
        print(f"    Firecrawl HTTP error: {e.response.status_code} {e.response.text[:200]}")
    except Exception as e:
        print(f"    Firecrawl failed: {e}")
    return False


def main():
    print(f"Downloading showcase product images -> {DOWNLOAD_DIR}")
    print(f"Firecrawl API key: {'SET' if FIRECRAWL_API_KEY else 'NOT SET (fallback disabled)'}\n")
    print("=" * 70)

    success_count = 0
    failed = []

    for filename, name, page_urls in PRODUCTS:
        print(f"\n{'='*50}")
        print(f"  {name}")
        print(f"{'='*50}")

        filepath = os.path.join(DOWNLOAD_DIR, filename)
        downloaded = False

        # Strategy 1: direct scrape each candidate URL
        for i, url in enumerate(page_urls):
            if downloaded:
                break
            print(f"\n  [{i+1}/{len(page_urls)}] Direct scrape: {url[:70]}...")
            downloaded = try_direct_scrape(url, filepath)
            time.sleep(0.3)

        # Strategy 2: Firecrawl fallback on first URL
        if not downloaded and FIRECRAWL_API_KEY:
            print(f"\n  Firecrawl fallback: {page_urls[0][:70]}...")
            downloaded = try_firecrawl(page_urls[0], filepath)

        if downloaded:
            success_count += 1
            print(f"\n  SUCCESS: {name}")
        else:
            failed.append(name)
            print(f"\n  FAILED: {name}")

        time.sleep(0.5)

    print("\n" + "=" * 70)
    print(f"\nResults: {success_count}/{len(PRODUCTS)} images downloaded")

    if failed:
        print(f"\nFailed ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
