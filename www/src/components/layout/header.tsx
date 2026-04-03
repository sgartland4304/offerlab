import Link from "next/link";

const navItems = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">
          OfferLab
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-body-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="https://app.offerlab.com/login"
            className="text-body-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="https://app.offerlab.com/signup"
            className="rounded-full bg-foreground px-4 py-2 text-body-sm font-medium text-background transition-colors hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
