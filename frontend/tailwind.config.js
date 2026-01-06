/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily:{
        fancy : "Noto Serif Balinese, serif"
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg) translateX(0)' },
          '50%': { transform: 'rotate(2deg) translateX(2px)' },
        }
      },
      animation:{
        wiggle:"wiggle 100ms linear 3"
      },
      boxShadow:{
        chat:"rgba(0, 0, 0, 0.15) 1.5px 1.5px 2px",
        profilepage : "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
        icon: "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
        even : "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px"
      },
      colors: {
        primary: {
          '25': 'hsl(278, 100%, 99%)',
          '50': 'hsl(278, 100%, 98%)',
          '100': 'hsl(278, 100%, 95%)',
          '200': 'hsl(277, 100%, 91%)',
          '300': 'hsl(277, 100%, 84%)',
          '400': 'hsl(278, 100%, 74%)',
          '500': 'hsl(278, 100%, 64%)',
          '600': 'hsl(278, 94%, 56%)',
          '700': 'hsl(278, 83%, 47%)',
          '800': 'hsl(279, 77%, 39%)',
          '900': 'hsl(280, 75%, 32%)',
          '950': 'hsl(280, 100%, 25%)',
          '999': 'hsl(280, 100%, 10%)',
        },
      }
    },
  },
  plugins: [],
}
