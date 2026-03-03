import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
			chart: {
				'1': 'hsl(var(--chart-1))',
				'2': 'hsl(var(--chart-2))',
				'3': 'hsl(var(--chart-3))',
				'4': 'hsl(var(--chart-4))',
				'5': 'hsl(var(--chart-5))'
			},
			// Cores customizadas do formulário
			'page-background': 'hsl(var(--page-background))',
			'text-primary': 'hsl(var(--text-primary))',
			'text-secondary': 'hsl(var(--text-secondary))',
			'text-label': 'hsl(var(--text-label))',
			'text-error': 'hsl(var(--text-error))',
			'border-input': 'hsl(var(--border-input))',
			'border-divider': 'hsl(var(--border-divider))',
			'button-secondary': 'hsl(var(--button-secondary))',
			'gradient-start': 'hsl(var(--gradient-start))',
			'gradient-end': 'hsl(var(--gradient-end))',
			'border-accent': 'hsl(var(--border-accent))',
			'bg-accent-start': 'hsl(var(--bg-accent-start))',
			'bg-accent-end': 'hsl(var(--bg-accent-end))',
			// Cores da sidebar
			'sidebar-bg': 'hsl(var(--sidebar-bg))',
			'sidebar-border': 'hsl(var(--sidebar-border))',
			'sidebar-text': 'hsl(var(--sidebar-text))',
			'sidebar-text-secondary': 'hsl(var(--sidebar-text-secondary))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		boxShadow: {
			'card': 'var(--shadow-card)',
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
