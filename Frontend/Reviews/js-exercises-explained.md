# JavaScript Exercises — แยกหัวข้อ + คำอธิบาย

> รวมโจทย์ JS พื้นฐานที่ทำไปแล้ว จัดกลุ่มตามหัวข้อ พร้อมอธิบายว่าโค้ดทำงานยังไงและจุดที่ควรระวัง
> คู่กับ [`01-js-review.md`](01-js-review.md) (สรุปคอนเซ็ปต์) และ [`dom-exercises-explained.md`](dom-exercises-explained.md)

## สารบัญ

| # | หัวข้อ | ครอบคลุม |
|---|--------|----------|
| 1 | [เงื่อนไข if/else และ ternary](#1-เงื่อนไข-ifelse-และ-ternary) | `if/else`, `? :`, boolean logic |
| 2 | [Regex ตรวจรูปแบบข้อความ](#2-regex-ตรวจรูปแบบข้อความ) | `RegExp`, `.test()` |
| 3 | [วันที่และเวลา](#3-วันที่และเวลา) | `Date`, เทียบช่วง, ผลต่างวัน, `toLocaleDateString` |
| 4 | [Destructuring](#4-destructuring) | แตกค่าใน parameter / หัว loop |
| 5 | [Loops](#5-loops) | `for...of`, `for` นับรอบ, chunk/pagination |
| 6 | [Spread / รวมข้อมูล](#6-spread--รวมข้อมูล) | รวม array, merge object |
| 7 | [Array — เข้าถึงและแก้ไข](#7-array--เข้าถึงและแก้ไข) | index, `.length`, `push`/`pop` |
| 8 | [Array methods: filter / map / reduce](#8-array-methods-filter--map--reduce) | คัด / แปลง / จัดกลุ่ม |
| 9 | [Object — เข้าถึง แก้ไข merge clone](#9-object--เข้าถึง-แก้ไข-merge-clone) | dot/bracket, spread, `structuredClone` |
| 10 | [Error handling](#10-error-handling) | `try/catch/finally`, `throw`, custom `Error` |
| 11 | [โจทย์รวม (validation หลายเงื่อนไข)](#11-โจทย์รวม-validation-หลายเงื่อนไข) | ผสมทุกหัวข้อ |

---

## 1. เงื่อนไข if/else และ ternary

### 1.1 เช็คตะกร้าว่างด้วย if/else

```js
if (cartItems.length != 0) {
  console.log(`มีสินค้า ${cartItems.length} ชิ้นในตะกร้า `);
} else {
  console.log("ตะกร้าว่างเปล่า");
}
```

- `cartItems.length` เป็นตัวเลข — `!= 0` จริงเมื่อมีของอย่างน้อย 1 ชิ้น
- template literal `` `...${cartItems.length}...` `` แทรกตัวเลขลงในข้อความ
- เขียนให้กระชับกว่านี้ได้ด้วย `if (cartItems.length)` เพราะ `0` เป็น falsy อยู่แล้ว

### 1.2 เก็บผล ternary ไว้ในตัวแปร

```js
const text = isLoggedIn ? "ออกจากระบบ" : "เข้าสู่ระบบ";
console.log(text);
```

- `condition ? a : b` — ถ้า `isLoggedIn` เป็น true ได้ `a` ไม่งั้นได้ `b`
- ต่างจาก `if` ตรงที่ ternary เป็น **นิพจน์ (expression)** มีค่าให้เก็บลงตัวแปรได้เลย

### 1.3 boolean logic หลายชั้น — canAccessFeature

```js
function canAccessFeature({ role, plan }, feature) {
  if (role === "admin") return true;
  if (feature === "export") return plan === "pro";
  return role !== "guest";
}
```

- **early return** — เจอเงื่อนไขที่ตัดสินได้ก็ `return` ทันที ไม่ต้องซ้อน else
- ลำดับสำคัญ: admin ผ่านหมดก่อน → ฟีเจอร์ `export` ต้อง plan `pro` → ที่เหลือแค่ไม่ใช่ guest ก็ผ่าน
- `return plan === "pro"` และ `return role !== "guest"` — คืนค่า boolean จากการเปรียบเทียบตรง ๆ ไม่ต้องเขียน `? true : false`

---

## 2. Regex ตรวจรูปแบบข้อความ

### 2.1 ตรวจอีเมล

```js
const regx = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

if (regx.test(email)) {
  console.log("รูปแบบอีเมลถูกต้อง อนุญาตให้สมัครสมาชิก");
} else {
  console.log("กรุณากรอกอีเมลให้ถูกต้อง");
}
```

อ่าน pattern ทีละส่วน:

| ส่วน | ความหมาย |
|------|----------|
| `^` ... `$` | ยึดตั้งแต่ต้นจนจบสตริง (ทั้งสตริงต้องแมตช์ ไม่ใช่แค่บางส่วน) |
| `[^@\s]+` | อักขระที่ **ไม่ใช่** `@` และไม่ใช่ช่องว่าง อย่างน้อย 1 ตัว |
| `@` | ต้องมี `@` ตรงกลาง |
| `\.` | จุด `.` จริง ๆ (ต้อง escape เพราะ `.` เปล่า = อักขระอะไรก็ได้) |

- `.test(str)` คืน `true`/`false` — เหมาะกับการตัดสินใจใน `if`
- pattern นี้เป็นแบบ "พอใช้" ไม่ครอบคลุมทุกกติกาอีเมลจริง แต่กันพิมพ์ผิดทั่วไปได้

### 2.2 ตรวจรูปแบบวันที่ DD/MM/YYYY — (ดูข้อ 3.4 ประกอบ)

```js
const reg = /^\d{2}\/\d{2}\/\d{4}$/;
if (!reg.test(dateString)) throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณากรอกเป็น DD/MM/YYYY");
```

- `\d{2}` = ตัวเลข 2 หลักพอดี, `\/` = slash (escape)
- regex เช็คแค่ **รูปแบบ** ไม่เช็คว่าวันมีจริง (เช่น `32/13/2025` ผ่าน regex) → ต้องเช็คต่อด้วย `Date`

---

## 3. วันที่และเวลา

### 3.1 เช็คว่าโปรโมชั่นยัง active ไหม

```js
function isPromotionActive(startDate, endDate) {
  const date = new Date();
  if (date >= startDate && date <= endDate) {
    return true;
  } else {
    return false;
  }
}
```

- `new Date()` = เวลาปัจจุบัน
- เทียบ `Date` กับ `Date` ด้วย `>=` / `<=` ได้ เพราะ JS แปลงเป็น timestamp (มิลลิวินาที) ให้อัตโนมัติ
- ทั้ง body เขียนสั้นได้เป็น `return date >= startDate && date <= endDate;`

**⚠️ ระวัง:** ถ้า `startDate` / `endDate` เป็น **string** การเทียบจะเพี้ยน — ควรมั่นใจว่าเป็น `Date` object หรือห่อด้วย `new Date(startDate)` ก่อน

### 3.2 คำนวณ "กี่วันก่อน" ของแต่ละออเดอร์

```js
const messages = [];
const date = new Date();
for (const { id, orderDate } of orders) {
  const day = Math.floor((date - orderDate) / (1000 * 60 * 60 * 24));
  messages.push(`ออเดอร์ #${id} สั่งเมื่อ ${day} วันก่อน`);
}
console.log(messages);
```

- `date - orderDate` — ลบ `Date` สองตัว → ได้ผลต่างเป็น **มิลลิวินาที**
- `/ (1000 * 60 * 60 * 24)` — แปลง ms → วัน (1000ms × 60s × 60min × 24hr)
- `Math.floor(...)` — ปัดลงเป็นจำนวนวันเต็ม
- destructure `{ id, orderDate }` ที่หัว loop ดึงเฉพาะฟิลด์ที่ใช้

### 3.3 กรองออเดอร์ภายใน 7 วัน

```js
function getRecentOrders(orders) {
  const date = new Date();
  return orders.filter((order) => date - order.orderDate <= 7 * 24 * 60 * 60 * 1000);
}
```

- แนวคิดเดียวกับ 3.2 แต่ใช้ใน `filter` — เก็บออเดอร์ที่ "อายุ ≤ 7 วัน (เป็น ms)"
- `7 * 24 * 60 * 60 * 1000` = จำนวน ms ใน 7 วัน

### 3.4 แปลงและตรวจวันที่จริง — parseCustomDate

```js
function parseCustomDate(dateString) {
  const reg = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!reg.test(dateString)) throw new Error("รูปแบบวันที่ไม่ถูกต้อง กรุณากรอกเป็น DD/MM/YYYY");

  const [day, month, year] = dateString.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    throw new Error("ไม่มีวันที่นี้อยู่จริง");
  }
  return date;
}
```

- `split("/")` → `["25","12","2025"]` แล้ว `.map(Number)` แปลงทุกตัวเป็นเลข
- `new Date(year, month - 1, day)` — **เดือนใน JS เริ่มที่ 0** (มกรา = 0) จึง `month - 1`
- **เทคนิค round-trip:** ถ้าใส่ `31/02/2025` ไป `Date` จะ "ล้น" กลายเป็น 3 มี.ค. อัตโนมัติ → พออ่าน `getDate()` กลับมาได้ 3 ไม่ตรงกับ 31 ที่ป้อน → รู้ว่าวันที่ไม่จริง แล้ว throw

### 3.5 จัดรูปแบบวันเวลาแบบไทย — formatLastLogin

```js
function formatLastLogin({ name, lastLogin }) {
  const date = new Date(lastLogin);
  const d = date.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  const t = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return `${name} ล็อกอินล่าสุดเมื่อ ${d} เวลา ${t}`;
}
```

- `new Date(lastLogin)` — แปลงสตริง/timestamp เป็น `Date`
- `toLocaleDateString(locale, options)` — จัดรูปแบบตามภาษา: `"th-TH"` ได้เดือนภาษาไทย + ปี พ.ศ.
- `options` เลือกว่าจะโชว์ส่วนไหนและรูปแบบไหน (`"numeric"`, `"long"`, `"2-digit"`)

---

## 4. Destructuring

แตกค่าจาก object/array ออกมาเป็นตัวแปรตรง ๆ ลดการพิมพ์ `obj.` ซ้ำ ๆ

### 4.1 Destructure ตรง parameter

```js
function validateCheckoutForm({ name, address, phone, paymentMethod }) { /* ... */ }
function canAccessFeature({ role, plan }, feature) { /* ... */ }
function formatUserDisplay({ name, role }) {
  return `สวัสดี, ${name} (${role})`;
}
```

- ฟังก์ชันรับ object แล้วดึงเฉพาะฟิลด์ที่ต้องการที่หัว parameter เลย
- ข้างในเรียก `name` ได้ตรง ๆ ไม่ต้อง `user.name`
- `canAccessFeature` — destructure ได้เฉพาะ argument ตัวแรก ตัวที่สอง (`feature`) รับปกติ

### 4.2 Destructure ที่หัว loop

```js
for (const { field, value } of formInputs) {
  if (!value) emptyFields.push(field);
}
```

- `formInputs` เป็น array ของ `{ field, value }` — แตกทุกรอบที่หัว `for...of`
- `!value` เป็นจริงเมื่อค่าว่าง (`""`, `null`, `undefined`, `0`, `false`)

### 4.3 Destructure ใน callback ของ map

```js
function getPriceTags(products) {
  return products.map(({ name, price }) => `${name}: ${price} บาท`);
}
```

- callback รับ `product` แต่ destructure `{ name, price }` ตรงพารามิเตอร์เลย

### 4.4 Array destructuring

```js
const [day, month, year] = dateString.split("/").map(Number);
```

- แตก array ตาม **ตำแหน่ง** — ตัวที่ 0 → `day`, ตัวที่ 1 → `month`, ...

---

## 5. Loops

### 5.1 for...of พิมพ์ทีละบรรทัด

```js
for (const product of products) {
  console.log(`- ${product}`);
}
```

- `for...of` วนเอา **ค่า** ของแต่ละสมาชิกใน array (ไม่ใช่ index)

### 5.2 for นับรอบ — เลขหน้าจากจำนวนรายการ

```js
const num = Math.ceil(totalItems / itemsPerPage);
for (let i = 1; i <= num; i++) {
  console.log(`หน้า ${i}`);
}
```

- `Math.ceil` — ปัด **ขึ้น** เพราะเศษที่เหลือก็ต้องมีอีก 1 หน้า (เช่น 23 รายการ หน้าละ 10 → 2.3 → 3 หน้า)
- ใช้ `for` แบบ index เพราะต้องการตัวเลข `1..num`

### 5.3 แบ่งเป็นก้อน (chunk) — paginateItems

```js
function paginateItems(items, itemsPerPage) {
  const arr = [];
  if (!items) return arr;

  let current = [];
  for (const item of items) {
    current.push(item);
    if (current.length === itemsPerPage) {
      arr.push(current);
      current = [];
    }
  }
  if (current.length > 0) arr.push(current);
  return arr;
}
```

- สะสม `item` ลง `current` จนครบ `itemsPerPage` → push ก้อนนั้นเข้า `arr` แล้ว **รีเซ็ต** `current = []` (สร้าง array ใหม่ ไม่ใช่ `current.length = 0` เพราะก้อนเดิมถูก push ไปแล้วโดยอ้างอิง)
- หลัง loop ถ้ายังมีของเหลือใน `current` (ก้อนสุดท้ายไม่เต็ม) → push เก็บด้วย
- `if (!items) return arr` — กันกรณีส่ง `undefined`/`null` มา

---

## 6. Spread / รวมข้อมูล

### 6.1 รวม array

```js
const mergeCart = [...guestCart, ...memberCart];
console.log(mergeCart);
console.log(mergeCart.length);
```

- `...arr` "คลี่" สมาชิกทั้งหมดออกมาวางใน array ใหม่ → ได้ array เดียวที่ต่อกัน
- เป็นการสร้าง array **ใหม่** ไม่กระทบตัวเดิม

### 6.2 Merge object

```js
function mergeUserSettings(defaultSettings, userSettings) {
  return { ...defaultSettings, ...userSettings };
}
```

- คลี่ทั้งสอง object เข้า object ใหม่ — **ตัวที่อยู่หลังทับตัวหน้า** ถ้า key ซ้ำ
- ดังนั้น `userSettings` (ค่าที่ผู้ใช้ตั้งเอง) ชนะ `defaultSettings`
- **shallow** เท่านั้น — ถ้าข้างในมี object ซ้อน จะแชร์ reference เดียวกัน (ดูข้อ 9.4)

---

## 7. Array — เข้าถึงและแก้ไข

### 7.1 อ่านค่า

```js
console.log(cartItems[0]);       // สมาชิกตัวแรก (index เริ่มที่ 0)
console.log(cartItems.length);   // จำนวนสมาชิก
```

### 7.2 เพิ่ม/ลบท้าย array

```js
cartItems.push("รองเท้าผ้าใบ");  // เพิ่มต่อท้าย, คืนค่า length ใหม่
console.log(cartItems);
cartItems.pop();                  // ลบตัวท้ายออก, คืนค่าตัวที่ถูกลบ
console.log(cartItems);
```

- `push` / `pop` **แก้ไข array เดิม (mutate)** ไม่ได้สร้างใหม่

---

## 8. Array methods: filter / map / reduce

ทั้งสามตัว **ไม่แก้ array เดิม** — คืนค่าใหม่เสมอ

### 8.1 filter — คัดเฉพาะที่ผ่านเงื่อนไข

```js
function getAvailableProducts(products) {
  return products.filter((product) => product.inStock == true);
}
```

- callback คืน `true` → เก็บ, คืน `false` → ทิ้ง
- `product.inStock == true` เขียนสั้นได้เป็น `product.inStock`

### 8.2 map — แปลงทุกตัวเป็นรูปแบบใหม่

```js
function getPriceTags(products) {
  return products.map(({ name, price }) => `${name}: ${price} บาท`);
}
```

- array ยาวเท่าเดิม แต่แต่ละตัวถูกแปลง (object → string)

### 8.3 reduce — ยุบ array เป็นค่าเดียว (ในที่นี้คือ object จัดกลุ่ม)

```js
function groupProductsByCategory(products) {
  return products.reduce((groups, product) => {
    const category = product.category;
    const current = groups[category] ?? [];
    return { ...groups, [category]: [...current, product] };
  }, {});
}
```

- `{}` ตัวหลังคือ **ค่าเริ่มต้น** ของ `groups`
- ทุกรอบ: หา array ของหมวดนั้น (`groups[category]`) ถ้ายังไม่มีใช้ `[]` (`?? []`)
- คืน object ใหม่ที่ก็อป `groups` เดิม + อัปเดตคีย์ `[category]` ด้วย array ที่เติม `product` เข้าไป
- `[category]` = **computed key** ใช้ค่าตัวแปรเป็นชื่อคีย์
- *(เขียนแบบ mutate `groups[category] ??= []; groups[category].push(product); return groups;` ก็ได้ เร็วกว่าเพราะไม่ copy ทุกรอบ)*

---

## 9. Object — เข้าถึง แก้ไข merge clone

### 9.1 อ่าน property

```js
console.log(userProfile.email);
```

### 9.2 เพิ่ม/แก้ property ด้วย bracket

```js
userProfile["theme"] = "dark";
console.log(userProfile);
```

- `obj["key"]` เท่ากับ `obj.key` — bracket ใช้ตอนชื่อคีย์เป็นตัวแปรหรือมีอักขระพิเศษ
- ถ้าคีย์ยังไม่มี = เพิ่มใหม่, ถ้ามีแล้ว = เขียนทับ

### 9.3 destructure + template — formatUserDisplay

```js
function formatUserDisplay({ name, role }) {
  return `สวัสดี, ${name} (${role})`;
}
```

### 9.4 clone แบบลึก — cloneFormState

```js
function cloneFormState(formState) {
  return structuredClone(formState);
}
const draft = cloneFormState(formState);
draft.address.city = "เชียงใหม่";
console.log("เดิม:", formState.address.city);   // ไม่เปลี่ยน
console.log("สำเนา:", draft.address.city);      // เชียงใหม่
```

- `structuredClone()` — ก็อป **ลึกทุกชั้น** object ซ้อนข้างในก็เป็นสำเนาใหม่หมด
- ต่างจาก `{ ...formState }` (spread) ที่ก็อปแค่ชั้นบน — ถ้าแก้ `draft.address.city` แบบ spread จะไป**กระทบ** `formState.address.city` ด้วย เพราะ `address` เป็น reference เดียวกัน

---

## 10. Error handling

### 10.1 try/catch — กันโค้ดพังเวลา parse

```js
try {
  console.log(JSON.parse(invalidJson));
} catch (error) {
  console.error("ข้อมูลเสียหาย ไม่สามารถอ่านได้");
}
```

- `JSON.parse` โยน error ถ้าสตริงไม่ใช่ JSON ที่ถูกต้อง → `catch` รับไว้ โปรแกรมไม่ crash

### 10.2 try/catch/finally

```js
try {
  console.log(riskyLoadProducts());
} catch (e) {
  console.error("โหลดสินค้าไม่สำเร็จ: เครือข่ายขัดข้อง");
} finally {
  console.log("loading = false");
}
```

- `finally` รันเสมอ — ไม่ว่าจะสำเร็จหรือ error — เหมาะกับงาน cleanup เช่นปิดสถานะ loading

### 10.3 โยน error เอง — throw + จับ

```js
function calculateShipingFee(total) {
  if (total > 1000) return 0;
  else if (total <= 1000 && total >= 0) return 50;
  else throw new Error("ยอดสั่งซื้อต้องไม่ติดลบ");
}

try {
  console.log(calculateShipingFee(testTotal));
} catch (e) {
  console.log(e.message);
}
```

- `throw new Error("...")` — หยุดฟังก์ชันทันทีแล้วส่ง error ขึ้นไปให้ `catch`
- `e.message` — อ่านข้อความที่ใส่ตอนสร้าง Error
- *(เงื่อนไข `total <= 1000` ซ้ำซ้อน เพราะ `> 1000` ถูกจับไปแล้วในบรรทัดบน เขียน `else if (total >= 0)` พอ)*

### 10.4 Custom Error class — ApiError

```js
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);           // ส่ง message ให้ Error แม่จัดการ
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.timestamp = new Date();
  }
}

try {
  throw new ApiError(testMessage, testStatusCode);
} catch (e) {
  console.log(`${e.name} ${e.statusCode} ${e.message}`);
  console.log(`บันทึกเวลาไว้แล้ว: ${e.timestamp instanceof Date}`);
}
```

- `extends Error` — สืบทอดจาก Error ได้ `message`, stack trace ครบ
- `super(message)` — **ต้องเรียกก่อน** ใช้ `this` ใน constructor ของ subclass
- เพิ่มฟิลด์เองได้ (`statusCode`, `timestamp`) → ตอน `catch` ดึงข้อมูลเสริมมาใช้ต่อได้ เช่น log หรือ retry ตาม status code

---

## 11. โจทย์รวม (validation หลายเงื่อนไข)

### 11.1 validateCheckoutForm — เก็บ error ทั้งหมดไว้ใน array

```js
function validateCheckoutForm({ name, address, phone, paymentMethod }) {
  const erros = [];
  if (!name) erros.push("กรุณากรอกชื่อผู้รับ");
  if (!address) erros.push("กรุณากรอกที่อยู่จัดส่ง");
  if (phone.length < 9) erros.push("เบอร์โทรศัพท์ไม่ถูกต้อง");
  if (!paymentMethod) erros.push("กรุณาเลือกวิธีชำระเงิน");
  return erros;
}
```

- แพตเทิร์น "**เก็บ error ทุกอันแล้วค่อยคืน**" — ไม่ return ทันทีที่เจอ error แรก ผู้ใช้เห็นทุกปัญหารวดเดียว
- array ว่าง = ผ่านหมด

**⚠️ ระวัง:** `phone.length` — ถ้า `phone` เป็น `undefined`/`null` จะพัง `Cannot read properties of undefined`
ควรกันก่อน: `if (!phone || phone.length < 9)`

### 11.2 handleCheckout — validate + จัดการสถานะ UI

```js
function handleCheckout(order) {
  setLoading(true);
  try {
    if (typeof order !== "object" || order === null) {
      throw new Error("ข้อมูลคำสั่งซื้อไม่ถูกต้อง");
    }
    if (!Array.isArray(order.items) || order.items.length == 0) {
      throw new Error("กรุณาเลือกสินค้าอย่างน้อย 1 รายการ");
    }
    if (typeof order.total !== "number" || order.total <= 0) {
      throw new Error("ยอดชำระไม่ถูกต้อง");
    }
    showSuccessMessage();
  } catch (error) {
    showErrorToast(error.message);
  } finally {
    setLoading(false);
  }
}
```

- ตรวจจากหยาบไปละเอียด: เป็น object ก่อน → มี `items` เป็น array ที่ไม่ว่าง → `total` เป็นเลขบวก
- `typeof order !== "object" || order === null` — เพราะ `typeof null === "object"` ต้องเช็ค `null` แยก
- `Array.isArray(...)` — วิธีที่ถูกต้องในการเช็คว่าเป็น array (`typeof []` ได้ `"object"` ใช้ไม่ได้)
- ทุก error เข้า `catch` เดียว → แสดง toast ด้วย `error.message`
- `finally { setLoading(false) }` — ปิด loading ไม่ว่าผลจะเป็นยังไง

### 11.3 parseCustomDate — regex + Date + throw

ดู [ข้อ 3.4](#34-แปลงและตรวจวันที่จริง--parsecustomdate) — ผสม 3 หัวข้อ: regex เช็ครูปแบบ, `Date` เช็ควันจริง, `throw` แจ้ง error พร้อมข้อความเจาะจง

---

## เช็กลิสต์แนวคิด

- [ ] `if (arr.length)` แทน `!= 0` — `0` เป็น falsy
- [ ] ternary เป็น expression เก็บลงตัวแปรได้
- [ ] early return แทน else ซ้อน
- [ ] `return a === b` คืน boolean ตรง ๆ
- [ ] regex `^...$` = ทั้งสตริง, `\.` `\/` = อักขระจริงต้อง escape
- [ ] `regex.test(str)` → boolean
- [ ] ลบ `Date` สองตัวได้ ms → `/ (1000*60*60*24)` = วัน
- [ ] `new Date(y, m-1, d)` — เดือนเริ่มที่ 0
- [ ] round-trip check: อ่านค่ากลับมาเทียบ = จับวันที่ไม่มีจริง
- [ ] `toLocaleDateString("th-TH", {...})` จัดรูปแบบตามภาษา
- [ ] destructure ได้ทั้งใน parameter และหัว `for...of`
- [ ] `Math.ceil` สำหรับจำนวนหน้า (เศษ = อีกหน้า)
- [ ] chunk: สะสมจนครบ → push → รีเซ็ต `current = []`
- [ ] spread `[...a, ...b]` / `{...a, ...b}` — สร้างใหม่, ตัวหลังทับตัวหน้า, shallow
- [ ] `push`/`pop` mutate เดิม; `filter`/`map`/`reduce` คืนใหม่
- [ ] `reduce(fn, initial)` — ยุบเป็นค่าเดียว, `[key]` computed key
- [ ] `structuredClone` ลึก vs spread ตื้น
- [ ] `typeof null === "object"` → เช็ค null แยก
- [ ] `Array.isArray()` เช็ค array (ไม่ใช่ `typeof`)
- [ ] `class X extends Error` + `super(message)` ก่อนใช้ `this`
- [ ] `finally` รันเสมอ — ใช้ปิดสถานะ loading
- [ ] เก็บ error ลง array แล้วคืนทีเดียว = ผู้ใช้เห็นทุกปัญหา
```
