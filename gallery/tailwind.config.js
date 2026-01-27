// Tailwind Configuration for Product Gallery
// Uses OfferLab color system from Figma
// Add this to your existing tailwind.config.js or merge with your current config

module.exports = {
  content: [
    // Your existing content paths
    './app/views/**/*.html.erb',
    './app/javascript/**/*.js',
    './app/assets/stylesheets/**/*.css',
    './gallery/**/*.html',
    './gallery/**/*.erb',
  ],
  theme: {
    extend: {
      colors: {
        // Content colors
        'content-primary': 'var(--content-primary, #342E26)',
        'content-secondary': 'var(--content-secondary, #342E26A3)',
        'content-tertiary': 'var(--content-tertiary, #342E2670)',
        'content-interactive-primary': 'var(--content-interactive-primary, #342E26)',
        'content-interactive-secondary': 'var(--content-interactive-secondary)',
        'content-interactive-tertiary': 'var(--content-interactive-tertiary)',
        
        // Border colors
        'content-border-neutral': 'var(--content-border-neutral, rgba(52, 46, 38, 0.08))',
        'content-border-light': 'var(--content-border-light)',
        'content-border-dark': 'var(--content-border-dark)',
        'content-border-input': 'var(--content-border-input)',
        'content-border-card': 'var(--content-border-card)',
        
        // Background colors
        'content-background-base': 'var(--content-background-base, #F7F5F0)',
        'content-background-screen': 'var(--content-background-screen)',
        'content-background-elevated': 'var(--content-background-elevated, #FFF)',
        'content-background-neutral': 'var(--content-background-neutral)',
        'content-background-overlay': 'var(--content-background-overlay)',
        'content-background-overlay-hover': 'var(--content-background-overlay-hover)',
        'content-background-card-bg': 'var(--content-background-card-bg)',
        'content-background-modal-overlay': 'var(--content-background-modal-overlay)',
        
        // Sentiment colors
        'content-sentiment-warning': 'var(--content-sentiment-warning)',
        'content-sentiment-negative': 'var(--content-sentiment-negative)',
        'content-sentiment-positive': 'var(--content-sentiment-positive)',
        
        // Brand colors
        'brand-primary-brew': 'var(--brand-primary-brew, #342E26)',
        'brand-primary-shine': 'var(--brand-primary-shine)',
        'brand-primary-crisp': 'var(--brand-primary-crisp)',
        'brand-secondary-spice': 'var(--brand-secondary-spice)',
        'brand-secondary-piggy': 'var(--brand-secondary-piggy)',
        'brand-secondary-moola': 'var(--brand-secondary-moola)',
        'brand-secondary-mint': 'var(--brand-secondary-mint)',
        
        // Status colors
        'brand-status-status-silver': 'var(--brand-status-status-silver)',
        'brand-status-status-silver-secondary': 'var(--brand-status-status-silver-secondary)',
        'brand-status-status-gold': 'var(--brand-status-status-gold)',
        'brand-status-status-gold-secondary': 'var(--brand-status-status-gold-secondary)',
        'brand-status-status-green': 'var(--brand-status-status-green)',
        'brand-status-status-green-secondary': 'var(--brand-status-status-green-secondary)',
        
        // Spice palette
        'spice-50': 'var(--spice-50)',
        'spice-100': 'var(--spice-100)',
        'spice-200': 'var(--spice-200)',
        'spice-300': 'var(--spice-300)',
        'spice-400': 'var(--spice-400)',
        'spice-500': 'var(--spice-500)',
        'spice-600': 'var(--spice-600)',
        'spice-700': 'var(--spice-700)',
        'spice-800': 'var(--spice-800)',
        'spice-900': 'var(--spice-900)',
        'spice-950': 'var(--spice-950)',
        
        // Mint palette
        'mint-50': 'var(--mint-50)',
        'mint-100': 'var(--mint-100)',
        'mint-200': 'var(--mint-200)',
        'mint-300': 'var(--mint-300)',
        'mint-400': 'var(--mint-400)',
        'mint-500': 'var(--mint-500)',
        'mint-600': 'var(--mint-600)',
        'mint-700': 'var(--mint-700)',
        'mint-800': 'var(--mint-800)',
        'mint-900': 'var(--mint-900)',
        'mint-950': 'var(--mint-950)',
        
        // Green palette
        'green-50': 'var(--green-50)',
        'green-100': 'var(--green-100)',
        'green-200': 'var(--green-200)',
        'green-300': 'var(--green-300)',
        'green-400': 'var(--green-400)',
        'green-500': 'var(--green-500)',
        'green-600': 'var(--green-600)',
        'green-700': 'var(--green-700)',
        'green-800': 'var(--green-800)',
        'green-900': 'var(--green-900)',
        'green-950': 'var(--green-950)',
        
        // Red palette
        'red-50': 'var(--red-50)',
        'red-100': 'var(--red-100)',
        'red-200': 'var(--red-200)',
        'red-300': 'var(--red-300)',
        'red-400': 'var(--red-400)',
        'red-500': 'var(--red-500)',
        'red-600': 'var(--red-600)',
        'red-700': 'var(--red-700)',
        'red-800': 'var(--red-800)',
        'red-900': 'var(--red-900)',
        'red-950': 'var(--red-950)',
        
        // Yellow palette
        'yellow-50': 'var(--yellow-50)',
        'yellow-100': 'var(--yellow-100)',
        'yellow-200': 'var(--yellow-200)',
        'yellow-300': 'var(--yellow-300)',
        'yellow-400': 'var(--yellow-400)',
        'yellow-500': 'var(--yellow-500)',
        'yellow-600': 'var(--yellow-600)',
        'yellow-700': 'var(--yellow-700)',
        'yellow-800': 'var(--yellow-800)',
        'yellow-900': 'var(--yellow-900)',
        'yellow-950': 'var(--yellow-950)',
        
        // Orange palette
        'orange-50': 'var(--orange-50)',
        'orange-100': 'var(--orange-100)',
        'orange-200': 'var(--orange-200)',
        'orange-300': 'var(--orange-300)',
        'orange-400': 'var(--orange-400)',
        'orange-500': 'var(--orange-500)',
        'orange-600': 'var(--orange-600)',
        'orange-700': 'var(--orange-700)',
        'orange-800': 'var(--orange-800)',
        'orange-900': 'var(--orange-900)',
        'orange-950': 'var(--orange-950)',
        
        // Grayscale
        'grayscale-gray-1': 'var(--grayscale-gray-1)',
        'grayscale-gray-2': 'var(--grayscale-gray-2)',
        'grayscale-gray-3': 'var(--grayscale-gray-3)',
        'grayscale-gray-4': 'var(--grayscale-gray-4)',
        'grayscale-gray-5': 'var(--grayscale-gray-5)',
        'grayscale-gray-6': 'var(--grayscale-gray-6)',
        'grayscale-gray-7': 'var(--grayscale-gray-7)',
        'grayscale-gray-8': 'var(--grayscale-gray-8)',
        'grayscale-gray-9': 'var(--grayscale-gray-9)',
        'grayscale-gray-10': 'var(--grayscale-gray-10)',
        
        // Data values
        'data-value-1': 'var(--data-value-1)',
        'data-value-2': 'var(--data-value-2)',
        'data-value-3': 'var(--data-value-3)',
        'data-value-4': 'var(--data-value-4)',
        'data-value-5': 'var(--data-value-5)',
        
        // Base colors
        'white': 'var(--white, #FFF)',
        'black': 'var(--black, #000)',
        
        // Text
        'content-text-placeholder': 'var(--content-text-placeholder)',
        'content-focus-outline': 'var(--content-focus-outline)',
      },
      borderRadius: {
        'xs': 'var(--rounded-xs, 3px)',
        'sm': 'var(--rounded-sm, 4px)',
        'md': 'var(--rounded-md, 8px)',
        'lg': 'var(--rounded-lg, 10px)',
        'xl': 'var(--rounded-xl, 12px)',
        '2xl': 'var(--rounded-2xl, 16px)',
        '3xl': 'var(--rounded-3xl, 20px)',
        '4xl': 'var(--rounded-4xl, 24px)',
        '28': 'var(--rounded-28, 28px)',
        '5xl': 'var(--rounded-5xl, 32px)',
        '36': 'var(--rounded-36, 36px)',
        '40': 'var(--rounded-40, 40px)',
        'full': 'var(--rounded-full, 99999px)',
      },
      letterSpacing: {
        'normal': 'var(--tracking-normal, 0px)',
        'tight-1': 'var(--tracking-tight-1)',
        'tight-2': 'var(--tracking-tight-2)',
        'tight-3': 'var(--tracking-tight-3)',
        'tight-4': 'var(--tracking-tight-4)',
        'tight-8': 'var(--tracking-tight-8)',
        'tight-10': 'var(--tracking-tight-10)',
      },
      fontSize: {
        '8xl': 'var(--size-8xl, 96px)',
        '7xl': 'var(--size-7xl, 80px)',
        '6xl': 'var(--size-6xl, 56px)',
        '5xl': 'var(--size-5xl, 48px)',
        '4xl': 'var(--size-4xl, 40px)',
        '3xl': 'var(--size-3xl, 32px)',
        '26': 'var(--size-26, 26px)',
        '2xl': 'var(--size-2xl, 24px)',
        'xl': 'var(--size-xl, 21px)',
        'lg': 'var(--size-lg, 18px)',
        'base': 'var(--size-base, 16px)',
        'sm': 'var(--size-sm, 14px)',
        'xs': 'var(--size-xs, 12px)',
        'xxs': 'var(--size-xxs, 10px)',
      },
      lineHeight: {
        'snug': 'var(--lineHeight-snug, 133%)',
        'normal': 'var(--lineHeight-normal, 150%)',
        'tight': 'var(--lineHeight-tight, 120%)',
      },
    }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: false, // Disable DaisyUI themes, use custom colors
  },
}
