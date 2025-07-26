import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			/* Arabic RTL E-commerce Color System */
			colors: {
				/* Base colors */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				/* Extended border variants */
				'border-light': 'hsl(var(--border-light))',
				'border-strong': 'hsl(var(--border-strong))',
				'input-border': 'hsl(var(--input-border))',

				/* Primary color system */
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))'
				},

				/* Secondary color system */
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					accent: 'hsl(var(--secondary-accent))',
					'accent-foreground': 'hsl(var(--secondary-accent-foreground))'
				},

				/* Surface colors for layered designs */
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					foreground: 'hsl(var(--surface-foreground))'
				},

				/* Status colors */
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					light: 'hsl(var(--success-light))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					light: 'hsl(var(--warning-light))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					light: 'hsl(var(--destructive-light))'
				},

				/* Muted colors */
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					hover: 'hsl(var(--muted-hover))'
				},

				/* Accent colors */
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))'
				},

				/* Popover colors */
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},

				/* Card colors */
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},

				/* Sidebar colors */
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			/* Border radius system */
			borderRadius: {
				'xs': 'var(--radius-sm)',
				'sm': 'calc(var(--radius) - 4px)',
				'md': 'calc(var(--radius) - 2px)',
				'lg': 'var(--radius)',
				'xl': 'var(--radius-md)',
				'2xl': 'var(--radius-lg)',
				'3xl': 'var(--radius-xl)'
			},

			/* Spacing system for consistent layouts */
			spacing: {
				'section': 'var(--spacing-section)',
				'component': 'var(--spacing-component)',
				'element': 'var(--spacing-element)'
			},

			/* Box shadow system */
			boxShadow: {
				'xs': 'var(--shadow-sm)',
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'primary': 'var(--shadow-primary)',
				'card': 'var(--shadow-card)'
			},

			/* Typography scale */
			fontSize: {
				'xs': ['var(--font-size-xs)', { lineHeight: '1.4' }],
				'sm': ['var(--font-size-sm)', { lineHeight: '1.5' }],
				'base': ['var(--font-size-base)', { lineHeight: '1.6' }],
				'lg': ['var(--font-size-lg)', { lineHeight: '1.5' }],
				'xl': ['var(--font-size-xl)', { lineHeight: '1.4' }],
				'2xl': ['var(--font-size-2xl)', { lineHeight: '1.3' }],
				'3xl': ['var(--font-size-3xl)', { lineHeight: '1.2' }],
				'4xl': ['var(--font-size-4xl)', { lineHeight: '1.1' }]
			},

			/* Font families for Arabic support */
			fontFamily: {
				'arabic': ['Noto Sans Arabic', 'system-ui', 'sans-serif'],
				'sans': ['system-ui', '-apple-system', 'sans-serif']
			},

			/* Animation keyframes */
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' }
				},
				'slide-in-left': {
					from: { transform: 'translateX(-100%)' },
					to: { transform: 'translateX(0)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'pulse-primary': {
					'0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.7)' },
					'70%': { boxShadow: '0 0 0 10px hsl(var(--primary) / 0)' }
				}
			},

			/* Animations */
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'pulse-primary': 'pulse-primary 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
			},

			/* Transition timing functions */
			transitionTimingFunction: {
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
