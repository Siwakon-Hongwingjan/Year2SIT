import { test, before } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import {
  createProductCard,
  renderProductList,
  removeProductCard,
  renderCart,
  toggleOutOfStock,
} from "../src/dom.js";

before(() => {
  const dom = new JSDOM("<!doctype html><body></body>");
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
});

test("createProductCard returns a detached element with the product id in dataset", () => {
  const card = createProductCard({ id: 42, name: "Mug", price: 150, inStock: true });
  assert.equal(card.dataset.productId, "42");
  assert.equal(card.parentNode, null);
});

test("createProductCard renders the product name and formatted price as text", () => {
  const card = createProductCard({ id: 1, name: "Mug", price: 150, inStock: true });
  assert.match(card.textContent, /Mug/);
  assert.match(card.textContent, /150/);
});

test("renderProductList clears the container then appends one card per product", () => {
  const container = document.createElement("div");
  container.innerHTML = "<article>stale</article>";
  renderProductList(container, [
    { id: 1, name: "Mug", price: 150, inStock: true },
    { id: 2, name: "Plate", price: 90, inStock: true },
  ]);
  assert.equal(container.querySelectorAll("[data-product-id]").length, 2);
});

test("removeProductCard removes only the matching card from the container", () => {
  const container = document.createElement("div");
  renderProductList(container, [
    { id: 1, name: "Mug", price: 150, inStock: true },
    { id: 2, name: "Plate", price: 90, inStock: true },
  ]);
  removeProductCard(container, 1);
  assert.equal(container.querySelector('[data-product-id="1"]'), null);
  assert.notEqual(container.querySelector('[data-product-id="2"]'), null);
});

test("renderCart updates the cart list and total element text content", () => {
  const listEl = document.createElement("ul");
  const totalEl = document.createElement("span");
  renderCart({ listEl, totalEl }, [{ id: 1, name: "Mug", price: 150, quantity: 2 }]);
  assert.equal(listEl.children.length, 1);
  assert.match(totalEl.textContent, /300/);
});

test("toggleOutOfStock adds/removes the out-of-stock class based on stock state", () => {
  const card = document.createElement("article");
  toggleOutOfStock(card, false);
  assert.equal(card.classList.contains("out-of-stock"), true);
  toggleOutOfStock(card, true);
  assert.equal(card.classList.contains("out-of-stock"), false);
});

test.todo(
  "main.js wires #search to filter already-rendered product cards via DOM traversal (no re-fetch)",
);
test.todo(
  "main.js uses one delegated click listener on #product-list with event.target.closest() for Add to cart",
);
test.todo(
  "main.js uses event.target.closest() to find and remove the correct cart row, confirming before removing the last item",
);
