module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  plugins: ["security"],
  rules: {
    "security/trpc-procedure-security": "error",
    "security/api-route-security": "error",
  },
}; 