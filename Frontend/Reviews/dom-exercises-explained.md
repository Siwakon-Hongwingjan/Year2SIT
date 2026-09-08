# DOM Exercises — คำอธิบายการทำงานทีละข้อ

> รวมโจทย์ DOM 10 ข้อที่ทำไปแล้ว พร้อมอธิบายว่าโค้ดแต่ละบรรทัดทำงานยังไง
> อ้างอิงแนวคิดจาก [`ch01-basicwebarch-dom.md`](ch01-basicwebarch-dom.md)

## สารบัญ

| # | โจทย์ | โฟกัสหลัก |
|---|-------|-----------|
| 1 | [สำรวจต้นไม้ของเมนู](#ข้อ-1--สำรวจต้นไม้ของเมนู) | `childNodes` vs `children`, `nodeType` |
| 2 | [หาเมนูด้วย selector](#ข้อ-2--หาเมนูด้วย-selector) | `querySelectorAll`, `classList`, scoped query |
| 3 | [แสดงข้อความจากผู้ใช้อย่างปลอดภัย](#ข้อ-3--แสดงข้อความจากผู้ใช้อย่างปลอดภัย) | `textContent` vs `innerHTML`, XSS |
| 4 | [ซ่อม attribute ของลิงก์](#ข้อ-4--ซ่อม-attribute-ของลิงก์) | `setAttribute`, `hasAttribute`, `getAttributeNames` |
| 5 | [สร้างรายการสินค้า + แทรกโปรโมชั่น](#ข้อ-5--สร้างรายการสินค้า--แทรกโปรโมชั่น) | `createElement`, `appendChild`, `insertBefore` |
| 6 | [เดินหาข้อมูลจานอาหาร](#ข้อ-6--เดินหาข้อมูลจานอาหาร) | `closest`, `previousElementSibling`, tree walk |
| 7 | [จัดตะกร้าสินค้า](#ข้อ-7--จัดตะกร้าสินค้า) | live collection, `removeChild`, `replaceChild` |
| 8 | [ล้างชั้นสินค้าหมดสต็อก](#ข้อ-8--ล้างชั้นสินค้าหมดสต็อก) | live `HTMLCollection` vs static `NodeList` |
| 9 | [จัดชั้นวางสินค้าในครั้งเดียว](#ข้อ-9--จัดชั้นวางสินค้าในครั้งเดียว) | `DocumentFragment`, `dataset`, `reduce` |
| 10 | [จัดเรียงรายการ Todo](#ข้อ-10--จัดเรียงรายการ-todo) | ย้าย node เดิม, stable `sort` |

---

## ข้อ 1 · สำรวจต้นไม้ของเมนู

**โจทย์:** อ่านโครงสร้างของ `<ul id="menu">` แล้วรายงานตัวเลข 4 อย่างลงในหน้า

```js
function inspectMenu() {
  const menu = document.getElementById("menu");
  document.getElementById("count-nodes").textContent = menu.childNodes.length;
  document.getElementById("count-elements").textContent = menu.children.length;
  document.getElementById("first-tag").textContent = menu.firstElementChild.tagName;

  const types = [];
  for (const child of menu.childNodes) {
    types.push(child.nodeType);
  }
  document.getElementById("types").textContent = types.join(",");
}
```

**ทำงานยังไง**

1. `getElementById("menu")` — คว้า `<ul>` มาเก็บใน `menu`
2. `menu.childNodes.length` — นับ **ทุก node ลูก** รวม text node (พวกช่องว่าง/ขึ้นบรรทัดใหม่ระหว่าง `<li>`) และ comment node → ตัวเลขนี้มักจะมากกว่าจำนวน `<li>` จริง
3. `menu.children.length` — นับ **เฉพาะ element** (`<li>`) เท่านั้น ข้าม text/comment
4. `menu.firstElementChild.tagName` — element ลูกตัวแรก (ข้าม text node นำหน้า) แล้วอ่านชื่อแท็ก คืนค่าเป็นตัวพิมพ์ใหญ่ เช่น `"LI"`
5. ลูป `for...of` วน `childNodes` เก็บ `nodeType` ของแต่ละตัวลง array แล้ว `join(",")` → ได้ลำดับแบบ `3,1,3,1,3` (3 = TEXT_NODE, 1 = ELEMENT_NODE)

**กันพลาด:** `childNodes` เป็น `NodeList`, `children` เป็น `HTMLCollection` — คนละชนิดแต่ทั้งคู่มี `.length`

---

## ข้อ 2 · หาเมนูด้วย selector

**โจทย์:** ทำ 3 อย่างกับเมนู — ไฮไลต์เมนูเนื้อ, นับเมนูเจ, อ่านซุปตัวแรก

```js
function markMenu() {
  const meat = document.querySelectorAll(".meat");
  meat.forEach((item) => item.classList.add("highlight"));

  document.getElementById("vegan-count").textContent =
    document.querySelectorAll(".vegan").length;

  const soup = document.getElementById("soup");
  const firstSoup = soup.querySelector("li");
  document.getElementById("first-soup").textContent = firstSoup.textContent;
}
```

**ทำงานยังไง**

1. `querySelectorAll(".meat")` — คืน `NodeList` แบบ static ของทุก element ที่มี class `meat`
   `NodeList` เรียก `.forEach` ได้ตรง ๆ → วนเพิ่ม class `highlight` ให้ทีละตัวด้วย `classList.add`
2. `querySelectorAll(".vegan").length` — ไม่ต้องวนเลย แค่ต้องการจำนวน → เอา `.length` เขียนลงช่องผลลัพธ์
3. **scoped query:** `soup.querySelector("li")` — เรียก `querySelector` จาก element `#soup` ไม่ใช่จาก `document` → ค้นเฉพาะลูกหลานของ `#soup` เท่านั้น ได้ `<li>` ตัวแรกในนั้น แล้วอ่าน `.textContent`

**กันพลาด:** `querySelector` คืน element ตัวแรกตัวเดียว (หรือ `null`), `querySelectorAll` คืนทั้งหมด

---

## ข้อ 3 · แสดงข้อความจากผู้ใช้อย่างปลอดภัย

**โจทย์:** เอา `userText` (อาจมีแท็ก HTML แฝง) ไปแสดงในหน้าโดยไม่ให้แท็กถูกตีความ

```js
function showMessage(userText) {
  document.getElementById("safe-box").textContent = userText;

  const richbox = document.getElementById("rich-box");
  const strong = document.createElement("strong");
  strong.textContent = "ข้อความจากผู้ใช้: ";
  richbox.append(strong);
  richbox.append(document.createTextNode(userText));
}
```

ทดสอบด้วย `'<b>สวัสดี</b><img src="broken.jpg">'`

**ทำงานยังไง**

1. **`safe-box`** — ใช้ `textContent = userText` ตัวสตริง `<b>สวัสดี</b>...` จะถูกเก็บเป็น **ตัวอักษรล้วน** เบราว์เซอร์แสดงเครื่องหมาย `<` `>` ตามตัวอักษร ไม่สร้าง element ไม่โหลดรูป
2. **`rich-box`** — อยากได้หัวข้อ **ตัวหนา** + ข้อความผู้ใช้ โดยไม่แตะ `innerHTML`:
   - `createElement("strong")` สร้างแท็กหนา แล้วเซ็ตข้อความหัวข้อผ่าน `textContent`
   - `createTextNode(userText)` ห่อข้อความผู้ใช้เป็น **text node** ล้วน ๆ
   - `append(...)` เอาทั้งสองต่อเข้า `#rich-box` ตามลำดับ
3. ผล: ตัวหนาคือข้อความของเราเอง (ปลอดภัย) ส่วนของผู้ใช้เป็น text node จึงไม่มีทางกลายเป็น `<img>` ที่ยิง request

**หลักการ:** อย่าเอา string จากผู้ใช้ยัด `innerHTML` เด็ดขาด — `textContent` / `createTextNode` คือทางปลอดภัย
(`append()` ถ้าส่ง string เข้าไปตรง ๆ ก็ปลอดภัยเหมือนกัน เพราะมันถือเป็น text ไม่ parse HTML)

---

## ข้อ 4 · ซ่อม attribute ของลิงก์

**โจทย์:** เติม `target`/`rel` ให้ลิงก์สินค้า, มาร์คลิงก์ที่ไม่มี `href`, แล้วรายงาน attribute ทั้งหมดของ `#hero-img`

```js
function fixLinks() {
  const link = document.querySelectorAll(".product-link");
  link.forEach((item) => {
    item.setAttribute("target", "_blank");
    item.setAttribute("rel", "noopener");
  });

  link.forEach((item) => {
    if (item.hasAttribute("href") == false) {
      item.classList.add("broken");
    }
  });

  const pic = document.getElementById("hero-img");
  const att = [];
  for (let i = 0; i < pic.getAttributeNames().length; i++) {
    att.push(pic.getAttributeNames()[i]);
  }
  document.getElementById("hero-attrs").textContent = att.join(", ");
}
```

**ทำงานยังไง**

1. เก็บลิงก์ทั้งหมด (`.product-link`) เป็น `NodeList`
2. ลูปแรก — `setAttribute("target", "_blank")` + `setAttribute("rel", "noopener")` ให้ทุกตัว
   (`rel="noopener"` กันหน้าใหม่เข้าถึง `window.opener` ของเรา = ปิดช่องโหว่ tabnabbing)
3. ลูปสอง — `hasAttribute("href")` เช็คว่ามี attribute `href` ไหม ถ้าไม่มี (`== false`) → `classList.add("broken")`
4. `getAttributeNames()` — คืน **array ของชื่อ attribute ตามลำดับที่เขียนจริงในแท็ก** วนเก็บแล้ว `join(", ")` เช่น `"id, src, alt, width"`

**กันพลาด:** `getAttributeNames()` สร้าง array ใหม่ทุกครั้งที่เรียก — เรียกซ้ำในลูปได้ผลถูกแต่เปลืองนิดหน่อย เก็บใส่ตัวแปรก่อนแล้ววนจะสวยกว่า

---

## ข้อ 5 · สร้างรายการสินค้า + แทรกโปรโมชั่น

**โจทย์:** สร้าง `<li>` ให้สินค้าทุกชิ้นด้วย `createElement` (ห้าม `innerHTML`), แทรกแถวโปรโมชั่นเป็นตัวแรก, นับจำนวนสินค้า

```js
function renderProducts(products) {
  const productList = document.getElementById("product-list");

  products.forEach((product) => {
    const li = document.createElement("li");
    li.classList.add("product");
    li.textContent = `${product.name} —- ${product.price} บาท`;
    productList.appendChild(li);
  });

  const li = document.createElement("li");
  li.classList.add("promo");
  li.textContent = "โปรโมชั่นวันนี้";
  productList.insertBefore(li, productList.firstChild);

  let count = 0;
  const a = productList.children;
  [...a].forEach((el) => {
    if (el.classList.contains("product")) count += 1;
  });
  document.getElementById("product-count").textContent = count;
}
```

**ทำงานยังไง**

1. วน `products` → แต่ละชิ้นสร้าง `<li class="product">` เซ็ตข้อความ แล้ว `appendChild` ต่อท้าย `#product-list` → เรียงตามลำดับ array
2. สร้าง `<li class="promo">` แยก แล้ว `insertBefore(li, productList.firstChild)` — วางไว้ **ก่อน** node ลูกตัวแรก = กลายเป็นแถวแรกสุด
3. นับสินค้า: `productList.children` เป็น `HTMLCollection` → กระจายเป็น array (`[...a]`) แล้วนับเฉพาะตัวที่ `classList.contains("product")` → แถว promo ไม่ถูกนับ

**⚠️ ระวัง:** ข้อความใส่ `—-` (em dash + ขีดกลาง) แต่โจทย์บอกรูปแบบ `"ชื่อ — ราคา บาท"` (em dash ตัวเดียว) — ถ้ามีเทสต์เทียบสตริงเป๊ะจะไม่ผ่าน แก้เป็น `` `${product.name} — ${product.price} บาท` ``

---

## ข้อ 6 · เดินหาข้อมูลจานอาหาร

**โจทย์:** จาก `<li>` จานอาหารหนึ่งตัว เดินต้นไม้ DOM ไปหา ชื่อ / หมวด / ตำแหน่งในหมวด / เพื่อนบ้าน

```js
function describeDish(id) {
  const dish = document.getElementById(id);
  document.getElementById("dish-name").textContent = dish.textContent;

  const section = dish.closest(".menu-section");
  document.getElementById("dish-section").textContent =
    section.querySelector("h3").textContent;

  let count = 1;
  let current = dish.previousElementSibling;
  while (current) {
    count++;
    current = current.previousElementSibling;
  }
  document.getElementById("dish-position").textContent = count;

  const prv = dish.previousElementSibling;
  const next = dish.nextElementSibling;
  const prvText = dish ? prv.textContent : "-";
  const nextText = dish ? next.textContent : "-";
  document.getElementById("dish-neighbors").textContent =
    `ก่อนหน้า: ${prvText} · ถัดไป: ${nextText}`;
}
```

**ทำงานยังไง**

1. `dish.textContent` → ชื่อจาน
2. **เดินขึ้น:** `closest(".menu-section")` ไต่ ancestor ขึ้นไป (รวมตัวเอง) หา element แรกที่มี class `menu-section` → จากนั้น `section.querySelector("h3")` หาหัวข้อหมวดข้างใน
3. **นับตำแหน่ง:** เริ่ม `count = 1` แล้ววน `previousElementSibling` ถอยหลังทีละก้าวจนกว่าจะเป็น `null` แต่ละก้าว `count++` → ได้ลำดับที่ของจานในหมวด (1-based)
4. **เพื่อนบ้าน:** `previousElementSibling` / `nextElementSibling` ซ้าย-ขวา

**⚠️ ระวัง (บั๊กจริง):** เงื่อนไข `dish ? prv.textContent : "-"` เช็คผิดตัวแปร — `dish` เป็นจริงเสมอ (เจอ element แล้ว) ควรเช็ค `prv` / `next`:

```js
const prvText = prv ? prv.textContent : "-";
const nextText = next ? next.textContent : "-";
```

ถ้าจานอยู่หัวหรือท้ายหมวด `prv`/`next` จะเป็น `null` แล้วโค้ดเดิมจะ `Cannot read properties of null (reading 'textContent')` พังทันที

---

## ข้อ 7 · จัดตะกร้าสินค้า

**โจทย์:** ลบสินค้าที่ `data-qty="0"`, รวมยอดที่เหลือ, เปลี่ยน banner เก่าเป็นอันใหม่

```js
function cleanCart() {
  const cart = document.getElementById("cart");
  const arrCart = Array.from(cart.children);

  let total = 0;
  arrCart.forEach((item) => {
    const qty = item.getAttribute("data-qty");
    if (qty == "0") {
      cart.removeChild(item);
    } else {
      total += Number(qty);
    }
  });

  const oldBanner = document.getElementById("old-banner");
  const banner = document.createElement("div");
  banner.classList.add("banner");
  banner.textContent = "ตะกร้าอัปเดตแล้ว";
  oldBanner.parentNode.replaceChild(banner, oldBanner);

  document.getElementById("cart-total").textContent = total;
}
```

**ทำงานยังไง**

1. **snapshot ก่อนลบ:** `cart.children` เป็น live `HTMLCollection` — ถ้าวนมันไปพร้อมกับ `removeChild` index จะเลื่อนจนข้ามตัว → `Array.from(...)` ถ่ายเป็น array นิ่ง ๆ ก่อน แล้วค่อยวน
2. แต่ละ `<li>` อ่าน `getAttribute("data-qty")`:
   - `"0"` → `cart.removeChild(item)` เอาออกจากตะกร้า
   - อื่น ๆ → `Number(qty)` แปลงเป็นเลขแล้วบวกสะสมใน `total`
3. **แทน banner:** `oldBanner.parentNode.replaceChild(banner, oldBanner)` — สร้าง `<div class="banner">` ใหม่ แล้วสั่ง parent สลับ node เก่าเป็นใหม่ในตำแหน่งเดิม
4. เขียน `total` ลง `#cart-total`

**หลักการ:** live collection + ลบระหว่างวน = ต้อง `Array.from` ก่อนเสมอ

---

## ข้อ 8 · ล้างชั้นสินค้าหมดสต็อก

**โจทย์:** จับคอลเลกชัน `.item` ไว้ 2 แบบ (live + static) → ลบ `.sold-out` ทั้งหมด → รายงานความยาวของทั้งสองคอลเลกชัน

```js
var __capturedLive = null;
var __capturedStatic = null;

function prepareCounts() {
  __capturedLive = document.getElementsByClassName("item");   // live HTMLCollection
  __capturedStatic = document.querySelectorAll(".item");       // static NodeList
}

function removeSoldOut() {
  const soldOut = document.getElementsByClassName("sold-out"); // live
  while (soldOut.length) soldOut[0].remove();
}

function reportCounts() {
  document.getElementById("live-count").textContent = __capturedLive.length;
  document.getElementById("static-count").textContent = __capturedStatic.length;
}
```

**ทำงานยังไง — หัวใจของข้อนี้คือ live vs static**

1. `prepareCounts()` จับ **ก่อน** ลบอะไร:
   - `getElementsByClassName("item")` → `HTMLCollection` แบบ **live** ผูกกับ DOM สด ถ้า DOM เปลี่ยน `.length` เปลี่ยนตาม
   - `querySelectorAll(".item")` → `NodeList` แบบ **static** เป็นภาพนิ่ง ณ วินาทีที่เรียก
2. `removeSoldOut()` — `getElementsByClassName("sold-out")` ก็ live เหมือนกัน จะวนด้วย index คงที่ไม่ได้ (ลบตัวที่ 0 แล้วตัวอื่นเลื่อน index มาแทน) → ใช้ `while (soldOut.length) soldOut[0].remove()` = ลบตัวแรกซ้ำ ๆ จนคอลเลกชันว่าง
3. `reportCounts()` — สมมติ `.item` ที่ถูกลบไปมี class `sold-out` ด้วย N ตัว:
   - `__capturedLive.length` → **ลดลง** N (เพราะ live เห็นการลบ)
   - `__capturedStatic.length` → **เท่าเดิม** (snapshot ไม่ขยับ)

นี่คือจุดที่โจทย์อยากให้เห็นความต่างชัด ๆ

---

## ข้อ 9 · จัดชั้นวางสินค้าในครั้งเดียว

**โจทย์:** สร้างการ์ดสินค้าทุกใบใน `#shelf` โดยต่อเข้า DOM จริง **ครั้งเดียว** ผ่าน `DocumentFragment`

```js
function renderShelf(products) {
  const shelf = document.querySelector("#shelf");
  const frag = document.createDocumentFragment();

  products.forEach((item) => {
    const art = document.createElement("article");
    art.classList.add("card");
    art.dataset.id = item.id;

    const h3 = document.createElement("h3");
    h3.classList.add("card-name");
    h3.textContent = item.name;

    const p = document.createElement("p");
    p.classList.add("card-price");
    p.textContent = `${item.price} บาท`;

    const ul = document.createElement("ul");
    ul.classList.add("card-tags");
    item.tags.forEach((tag) => {
      const li = document.createElement("li");
      li.textContent = tag;
      ul.appendChild(li);
    });

    if (item.tags.length === 0) art.classList.add("plain");

    art.appendChild(h3);
    art.appendChild(p);
    art.appendChild(ul);
    frag.appendChild(art);
  });

  shelf.appendChild(frag);
  document.getElementById("shelf-count").textContent = shelf.children.length;

  const cheapest = products.reduce((min, p) => (p.price < min.price ? p : min));
  document.getElementById("cheapest").textContent = cheapest.name;
}
```

**ทำงานยังไง**

1. `createDocumentFragment()` — คอนเทนเนอร์ในหน่วยความจำ อยู่นอก DOM ต่อ node เข้ามันไม่ทำให้เบราว์เซอร์ reflow
2. วนสินค้าแต่ละชิ้น ประกอบการ์ด 3 ชั้น:
   - `<article class="card" data-id="...">` — `art.dataset.id = item.id` เท่ากับ `setAttribute("data-id", ...)` (kebab-case ใน HTML ↔ camelCase ใน JS)
   - `<h3 class="card-name">` ชื่อ
   - `<p class="card-price">` ราคา `"259 บาท"`
   - `<ul class="card-tags">` วน `item.tags` สร้าง `<li>` ต่อเข้า `ul`
   - ถ้าไม่มี tag เลย (`tags.length === 0`) → เพิ่ม class `plain` ให้ `<article>`
   - ประกอบ h3 → p → ul เข้า `art` แล้ว `art` เข้า `frag`
3. หลังลูปจบ `shelf.appendChild(frag)` **ครั้งเดียว** — fragment "ละลาย" ทิ้งตัวเอง เหลือแต่การ์ดทั้งหมดเข้า `#shelf` พร้อมกัน = reflow รอบเดียว
4. `shelf.children.length` → จำนวนการ์ด
5. `reduce` ไม่ใส่ค่าเริ่ม → เริ่มจาก `products[0]` เทียบ `p.price < min.price` (เข้ม `<`) ถ้าราคาเท่ากันจะไม่สลับ → ได้ตัวที่ถูกที่สุดและ **มาก่อนใน array** ตามโจทย์

**หลักการ:** insert หลายตัว → ประกอบใน fragment แล้ว append ทีเดียว (perf pattern)

---

## ข้อ 10 · จัดเรียงรายการ Todo

**โจทย์:** เรียง `<li>` ใน `<ul id="todo-list">` โดย **ย้าย node เดิม** ห้ามสร้างใหม่ ห้าม `innerHTML` — และอัปเดตสรุปทุกครั้ง

```js
function updateSummary() {
  const todoList = document.getElementById("todo-list");
  const items = Array.from(todoList.children);
  const remaing = items.filter((li) => !li.classList.contains("done"));
  document.getElementById("todo-summary").textContent =
    `เหลือ ${remaing.length} จาก ${items.length}`;
}

function sortByPriority() {
  const todoList = document.getElementById("todo-list");
  const items = Array.from(todoList.children);
  items.sort((a, b) => a.dataset.priority - b.dataset.priority);
  items.forEach((item) => todoList.appendChild(item));
  updateSummary();
}

function moveDoneToBottom() {
  const todoList = document.getElementById("todo-list");
  const items = Array.from(todoList.children);
  const done = items.filter((li) => li.classList.contains("done"));
  done.forEach((a) => todoList.appendChild(a));
  updateSummary();
}

function pinFirst(id) {
  const todoList = document.getElementById("todo-list");
  const items = Array.from(todoList.children);
  const match = items.find((li) => li.dataset.id === id);
  if (match) todoList.insertBefore(match, todoList.firstElementChild);
  updateSummary();
}
```

**ทำงานยังไง**

- **แนวคิดหลัก:** `<li>` อยู่ในต้นไม้อยู่แล้ว การเรียก `appendChild(existingNode)` / `insertBefore(existingNode, ...)` = **ย้าย** ไม่ใช่โคลน node ตัวเดิมถูกถอดจากตำแหน่งเก่าไปแปะที่ใหม่อัตโนมัติ

- **`sortByPriority()`** — `Array.from(children)` เป็น array ก่อน (เพราะกำลังจะขยับ DOM), `sort` ตาม `dataset.priority` — เป็น string แต่ตัวลบ `a - b` บังคับให้เป็นตัวเลข `Array.prototype.sort` เป็น **stable** → ค่า priority เท่ากันคงลำดับเดิม จากนั้นวน `appendChild` ตามลำดับที่เรียงแล้ว = จัดเรียงใหม่ทั้งลิสต์

- **`moveDoneToBottom()`** — `filter` เอาเฉพาะ `<li class="done">` ตามลำดับที่เจอ แล้ว `appendChild` ไปต่อท้ายทีละตัว ตัวที่ done ถูกดันไปล่างสุด โดยลำดับสัมพัทธ์ระหว่างกันคงเดิม

- **`pinFirst(id)`** — `find` หา `<li>` ที่ `dataset.id === id` แล้ว `insertBefore(match, todoList.firstElementChild)` ย้ายมาเป็นตัวแรก (`if (match)` กันกรณีหาไม่เจอ)

- **`updateSummary()`** — เรียกท้ายทุกฟังก์ชัน นับ `<li>` ทั้งหมด (Y) กับตัวที่ไม่มี class `done` (X) เขียน `"เหลือ X จาก Y"`

---

## เช็กลิสต์แนวคิดที่ข้อพวกนี้ทดสอบ

- [ ] `childNodes` (ทุก node) vs `children` (เฉพาะ element) — ข้อ 1
- [ ] `nodeType`: 1 = element, 3 = text — ข้อ 1
- [ ] `querySelector` scoped กับ element ไม่ใช่ document — ข้อ 2
- [ ] `textContent` / `createTextNode` ปลอดภัย, `innerHTML` เสี่ยง XSS — ข้อ 3
- [ ] `setAttribute` / `hasAttribute` / `getAttributeNames` (คงลำดับในแท็ก) — ข้อ 4
- [ ] `insertBefore(node, firstChild)` = แทรกหัว — ข้อ 5
- [ ] `closest()` เดินขึ้น ancestor — ข้อ 6
- [ ] `previousElementSibling` / `nextElementSibling` คืน `null` ที่ขอบ — ข้อ 6
- [ ] live collection + ลบระหว่างวน → `Array.from` ก่อน — ข้อ 7, 8
- [ ] `replaceChild(new, old)` — ข้อ 7
- [ ] `getElementsByClassName` (live) vs `querySelectorAll` (static) — ข้อ 8
- [ ] `while (coll.length) coll[0].remove()` วนลบ live collection — ข้อ 8
- [ ] `DocumentFragment` → append ทีเดียว ลด reflow — ข้อ 9
- [ ] `dataset.x` ↔ `data-x` — ข้อ 9, 10
- [ ] `appendChild(existingNode)` = ย้าย ไม่ใช่ก็อป — ข้อ 10
- [ ] `Array.prototype.sort` เป็น stable — ข้อ 10
```
