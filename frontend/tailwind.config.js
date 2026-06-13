/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        neon: '#A6FF4D',
        gold: '#D4AF37',
        luxury: {
          900: '#080B0C',
          800: '#0D1215',
          700: '#141B20',
          600: '#1C262C',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'luxury-gradient': 'radial-gradient(ellipse at top, #0D1A14 0%, #080B0C 50%, #080B0C 100%)',
        'neon-glow': 'radial-gradient(circle at 50% 0%, rgba(166,255,77,0.15) 0%, transparent 60%)',
        'gold-glow': 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(166,255,77,0.15), 0 0 40px rgba(166,255,77,0.05)',
        'neon-sm': '0 0 10px rgba(166,255,77,0.1)',
        'gold': '0 0 20px rgba(212,175,55,0.15), 0 0 40px rgba(212,175,55,0.05)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'count-up': 'countUp 2s ease-out forwards',
        'particle': 'particle 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(166,255,77,0.1), 0 0 10px rgba(166,255,77,0.05)' },
          '100%': { boxShadow: '0 0 20px rgba(166,255,77,0.2), 0 0 40px rgba(166,255,77,0.1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        particle: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '25%': { transform: 'translate(100px, -50px) scale(1.5)', opacity: '0.6' },
          '50%': { transform: 'translate(50px, -100px) scale(0.8)', opacity: '0.4' },
          '75%': { transform: 'translate(-50px, -50px) scale(1.2)', opacity: '0.5' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
