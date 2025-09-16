import "@testing-library/jest-dom";

// JSDOM doesn't implement scrollIntoView; mock it for components using it
Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  value: function () {},
  writable: true,
});
