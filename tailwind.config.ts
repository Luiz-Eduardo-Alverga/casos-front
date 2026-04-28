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
      screens: {
        "3xl": "2260px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Cores customizadas do formulário
        "page-background": "hsl(var(--page-background))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-label": "hsl(var(--text-label))",
        "text-error": "hsl(var(--text-error))",
        "border-input": "hsl(var(--border-input))",
        "border-divider": "hsl(var(--border-divider))",
        "button-secondary": "hsl(var(--button-secondary))",
        "gradient-start": "hsl(var(--gradient-start))",
        "gradient-end": "hsl(var(--gradient-end))",
        "border-accent": "hsl(var(--border-accent))",
        "bg-accent-start": "hsl(var(--bg-accent-start))",
        "bg-accent-end": "hsl(var(--bg-accent-end))",
        // Cores da sidebar
        "sidebar-bg": "hsl(var(--sidebar-bg))",
        "sidebar-border": "hsl(var(--sidebar-border))",
        "sidebar-text": "hsl(var(--sidebar-text))",
        "sidebar-text-secondary": "hsl(var(--sidebar-text-secondary))",
        // Cores do Painel do Desenvolvedor
        "panel-bg": "hsl(var(--panel-bg))",
        "panel-card-bg": "hsl(var(--panel-card-bg))",
        "panel-text-primary": "hsl(var(--panel-text-primary))",
        "panel-text-secondary": "hsl(var(--panel-text-secondary))",
        "panel-border": "hsl(var(--panel-border))",
        "panel-border-light": "hsl(var(--panel-border-light))",
        "panel-checkbox-border": "hsl(var(--panel-checkbox-border))",
        "panel-checkbox-checked": "hsl(var(--panel-checkbox-checked))",
        "panel-badge-open": "hsl(var(--panel-badge-open))",
        "panel-badge-open-bg": "hsl(var(--panel-badge-open-bg))",
        "panel-badge-fixed": "hsl(var(--panel-badge-fixed))",
        "panel-badge-fixed-bg": "hsl(var(--panel-badge-fixed-bg))",
        "panel-badge-return": "hsl(var(--panel-badge-return))",
        "panel-badge-return-bg": "hsl(var(--panel-badge-return-bg))",
        "panel-badge-importance": "hsl(var(--panel-badge-importance))",
        "panel-badge-importance-bg": "hsl(var(--panel-badge-importance-bg))",
        "panel-card-border": "hsl(var(--panel-card-border))",
        "panel-card-yellow-accent": "hsl(var(--panel-card-yellow-accent))",
        "panel-badge-importance-yellow":
          "hsl(var(--panel-badge-importance-yellow))",
        "panel-badge-importance-yellow-bg":
          "hsl(var(--panel-badge-importance-yellow-bg))",
        "panel-button-back": "hsl(var(--panel-button-back))",
        // Cores da tela de login
        "login-bg-start": "hsl(var(--login-bg-start))",
        "login-bg-end": "hsl(var(--login-bg-end))",
        "login-banner-text": "hsl(var(--login-banner-text))",
        "login-input-border": "hsl(var(--login-input-border))",
        "login-placeholder": "hsl(var(--login-placeholder))",
        "login-checkbox-bg": "hsl(var(--login-checkbox-bg))",
        "login-checkbox-border": "hsl(var(--login-checkbox-border))",
        "login-checkbox-label": "hsl(var(--login-checkbox-label))",
        "login-button-from": "hsl(var(--login-button-from))",
        "login-button-to": "hsl(var(--login-button-to))",
        "login-button-text": "hsl(var(--login-button-text))",
        "login-footer-text": "hsl(var(--login-footer-text))",
        // Cores da tela Papéis e Acessos
        "papeis-role-active-bg": "hsl(var(--papeis-role-active-bg))",
        "papeis-role-active-border": "hsl(var(--papeis-role-active-border))",
        "papeis-role-active-text": "hsl(var(--papeis-role-active-text))",
        "papeis-role-active-indicator":
          "hsl(var(--papeis-role-active-indicator))",
        "papeis-module-icon-active-bg":
          "hsl(var(--papeis-module-icon-active-bg))",
        "papeis-module-icon-muted-bg":
          "hsl(var(--papeis-module-icon-muted-bg))",
        "papeis-perm-selected-bg": "hsl(var(--papeis-perm-selected-bg))",
        "papeis-perm-selected-border":
          "hsl(var(--papeis-perm-selected-border))",
        "papeis-button-dark-bg": "hsl(var(--papeis-button-dark-bg))",
        "papeis-button-dark-bg-hover":
          "hsl(var(--papeis-button-dark-bg-hover))",
        "papeis-badge-count-bg": "hsl(var(--papeis-badge-count-bg))",
        "papeis-badge-count-text": "hsl(var(--papeis-badge-count-text))",

        // Marca / destaque
        "brand-yellow": "hsl(var(--brand-yellow))",
        "brand-yellow-hover": "hsl(var(--brand-yellow-hover))",

        // Tons específicos
        "cases-ink": "hsl(var(--cases-ink))",
        "border-strong": "hsl(var(--border-strong))",

        // Página pública (Adquirentes)
        "public-border": "hsl(var(--public-border))",
        "public-placeholder": "hsl(var(--public-placeholder))",
        "public-text-muted": "hsl(var(--public-text-muted))",
        "public-hint": "hsl(var(--public-hint))",
        "public-surface-muted": "hsl(var(--public-surface-muted))",
        "public-focus": "hsl(var(--public-focus))",
        "public-info-bg": "hsl(var(--public-info-bg))",
        "public-info-text": "hsl(var(--public-info-text))",
        "public-danger-bg": "hsl(var(--public-danger-bg))",
        "public-danger-text": "hsl(var(--public-danger-text))",
      },
      backgroundImage: {
        "login-gradient":
          "linear-gradient(125.79deg, hsl(var(--login-bg-start)) 0%, hsl(var(--login-bg-end)) 100%)",
        "login-button-gradient":
          "linear-gradient(to right, hsl(var(--login-button-from)), hsl(var(--login-button-to)))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
