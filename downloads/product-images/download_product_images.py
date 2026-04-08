#!/usr/bin/env python3
"""
Download featured product images for 24 DTC brand products.
Most brands use Shopify, so we try the Shopify JSON API first,
then fall back to og:image scraping.

Usage:
    pip install requests beautifulsoup4
    python download_product_images.py
"""

import os
import re
import json
import time
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

DOWNLOAD_DIR = os.path.dirname(os.path.abspath(__file__))
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
              "image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

# Product definitions: (filename, product_page_url, shopify_json_url_or_None)
PRODUCTS = [
    (
        "01-glossier-boy-brow",
        "https://www.glossier.com/products/boy-brow",
        "https://www.glossier.com/products/boy-brow.json",
    ),
    (
        "02-rhode-peptide-lip-treatment",
        "https://www.rhodeskin.com/products/peptide-lip-treatment",
        "https://www.rhodeskin.com/products/peptide-lip-treatment.json",
    ),
    (
        "03-drunk-elephant-protini-polypeptide-cream",
        "https://www.drunkelephant.com/protini-polypeptide-firming-refillable-moisturizer-856556004739.html",
        None,  # Not Shopify
    ),
    (
        "04-summer-fridays-jet-lag-mask",
        "https://summerfridays.com/products/jet-lag-mask",
        "https://summerfridays.com/products/jet-lag-mask.json",
    ),
    (
        "05-tower-28-shineon-lip-jelly",
        "https://www.tower28beauty.com/products/shine-on-lip-gloss-jelly",
        "https://www.tower28beauty.com/products/shine-on-lip-gloss-jelly.json",
    ),
    (
        "06-supergoop-unseen-sunscreen",
        "https://supergoop.com/products/unseen-sunscreen-spf-50",
        "https://supergoop.com/products/unseen-sunscreen-spf-50.json",
    ),
    (
        "07-kosas-cloud-set-setting-powder",
        "https://kosas.com/products/cloud-set",
        "https://kosas.com/products/cloud-set.json",
    ),
    (
        "08-merit-minimalist-complexion-stick",
        "https://www.meritbeauty.com/products/the-minimalist",
        "https://www.meritbeauty.com/products/the-minimalist.json",
    ),
    (
        "09-olaplex-no3-hair-perfector",
        "https://olaplex.com/products/olaplex-n-3-hair-perfector-us",
        "https://olaplex.com/products/olaplex-n-3-hair-perfector-us.json",
    ),
    (
        "10-necessaire-the-body-wash",
        "https://necessaire.com/products/the-body-wash-pump-fragrance-free",
        "https://necessaire.com/products/the-body-wash-pump-fragrance-free.json",
    ),
    (
        "11-touchland-power-mist",
        "https://touchland.com/products/rainwater-power-mist",
        "https://touchland.com/products/rainwater-power-mist.json",
    ),
    (
        "12-olipop-vintage-cola",
        "https://drinkolipop.com/products/vintage-cola",
        "https://drinkolipop.com/products/vintage-cola.json",
    ),
    (
        "13-graza-sizzle-olive-oil",
        "https://www.graza.co/products/sizzle",
        "https://www.graza.co/products/sizzle.json",
    ),
    (
        "14-chamberlain-coffee-social-dog",
        "https://chamberlaincoffee.com/products/social-dog-blend",
        "https://chamberlaincoffee.com/products/social-dog-blend.json",
    ),
    (
        "15-boy-smells-de-nimes-candle",
        "https://boysmells.com/collections/candles",
        None,  # Need to find specific product URL
    ),
    (
        "16-little-spoon-lunchers",
        "https://www.littlespoon.com/products/lunchers",
        None,  # Not standard Shopify
    ),
    (
        "17-wild-one-harness",
        "https://wildone.com/products/dog-harness",
        "https://wildone.com/products/dog-harness.json",
    ),
    (
        "18-magic-spoon-cereal",
        "https://magicspoon.com/",
        None,  # Homepage, needs special handling
    ),
    (
        "19-fly-by-jing-sichuan-chili-crisp",
        "https://flybyjing.com/products/sichuan-chili-crisp",
        "https://flybyjing.com/products/sichuan-chili-crisp.json",
    ),
    (
        "20-bala-weighted-bangles",
        "https://shopbala.com/products/bala-bangles",
        "https://shopbala.com/products/bala-bangles.json",
    ),
    (
        "21-our-place-always-pan",
        "https://fromourplace.com/products/always-essential-cooking-pan",
        "https://fromourplace.com/products/always-essential-cooking-pan.json",
    ),
    (
        "22-mejuri-croissant-dome-ring",
        "https://mejuri.com/shop/products/croissant-dome-ring",
        None,  # Non-standard Shopify URL
    ),
    (
        "23-liquid-iv-hydration-multiplier",
        "https://www.liquid-iv.com/products/lemon-lime-hydration-multiplier",
        "https://www.liquid-iv.com/products/lemon-lime-hydration-multiplier.json",
    ),
    (
        "24-bloom-nutrition-greens",
        "https://bloomnu.com/products/greens-superfoods",
        "https://bloomnu.com/products/greens-superfoods.json",
    ),
]


def get_extension(url, content_type=None):
    """Determine file extension from URL or content-type."""
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
        if "gif" in ct:
            return ".gif"
        if "avif" in ct:
            return ".avif"
    return ".jpg"  # default


def download_image(image_url, filepath):
    """Download an image from a URL to a local filepath."""
    try:
        # Clean up Shopify URL - get a good size
        if "cdn.shopify.com" in image_url:
            # Remove size parameters to get original/large image
            image_url = re.sub(r'_\d+x\d+', '', image_url)
            image_url = re.sub(r'\?v=\d+', '', image_url)
            # Request a reasonable size
            if "?" not in image_url:
                image_url += "?width=1000"
            else:
                image_url += "&width=1000"

        resp = requests.get(image_url, headers=HEADERS, timeout=30, stream=True)
        resp.raise_for_status()

        content_type = resp.headers.get("Content-Type", "")
        ext = get_extension(image_url, content_type)

        # Adjust filepath extension if needed
        base = os.path.splitext(filepath)[0]
        filepath = base + ext

        with open(filepath, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_kb = os.path.getsize(filepath) / 1024
        print(f"    -> Saved: {os.path.basename(filepath)} ({size_kb:.1f} KB)")
        return True
    except Exception as e:
        print(f"    -> Download failed: {e}")
        return False


def try_shopify_json(json_url, filepath):
    """Try to get the product image from Shopify's JSON API."""
    try:
        resp = requests.get(json_url, headers=HEADERS, timeout=15)
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
                # Ensure https
                if image_url.startswith("//"):
                    image_url = "https:" + image_url
                print(f"    Found via Shopify JSON: {image_url[:80]}...")
                return download_image(image_url, filepath)
    except Exception as e:
        print(f"    Shopify JSON failed: {e}")
    return False


def try_og_image(page_url, filepath):
    """Try to get the product image from og:image meta tag."""
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Try og:image first
        og_tag = soup.find("meta", property="og:image")
        if og_tag and og_tag.get("content"):
            image_url = og_tag["content"]
            if image_url.startswith("//"):
                image_url = "https:" + image_url
            print(f"    Found via og:image: {image_url[:80]}...")
            return download_image(image_url, filepath)

        # Try twitter:image
        tw_tag = soup.find("meta", attrs={"name": "twitter:image"})
        if tw_tag and tw_tag.get("content"):
            image_url = tw_tag["content"]
            if image_url.startswith("//"):
                image_url = "https:" + image_url
            print(f"    Found via twitter:image: {image_url[:80]}...")
            return download_image(image_url, filepath)

        # Try first product image in common patterns
        for selector in [
            'img[class*="product"]',
            'img[class*="hero"]',
            'img[class*="featured"]',
            'img[data-src]',
            ".product-image img",
            ".product__image img",
            "#product-image img",
        ]:
            img = soup.select_one(selector)
            if img:
                image_url = img.get("src") or img.get("data-src") or img.get("srcset", "").split(",")[0].split(" ")[0]
                if image_url:
                    if image_url.startswith("//"):
                        image_url = "https:" + image_url
                    elif image_url.startswith("/"):
                        parsed = urlparse(page_url)
                        image_url = f"{parsed.scheme}://{parsed.netloc}{image_url}"
                    print(f"    Found via CSS selector: {image_url[:80]}...")
                    return download_image(image_url, filepath)

    except Exception as e:
        print(f"    og:image scraping failed: {e}")
    return False


def try_google_shopping(product_name, filepath):
    """
    As a last resort, try to get an image via Google's search suggestions.
    This searches Google Shopping and extracts the first product image.
    """
    try:
        search_url = f"https://www.google.com/search?q={requests.utils.quote(product_name + ' product')}&tbm=shop"
        resp = requests.get(search_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()

        # Look for product image URLs in the response
        soup = BeautifulSoup(resp.text, "html.parser")

        # Google shopping images are often in img tags or encoded in scripts
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src.startswith("http") and ("encrypted-tbn" in src or "gstatic" in src):
                print(f"    Found via Google Shopping: {src[:80]}...")
                return download_image(src, filepath)

        # Try regular Google image search as fallback
        search_url = f"https://www.google.com/search?q={requests.utils.quote(product_name + ' product image')}&tbm=isch"
        resp = requests.get(search_url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")

        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src.startswith("http") and "gstatic" in src and len(src) > 50:
                print(f"    Found via Google Images: {src[:80]}...")
                return download_image(src, filepath)

    except Exception as e:
        print(f"    Google Shopping search failed: {e}")
    return False


def main():
    print(f"Downloading product images to: {DOWNLOAD_DIR}\n")
    print("=" * 70)

    success_count = 0
    failed = []

    for filename, page_url, json_url in PRODUCTS:
        product_name = filename.split("-", 1)[1].replace("-", " ").title()
        print(f"\n[{filename.split('-')[0]}] {product_name}")
        print(f"    URL: {page_url}")

        filepath = os.path.join(DOWNLOAD_DIR, filename)
        downloaded = False

        # Strategy 1: Shopify JSON API
        if json_url and not downloaded:
            downloaded = try_shopify_json(json_url, filepath)

        # Strategy 2: og:image from product page
        if not downloaded:
            downloaded = try_og_image(page_url, filepath)

        # Strategy 3: Google Shopping as last resort
        if not downloaded:
            downloaded = try_google_shopping(product_name, filepath)

        if downloaded:
            success_count += 1
        else:
            failed.append(product_name)
            print(f"    *** FAILED to download image ***")

        # Be polite to servers
        time.sleep(1)

    print("\n" + "=" * 70)
    print(f"\nResults: {success_count}/{len(PRODUCTS)} images downloaded successfully")

    if failed:
        print(f"\nFailed products ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")
        print("\nFor failed products, try manually downloading from the product page URLs above.")


if __name__ == "__main__":
    main()
