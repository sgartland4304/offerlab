#!/usr/bin/env python3
"""
Generate category images for OfferLab using the Gemini API.

Each image follows a consistent template:
- Real product from a real e-commerce brand
- Vibrant monochromatic background matching the product's dominant color
- Subtle gradient/light refraction (not flat)
- Natural cast shadow, slightly tilted angle
- No text overlays — just the product
- Square composition, editorial product photography style

Usage:
    export GEMINI_API_KEY="your-key-here"
    python3 generate_category_images.py

Or pass the key directly:
    python3 generate_category_images.py --api-key "your-key-here"
"""

import argparse
import base64
import json
import os
import sys
import time
from typing import Optional
import requests

# ---------------------------------------------------------------------------
# Final 40 Category Definitions
# ---------------------------------------------------------------------------
CATEGORIES = [
    {
        "slug": "skin-care",
        "label": "Skin Care",
        "brand": "Drunk Elephant",
        "product": "Protini Polypeptide Cream",
        "description": "small white moisturizer jar with a signature purple/lavender lid and the Drunk Elephant logo",
        "color": "#7B68AE",
        "color_name": "purple",
    },
    {
        "slug": "coffee",
        "label": "Coffee",
        "brand": "Counter Culture Coffee",
        "product": "Hologram Blend bag",
        "description": "12 oz coffee bag with bold red-orange design, geometric typography, and the Counter Culture logo",
        "color": "#E94E43",
        "color_name": "warm red",
    },
    {
        "slug": "lip-eye-makeup",
        "label": "Lip & Eye Makeup",
        "brand": "Fenty Beauty",
        "product": "Gloss Bomb Universal Lip Luminizer in Fenty Glow",
        "description": "sleek elongated lip gloss tube with a faceted cap, in a warm peachy-gold tone",
        "color": "#E0A07A",
        "color_name": "warm peach",
    },
    {
        "slug": "baby-toddler",
        "label": "Baby & Toddler",
        "brand": "Mushie",
        "product": "Stacking Cups Toy",
        "description": "set of minimalist Scandinavian-style stacking cups in soft muted earth tones (sage, sand, blush, ivory)",
        "color": "#CEAE8F",
        "color_name": "warm sand",
    },
    {
        "slug": "pet-supplies",
        "label": "Pet Supplies",
        "brand": "Wild One",
        "product": "Harness Walk Kit in Spruce",
        "description": "modern dog harness and leash set in rich forest/spruce green with clean lines and matte hardware",
        "color": "#5A9E6F",
        "color_name": "spruce green",
    },
    {
        "slug": "supplements-vitamins",
        "label": "Supplements & Vitamins",
        "brand": "Ritual",
        "product": "Essential for Women 18+ Multivitamin",
        "description": "clear capsule bottle showing distinctive golden-yellow beadlet capsules inside, with minimal white label",
        "color": "#F4D35E",
        "color_name": "sunny yellow",
    },
    {
        "slug": "hair-care",
        "label": "Hair Care",
        "brand": "Olaplex",
        "product": "No. 3 Hair Perfector",
        "description": "cream/champagne colored bottle with simple black typography and the Olaplex logo",
        "color": "#E8D5B8",
        "color_name": "champagne beige",
    },
    {
        "slug": "candles-home-fragrance",
        "label": "Candles & Home Fragrance",
        "brand": "Boy Smells",
        "product": "KUSH Candle",
        "description": "candle with signature pink wax in a sleek translucent glass vessel with a minimalist black label",
        "color": "#F0BFC3",
        "color_name": "dusty rose pink",
    },
    {
        "slug": "perfumes-colognes",
        "label": "Perfumes & Colognes",
        "brand": "Le Labo",
        "product": "Santal 33 Eau de Parfum",
        "description": "apothecary-style brown glass bottle with typewriter-font label, warm amber liquid visible inside",
        "color": "#C9985A",
        "color_name": "warm amber",
    },
    {
        "slug": "snack-foods",
        "label": "Snack Foods",
        "brand": "Pipcorn",
        "product": "Heirloom Cheddar Cheese Balls",
        "description": "bright orange-yellow snack bag with playful hand-drawn illustrations and the Pipcorn logo",
        "color": "#F7B731",
        "color_name": "cheddar gold",
    },
    {
        "slug": "wellness",
        "label": "Wellness",
        "brand": "Moon Juice",
        "product": "Magnesi-Om",
        "description": "sleek supplement jar in berry/magenta tones with the Moon Juice logo, containing magnesium powder",
        "color": "#C54B8C",
        "color_name": "berry magenta",
    },
    {
        "slug": "bath-body",
        "label": "Bath & Body",
        "brand": "Necessaire",
        "product": "The Body Wash in Eucalyptus",
        "description": "minimalist pump bottle with clean sans-serif typography, cream/white body with green accent tones",
        "color": "#3A7D5C",
        "color_name": "sage green",
    },
    {
        "slug": "cereal-granola",
        "label": "Cereal & Granola",
        "brand": "Magic Spoon",
        "product": "Fruity Cereal",
        "description": "bold cereal box with pop-art inspired illustrations in hot pinks, purples, and warm tones",
        "color": "#FF6B9D",
        "color_name": "bubblegum pink",
    },
    {
        "slug": "nail-care",
        "label": "Nail Care",
        "brand": "Olive & June",
        "product": "CV nail polish",
        "description": "rounded nail polish bottle with signature poppy cap in bright cherry red color",
        "color": "#E63946",
        "color_name": "cherry red",
    },
    {
        "slug": "seasonings-spices",
        "label": "Seasonings & Spices",
        "brand": "Diaspora Co.",
        "product": "Pragati Turmeric",
        "description": "amber glass spice jar filled with vibrant golden turmeric powder, with a minimal craft-style label",
        "color": "#CC8400",
        "color_name": "turmeric ochre",
    },
    {
        "slug": "tea-infusions",
        "label": "Tea & Infusions",
        "brand": "Rishi Tea",
        "product": "Organic Ceremonial Matcha tin",
        "description": "elegant matcha tin in deep green with Japanese-inspired design and the Rishi Tea logo",
        "color": "#6B8E23",
        "color_name": "matcha green",
    },
    {
        "slug": "clean-beauty",
        "label": "Clean Beauty",
        "brand": "Tower 28",
        "product": "BeachPlease Luminous Tinted Balm in Golden Hour",
        "description": "compact round recyclable cosmetic tin with warm coral-orange tinted balm visible",
        "color": "#F4845F",
        "color_name": "sunset coral",
    },
    {
        "slug": "activewear",
        "label": "Activewear",
        "brand": "Girlfriend Collective",
        "product": "Plum Compressive High-Rise Legging",
        "description": "high-waisted athletic legging in rich deep plum purple, made from recycled materials",
        "color": "#8B3A7D",
        "color_name": "vibrant plum",
    },
    {
        "slug": "yoga-pilates",
        "label": "Yoga & Pilates",
        "brand": "Bala",
        "product": "Bala Bangles 1lb in Blush",
        "description": "pair of sleek wrist/ankle weights in soft blush pink silicone with a smooth curved bracelet-like design",
        "color": "#F0C4C8",
        "color_name": "warm blush pink",
    },
    {
        "slug": "sneakers",
        "label": "Sneakers",
        "brand": "On Running",
        "product": "Cloudmonster in Acai/Aloe",
        "description": "modern running shoe with exaggerated CloudTec sole in deep acai purple with bright aloe-green accents",
        "color": "#7D3C98",
        "color_name": "acai purple",
    },
    {
        "slug": "beverages",
        "label": "Beverages",
        "brand": "Liquid Death",
        "product": "Mountain Water tallboy can",
        "description": "tall matte aluminum can with bold skull artwork and heavy metal typography in teal and black",
        "color": "#00CED1",
        "color_name": "dark turquoise",
    },
    {
        "slug": "cosmetic-sets",
        "label": "Cosmetic Sets",
        "brand": "Charlotte Tilbury",
        "product": "Pillow Talk Icons Gift Set",
        "description": "luxurious gift set with rose-gold packaging containing lipstick and lip liner in dusty mauve-pink tones",
        "color": "#C48B8B",
        "color_name": "dusty mauve",
    },
    {
        "slug": "honey-preserves",
        "label": "Honey & Preserves",
        "brand": "Mike's Hot Honey",
        "product": "Original Hot Honey squeeze bottle",
        "description": "iconic squeeze bottle with retro-inspired red and yellow label, golden amber honey visible inside",
        "color": "#E8A817",
        "color_name": "golden amber",
    },
    {
        "slug": "jewelry",
        "label": "Jewelry",
        "brand": "Mejuri",
        "product": "Croissant Dome Ring in Gold Vermeil",
        "description": "sculptural twisted gold ring with a bold voluminous croissant dome design in warm 18k gold",
        "color": "#E8C472",
        "color_name": "warm gold",
    },
    {
        "slug": "cycling",
        "label": "Cycling",
        "brand": "Rapha",
        "product": "EF Education-EasyPost Pro Team Jersey",
        "description": "professional cycling jersey in bold bright pink with iconic argyle pattern design",
        "color": "#F06E9A",
        "color_name": "vibrant cycling pink",
    },
    {
        "slug": "cookies-bakery",
        "label": "Cookies & Bakery",
        "brand": "Last Crumb",
        "product": "The Core Cookie Collection box",
        "description": "luxury matte black cookie box with gold foil logo, individually wrapped cookies visible inside",
        "color": "#2B2B2B",
        "color_name": "rich charcoal black",
    },
    {
        "slug": "kitchen-dining",
        "label": "Kitchen & Dining",
        "brand": "Our Place",
        "product": "Always Pan 2.0 in Sage",
        "description": "iconic all-in-one cooking pan in sage green with built-in spatula rest, pour spout, and beechwood handle",
        "color": "#9DBF98",
        "color_name": "soft sage green",
    },
    {
        "slug": "outdoor-recreation",
        "label": "Outdoor Recreation",
        "brand": "Cotopaxi",
        "product": "Batac 16L Del Dia Backpack",
        "description": "colorful patchwork backpack made from remnant fabrics in turquoise, coral, purple, and yellow panels",
        "color": "#3AAFB9",
        "color_name": "Cotopaxi teal",
    },
    {
        "slug": "camping-hiking",
        "label": "Camping & Hiking",
        "brand": "Stanley",
        "product": "Quencher H2.0 FlowState Tumbler 40oz in Citron",
        "description": "large insulated tumbler with handle and straw in bright citron/lime green color",
        "color": "#B5CC18",
        "color_name": "bright lime",
    },
    {
        "slug": "linens-bedding",
        "label": "Linens & Bedding",
        "brand": "Parachute",
        "product": "Linen Sheet Set in Clay",
        "description": "naturally rumpled European flax linen sheets in warm terracotta clay color, folded neatly",
        "color": "#D49578",
        "color_name": "soft terracotta",
    },
    {
        "slug": "decor",
        "label": "Decor",
        "brand": "East Fork Pottery",
        "product": "The Mug in Tequila Sunrise glaze",
        "description": "handcrafted ceramic mug with rounded organic form in a rich warm orange Tequila Sunrise glaze",
        "color": "#D96A1E",
        "color_name": "sunset orange",
    },
    {
        "slug": "handbags-wallets",
        "label": "Handbags & Wallets",
        "brand": "Mansur Gavriel",
        "product": "Mini Bucket Bag in Ocean",
        "description": "minimal sculptural bucket bag in deep navy/ocean blue vegetable-tanned Italian calfskin leather",
        "color": "#1B3A5C",
        "color_name": "deep navy",
    },
    {
        "slug": "household-supplies",
        "label": "Household Supplies",
        "brand": "Blueland",
        "product": "The Clean Essentials Kit",
        "description": "set of pastel-colored translucent reusable acrylic spray bottles in blue, teal, and clear with minimal labels",
        "color": "#3B82C4",
        "color_name": "clean ocean blue",
    },
    {
        "slug": "fitness-exercise",
        "label": "Fitness & Exercise",
        "brand": "Therabody",
        "product": "Theragun Mini",
        "description": "compact triangular percussive therapy device in matte slate grey with a rubberized grip",
        "color": "#5A6169",
        "color_name": "slate grey",
    },
    {
        "slug": "toys-games",
        "label": "Toys & Games",
        "brand": "Fat Brain Toys",
        "product": "Tobbles Neo",
        "description": "rainbow set of smooth weighted spherical stacking pieces in green, orange, blue, red, yellow, and purple",
        "color": "#43A047",
        "color_name": "playful green",
    },
    {
        "slug": "candy-chocolate",
        "label": "Candy & Chocolate",
        "brand": "Compartes",
        "product": "California Love Dark Chocolate Salted Pretzel Bar",
        "description": "artisan chocolate bar with vibrant packaging showing a LA sunset scene with palm tree silhouettes in pinks and oranges",
        "color": "#D94E67",
        "color_name": "coral pink",
    },
    {
        "slug": "arts-crafts",
        "label": "Arts & Crafts",
        "brand": "Cricut",
        "product": "Joy Xtra Cutting Machine in Lavender",
        "description": "compact modern cutting machine in soft matte lavender purple with a sleek minimal design",
        "color": "#8B7CB8",
        "color_name": "creative lavender",
    },
    {
        "slug": "gifting-food-baskets",
        "label": "Gifting & Food Baskets",
        "brand": "Magnolia Bakery",
        "product": "Classic Banana Pudding",
        "description": "individual servings of creamy banana pudding in branded cups with Magnolia Bakery branding, creamy vanilla-banana color",
        "color": "#EDD97B",
        "color_name": "custard gold",
    },
    {
        "slug": "party-celebration",
        "label": "Party & Celebration",
        "brand": "Meri Meri",
        "product": "Rainbow Sun Dinner Plates",
        "description": "die-cut paper plates shaped like a smiling sun with multicolored rainbow rays bursting outward",
        "color": "#F7C948",
        "color_name": "festive sunshine yellow",
    },
    {
        "slug": "lighting",
        "label": "Lighting",
        "brand": "Gantri",
        "product": "Maskor Table Light in Coral",
        "description": "sculptural 3D-printed table lamp with concentric nautilus shell-like rings in warm coral color",
        "color": "#D9604A",
        "color_name": "rich terracotta coral",
    },
]


def build_prompt(cat: dict) -> str:
    """Build the Gemini image-generation prompt for a single category.

    Follows the prompt structure from .claude/skills/gemini-image/SKILL.md:
    Subject -> Style -> Composition -> Lighting -> Color palette -> Background
    -> Negative constraints.
    """
    return (
        # Subject
        f"Subject: A single {cat['brand']} {cat['product']} — "
        f"{cat['description']}. The real, recognizable retail product with "
        f"its actual branding and shape.\n\n"

        # Style
        f"Style: Photorealistic editorial product photography, shot on a "
        f"Hasselblad medium-format camera. High-end commercial DTC brand "
        f"aesthetic — the same look as Glossier Futuredew, Billie razor, "
        f"Ceremonia Aceite de Moska, and Kester Black nail polish campaigns. "
        f"Crisp, 8K quality, sharp focus on the product.\n\n"

        # Composition
        f"Composition: Square 1:1 aspect ratio. The product is the single "
        f"focal point, placed near the center of the frame, occupying roughly "
        f"50-60% of the vertical space. Slightly tilted/angled at a natural, "
        f"casual angle — never perfectly straight or rigid. Clean negative "
        f"space around the product.\n\n"

        # Lighting
        f"Lighting: Soft directional studio lighting coming from the upper-"
        f"left, creating a natural, elongated cast shadow falling toward the "
        f"lower-right of the product. The shadow should be soft-edged and "
        f"realistic — not a hard drop-shadow. The product appears to float "
        f"subtly above the surface with dimensional depth.\n\n"

        # Color palette / Background
        f"Color palette & Background: A vibrant monochromatic "
        f"{cat['color_name']} background, approximately hex {cat['color']}. "
        f"The background is NOT a flat fill — it has subtle light refraction, "
        f"gentle gradient variation, and soft tonal shifts as if lit by warm "
        f"studio light on a seamless paper backdrop. The background wraps "
        f"beneath the product, creating a continuous floor/wall surface.\n\n"

        # Negative constraints
        f"Do NOT include: any added text overlays, typography, captions, "
        f"labels, watermarks, borders, frames, logos beyond what exists on "
        f"the real product itself, people, hands, multiple products, or any "
        f"additional props. No studio equipment visible. No Photoshop "
        f"artifacts. Just the product, its shadow, and the colored background."
    )


def generate_image(
    api_key: str,
    prompt: str,
    model: str = "gemini-2.5-flash-image-preview",
    retries: int = 3,
) -> Optional[bytes]:
    """Call the Gemini API to generate an image. Returns raw image bytes.

    Default model is `gemini-2.5-flash-image-preview` (aka "nano banana")
    which is the current image-generation model on the Generative Language
    API. Pass `--model gemini-3-pro-image-preview` for highest quality if
    your API key has access.
    """
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/"
        f"models/{model}:generateContent?key={api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "temperature": 1.0,
        },
    }
    headers = {"Content-Type": "application/json"}

    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=120)
            if resp.status_code == 200:
                data = resp.json()
                for cand in data.get("candidates", []):
                    for part in cand.get("content", {}).get("parts", []):
                        if "inlineData" in part:
                            return base64.b64decode(part["inlineData"]["data"])
                print("  Warning: 200 OK but no image data in response")
                return None
            elif resp.status_code == 429:
                wait = 2 ** attempt
                print(f"  Rate limited (429). Waiting {wait}s before retry...")
                time.sleep(wait)
            else:
                print(f"  Error {resp.status_code}: {resp.text[:200]}")
                if attempt < retries:
                    time.sleep(2 ** attempt)
        except requests.exceptions.Timeout:
            print(f"  Timeout on attempt {attempt}/{retries}")
            if attempt < retries:
                time.sleep(2 ** attempt)
        except Exception as e:
            print(f"  Exception: {e}")
            if attempt < retries:
                time.sleep(2 ** attempt)

    return None


def main():
    parser = argparse.ArgumentParser(description="Generate OfferLab category images")
    parser.add_argument("--api-key", default=os.environ.get("GEMINI_API_KEY", ""),
                        help="Gemini API key (or set GEMINI_API_KEY env var)")
    parser.add_argument("--output-dir", default=".",
                        help="Directory to save images (default: current dir)")
    parser.add_argument("--start", type=int, default=0,
                        help="Start index (0-based) to resume from")
    parser.add_argument("--only", type=str, default="",
                        help="Comma-separated slugs to generate (e.g. 'coffee,tea-infusions')")
    parser.add_argument("--delay", type=float, default=2.0,
                        help="Seconds to wait between API calls (default: 2)")
    parser.add_argument("--model", type=str,
                        default="gemini-2.5-flash-image-preview",
                        help="Gemini model name (default: gemini-2.5-flash-image-preview). "
                             "Try 'gemini-3-pro-image-preview' for higher quality.")
    args = parser.parse_args()

    if not args.api_key:
        print("Error: No API key. Set GEMINI_API_KEY or pass --api-key")
        sys.exit(1)

    os.makedirs(args.output_dir, exist_ok=True)

    cats = CATEGORIES
    if args.only:
        slugs = {s.strip() for s in args.only.split(",")}
        cats = [c for c in cats if c["slug"] in slugs]

    cats = cats[args.start:]
    total = len(cats)

    print(f"\nGenerating {total} category images...")
    print(f"Output directory: {os.path.abspath(args.output_dir)}\n")

    succeeded = 0
    failed = []

    for i, cat in enumerate(cats):
        idx = args.start + i + 1
        print(f"[{idx}/{args.start + total}] {cat['label']} "
              f"({cat['brand']} {cat['product']})...")

        prompt = build_prompt(cat)
        img_data = generate_image(args.api_key, prompt, model=args.model)

        if img_data:
            path = os.path.join(args.output_dir, f"{cat['slug']}.png")
            with open(path, "wb") as f:
                f.write(img_data)
            print(f"  Saved: {path} ({len(img_data):,} bytes)")
            succeeded += 1
        else:
            print(f"  FAILED: {cat['label']}")
            failed.append(cat["slug"])

        if i < total - 1:
            time.sleep(args.delay)

    print(f"\nDone! {succeeded}/{total} images generated.")
    if failed:
        print(f"Failed: {', '.join(failed)}")
        print(f"Re-run with: --only {','.join(failed)}")


if __name__ == "__main__":
    main()
