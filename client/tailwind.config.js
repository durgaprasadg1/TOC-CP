/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        display: ['"Space Mono"', 'monospace'],
      },
      colors: {
        lab: {
          bg:       '#0a0c0f',
          surface:  '#0f1117',
          panel:    '#13161e',
          border:   '#1e2330',
          muted:    '#2a2f3d',
          text:     '#c8d0e0',
          dim:      '#5a6380',
          green:    '#00ff9d',
          'green-dim': '#00cc7a',
          cyan:     '#00d4ff',
          orange:   '#ff8c42',
          red:      '#ff4466',
          purple:   '#a855f7',
          yellow:   '#ffd166',
        }
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 157, 0.15)',
        'glow-cyan':  '0 0 20px rgba(0, 212, 255, 0.15)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        blink: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      }
    }
  },
  plugins: []
}
