# Frontend — Practice Requirements

Practice project: a small vanilla-JS **product catalog + cart** page that talks to the
Backend/Assignment API. Grows one slide-topic at a time.

## 01 JS fundamentals review  <!-- slug: 01-js-review -->
_From Slides/01_JS_Review.pdf_

- [ ] `src/api.js` exports `async function getProducts()` — fetches `GET /products` and returns the parsed JSON array (fetch wrapper only, no UI logic).
- [ ] `src/api.js` exports `async function getProductById(id)` — fetches `GET /products/:id`, throws on a non-OK response.
- [ ] `src/utils.js` exports `formatPrice(amount)` returning a Thai-baht string via `toLocaleString()` (e.g. `1500` → `"1,500 บาท"`).
- [ ] `src/utils.js` exports `calculateCartTotal(cartItems)` using `.reduce()` to sum `price * quantity` across cart lines; throws `ValidationError` for a malformed (non-array) cart.
- [ ] `src/utils.js` exports `filterInStock(products)` using `.filter()` to keep only `inStock: true` products.
- [ ] `src/utils.js` exports `isValidEmail(email)` backed by a regex `.test()` check (basic `local@domain.tld` shape).
- [ ] `src/utils.js` exports `class ValidationError extends Error` with `.name === "ValidationError"`.
- [ ] All new modules use ES module named exports (`export function ...`); `src/main.js` imports only what it uses.

Tests: `tests/01-js-review.test.js`

## 02 Basic Web Architecture & DOM manipulation  <!-- slug: ch01-basicwebarch-dom -->
_From Slides/Ch01_BasicWebArch_DOM.pdf_

DOM manipulation is the focus of this deck — prioritize these over pure-JS polish.

- [ ] `src/dom.js` exports `createProductCard(product)` — builds a **detached** `<article>` element (via `document.createElement`, not `innerHTML`) with the product name, `formatPrice(product.price)`, and an "Add to cart" `<button>`; sets `card.dataset.productId = product.id` for later selection.
- [ ] `src/dom.js` exports `renderProductList(container, products)` — clears `container`, builds all product cards into a `DocumentFragment`, and appends the fragment **once** (single reflow, not one `appendChild` per product).
- [ ] `src/dom.js` exports `removeProductCard(container, productId)` — selects the card via `container.querySelector('[data-product-id="..."]')` and removes it from the DOM.
- [ ] `src/dom.js` exports `renderCart({ listEl, totalEl }, cartItems)` — re-renders cart line items into `listEl` and writes the formatted total into `totalEl.textContent`.
- [ ] `src/dom.js` exports `toggleOutOfStock(cardElement, inStock)` — uses `classList.toggle('out-of-stock', !inStock)`, not manual `className` string edits.
- [ ] `src/main.js` fetches products on load and calls `renderProductList`.
- [ ] `src/main.js` wires a `#search` input so typing filters the **already-rendered** product cards by traversing/hiding existing DOM nodes (no re-fetch per keystroke).
- [ ] `src/main.js` attaches **one** delegated click listener on `#product-list` (not one listener per card) that uses `event.target.closest('[data-product-id]')` to identify which "Add to cart" button was clicked.
- [ ] `src/main.js` attaches a delegated click listener on the cart container that uses `event.target.closest()` to find the clicked row's element and removes only that row via `removeChild`/`remove()`.
- [ ] Before removing the last item in the cart, confirm with `confirm("Remove this item?")` (per the System Dialogs slide) before mutating the DOM.

Tests: `tests/ch01-basicwebarch-dom.test.js`
