/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.tsx"],
  theme: {
    fontFamily: {
      poppins: ["Poppins", "sans-serif"],
      mono: ["Ubuntu Mono", "monoscape"],
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#dc2626",
          secondary: "#FA9282",
          accent: "#000",
          neutral: "#666",
          "base-100": "#363636",
          "base-300": "#1C1C1C",
          info: "#000",
          success: "#000",
          warning: "#000",
          error: "#000",
        },
      },
    ],
  },
};
