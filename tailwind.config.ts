export default {
  content: [import.meta.dirname?.concat("/app/**/*.{ts,tsx}")],
};

export const globalCss = /* css */ `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,700;1,400;1,700&display=swap');
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
`;
