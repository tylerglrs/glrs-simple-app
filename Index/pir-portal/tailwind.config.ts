import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	// Custom breakpoints for mobile-first responsive design
  	screens: {
  		'xs': '375px',   // Small phones (iPhone SE)
  		'sm': '640px',   // Default Tailwind
  		'md': '768px',   // Default Tailwind
  		'lg': '1024px',  // Default Tailwind
  		'xl': '1280px',  // Default Tailwind
  		'2xl': '1536px', // Default Tailwind
  	},
  	extend: {
  		// Touch target utilities (44px minimum per WCAG)
  		minHeight: {
  			'touch': '44px',
  		},
  		minWidth: {
  			'touch': '44px',
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			// Brand primary - Teal
  			teal: {
  				'50': '#f0fdfa',
  				'100': '#ccfbf1',
  				'200': '#99f6e4',
  				'300': '#5eead4',
  				'400': '#2dd4bf',
  				'500': '#14b8a6',
  				'600': '#069494',
  				'700': '#0f766e',
  				'800': '#115e59',
  				'900': '#134e4a',
  				DEFAULT: '#069494'
  			},
  			// Warm accent - Rose Gold (celebrations, milestones)
  			rosegold: {
  				'50': '#fff1f2',
  				'100': '#ffe4e6',
  				'200': '#fecdd3',
  				'300': '#fda4af',
  				'400': '#fb7185',
  				'500': '#f43f5e',
  				'600': '#e11d48',
  				DEFAULT: '#fb7185'
  			},
  			// Warm accent - Amber (achievements, streaks)
  			amber: {
  				'50': '#fffbeb',
  				'100': '#fef3c7',
  				'200': '#fde68a',
  				'300': '#fcd34d',
  				'400': '#fbbf24',
  				'500': '#f59e0b',
  				'600': '#d97706',
  				'700': '#b45309',
  				DEFAULT: '#fbbf24'
  			},
  			// Metric colors
  			mood: {
  				DEFAULT: '#6366f1',
  				light: '#e0e7ff'
  			},
  			energy: {
  				DEFAULT: '#f59e0b',
  				light: '#fef3c7'
  			},
  			anxiety: {
  				DEFAULT: '#ef4444',
  				light: '#fee2e2'
  			},
  			sleep: {
  				DEFAULT: '#3b82f6',
  				light: '#dbeafe'
  			},
  			craving: {
  				DEFAULT: '#ec4899',
  				light: '#fce7f3'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundImage: {
  			// Hero gradients
  			'gradient-brand': 'linear-gradient(135deg, #069494 0%, #0891b2 100%)',
  			'gradient-warm': 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  			'gradient-rosegold': 'linear-gradient(135deg, #fb7185 0%, #fda4af 100%)',
  			'gradient-celebration': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  			'gradient-calm': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  			// Time-of-day gradients
  			'gradient-morning': 'linear-gradient(180deg, rgba(251,191,36,0.1) 0%, white 50%, #f8fafc 100%)',
  			'gradient-afternoon': 'linear-gradient(180deg, rgba(56,189,248,0.1) 0%, white 50%, #f8fafc 100%)',
  			'gradient-evening': 'linear-gradient(180deg, rgba(251,146,60,0.1) 0%, rgba(251,113,133,0.05) 30%, #f8fafc 100%)',
  			'gradient-night': 'linear-gradient(180deg, rgba(99,102,241,0.1) 0%, #f1f5f9 50%, #f1f5f9 100%)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' }
  			},
  			'gradient-x': {
  				'0%, 100%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' }
  			},
  			'pulse-soft': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.7' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-10px)' }
  			},
  			'scale-in': {
  				'0%': { transform: 'scale(0.9)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' }
  			},
  			'slide-up': {
  				'0%': { transform: 'translateY(10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			'slide-down': {
  				'0%': { transform: 'translateY(-10px)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' }
  			},
  			'flame': {
  				'0%, 100%': { transform: 'scaleY(1) scaleX(1)' },
  				'25%': { transform: 'scaleY(1.1) scaleX(0.9)' },
  				'50%': { transform: 'scaleY(0.9) scaleX(1.1)' },
  				'75%': { transform: 'scaleY(1.05) scaleX(0.95)' }
  			},
  			'celebrate': {
  				'0%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(1.2)' },
  				'100%': { transform: 'scale(1)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'shimmer': 'shimmer 2s linear infinite',
  			'gradient-x': 'gradient-x 3s ease infinite',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'scale-in': 'scale-in 0.2s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out',
  			'slide-down': 'slide-down 0.3s ease-out',
  			'flame': 'flame 0.5s ease-in-out infinite',
  			'celebrate': 'celebrate 0.5s ease-in-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config
