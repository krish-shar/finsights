const config: {
  plugins: never[];
  theme: {
    extend: {
      colors: {
        background: string;
        foreground: string;
        accent: {
          light: string;
          DEFAULT: string;
          dark: string;
        };
      };
    };
  };
  content: string[];
} = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          light: "var(--accent-light)",
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
