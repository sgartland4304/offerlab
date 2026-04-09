#!/usr/bin/env python3
"""
Download featured product images for new bundle products (round 2).
Only includes brands confirmed to exist as real DTC companies.

Usage:
    pip install requests beautifulsoup4
    python download_bundle_images.py
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

# Each product has multiple (strategy, url) attempts
PRODUCTS = [
    {
        "filename": "25-lovevery-play-kit-charmer",
        "name": "Lovevery The Charmer Play Kit (Months 3-4)",
        "attempts": [
            ("og_image", "https://lovevery.com/products/the-play-kits-the-charmer"),
            ("og_image", "https://www.babylist.com/gp/lovevery-the-play-kits-3-kit-gift/15570/291476"),
        ],
    },
    {
        "filename": "26-graza-drizzle-olive-oil",
        "name": "Graza Drizzle Olive Oil",
        "attempts": [
            ("shopify_json", "https://www.graza.co/products/drizzle.json"),
            ("og_image", "https://www.graza.co/products/drizzle"),
            ("og_image", "https://www.amazon.com/Graza-Drizzle-Extra-Virgin-Olive-Oil-Finishing-High-Polyphenol/dp/B09WTZRV6Z"),
        ],
    },
    {
        "filename": "27-farmers-dog-fresh-food",
        "name": "The Farmer's Dog Fresh Food",
        "attempts": [
            ("og_image", "https://www.thefarmersdog.com/"),
            ("og_image", "https://www.thefarmersdog.com/our-food"),
        ],
    },
    {
        "filename": "28-alo-yoga-airlift-leggings",
        "name": "Alo Yoga Airlift Leggings",
        "attempts": [
            ("shopify_json", "https://www.aloyoga.com/products/w5561r-high-waist-airlift-legging-black.json"),
            ("og_image", "https://www.aloyoga.com/products/w5561r-high-waist-airlift-legging-black"),
            ("og_image", "https://www.aloyoga.com/collections/airlift-leggings"),
        ],
    },
    {
        "filename": "29-vitruvi-stone-diffuser",
        "name": "Vitruvi Stone Diffuser + Essential Oil Set",
        "attempts": [
            ("shopify_json", "https://vitruvi.com/products/starter-stone-diffuser-bundle.json"),
            ("shopify_json", "https://vitruvi.com/products/stone-essential-oil-diffuser.json"),
            ("og_image", "https://vitruvi.com/products/stone-essential-oil-diffuser"),
            ("og_image", "https://www.amazon.com/Diffuser-Ultrasonic-Essential-Aromatherapy-Capacity/dp/B0BCP1RG4B"),
        ],
    },
    {
        "filename": "30-bask-suncare-spray",
        "name": "Bask Suncare Body Mist",
        "attempts": [
            ("shopify_json", "https://basksuncare.com/products/bask-non-aerosol-spray.json"),
            ("og_image", "https://basksuncare.com/products/bask-non-aerosol-spray"),
            ("og_image", "https://basksuncare.com/"),
        ],
    },
    {
        "filename": "31-deux-cookie-dough",
        "name": "Deux Cookie Dough Bites",
        "attempts": [
            ("shopify_json", "https://www.eatdeux.com/products/collagen-brownie-batter.json"),
            ("og_image", "https://www.eatdeux.com/"),
            ("og_image", "https://www.eatdeux.com/collections/all-products"),
        ],
    },
    {
        "filename": "32-mid-day-squares-variety",
        "name": "Mid-Day Squares Variety Pack",
        "attempts": [
            ("shopify_json", "https://www.middaysquares.com/products/12-pack-cookie-dough.json"),
            ("og_image", "https://www.middaysquares.com/pages/12-pack-page"),
            ("og_image", "https://www.middaysquares.com/"),
            ("og_image", "https://www.amazon.com/Mid-Day-Squares-Protein-Chocolate-Certified/dp/B08HYCYTCK"),
        ],
    },
    {
        "filename": "33-chamberlain-coffee-cold-brew",
        "name": "Chamberlain Coffee Cold Brew",
        "attempts": [
            ("shopify_json", "https://chamberlaincoffee.com/products/chamberlain-coffee-cold-brew-coffee-starter-pack.json"),
            ("shopify_json", "https://chamberlaincoffee.com/products/variety-cold-brew-singles.json"),
            ("og_image", "https://chamberlaincoffee.com/products/chamberlain-coffee-cold-brew-coffee-starter-pack"),
            ("og_image", "https://chamberlaincoffee.com/collections/cold-brew-coffee"),
        ],
    },
    {
        "filename": "34-fieldwork-trail-joggers",
        "name": "Fieldwork Trail Joggers",
        "attempts": [
            ("og_image", "https://fieldworkclothing.com/"),
            ("og_image", "https://fieldworkclothing.com/collections/all"),
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
        for attr in [{"name": "twitter:image"}, {"property": "twitter:image"}]:
            tw_tag = soup.find("meta", attrs=attr)
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
    print(f"Downloading bundle product images → {DOWNLOAD_DIR}\n")
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

    print("\n" + "=" * 70)
    print("NOTE: The following brands from the bundles could NOT be found")
    print("as real DTC companies and may be fictional/placeholder names:")
    print("  - Noni (Organic Baby Wash)")
    print("  - Volta (Single Origin Pour Over)")
    print("  - Duskbody (Body Butter)")
    print("  - Solta (Calabrian Chili Honey / Pasta Kit)")
    print("  - Otis & Fern (Organic Dog Treats)")
    print("  - Veta (Adaptogen Pre-Workout)")
    print("  - Loom & Stone (Linen Duvet Set)")
    print("  - Hallow (Signature Candle)")
    print("  - 'a]' Natural Wine (brand name appears cut off)")


if __name__ == "__main__":
    main()
