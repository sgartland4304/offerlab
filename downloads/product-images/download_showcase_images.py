#!/usr/bin/env python3
"""
Download featured product images for 20 additional showcase brands.
Curated mix of beauty, CPG, home, apparel, and wellness with visually
distinctive products for the OfferLab marketing page.

Usage:
    pip install requests beautifulsoup4
    python download_showcase_images.py
"""

import os
import re
import json
import time
import requests
from urllib.parse import urlparse, quote
from bs4 import BeautifulSoup

DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "images")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

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

PRODUCTS = [
    # ---------- BEAUTY & SKINCARE ----------
    {
        "filename": "35-tatcha-dewy-skin-cream",
        "name": "Tatcha The Dewy Skin Cream",
        "attempts": [
            ("shopify_json", "https://www.tatcha.com/products/dewy-skin-cream.json"),
            ("og_image", "https://www.tatcha.com/products/dewy-skin-cream.html"),
            ("og_image", "https://www.tatcha.com/product/the-dewy-skin-cream/DEWY-SKIN-CREAM.html"),
        ],
    },
    {
        "filename": "36-ilia-super-serum-skin-tint",
        "name": "ILIA Super Serum Skin Tint",
        "attempts": [
            ("shopify_json", "https://iliabeauty.com/products/super-serum-skin-tint-spf-40.json"),
            ("og_image", "https://iliabeauty.com/products/super-serum-skin-tint-spf-40"),
        ],
    },
    {
        "filename": "37-youth-to-the-people-superfood-cleanser",
        "name": "Youth To The People Superfood Cleanser",
        "attempts": [
            ("shopify_json", "https://www.youthtothepeople.com/products/superfood-antioxidant-cleanser.json"),
            ("og_image", "https://www.youthtothepeople.com/products/superfood-antioxidant-cleanser"),
        ],
    },
    {
        "filename": "38-saie-dew-balm",
        "name": "Saie Dew Balm",
        "attempts": [
            ("shopify_json", "https://saiehello.com/products/dew-balm.json"),
            ("shopify_json", "https://saiehello.com/products/glowy-super-gel.json"),
            ("og_image", "https://saiehello.com/products/dew-balm"),
            ("og_image", "https://saiehello.com/products/glowy-super-gel"),
        ],
    },
    {
        "filename": "39-dieux-forever-eye-mask",
        "name": "Dieux Forever Eye Mask",
        "attempts": [
            ("shopify_json", "https://dieuxskin.com/products/forever-eye-mask.json"),
            ("og_image", "https://dieuxskin.com/products/forever-eye-mask"),
        ],
    },
    {
        "filename": "40-dae-signature-shampoo",
        "name": "Dae Hair Signature Shampoo",
        "attempts": [
            ("shopify_json", "https://daehair.com/products/signature-shampoo.json"),
            ("og_image", "https://daehair.com/products/signature-shampoo"),
        ],
    },

    # ---------- FOOD & BEVERAGE ----------
    {
        "filename": "41-poppi-strawberry-lemon",
        "name": "Poppi Strawberry Lemon Prebiotic Soda",
        "attempts": [
            ("shopify_json", "https://drinkpoppi.com/products/strawberry-lemon.json"),
            ("og_image", "https://drinkpoppi.com/products/strawberry-lemon"),
            ("og_image", "https://drinkpoppi.com/"),
        ],
    },
    {
        "filename": "42-recess-pom-hibiscus",
        "name": "Recess Pom Hibiscus Mood Water",
        "attempts": [
            ("shopify_json", "https://www.takearecess.com/products/mood-water-pom-hibiscus.json"),
            ("shopify_json", "https://www.takearecess.com/products/pomegranate-hibiscus.json"),
            ("og_image", "https://www.takearecess.com/products/mood-water-pom-hibiscus"),
            ("og_image", "https://www.takearecess.com/"),
        ],
    },
    {
        "filename": "43-ghia-le-spritz",
        "name": "Ghia Le Spritz Non-Alcoholic Aperitif",
        "attempts": [
            ("shopify_json", "https://drinkghia.com/products/le-spritz.json"),
            ("shopify_json", "https://drinkghia.com/products/ghia-original.json"),
            ("og_image", "https://drinkghia.com/products/le-spritz"),
            ("og_image", "https://drinkghia.com/"),
        ],
    },
    {
        "filename": "44-omsom-thai-larb-starter",
        "name": "Omsom Thai Larb Starter",
        "attempts": [
            ("shopify_json", "https://omsom.com/products/thai-larb-starter.json"),
            ("shopify_json", "https://omsom.com/products/southeast-asian-sampler.json"),
            ("og_image", "https://omsom.com/products/thai-larb-starter"),
            ("og_image", "https://omsom.com/collections/all-starters"),
        ],
    },
    {
        "filename": "45-immi-tom-yum-ramen",
        "name": "Immi Tom Yum Shrimp Ramen",
        "attempts": [
            ("shopify_json", "https://immieats.com/products/tom-yum-shrimp.json"),
            ("og_image", "https://immieats.com/products/tom-yum-shrimp"),
            ("og_image", "https://immieats.com/"),
        ],
    },

    # ---------- HOME & KITCHEN ----------
    {
        "filename": "46-caraway-cookware-set-cream",
        "name": "Caraway Ceramic Cookware Set (Cream)",
        "attempts": [
            ("shopify_json", "https://www.carawayhome.com/products/cookware-set.json"),
            ("og_image", "https://www.carawayhome.com/products/cookware-set"),
            ("og_image", "https://www.carawayhome.com/"),
        ],
    },
    {
        "filename": "47-great-jones-dutchess-dutch-oven",
        "name": "Great Jones The Dutchess Dutch Oven",
        "attempts": [
            ("shopify_json", "https://www.greatjonesgoods.com/products/the-dutchess.json"),
            ("og_image", "https://www.greatjonesgoods.com/products/the-dutchess"),
        ],
    },
    {
        "filename": "48-brightland-awake-olive-oil",
        "name": "Brightland AWAKE Olive Oil",
        "attempts": [
            ("shopify_json", "https://www.brightland.co/products/awake.json"),
            ("og_image", "https://www.brightland.co/products/awake"),
        ],
    },
    {
        "filename": "49-otherland-daybed-candle",
        "name": "Otherland Daybed Candle",
        "attempts": [
            ("shopify_json", "https://www.otherland.com/products/daybed.json"),
            ("og_image", "https://www.otherland.com/products/daybed"),
            ("og_image", "https://www.otherland.com/"),
        ],
    },

    # ---------- APPAREL & LIFESTYLE ----------
    {
        "filename": "50-parachute-linen-venice-sheets",
        "name": "Parachute Linen Venice Sheet Set",
        "attempts": [
            ("shopify_json", "https://www.parachutehome.com/products/linen-venice-set.json"),
            ("shopify_json", "https://www.parachutehome.com/products/linen-sheet-set.json"),
            ("og_image", "https://www.parachutehome.com/products/linen-venice-set"),
            ("og_image", "https://www.parachutehome.com/products/linen-sheet-set"),
        ],
    },
    {
        "filename": "51-vuori-ponto-performance-pant",
        "name": "Vuori Ponto Performance Pant",
        "attempts": [
            ("shopify_json", "https://vuoriclothing.com/products/ponto-performance-pant.json"),
            ("og_image", "https://vuoriclothing.com/products/ponto-performance-pant"),
        ],
    },
    {
        "filename": "52-rothys-the-point-flat",
        "name": "Rothy's The Point Flat",
        "attempts": [
            ("shopify_json", "https://rothys.com/products/the-point.json"),
            ("og_image", "https://rothys.com/products/the-point"),
            ("og_image", "https://rothys.com/collections/womens-the-point"),
        ],
    },

    # ---------- WELLNESS & TECH ----------
    {
        "filename": "53-ritual-essential-for-women-18",
        "name": "Ritual Essential for Women 18+",
        "attempts": [
            ("og_image", "https://ritual.com/products/essential-for-women-multivitamin"),
            ("og_image", "https://ritual.com/"),
        ],
    },
    {
        "filename": "54-oura-ring-gen-3",
        "name": "Oura Ring Gen 3",
        "attempts": [
            ("og_image", "https://ouraring.com/product/rings/heritage/silver"),
            ("og_image", "https://ouraring.com/product/heritage-silver"),
            ("og_image", "https://ouraring.com/"),
        ],
    },
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
            if "?" not in image_url:
                image_url += "?width=1000"
            else:
                image_url += "&width=1000"

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


def try_shopify_json(json_url, filepath):
    try:
        resp = SESSION.get(json_url, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        product = data.get("product", {})
        images = product.get("images", [])
        if not images:
            image_obj = product.get("image", {})
            if image_obj and image_obj.get("src"):
                images = [image_obj]

        if images:
            image_url = images[0].get("src", "")
            if image_url:
                if image_url.startswith("//"):
                    image_url = "https:" + image_url
                print(f"    Found via Shopify JSON: {image_url[:100]}...")
                return download_image(image_url, filepath)
        else:
            print(f"    Shopify JSON returned no images")
    except requests.exceptions.HTTPError as e:
        print(f"    Shopify JSON HTTP error: {e.response.status_code}")
    except Exception as e:
        print(f"    Shopify JSON failed: {e}")
    return False


def try_og_image(page_url, filepath):
    try:
        resp = SESSION.get(page_url, timeout=15, allow_redirects=True)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # og:image
        og_tag = soup.find("meta", property="og:image")
        if og_tag and og_tag.get("content"):
            image_url = og_tag["content"]
            if image_url.startswith("//"):
                image_url = "https:" + image_url
            if image_url.startswith("http"):
                print(f"    Found via og:image: {image_url[:100]}...")
                return download_image(image_url, filepath)

        # twitter:image
        for attr in [{"name": "twitter:image"}, {"property": "twitter:image"}]:
            tw_tag = soup.find("meta", attrs=attr)
            if tw_tag and tw_tag.get("content"):
                image_url = tw_tag["content"]
                if image_url.startswith("//"):
                    image_url = "https:" + image_url
                if image_url.startswith("http"):
                    print(f"    Found via twitter:image: {image_url[:100]}...")
                    return download_image(image_url, filepath)

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
                        img = img.get("url", img.get("contentUrl", ""))
                    if img and img.startswith("http"):
                        print(f"    Found via JSON-LD: {img[:100]}...")
                        return download_image(img, filepath)
            except (json.JSONDecodeError, AttributeError):
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
                image_url = (
                    img.get("src") or img.get("data-src")
                    or img.get("srcset", "").split(",")[0].split(" ")[0]
                )
                if image_url and not image_url.startswith("data:"):
                    if image_url.startswith("//"):
                        image_url = "https:" + image_url
                    elif image_url.startswith("/"):
                        parsed = urlparse(page_url)
                        image_url = f"{parsed.scheme}://{parsed.netloc}{image_url}"
                    if image_url.startswith("http"):
                        print(f"    Found via selector: {image_url[:100]}...")
                        return download_image(image_url, filepath)

    except requests.exceptions.HTTPError as e:
        print(f"    og:image HTTP error: {e.response.status_code}")
    except Exception as e:
        print(f"    og:image failed: {e}")
    return False


def try_google(product_name, filepath):
    try:
        search_url = f"https://www.google.com/search?q={quote(product_name + ' product official')}&tbm=isch"
        resp = SESSION.get(search_url, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src.startswith("http") and ("encrypted-tbn" in src or "gstatic" in src) and len(src) > 50:
                print(f"    Found via Google Images: {src[:80]}...")
                return download_image(src, filepath)
    except Exception as e:
        print(f"    Google Images failed: {e}")
    return False


def main():
    print(f"Downloading showcase product images -> {DOWNLOAD_DIR}\n")
    print("=" * 70)

    success_count = 0
    failed = []

    for product in PRODUCTS:
        filename = product["filename"]
        name = product["name"]
        attempts = product["attempts"]

        print(f"\n{'='*50}")
        print(f"  {name}")
        print(f"{'='*50}")

        filepath = os.path.join(DOWNLOAD_DIR, filename)
        downloaded = False

        for i, (strategy, url) in enumerate(attempts):
            if downloaded:
                break
            print(f"\n  Attempt {i+1}/{len(attempts)}: {strategy} -> {url[:70]}...")

            if strategy == "shopify_json":
                downloaded = try_shopify_json(url, filepath)
            elif strategy == "og_image":
                downloaded = try_og_image(url, filepath)

            time.sleep(0.5)

        if not downloaded:
            print(f"\n  Final fallback: Google Images...")
            downloaded = try_google(name, filepath)

        if downloaded:
            success_count += 1
            print(f"\n  SUCCESS: {name}")
        else:
            failed.append(name)
            print(f"\n  FAILED: {name}")

        time.sleep(1)

    print("\n" + "=" * 70)
    print(f"\nResults: {success_count}/{len(PRODUCTS)} images downloaded")

    if failed:
        print(f"\nFailed ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")


if __name__ == "__main__":
    main()
