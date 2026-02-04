/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './**/*.js',
  ],
  theme: {
    extend: {
      fontSize: {
        'display-small': ['var(--size-4xl, 40px)', { lineHeight: '120%', letterSpacing: '-0.05em' }],
        'display-medium': ['var(--size-6xl, 88px)', { lineHeight: '120%', letterSpacing: '-0.05em' }],
      },
      colors: {
        /* OfferLab design system */
        'content-primary': 'var(--content-primary, #342E26)',
        'content-secondary': 'var(--content-secondary)',
        'content-tertiary': 'var(--content-tertiary)',
        'content-background-base': 'var(--content-background-base, #F7F5F0)',
        'content-background-elevated': 'var(--content-background-elevated, #FFF)',
        'content-border-neutral': 'var(--content-border-neutral)',
        'brand-primary-brew': 'var(--brand-primary-brew, #342E26)',
        'brand-secondary-spice': 'var(--brand-secondary-spice, #713636)',
        'brand-secondary-mint': 'var(--brand-secondary-mint)',
        'brand-secondary-moola': 'var(--brand-secondary-moola)',
      },
    },
  },
  plugins: [],
};
