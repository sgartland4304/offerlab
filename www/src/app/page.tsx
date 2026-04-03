import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Section className="text-center">
        <h1 className="mx-auto max-w-4xl text-display font-bold tracking-tight">
          Build Better Offers
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-body-lg text-muted">
          OfferLab helps you build, test, and optimize high-converting offers
          — so you can grow revenue without guessing.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button href="https://app.offerlab.com/signup" size="lg">
            Get Started Free
          </Button>
          <Button href="/#product" variant="secondary" size="lg">
            See How It Works
          </Button>
        </div>
      </Section>

      {/* Product */}
      <Section id="product" className="bg-surface">
        <h2 className="text-center text-h2 font-bold tracking-tight">
          Everything you need to craft irresistible offers
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-body-lg text-muted">
          From ideation to optimization, OfferLab gives you the tools to create
          offers that convert.
        </p>
      </Section>

      {/* Pricing */}
      <Section id="pricing">
        <h2 className="text-center text-h2 font-bold tracking-tight">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-body-lg text-muted">
          Start for free. Upgrade when you&apos;re ready.
        </p>
      </Section>
    </>
  );
}
