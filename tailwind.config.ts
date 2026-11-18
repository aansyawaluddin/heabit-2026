import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#3385ce",
          deep: "#2468a8",
          navy: "#0d203b",
          ink: "#07111f",
          ice: "#7fd0ff",
          sky: "#e8f4fd",
        },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        pop: { "0%": { transform: "scale(0.6)", opacity: "0" }, "60%": { transform: "scale(1.06)", opacity: "1" }, "100%": { transform: "scale(1)" } },
        flash: { "0%,100%": { boxShadow: "0 0 0 0 rgba(127,208,255,0)" }, "50%": { boxShadow: "0 0 0 6px rgba(127,208,255,0.55)" } },
      },
      animation: {
        pop: "pop 450ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both",
        flash: "flash 1.1s ease-in-out 4",
        marquee: "marquee 28s linear infinite",
        floaty: "floaty 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
