// Pure JS helpers — see REQUIREMENTS.md "01 JS fundamentals review".
// Stubs only: implement the logic yourself, tests describe the expected behavior.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function formatPrice(amount) {
  throw new Error("not implemented");
}

export function calculateCartTotal(cartItems) {
  throw new Error("not implemented");
}

export function filterInStock(products) {
  throw new Error("not implemented");
}

export function isValidEmail(email) {
  throw new Error("not implemented");
}
