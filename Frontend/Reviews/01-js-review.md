# สัปดาห์ที่ 1 — ทบทวนพื้นฐาน JavaScript

> Source: Slides/01_JS_Review.pdf · synced 2026-09-04

## Key concepts
- Variable declaration: `let` (mutable, block scope), `const` (immutable binding), `var` (legacy, avoid).
- Primitive types: String, Number, Boolean, null, undefined — check with `typeof`.
- Conditionals: `if/else if/else` for ranges/multi-condition logic; `switch` for comparing one variable against many enum-like values (readable when 3-4+ cases).
- Loops: `for` (known count), `while` (unknown count, condition-checked-first), `do...while` (runs body at least once), `for...of` (iterates values — arrays/strings/Map/Set), `for...in` (iterates keys — objects only, **never** arrays: gives string indices).
- `break` exits a loop immediately; `continue` skips to the next iteration.
- Functions: 3 forms — declaration (hoisted), expression, arrow function (concise, modern). All produce equivalent behavior; arrow functions don't have their own `this`.
- Parameters/return: functions without `return` yield `undefined`. Scope — local (inside function) vs global.
- Higher-order functions: functions that accept/return other functions (e.g. passing a `shippingFn` calculator).
- Arrays: index from 0, `.length`; core methods `push/pop`, `forEach`, `map`, `filter`, `reduce`, `find`.
- Objects: key-value pairs; access via dot or bracket notation; methods use `this` to reference the owning object.
- Spread (`...`): copies/merges arrays or objects (shallow, top level only), spreads args into function calls (`Math.max(...arr)`). Object spread with duplicate keys — last one wins (useful for immutable state updates).
- Rest (`...`) — opposite of spread: gathers many function arguments into one array parameter.
- Destructuring: array (positional, can skip/default/swap) and object (by key name, can rename/default/nested) — very common for API responses and function parameters.
- `Date`: construct via `new Date()`, `new Date(y, m, d)` (**month is 0-indexed**), ISO string, or `Date.now()` (timestamp in ms). Getters: `getFullYear`, `getMonth` (0-11), `getDate`, `getDay` (0=Sun), `getHours/Minutes`. No `addDays()` — must combine `setDate(getDate() + n)`. Date subtraction yields milliseconds; convert to days via `/ (1000*60*60*24)`. Display with `toLocaleString/toLocaleDateString/toLocaleTimeString('th-TH')`; serialize with `toISOString()`.
- Regular Expressions: pattern literal `/pattern/flags` or `new RegExp()`. Flags: `g` (global), `i` (case-insensitive). Common classes: `\d`, `\w`, `\s`, anchors `^`/`$`, quantifiers `* + ? {n,m}`. Methods: `test()` (bool), `match()`, `replace()`, `split()`.
- Exception handling: `try { }catch(error){ }finally{ }`. `finally` always runs. Uncaught errors stop the whole script. `throw new Error(message)` creates a custom error with `.message`/`.name`. Custom error classes via `class X extends Error` + `super(message)`, distinguish with `instanceof` in `catch`.
- JS Modules: 1 file = 1 module with its own scope. ES Modules use `export`/`import`; named exports (many per file, import with matching `{ name }`) vs default export (exactly one per file, import name is arbitrary). `import { x as y }`, `import * as ns`, mixing default + named imports. CommonJS (`module.exports` / `require`) shown as the older Node-style alternative.

## Definitions to memorize
- **Hoisting**: function declarations can be called before their definition appears in the file; function expressions/arrow functions cannot.
- **Immutability (via spread)**: creating a new array/object copy instead of mutating the original — common pattern for state updates.
- **Stateless-adjacent idea from Date**: timestamps are just numbers (ms since epoch); all date math reduces to integer arithmetic on milliseconds.
- **Named export vs default export**: named = many per file, exact name required on import; default = one per file, any name allowed on import.

## Code / examples
```js
// switch vs if/else
function getOrderStatusLabel(status) {
  switch (status) {
    case "pending": return "รอดำเนินการ";
    case "shipped": return "จัดส่งแล้ว";
    default: return "ไม่ทราบสถานะ";
  }
}

// destructuring + defaults straight in a function parameter
function greetUser({ name, role = "guest" }) {
  console.log(`${name} (${role})`);
}

// custom error class
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
try {
  throw new ApiError("ไม่พบสินค้า", 404);
} catch (error) {
  if (error instanceof ApiError) console.log(error.statusCode, error.message);
}

// named vs default export
export function formatPrice(n) { return n.toLocaleString() + " บาท"; }
export default function Button({ label }) { return `<button>${label}</button>`; }
```

## Likely exam questions
- Given a snippet using `var` inside a loop vs `let`, explain the scoping difference.
- Why does `for...in` on an array give unexpected results? What should be used instead?
- Trace output of a `for` loop with `break`/`continue` at specific iterations.
- Difference between `map()`, `filter()`, and `reduce()` — write one that transforms an array of products into total cart price.
- Write a function using object/array destructuring with default values to safely read a nested API response.
- Explain why `new Date(2026, 0, 1)` is January 1, not month "0".
- Write a regex to validate a Thai phone number / password rule, and use `.test()`.
- What happens to code after a `throw` inside `try` if there's no matching `catch`?
- Difference between named export and default export; write both import styles for a given module.
- Explain what `finally` guarantees versus `catch`.
