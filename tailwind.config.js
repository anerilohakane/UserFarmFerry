/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}



// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./App.{js,jsx,ts,tsx}",
//     "./app.{js,jsx,ts,tsx}",
//     "./screens/**/*.{js,jsx,ts,tsx}",
//     "./components/**/*.{js,jsx,ts,tsx}",
//   ],
//   presets: [require("nativewind/preset")],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
