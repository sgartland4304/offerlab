import fs from "node:fs";
import path from "node:path";

const ICONS_DIR = path.join(process.cwd(), "public/icons");
const iconCache = new Map<string, string>();

function loadIcon(name: string): string {
  const cached = iconCache.get(name);
  if (cached) return cached;
  const raw = fs.readFileSync(path.join(ICONS_DIR, `${name}.svg`), "utf-8");
  iconCache.set(name, raw);
  return raw;
}

interface IconProps {
  /** File name (without .svg) inside public/icons. e.g. "arrow-right" */
  name: string;
  /** Tailwind size + color classes. Default: `size-5` (20px). */
  className?: string;
  /** If set, renders with role="img" and aria-label. Otherwise aria-hidden. */
  title?: string;
}

/**
 * Server-rendered SVG icon.
 *
 * Inlines SVGs from /public/icons/*.svg at render time so they tint with
 * `currentColor` via Tailwind `text-*` classes.
 *
 * Example:
 *   <Icon name="arrow-right" className="size-5 text-content-primary" />
 */
export function Icon({ name, className = "size-5", title }: IconProps) {
  let svg = loadIcon(name);

  // Strip width/height hard-coded attrs so className size-* works.
  svg = svg.replace(/\s(width|height)="[^"]*"/g, "");

  // Inject className + accessibility attrs into the <svg> tag.
  const a11y = title
    ? `role="img" aria-label="${title}"`
    : 'aria-hidden="true" focusable="false"';

  svg = svg.replace(
    /<svg([^>]*?)>/,
    `<svg$1 class="${className}" ${a11y}>`
  );

  return <span className="inline-flex" dangerouslySetInnerHTML={{ __html: svg }} />;
}
