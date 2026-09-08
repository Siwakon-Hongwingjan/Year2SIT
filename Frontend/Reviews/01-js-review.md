# สัปดาห์ที่ 1 — ทบทวนพื้นฐาน JavaScript

> Source: Slides/01_JS_Review.pdf · synced 2026-09-04

## แนวคิดหลัก
- การประกาศตัวแปร: `let` (แก้ค่าได้, block scope), `const` (ผูกค่าเปลี่ยนไม่ได้), `var` (ของเก่า, เลี่ยง).
- ชนิดข้อมูลพื้นฐาน (primitive): String, Number, Boolean, null, undefined — ตรวจด้วย `typeof`.
- เงื่อนไข: `if/else if/else` สำหรับตรรกะแบบช่วงค่า/หลายเงื่อนไข; `switch` สำหรับเทียบตัวแปรตัวเดียวกับค่าแบบ enum หลายค่า (อ่านง่ายเมื่อมี 3-4 เคสขึ้นไป).
- ลูป: `for` (รู้จำนวนรอบ), `while` (ไม่รู้จำนวนรอบ, เช็คเงื่อนไขก่อน), `do...while` (ทำ body อย่างน้อย 1 รอบ), `for...of` (วนค่า — array/string/Map/Set), `for...in` (วน key — ใช้กับ object เท่านั้น, **ห้าม** ใช้กับ array เพราะได้ index เป็น string).
- `break` ออกจากลูปทันที; `continue` ข้ามไปรอบถัดไป.
- ฟังก์ชัน: มี 3 รูปแบบ — declaration (hoist ได้), expression, arrow function (กระชับ, สมัยใหม่). ทั้งหมดให้พฤติกรรมเทียบเท่ากัน; arrow function ไม่มี `this` ของตัวเอง.
- พารามิเตอร์/การคืนค่า: ฟังก์ชันที่ไม่มี `return` จะให้ `undefined`. Scope — local (ในฟังก์ชัน) กับ global.
- Higher-order function: ฟังก์ชันที่รับ/คืนฟังก์ชันอื่น (เช่น ส่งฟังก์ชัน `shippingFn` เข้าไปคำนวณ).
- Array: index เริ่มที่ 0, มี `.length`; เมธอดหลัก `push/pop`, `forEach`, `map`, `filter`, `reduce`, `find`.
- Object: คู่ key-value; เข้าถึงด้วย dot หรือ bracket notation; เมธอดใช้ `this` อ้างถึง object เจ้าของ.
- Spread (`...`): ก็อป/รวม array หรือ object (แบบ shallow, ระดับบนสุดเท่านั้น), กระจาย argument เข้า function call (`Math.max(...arr)`). Object spread ที่ key ซ้ำ — ตัวหลังชนะ (มีประโยชน์กับการอัปเดต state แบบ immutable).
- Rest (`...`) — ตรงข้ามกับ spread: รวบ argument หลายตัวเข้าเป็น array parameter ตัวเดียว.
- Destructuring: แบบ array (ตามตำแหน่ง, ข้าม/ตั้ง default/สลับค่าได้) และแบบ object (ตามชื่อ key, เปลี่ยนชื่อ/ตั้ง default/ซ้อนได้) — เจอบ่อยมากกับ response ของ API และพารามิเตอร์ฟังก์ชัน.
- `Date`: สร้างด้วย `new Date()`, `new Date(y, m, d)` (**เดือนนับจาก 0**), ISO string, หรือ `Date.now()` (timestamp เป็น ms). Getter: `getFullYear`, `getMonth` (0-11), `getDate`, `getDay` (0=อาทิตย์), `getHours/Minutes`. ไม่มี `addDays()` — ต้องรวม `setDate(getDate() + n)`. การลบ Date ได้ผลเป็นมิลลิวินาที; แปลงเป็นวันด้วย `/ (1000*60*60*24)`. แสดงผลด้วย `toLocaleString/toLocaleDateString/toLocaleTimeString('th-TH')`; serialize ด้วย `toISOString()`.
- Regular Expression: literal `/pattern/flags` หรือ `new RegExp()`. Flags: `g` (global), `i` (ไม่สนตัวพิมพ์เล็กใหญ่). คลาสที่ใช้บ่อย: `\d`, `\w`, `\s`, anchor `^`/`$`, quantifier `* + ? {n,m}`. เมธอด: `test()` (คืน bool), `match()`, `replace()`, `split()`.
- การจัดการ exception: `try { } catch(error) { } finally { }`. `finally` รันเสมอ. error ที่ไม่ถูกจับจะหยุดสคริปต์ทั้งไฟล์. `throw new Error(message)` สร้าง error ที่มี `.message`/`.name`. สร้าง error class เองด้วย `class X extends Error` + `super(message)`, แยกแยะด้วย `instanceof` ใน `catch`.
- JS Modules: 1 ไฟล์ = 1 module มี scope ของตัวเอง. ES Modules ใช้ `export`/`import`; named export (มีได้หลายตัวต่อไฟล์, import ด้วยชื่อที่ตรงกันใน `{ name }`) เทียบกับ default export (มีได้ตัวเดียวต่อไฟล์, ตั้งชื่อตอน import อะไรก็ได้). `import { x as y }`, `import * as ns`, ผสม default + named ได้. CommonJS (`module.exports` / `require`) เป็นแบบเก่าสไตล์ Node.

## นิยามที่ต้องจำ
- **Hoisting**: function declaration เรียกใช้ก่อนบรรทัดที่นิยามได้; function expression/arrow function ทำไม่ได้.
- **Immutability (ผ่าน spread)**: สร้างสำเนา array/object ใหม่แทนการแก้ตัวเดิม — รูปแบบที่ใช้บ่อยตอนอัปเดต state.
- **แนวคิดจาก Date**: timestamp เป็นแค่ตัวเลข (ms นับจาก epoch); การคำนวณวันที่ทั้งหมดลดรูปเหลือการบวกลบจำนวนเต็มบนมิลลิวินาที.
- **Named export กับ default export**: named = หลายตัวต่อไฟล์, ต้อง import ด้วยชื่อตรง; default = ตัวเดียวต่อไฟล์, import ตั้งชื่ออะไรก็ได้.

## โค้ด / ตัวอย่าง
```js
// switch เทียบกับ if/else
function getOrderStatusLabel(status) {
  switch (status) {
    case "pending": return "รอดำเนินการ";
    case "shipped": return "จัดส่งแล้ว";
    default: return "ไม่ทราบสถานะ";
  }
}

// destructuring + default ในพารามิเตอร์ฟังก์ชันเลย
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

// named เทียบกับ default export
export function formatPrice(n) { return n.toLocaleString() + " บาท"; }
export default function Button({ label }) { return `<button>${label}</button>`; }
```

## คำถามที่น่าจะออกสอบ
- ให้ snippet ที่ใช้ `var` ในลูปเทียบกับ `let` แล้วอธิบายความต่างของ scope.
- ทำไม `for...in` บน array ถึงให้ผลไม่คาดคิด? ควรใช้อะไรแทน?
- ไล่ผลลัพธ์ของลูป `for` ที่มี `break`/`continue` ที่รอบเฉพาะเจาะจง.
- ความต่างของ `map()`, `filter()`, `reduce()` — เขียนตัวที่แปลง array ของสินค้าเป็นราคารวมในตะกร้า.
- เขียนฟังก์ชันที่ใช้ object/array destructuring พร้อม default value เพื่ออ่าน response API แบบซ้อนอย่างปลอดภัย.
- อธิบายว่าทำไม `new Date(2026, 0, 1)` ถึงเป็น 1 มกราคม ไม่ใช่เดือน "0".
- เขียน regex ตรวจเบอร์โทรไทย / กฎรหัสผ่าน แล้วใช้ `.test()`.
- เกิดอะไรกับโค้ดหลัง `throw` ใน `try` ถ้าไม่มี `catch` ที่ตรงกัน?
- ความต่างของ named export กับ default export; เขียนรูปแบบ import ทั้งสองแบบสำหรับ module ที่กำหนด.
- อธิบายว่า `finally` การันตีอะไรเมื่อเทียบกับ `catch`.
