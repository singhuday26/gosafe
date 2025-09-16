/** @type {import('jest').Config} */
export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(t|j)sx?$": ["babel-jest", { rootMode: "upward" }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
