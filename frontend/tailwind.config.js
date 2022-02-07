module.exports = {
  purge: ['./index.html', './src/*.{js,jsx,ts,tsx}', ],
  darkMode: false, // or 'media' or 'class'
  theme: {

    extend: {
      inset: {
        "1/6": "16%",
        "-1/10": "-10%",
        "3/5": "60%"
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
