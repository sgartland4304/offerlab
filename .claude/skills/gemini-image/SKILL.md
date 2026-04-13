---
name: gemini-image
description: "Generate and edit images using Google Gemini image models. Use when the user wants to create images, edit photos, generate product shots, mockups, icons, illustrations, or any visual asset. Triggers: 'generate an image', 'create a photo', 'make me an image of', 'edit this image', 'photoshoot', 'product shot', 'mockup image', or when a task requires producing image files."
allowed-tools:
  - mcp__gemini__generate_image
  - mcp__gemini__edit_image
  - mcp__gemini__load_image_from_path
  - mcp__gemini__describe_image
  - mcp__gemini__analyze_image
  - Read
  - Bash
  - Glob
---

# Gemini Image Generation & Editing Skill

Use Google Gemini's image models via the available MCP tools to generate and edit images.

## Available Tools

| Tool | Purpose |
|---|---|
| `mcp__gemini__generate_image` | Create new images from text prompts |
| `mcp__gemini__edit_image` | Edit existing images with instructions |
| `mcp__gemini__load_image_from_path` | Load a local image file for editing |
| `mcp__gemini__describe_image` | Describe what's in an image |
| `mcp__gemini__analyze_image` | Analyze image contents in detail |

## Workflow

### Generating a new image

1. **Craft the prompt** using the guidelines below.
2. Call `mcp__gemini__generate_image` with:
   - `prompt`: The detailed image description
   - `outputPath`: Where to save (e.g., `./assets/hero-image.png`)
   - `aspectRatio`: Match the use case (`16:9` for banners, `1:1` for social, `9:16` for stories, `4:3` for product shots)
   - `model`: Default `gemini-3-pro-image-preview` is best for quality. Use `gemini-2.5-flash-image` for speed.
3. Show the user the result by reading the saved image with the `Read` tool.
4. Offer to iterate — Gemini supports conversational editing via `thoughtSignature`.

### Editing an existing image

1. Load the image: `mcp__gemini__load_image_from_path` with the file path.
2. Call `mcp__gemini__edit_image` with:
   - `prompt`: Natural language edit instructions
   - `images`: Array with the loaded image (use `filePath` directly — no need to base64 encode)
   - `outputPath`: Where to save the edited version
3. For iterative edits, pass the `thoughtSignature` from the previous response to maintain context.

### Conversational editing (multi-turn)

When refining an image across multiple turns:
1. Generate or edit the initial image — capture the `thoughtSignature` from the response.
2. On subsequent edits, include the `thoughtSignature` in the images array to maintain continuity.
3. This lets Gemini understand what it already created and make targeted refinements.

## Prompt Engineering Guidelines

### Structure your prompts with these elements:

1. **Subject**: What is the main focus? ("a sleek wireless earbud", "a cozy coffee shop interior")
2. **Style**: What aesthetic? ("photorealistic", "flat illustration", "watercolor", "3D render", "minimalist")
3. **Composition**: How is it framed? ("close-up", "birds-eye view", "centered on white background", "rule of thirds")
4. **Lighting**: What mood? ("soft natural light", "dramatic studio lighting", "golden hour", "neon glow")
5. **Color palette**: What tones? ("warm earth tones", "vibrant pop colors", "monochrome", "pastel")
6. **Context/Background**: What surrounds it? ("on a marble countertop", "floating on gradient background", "in a modern kitchen")

### Prompt patterns for common use cases:

**Product shot on clean background:**
> "Professional product photography of [product], centered on a clean white background, soft studio lighting with subtle shadows, sharp focus, high-end commercial style, 8K quality"

**Lifestyle/contextual product shot:**
> "Lifestyle photography of [product] in [setting], natural lighting, shallow depth of field, warm color grading, editorial magazine style"

**Bundle/multi-product shot:**
> "Flat lay arrangement of [products] on [surface], overhead shot, even soft lighting, styled with [props], commercial photography"

**UI mockup / app screenshot:**
> "Clean UI screenshot showing [description], modern design, [light/dark] mode, SF Pro font style, iOS/Android native feel"

**Icon or illustration:**
> "Minimal flat vector illustration of [subject], [color palette], clean lines, no background, SVG-ready style"

**Social media graphic:**
> "Eye-catching social media post for [topic], bold typography, vibrant [brand colors], modern layout, Instagram-ready"

### Tips:
- Be specific about what you DON'T want: "no text overlays", "no people", "no watermarks"
- Reference real photography styles: "shot on Hasselblad", "Kinfolk magazine aesthetic"
- For product images, specify material/finish: "matte black aluminum", "frosted glass", "brushed steel"
- Use `use_search: true` when the image needs real-world data (weather, current events, statistics)

## Output Conventions

- Save generated images to a sensible location relative to the project (e.g., `./assets/`, `./images/`, or alongside the relevant code)
- Use descriptive filenames: `hero-banner-dark.png`, `product-bundle-flat-lay.png`
- Default to PNG for quality; suggest JPEG if file size matters
- Always show the user the generated image after saving by reading it with the `Read` tool
- If the user doesn't specify a location, ask or default to `./generated-images/`

## Model Selection

| Model | Best for |
|---|---|
| `gemini-3-pro-image-preview` | Highest quality, photorealistic, complex scenes (default) |
| `gemini-2.5-flash-image` | Fast iterations, drafts, simpler images |
| `nano-banana-pro-preview` | Experimental, creative styles |
