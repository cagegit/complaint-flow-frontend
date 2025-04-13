export default {
    content: [
      './index.html',
      './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    // 如果你想使用 CSS 变量模式
    corePlugins: {
      preflight: false, // 禁用 Tailwind 的基础样式，避免与 Ant Design 冲突
    },
  }