/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zigguratStone: '#d9c5a0',
        zigguratDark: '#2c251d',
        zigguratTerracotta: '#E2725B',
        zigguratGold: '#D4AF37',
        zigguratBlue: '#1e3a5f',
      },
      animation: {
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'flash-red': 'flashRed 0.5s ease-out',
        'flash-green': 'flashGreen 0.4s ease-out',
        'float-up': 'floatUp 0.8s ease-out forwards',
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pop': 'pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-up-fade': 'slide-up-fade 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(226, 114, 91, 0.5)' },
          '100%': { backgroundColor: 'transparent' }
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(212, 175, 55, 0.4)' },
          '100%': { backgroundColor: 'transparent' }
        },
        floatUp: {
          '0%': { opacity: 1, transform: 'translateY(0) scale(1)' },
          '100%': { opacity: 0, transform: 'translateY(-50px) scale(1.5)' }
        },
        pop: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        'slide-up-fade': {
          '0%': { transform: 'translateY(40px) scale(0.9)', opacity: '0', filter: 'blur(4px)' },
          '10%': { transform: 'translateY(0) scale(1)', opacity: '1', filter: 'blur(0)' },
          '85%': { transform: 'translateY(0) scale(1)', opacity: '1', filter: 'blur(0)' },
          '100%': { transform: 'translateY(-40px) scale(1.1)', opacity: '0', filter: 'blur(8px)' },
        }
      }
    },
  },
  plugins: [],
}
