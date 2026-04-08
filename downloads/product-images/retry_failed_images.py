#!/usr/bin/env python3
"""
Retry script for the 5 products that failed in the initial download.
Tries multiple URLs and strategies per product.

Usage:
    pip install requests beautifulsoup4
    python retry_failed_images.py
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
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
})

# Each product has a list of (strategy, url) tuples to try in order
FAILED_PRODUCTS = [
    {
        "filename": "06-supergoop-unseen-sunscreen",
        "name": "Supergoop Unseen Sunscreen",
        "attempts": [
            ("shopify_json", "https://supergoop.com/products/unseen-sunscreen-spf-50.json"),
            ("og_image", "https://supergoop.com/products/unseen-sunscreen-spf-50"),
            ("og_image", "https://bluemercury.com/products/supergoop-unseen-sunscreen-spf-50"),
            ("og_image", "https://www.dermstore.com/p/supergoop-unseen-sunscreen-spf-50-50ml/15844101/"),
            ("og_image", "https://fsastore.com/supergoop-unseen-sunscreen-spf-50/27302m.html"),
            ("og_image", "https://www.amazon.com/Supergoop-Unseen-Sunscreen-Invisible-Protection/dp/B0DPNL864S"),
        ],
    },
    {
        "filename": "14-chamberlain-coffee-social-dog",
        "name": "Chamberlain Coffee Social Dog Blend",
        "attempts": [
            # Try the alternate product handle (their site has two URLs)
            ("shopify_json", "https://chamberlaincoffee.com/products/social-dog-medium-roast-coffee-bag.json"),
            ("shopify_json", "https://chamberlaincoffee.com/products/social-dog-blend.json"),
            ("og_image", "https://chamberlaincoffee.com/products/social-dog-medium-roast-coffee-bag"),
            ("og_image", "https://chamberlaincoffee.com/products/social-dog-blend"),
            ("og_image", "https://www.amazon.com/Chamberlain-Coffee-Organic-Complex-Chocolate/dp/B09H843Q41"),
            ("og_image", "https://www.iherb.com/pr/chamberlain-coffee-social-dog-blend-ground-medium-roast-12-oz-340-g/142590"),
        ],
    },
    {
        "filename": "18-magic-spoon-cereal",
        "name": "Magic Spoon Cereal",
        "attempts": [
            # Actual product pages (not just homepage)
            ("shopify_json", "https://magicspoon.com/products/fruity-keto-cereal-case.json"),
            ("shopify_json", "https://magicspoon.com/products/fruity.json"),
            ("shopify_json", "https://magicspoon.com/products/cereal-fruity.json"),
            ("og_image", "https://magicspoon.com/products/fruity-keto-cereal-case"),
            ("og_image", "https://magicspoon.com/"),
            ("og_image", "https://www.amazon.com/Magic-Spoon-Cereal-Fruity-1-Pack/dp/B09DMZPC3Q"),
            ("og_image", "https://www.walmart.com/ip/Magic-Spoon-Fruity-Grain-Free-Breakfast-Cereal-7-oz-Box/1149849160"),
            ("og_image", "https://www.target.com/p/magic-spoon-fruity-keto-and-grain-free-cereal-7oz/-/A-85367259"),
        ],
    },
    {
        "filename": "22-mejuri-croissant-dome-ring",
        "name": "Mejuri Croissant Dome Ring",
        "attempts": [
            # Try various Mejuri URL patterns for the JSON endpoint
            ("shopify_json", "https://mejuri.com/shop/products/croissant-dome-ring.json"),
            ("og_image", "https://mejuri.com/shop/products/croissant-dome-ring"),
            ("og_image", "http://backend.mejuri.com/shop/products/croissant-dome-ring"),
            ("og_image", "https://mejuri.com/collections/dome"),
            ("og_image", "https://shopmy.us/shop/product/83097"),
            ("og_image", "https://www.refinery29.com/en-us/shop/product/croissant-dome-ring-11166144"),
        ],
    },
    {
        "filename": "23-liquid-iv-hydration-multiplier",
        "name": "Liquid I.V. Hydration Multiplier",
        "attempts": [
            ("shopify_json", "https://www.liquid-iv.com/products/lemon-lime-hydration-multiplier.json"),
            ("shopify_json", "https://www.liquid-iv.com/products/variety-pack-hydration-multiplier.json"),
            ("og_image", "https://www.liquid-iv.com/products/lemon-lime-hydration-multiplier"),
            ("og_image", "https://www.liquid-iv.com/"),
            ("og_image", "https://www.amazon.com/Liquid-I-V-Multiplier-Electrolyte-Supplement/dp/B01IT9NLHW"),
            ("og_image", "https://www.costco.com/liquid-i.v.-hydration-multiplier,-30-individual-serving-stick-packs-in-resealable-pouch,-lemon-lime.product.100301223.html"),
            ("og_image", "https://www.target.com/p/liquid-i-v-hydration-multiplier-vegan-powder-electrolyte-supplements-lemon-lime-0-56oz-each-10ct/-/A-78864725"),
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
            print(f"    -> File too small ({size_kb:.1f} KB), likely not a real image")
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

        # Try og:image
        og_tag = soup.find("meta", property="og:image")
        if og_tag and og_tag.get("content"):
            image_url = og_tag["content"]
            if image_url.startswith("//"):
                image_url = "https:" + image_url
            if image_url.startswith("http"):
                print(f"    Found via og:image: {image_url[:100]}...")
                return download_image(image_url, filepath)

        # Try twitter:image
        tw_tag = soup.find("meta", attrs={"name": "twitter:image"})
        if not tw_tag:
            tw_tag = soup.find("meta", attrs={"property": "twitter:image"})
        if tw_tag and tw_tag.get("content"):
            image_url = tw_tag["content"]
            if image_url.startswith("//"):
                image_url = "https:" + image_url
            if image_url.startswith("http"):
                print(f"    Found via twitter:image: {image_url[:100]}...")
                return download_image(image_url, filepath)

        # Try JSON-LD structured data
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

        # Try common CSS selectors
        for selector in [
            'img[class*="product"]',
            'img[class*="hero"]',
            'img[class*="featured"]',
            'img[class*="pdp"]',
            '.product-image img',
            '.product__image img',
            '#product-image img',
            '[data-testid*="product"] img',
            'img[data-src]',
        ]:
            img = soup.select_one(selector)
            if img:
                image_url = (
                    img.get("src")
                    or img.get("data-src")
                    or img.get("srcset", "").split(",")[0].split(" ")[0]
                )
                if image_url and not image_url.startswith("data:"):
                    if image_url.startswith("//"):
                        image_url = "https:" + image_url
                    elif image_url.startswith("/"):
                        parsed = urlparse(page_url)
                        image_url = f"{parsed.scheme}://{parsed.netloc}{image_url}"
                    if image_url.startswith("http"):
                        print(f"    Found via selector '{selector}': {image_url[:100]}...")
                        return download_image(image_url, filepath)

    except requests.exceptions.HTTPError as e:
        print(f"    og:image HTTP error: {e.response.status_code}")
    except Exception as e:
        print(f"    og:image failed: {e}")
    return False


def try_google_shopping(product_name, filepath):
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
    print(f"Retrying failed product images → {DOWNLOAD_DIR}\n")
    print("=" * 70)

    success_count = 0
    failed = []

    for product in FAILED_PRODUCTS:
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
            print(f"\n  Attempt {i+1}/{len(attempts)}: {strategy} → {url[:70]}...")

            if strategy == "shopify_json":
                downloaded = try_shopify_json(url, filepath)
            elif strategy == "og_image":
                downloaded = try_og_image(url, filepath)

            time.sleep(0.5)

        # Final fallback: Google Images
        if not downloaded:
            print(f"\n  Attempt FINAL: Google Images search...")
            downloaded = try_google_shopping(name, filepath)

        if downloaded:
            success_count += 1
            print(f"\n  ✓ SUCCESS: {name}")
        else:
            failed.append(name)
            print(f"\n  ✗ FAILED: {name}")

        time.sleep(1)

    print("\n" + "=" * 70)
    print(f"\nRetry Results: {success_count}/{len(FAILED_PRODUCTS)} images downloaded")

    if failed:
        print(f"\nStill failing ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")
        print("\nFor these, manually right-click → Save Image from the product pages:")
        print("  - Supergoop: https://supergoop.com/products/unseen-sunscreen-spf-50")
        print("  - Chamberlain Coffee: https://chamberlaincoffee.com/products/social-dog-medium-roast-coffee-bag")
        print("  - Magic Spoon: https://magicspoon.com/products/fruity-keto-cereal-case")
        print("  - Mejuri: https://mejuri.com/shop/products/croissant-dome-ring")
        print("  - Liquid I.V.: https://www.liquid-iv.com/products/lemon-lime-hydration-multiplier")


if __name__ == "__main__":
    main()
