const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "vcs-bg": "#0B0F19",
        "vcs-canvas": "#080C14",
        "vcs-card": "#121827",
        "vcs-border": "#243044",
        "vcs-text": "#F5F0E8",
        "vcs-text-secondary": "#A7B0C0",
        "vcs-text-muted": "#6B7280",
        "vcs-gold": "#C8A45D",
        "vcs-accent": "#7C8CFF",
        "vcs-success": "#34D399",
        "vcs-error": "#F87171",
        "vcs-warning": "#FBBF24",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
