// Wiring only — see REQUIREMENTS.md "02 Basic Web Architecture & DOM manipulation".
import { getProducts } from "./api.js";
import { renderProductList, renderCart } from "./dom.js";

// TODO (student):
// - on load: getProducts() then renderProductList(#product-list, products)
// - #search input: filter the already-rendered cards (traverse existing DOM, no re-fetch)
// - #product-list: one delegated click listener, use event.target.closest('[data-product-id]')
//   to find which "Add to cart" button was clicked
// - #cart: one delegated click listener, use event.target.closest() to find the row to remove;
//   confirm() before removing the last item

if (typeof document !== "undefined") {
  // Entry point left for the student to implement once the above are in place.
}
