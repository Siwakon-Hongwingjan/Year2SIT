# Basic Web Architecture & the DOM

> Source: Slides/Ch01_BasicWebArch_DOM.pdf · synced 2026-09-04

## Key concepts
### Web architecture
- Web architecture design goals: Speed, Security, Scalability, Maintainability.
- 3-tier architecture: Presentation Tier (client/browser) — Application Tier (web/app server, business logic) — Data Tier (database server).
- Client (browser): loads HTML/CSS/JS, renders UI, listens for events, calls Fetch API, updates the DOM with new data.
- Server (backend API): receives HTTP requests, applies logic/auth, reads/writes DB, returns JSON.
- Client-Server model: client always initiates the Request; server processes and sends the Response; both can be developed/deployed independently as long as the interface (API contract) stays the same.
- HTTP methods: GET (read), POST (create), PUT (replace whole resource), DELETE (remove), PATCH (partial update).
- HTTP status codes: 2xx success, 3xx redirect, 4xx client error, 5xx server error.
- HTTP is **stateless** — each request must be self-contained; the server does not remember prior requests. "Login persistence" is faked client-side via cookies (session ID) or tokens (JWT in headers).
- REST: client/server exchange representations (usually JSON) using standard HTTP methods against resources.

### DOM
- The DOM represents an HTML document as a **hierarchical tree of nodes** so JS can read/change structure, style and content. It's language-independent (not JS itself).
- `<script>` placement: in `<head>` blocks rendering until JS downloads/parses; placing scripts at the end of `<body>` (or using `defer`/`type="module"`) avoids blocking render.
- Node types (12 numeric constants on `Node.nodeType`): most used — `ELEMENT_NODE` (1), `ATTRIBUTE_NODE` (2), `TEXT_NODE` (3), `DOCUMENT_NODE` (9, root). All node types inherit from `Node` and share `nodeName`, `nodeType`, `nodeValue`.
- `document` is the root node (`window.document`); `document.documentElement` is the `<html>` element.
- Element creation: `document.createElement(tag)` creates a detached element; nothing renders until it's attached via `appendChild`/`insertBefore`/etc.
- `Attr` nodes inherit from `Node` but aren't part of the tree walk (`parentNode`/siblings are `null`); use `.ownerElement`, `element.getAttribute(name)`, `element.hasAttribute(name)`, `element.getAttributeNames()`.
- `innerHTML` (parses/renders raw HTML, XSS risk on untrusted input) vs `innerText` (only what's visually rendered, respects CSS `display:none`) vs `textContent` (all text incl. hidden, no HTML parsing — safest/fastest for plain text).

### Traversing nodes
- Node relationships: `parentNode`, `childNodes` (NodeList, includes text/comment nodes), `firstChild`/`lastChild`, `nextSibling`/`previousSibling`.
- Element-only equivalents (skip text/comment nodes): `children`, `childElementCount`, `firstElementChild`/`lastElementChild`, `nextElementSibling`/`previousElementSibling`, `parentElement`.
- `element.closest(selector)` walks **up** through ancestors (including itself) and returns the first match, or `null`.

### Selecting nodes
- `document.getElementById(id)` → single element or `null`.
- `getElementsByTagName()` / `getElementsByClassName()` → **live** `HTMLCollection` (auto-updates when DOM changes).
- `getElementsByName()` / `querySelectorAll()` → `NodeList`, **static** snapshot (querySelectorAll) except getElementsByName which is live per spec nuance shown; `querySelectorAll` does not update after creation.
- `querySelector(selector)` → first match or `null`; `querySelectorAll(selector)` → static NodeList of all matches, accepts full CSS selector syntax (`div.tech > p`, `#id`, `p.warning, p.note`, etc.).
- HTMLCollection items only via name/id/index and **cannot** use `.forEach` directly (must `Array.from()` first); NodeList (from querySelectorAll) supports `.forEach` directly.

### Manipulating nodes
- `document.createElement(tag)`, `document.createTextNode(text)`, `document.createAttribute(name)` build detached pieces; `setAttributeNode()` / `appendChild()` attach them.
- `appendChild(node)` — adds to the end of childNodes.
- `insertBefore(newNode, referenceNode)` — new node becomes the previous sibling of reference; passing `null` as reference appends at the end.
- `replaceChild(newChild, oldChild)` / `removeChild(child)` — replace or remove a child from its parent.
- `DocumentFragment`: an in-memory, off-DOM container. Build many nodes into the fragment, then `appendChild(fragment)` once — triggers a single reflow/repaint instead of one per loop iteration (perf pattern for bulk inserts).
- `dataset`: reads/writes custom `data-*` attributes as a `DOMStringMap`; kebab-case in HTML (`data-user-status`) becomes camelCase in JS (`element.dataset.userStatus`). Assigning `element.dataset.x = v` is equivalent to `setAttribute('data-x', v)`; `removeAttribute('data-x')` deletes it from the dataset.
- `classList`: read-only `DOMTokenList` view of an element's classes. Methods: `add(...)`, `remove(...)`, `toggle(name, force)`, `contains(name)`, `replace(old, new)`, `.length`, iterable with `forEach`. Preferred over string-mutating `className` directly.

### System dialogs (browser-level, not DOM elements)
- `alert(message)` — OK only, informational, blocks script execution until dismissed.
- `confirm(message)` — OK/Cancel, returns `true`/`false`.
- `prompt(message, default)` — OK/Cancel + text input, returns the string or `null` if cancelled.
- All three are synchronous/modal and styled by the OS/browser, not CSS.

## Definitions to memorize
- **DOM**: a hierarchical tree-of-nodes representation of an HTML document that JS can read and mutate.
- **Live vs static collection**: `HTMLCollection` (getElementsByTagName/ClassName) auto-reflects later DOM changes; `NodeList` from `querySelectorAll` is a frozen snapshot at call time.
- **Stateless HTTP**: no request "remembers" a previous one; persistence needs cookies/tokens.
- **Reflow/repaint**: the browser recalculating layout/paint after a DOM change — batch changes (e.g. via `DocumentFragment`) to minimize it.

## Code / examples
```js
// select + traverse
const soupMenu = document.querySelector('#soup');
const first = soupMenu.firstElementChild;
const next = first.nextElementSibling;

// closest()
el.closest('article > div'); // nearest ancestor div whose parent is article

// create + attach
const li = document.createElement('li');
li.textContent = 'Item';
listEl.appendChild(li);

// insert at a specific position
listEl.insertBefore(newLi, listEl.firstElementChild);

// remove / replace
listEl.removeChild(listEl.firstElementChild);
listEl.replaceChild(newLi, oldLi);

// bulk insert via DocumentFragment (single reflow)
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement('li');
  li.textContent = 'Item ' + i;
  fragment.appendChild(li);
}
list.appendChild(fragment);

// dataset + classList
button.dataset.color = 'green';           // <button data-color="green">
pElement.classList.add('text-xl', 'p-5');
pElement.classList.toggle('active');
```

## Likely exam questions
- Draw/explain the 3-tier web architecture and what each tier is responsible for.
- Explain why HTTP is stateless and how session/JWT-based login works around that.
- Given an HTML snippet, identify `nodeType`/`nodeName`/`nodeValue` for a given node.
- Difference between `innerHTML`, `innerText`, and `textContent` — when would each cause a bug?
- Difference between `HTMLCollection` and `NodeList`; which stays "live" after DOM changes?
- Write code to select all `.meat` `<li>` items and log each one.
- Write code that creates a new `<li>`, sets its text, and inserts it as the first child of a list (not the last).
- Why use a `DocumentFragment` instead of appending 1000 elements directly in a loop?
- Convert `data-user-id="42"` access via both `dataset` and `getAttribute`.
- Use `classList.toggle` to implement a "select/unselect" UI interaction.
- What does `element.closest('.card')` return if no ancestor matches?
