export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#EEF2FF',100:'#E0E7FF',200:'#C7D2FE',300:'#A5B4FC',
          400:'#818CF8',500:'#6366F1',600:'#4F46E5',700:'#4338CA',
          800:'#3730A3',900:'#312E81',950:'#1E1B4B',
        },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"','system-ui','sans-serif'] },
      boxShadow: {
        card:      '0 1px 3px 0 rgb(0 0 0/0.04), 0 4px 16px -2px rgb(0 0 0/0.06)',
        'card-lg': '0 4px 12px 0 rgb(0 0 0/0.08), 0 16px 40px -4px rgb(0 0 0/0.12)',
      },
    },
  },
  plugins: [],
}
