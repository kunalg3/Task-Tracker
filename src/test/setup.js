import "@testing-library/jest-dom/vitest";

// Make alerts non-blocking in tests.
// (QuickActions uses alert() for mock share feedback.)
globalThis.alert = () => {};

