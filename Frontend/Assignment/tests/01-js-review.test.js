import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatPrice,
  calculateCartTotal,
  filterInStock,
  isValidEmail,
  ValidationError,
} from "../src/utils.js";

test("formatPrice formats a number as a Thai-baht price string", () => {
  assert.equal(formatPrice(1500), "1,500 บาท");
});

test("formatPrice handles zero", () => {
  assert.equal(formatPrice(0), "0 บาท");
});

test("calculateCartTotal sums price * quantity for every cart line", () => {
  const cart = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 },
  ];
  assert.equal(calculateCartTotal(cart), 250);
});

test("calculateCartTotal returns 0 for an empty cart", () => {
  assert.equal(calculateCartTotal([]), 0);
});

test("calculateCartTotal throws ValidationError for malformed input", () => {
  assert.throws(() => calculateCartTotal(null), ValidationError);
});

test("filterInStock keeps only products where inStock is true", () => {
  const products = [
    { id: 1, inStock: true },
    { id: 2, inStock: false },
    { id: 3, inStock: true },
  ];
  const result = filterInStock(products);
  assert.deepEqual(
    result.map((p) => p.id),
    [1, 3],
  );
});

test("isValidEmail accepts a well-formed email", () => {
  assert.equal(isValidEmail("a@mail.com"), true);
});

test("isValidEmail rejects a string with no @", () => {
  assert.equal(isValidEmail("not-an-email"), false);
});

test("ValidationError is a real Error subclass", () => {
  const err = new ValidationError("bad cart");
  assert.ok(err instanceof Error);
  assert.equal(err.name, "ValidationError");
  assert.equal(err.message, "bad cart");
});

test.todo(
  "getProducts fetches from the Backend/Assignment API and returns parsed product JSON",
);
test.todo("getProductById fetches a single product and throws on a 404 response");
