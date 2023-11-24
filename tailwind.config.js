/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        "4xl": "2400px",
      },
    },
    extend: {
      padding: {
        '17': '4.25rem',
        '26': '6.5rem',
        '12.5': '3.125rem',
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '17.5': '4.375rem'
      },

      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '22': '5.5rem',
        '25': '6.25rem',
        '30': '7.5rem',
        '31': '7.75rem',
        '33': '8.25rem',
        '35': '8.75rem',
        '65': '16.25rem',
        '75': '18.75rem',
        '90': '22.5rem',
        '95': '23.75rem',
        '125': '31.25rem',
        '11.5': '2.875rem',
        '12.5': '3.125rem',
        '14.5': '3.625rem',
        '17.5': '4.375rem',
        '22.5': '5.625rem',
        '5.5': '1.375rem',
        '62.5': '15.625rem',
        '7.5': '1.875rem',
        '72.5': '18.125rem',
        '8.5': '2.125rem',
        '10.5': '2.625rem',
        '4.5': '1.125rem'
      },
      colors: {
        "body": "rgb(100 116 139)",
        "danger": "rgb(211 64 83)",
        "gray": "rgb(239 244 251)",
        "gray-2": "rgb(247 249 252)",
        "graydark": "rgb(51 58 72)",
        "meta-1": "rgb(220 53 69)",
        "meta-10": "rgb(15 173 207)",
        "meta-2": "rgb(239 242 247)",
        "meta-3": "rgb(16 185 129)",
        "meta-6": "rgb(255 186 0)",
        "meta-9": "rgb(229 231 235)",
        "primary": "rgb(60 80 224)",
        "secondary": "rgb(128 202 238)",
        "stroke": "rgb(226 232 240)",
        "success": "rgb(33 150 83)",
        "warning": "rgb(255 167 11)",
        "whiten": "rgb(241 245 249)",
        "whiter": "rgb(245 247 253)",
        "black-2": "rgb(1 1 1)",
        "bodydark1": "rgb(222 228 238)",
        "bodydark2": "rgb(138 153 175)",
        "meta-5": "rgb(37 154 230)",
        "meta-8": "rgb(240 149 12)",
        "black": "rgb(28 36 52)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },

      dropShadow: {
        '1': '0px 1px 0px #e2e8f0',
        '2': '0px 1px 4px rgba(0,0,0,.12)',
        '5': '0px 1px 5px rgba(0,0,0,.2)'
      },
      boxShadow: {
        '1': '0px 1px 3px rgba(0,0,0,.08)',
        '2': '0px 1px 4px rgba(0,0,0,.12)',
        '9': '0px 2px 3px hsla(0,0%,72%,.5)',
        card: '0px 1px 3px rgba(0,0,0,.12)',
        'card-2': '0px 1px 2px rgba(0,0,0,.05)',
        default: '0px 8px 13px -3px rgba(0,0,0,.07)',
        inner: 'inset 0 2px 4px 0 rgba(0,0,0,.05)',
        md: '0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)',
        sm: '0 1px 2px 0 rgba(0,0,0,.05)',
        'switch-1': '0px 0px 5px rgba(0,0,0,.15)',
        switcher: '0px 2px 4px rgba(0,0,0,.2),inset 0px 2px 2px #fff,inset 0px -1px 1px rgba(0,0,0,.1)'
      },
      zIndex: {
        '1': '1',
        '99': '99',
        '999': '999',
        '9999': '9999',
        '99999': '99999',
        '999999': '999999'
      },
      fontSize: {
        'title-lg': ['28px', '35px'],
        'title-md': ['24px', '30px'],
        'title-md2': ['26px', '30px'],
        'title-sm': ['20px', '26px'],
        'title-sm2': ['22px', '28px'],
        'title-xsm': ['18px', '24px'],
        'title-xxl2': ['42px', '58px'],
        'title-xl2': ['33px', '45px']
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}