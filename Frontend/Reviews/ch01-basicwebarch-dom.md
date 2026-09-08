# สถาปัตยกรรมเว็บพื้นฐาน และ DOM

> Source: Slides/Ch01_BasicWebArch_DOM.pdf · synced 2026-09-04

## แนวคิดหลัก
### สถาปัตยกรรมเว็บ (Web architecture)
- เป้าหมายการออกแบบสถาปัตยกรรมเว็บ: ความเร็ว (Speed), ความปลอดภัย (Security), ความสามารถในการขยาย (Scalability), การดูแลรักษา (Maintainability).
- สถาปัตยกรรม 3 ชั้น (3-tier): Presentation Tier (ฝั่ง client/เบราว์เซอร์) — Application Tier (web/app server, business logic) — Data Tier (database server).
- Client (เบราว์เซอร์): โหลด HTML/CSS/JS, เรนเดอร์ UI, ดักฟัง event, เรียก Fetch API, อัปเดต DOM ด้วยข้อมูลใหม่.
- Server (backend API): รับ HTTP request, ทำ logic/auth, อ่าน/เขียน DB, ส่ง JSON กลับ.
- โมเดล Client-Server: client เป็นฝ่ายเริ่ม Request เสมอ; server ประมวลผลแล้วส่ง Response กลับ; ทั้งสองฝั่งพัฒนา/deploy แยกกันได้ตราบใดที่ interface (API contract) ยังเหมือนเดิม.
- HTTP methods: GET (อ่าน), POST (สร้าง), PUT (แทนที่ทั้ง resource), DELETE (ลบ), PATCH (แก้ไขบางส่วน).
- HTTP status codes: 2xx สำเร็จ, 3xx redirect, 4xx ผิดพลาดฝั่ง client, 5xx ผิดพลาดฝั่ง server.
- HTTP เป็นแบบ **stateless** — แต่ละ request ต้องมีข้อมูลครบในตัวเอง; server ไม่จำ request ก่อนหน้า. "การคง login" ถูกจำลองฝั่ง client ด้วย cookie (session ID) หรือ token (JWT ใน header).
- REST: client/server แลกเปลี่ยน representation (ปกติเป็น JSON) ผ่าน HTTP method มาตรฐานกับ resource.

### DOM คืออะไร
- DOM แทนเอกสาร HTML เป็น **โครงสร้างต้นไม้ของ node แบบลำดับชั้น** เพื่อให้ JS อ่าน/แก้โครงสร้าง สไตล์ และเนื้อหาได้ เป็นสิ่งที่ไม่ผูกกับภาษา (ไม่ใช่ตัว JS เอง).
- ตำแหน่งของ `<script>`: วางใน `<head>` จะบล็อกการเรนเดอร์จนกว่าจะโหลด/parse JS เสร็จ; วางไว้ท้าย `<body>` (หรือใช้ `defer` / `type="module"`) จะไม่บล็อกการเรนเดอร์.
- ชนิดของ node (มีค่าคงที่ตัวเลข 12 ค่าบน `Node.nodeType`): ที่ใช้บ่อย — `ELEMENT_NODE` (1), `ATTRIBUTE_NODE` (2), `TEXT_NODE` (3), `DOCUMENT_NODE` (9, ราก). ทุกชนิด node สืบทอดจาก `Node` และมี `nodeName`, `nodeType`, `nodeValue` ร่วมกัน.
- `document` คือ node ราก (`window.document`); `document.documentElement` คือ element `<html>`.
- การสร้าง element: `document.createElement(tag)` สร้าง element ที่ยังไม่ผูกกับ DOM (detached) — ยังไม่แสดงผลจนกว่าจะถูกแนบด้วย `appendChild` / `insertBefore` ฯลฯ.
- node ชนิด `Attr` สืบทอดจาก `Node` แต่ไม่ถูกนับตอนเดินต้นไม้ (`parentNode`/siblings เป็น `null`); ให้ใช้ `.ownerElement`, `element.getAttribute(name)`, `element.hasAttribute(name)`, `element.getAttributeNames()`.
- `innerHTML` (parse/เรนเดอร์ HTML ดิบ, เสี่ยง XSS ถ้าเป็น input ที่ไม่น่าเชื่อถือ) เทียบกับ `innerText` (เฉพาะสิ่งที่มองเห็นจริง, เคารพ CSS `display:none`) เทียบกับ `textContent` (ข้อความทั้งหมดรวมที่ซ่อน, ไม่ parse HTML — ปลอดภัย/เร็วสุดสำหรับข้อความล้วน).

## คำสั่ง DOM ที่ใช้บ่อย — วิธีใช้ และพฤติกรรมหลังใช้งาน

### 1. การเลือก node (Selecting)
| คำสั่ง | วิธีใช้ | ผลลัพธ์ / พฤติกรรมหลังใช้งาน |
|---|---|---|
| `document.getElementById(id)` | `const el = document.getElementById('cart')` | คืน element เดียว หรือ `null` ถ้าไม่เจอ. ไม่ต้องใส่ `#`. เร็วที่สุด. |
| `document.querySelector(sel)` | `document.querySelector('#soup .meat')` | คืน element **ตัวแรก** ที่ตรง CSS selector หรือ `null`. รับ selector เต็มรูปแบบ. |
| `document.querySelectorAll(sel)` | `document.querySelectorAll('li.meat')` | คืน `NodeList` แบบ **static** (ถ่ายภาพ ณ ตอนเรียก — เพิ่ม/ลบ DOM ทีหลังไม่เปลี่ยนตาม). ใช้ `.forEach()` ได้เลย. ถ้าไม่เจอได้ NodeList ว่าง (ไม่ใช่ null). |
| `getElementsByTagName(tag)` | `document.getElementsByTagName('li')` | คืน `HTMLCollection` แบบ **live** (อัปเดตอัตโนมัติเมื่อ DOM เปลี่ยน). ใช้ `.forEach()` ไม่ได้ ต้อง `Array.from()` ก่อน. |
| `getElementsByClassName(cls)` | `document.getElementsByClassName('meat')` | คืน `HTMLCollection` แบบ **live**. เข้าถึงด้วย index/ชื่อ/id เท่านั้น. |
| `element.closest(sel)` | `e.target.closest('.card')` | เดิน **ขึ้น** ไปหา ancestor (รวมตัวเอง) ตัวแรกที่ตรง selector; คืน `null` ถ้าไม่มีใครตรง. ใช้บ่อยใน event delegation. |
| `element.matches(sel)` | `if (el.matches('.active'))` | คืน `true`/`false` ว่า element ตรง selector ไหม. ไม่แก้ DOM. |

### 2. การเดินต้นไม้ (Traversing)
| คำสั่ง | วิธีใช้ | ผลลัพธ์ / พฤติกรรมหลังใช้งาน |
|---|---|---|
| `element.children` | `ul.children` | `HTMLCollection` แบบ live ของ **element ลูก** (ข้าม text/comment node). |
| `element.childNodes` | `ul.childNodes` | `NodeList` ของ node ลูก **ทุกชนิด** รวม text node จากการเว้นบรรทัด/ช่องว่าง — มักมีมากกว่าที่คิด. |
| `firstElementChild` / `lastElementChild` | `ul.firstElementChild` | element ลูกตัวแรก/ตัวสุดท้าย หรือ `null`. |
| `nextElementSibling` / `previousElementSibling` | `li.nextElementSibling` | element พี่น้องถัดไป/ก่อนหน้า หรือ `null` ถ้าอยู่สุดขอบ. |
| `parentElement` / `parentNode` | `li.parentElement` | element/node แม่. `parentNode` ของ `<html>` คือ `document`; `parentElement` คือ `null`. |

### 3. การสร้างและแนบ node (Creating & attaching)
| คำสั่ง | วิธีใช้ | ผลลัพธ์ / พฤติกรรมหลังใช้งาน |
|---|---|---|
| `document.createElement(tag)` | `const li = document.createElement('li')` | สร้าง element **ลอย ๆ** ยังไม่อยู่ในหน้า ยังไม่เรนเดอร์ จนกว่าจะแนบเข้า tree. |
| `document.createTextNode(text)` | `const t = document.createTextNode('Hi')` | สร้าง text node ลอย ๆ ไว้ `appendChild` เข้าไปในภายหลัง. |
| `parent.appendChild(node)` | `ul.appendChild(li)` | ต่อ `node` เป็นลูก **ตัวสุดท้าย**. ถ้า `node` อยู่ที่อื่นอยู่แล้ว จะถูก **ย้าย** (ไม่ใช่ก็อป). ทำให้เกิด reflow. |
| `parent.append(...)` | `ul.append(li1, 'ข้อความ')` | เหมือน `appendChild` แต่ใส่ได้หลายตัว + ใส่ string ได้ตรง ๆ. ไม่คืนค่า. |
| `parent.insertBefore(new, ref)` | `ul.insertBefore(li, ul.firstElementChild)` | แทรก `new` ให้เป็นพี่น้อง **ก่อน** `ref`. ถ้า `ref` เป็น `null` จะไปต่อท้ายเหมือน append. |
| `el.insertAdjacentHTML(pos, html)` | `el.insertAdjacentHTML('beforeend', '<li>x</li>')` | แทรก HTML ที่ตำแหน่ง `'beforebegin'/'afterbegin'/'beforeend'/'afterend'` โดยไม่ทำลาย element เดิม (ต่างจากตั้ง `innerHTML +=`). เสี่ยง XSS ถ้า html ไม่น่าเชื่อถือ. |
| `document.createDocumentFragment()` | ดูตัวอย่างด้านล่าง | container ในหน่วยความจำ นอก DOM. แนบ node เข้า fragment ได้หลายตัว แล้ว `appendChild(fragment)` **ครั้งเดียว** → เกิด reflow/repaint รอบเดียวแทนที่จะเป็นทุกรอบลูป. หลังแนบ fragment จะกลายเป็นว่าง. |

### 4. การลบและแทนที่ node (Removing & replacing)
| คำสั่ง | วิธีใช้ | ผลลัพธ์ / พฤติกรรมหลังใช้งาน |
|---|---|---|
| `element.remove()` | `li.remove()` | ลบตัวเองออกจาก DOM. หลังลบ ตัวแปร `li` ยังชี้ object เดิมอยู่ (นำกลับมาแนบใหม่ได้) แต่ `li.parentNode` เป็น `null`. |
| `parent.removeChild(child)` | `ul.removeChild(ul.firstElementChild)` | ลบ `child` ออกจาก `parent` และ **คืน** node ที่ถูกลบ. |
| `parent.replaceChild(new, old)` | `ul.replaceChild(newLi, oldLi)` | เอา `new` ใส่แทนที่ `old` และคืน `old` ที่ถูกถอดออก. |
| `el.replaceWith(node)` | `oldLi.replaceWith(newLi)` | แทน `el` ด้วย node ใหม่ เขียนอ่านง่ายกว่า `replaceChild`. |

### 5. การแก้เนื้อหาและ attribute
| คำสั่ง | วิธีใช้ | ผลลัพธ์ / พฤติกรรมหลังใช้งาน |
|---|---|---|
| `el.textContent = str` | `p.textContent = 'ราคา 50 บาท'` | แทนข้อความลูกทั้งหมดด้วย `str`. ไม่ parse HTML → ปลอดภัยจาก XSS. เร็วสุด. |
| `el.innerHTML = html` | `div.innerHTML = '<b>x</b>'` | parse `html` แล้วสร้าง node ใหม่ ทับลูกเดิมทั้งหมด (event listener บนลูกเดิมหายไป). อย่าใส่ข้อมูลจากผู้ใช้ตรง ๆ. |
| `el.setAttribute(name, val)` | `img.setAttribute('src', '/a.png')` | ตั้ง/เขียนทับ attribute. ค่าเป็น string เสมอ. |
| `el.getAttribute(name)` | `img.getAttribute('src')` | อ่านค่า attribute เป็น string หรือ `null` ถ้าไม่มี. |
| `el.removeAttribute(name)` | `btn.removeAttribute('disabled')` | ลบ attribute ทิ้ง. |
| `el.dataset` | `el.dataset.userStatus = 'vip'` | อ่าน/เขียน `data-*`. `data-user-status` (kebab) ↔ `dataset.userStatus` (camel). ตั้งค่า = `setAttribute('data-user-status', ...)`; ลบด้วย `delete el.dataset.userStatus`. |
| `el.classList.add(...)` | `p.classList.add('active', 'p-5')` | เพิ่มคลาส (ซ้ำได้ไม่พัง). แก้ทันทีบนหน้า. |
| `el.classList.remove(...)` | `p.classList.remove('active')` | ลบคลาส (ไม่มีอยู่ก็ไม่ error). |
| `el.classList.toggle(name, force)` | `p.classList.toggle('active')` | มีอยู่→ลบ, ไม่มี→เพิ่ม; คืน `true`/`false` ว่าตอนนี้มีคลาสไหม. ใส่ `force` (bool) เพื่อบังคับทิศทาง. |
| `el.classList.contains(name)` | `if (p.classList.contains('active'))` | คืน `true`/`false`. ไม่แก้ DOM. |
| `el.style.prop = val` | `box.style.backgroundColor = 'red'` | ตั้ง inline style (คีย์เป็น camelCase). ทับเฉพาะ property นั้น. |

### 6. Event ที่เจอบ่อย
| คำสั่ง | วิธีใช้ | ผลลัพธ์ / พฤติกรรมหลังใช้งาน |
|---|---|---|
| `el.addEventListener(type, fn)` | `btn.addEventListener('click', handle)` | ผูก handler; ผูกซ้ำหลายตัวได้. `fn` รับ `event` object. |
| `el.removeEventListener(type, fn)` | `btn.removeEventListener('click', handle)` | ถอด handler — ต้องส่ง **ฟังก์ชันตัวเดิม** (ไม่ใช่ arrow ใหม่) ถึงจะถอดได้. |
| `event.target` | ใน handler: `event.target` | element ที่เป็นต้นเหตุจริง ๆ (ลึกสุด) — ต่างจาก `event.currentTarget` ที่เป็น element ที่ผูก listener. |
| `event.preventDefault()` | `e.preventDefault()` ใน `submit` | ยกเลิกพฤติกรรมปริยายของเบราว์เซอร์ (เช่น ฟอร์ม reload หน้า, ลิงก์เปลี่ยนหน้า). |
| `event.stopPropagation()` | `e.stopPropagation()` | หยุด event ไม่ให้ bubble ต่อขึ้นไปหา ancestor. |

## นิยามที่ต้องจำ
- **DOM**: การแทนเอกสาร HTML เป็นโครงสร้างต้นไม้ของ node แบบลำดับชั้นที่ JS อ่านและแก้ไขได้.
- **Live vs static collection**: `HTMLCollection` (getElementsByTagName/ClassName) สะท้อนการเปลี่ยน DOM ที่เกิดทีหลังอัตโนมัติ; `NodeList` จาก `querySelectorAll` เป็นภาพนิ่ง ณ เวลาที่เรียก.
- **Stateless HTTP**: ไม่มี request ไหน "จำ" request ก่อนหน้า; การคงสถานะต้องใช้ cookie/token.
- **Reflow/repaint**: การที่เบราว์เซอร์คำนวณ layout/paint ใหม่หลัง DOM เปลี่ยน — ควรรวบการเปลี่ยนแปลง (เช่นผ่าน `DocumentFragment`) เพื่อลดจำนวนครั้ง.
- **detached node**: node ที่สร้างแล้วแต่ยังไม่แนบเข้า DOM — ยังไม่แสดงผล, `parentNode` เป็น `null`.

## โค้ด / ตัวอย่าง
```js
// เลือก + เดินต้นไม้
const soupMenu = document.querySelector('#soup');
const first = soupMenu.firstElementChild;
const next = first.nextElementSibling;

// closest() — event delegation
list.addEventListener('click', (e) => {
  const li = e.target.closest('li');   // คลิกตรงไหนใน <li> ก็ได้
  if (!li) return;
  li.classList.toggle('selected');     // สลับสถานะเลือก/ไม่เลือก
});

// สร้าง + แนบ
const li = document.createElement('li');
li.textContent = 'Item';
listEl.appendChild(li);                 // ไปต่อท้าย, เกิด reflow

// แทรกตำแหน่งแรกแทนตำแหน่งท้าย
listEl.insertBefore(newLi, listEl.firstElementChild);

// ลบ / แทนที่
listEl.removeChild(listEl.firstElementChild);
oldLi.replaceWith(newLi);

// แทรกจำนวนมากผ่าน DocumentFragment (reflow ครั้งเดียว)
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const item = document.createElement('li');
  item.textContent = 'Item ' + i;
  fragment.appendChild(item);
}
list.appendChild(fragment);             // fragment ว่างหลังบรรทัดนี้

// dataset + classList
button.dataset.color = 'green';         // <button data-color="green">
console.log(button.getAttribute('data-color')); // "green" — เข้าถึงอีกทางหนึ่ง
pElement.classList.add('text-xl', 'p-5');
const nowActive = pElement.classList.toggle('active'); // true/false

// system dialog (ระดับเบราว์เซอร์ ไม่ใช่ element ใน DOM)
alert('บันทึกแล้ว');                    // OK อย่างเดียว, บล็อกสคริปต์จนกด
const ok = confirm('ลบรายการนี้?');     // true/false
const name = prompt('ชื่อของคุณ?', ''); // string หรือ null ถ้ากด Cancel
```

## System dialogs (ระดับเบราว์เซอร์ ไม่ใช่ element ใน DOM)
- `alert(message)` — มีปุ่ม OK อย่างเดียว, ให้ข้อมูล, บล็อกการทำงานของสคริปต์จนกว่าจะปิด.
- `confirm(message)` — OK/Cancel, คืน `true`/`false`.
- `prompt(message, default)` — OK/Cancel + ช่องกรอกข้อความ, คืน string หรือ `null` ถ้ากดยกเลิก.
- ทั้งสามเป็นแบบ synchronous/modal และถูกจัดสไตล์โดย OS/เบราว์เซอร์ ไม่ใช่ CSS.

## คำถามที่น่าจะออกสอบ
- วาด/อธิบายสถาปัตยกรรมเว็บ 3 ชั้น และหน้าที่ของแต่ละชั้น.
- อธิบายว่าทำไม HTTP ถึงเป็น stateless และ login แบบ session/JWT ทำงานรอบข้อจำกัดนี้อย่างไร.
- ให้ HTML snippet มา ระบุ `nodeType`/`nodeName`/`nodeValue` ของ node ที่กำหนด.
- ความต่างของ `innerHTML`, `innerText`, `textContent` — แต่ละตัวทำให้เกิดบั๊กเมื่อไร.
- ความต่างของ `HTMLCollection` กับ `NodeList`; ตัวไหน "live" หลัง DOM เปลี่ยน.
- เขียนโค้ดเลือก `<li>` ทุกตัวที่มีคลาส `.meat` แล้ว log ทีละตัว.
- เขียนโค้ดสร้าง `<li>` ใหม่ ตั้งข้อความ แล้วแทรกเป็นลูกตัวแรกของ list (ไม่ใช่ตัวสุดท้าย).
- ทำไมต้องใช้ `DocumentFragment` แทนการ append 1000 element ตรง ๆ ในลูป.
- เข้าถึง `data-user-id="42"` ทั้งผ่าน `dataset` และ `getAttribute`.
- ใช้ `classList.toggle` ทำ UI แบบ "เลือก/ยกเลิกเลือก".
- `element.closest('.card')` คืนอะไรถ้าไม่มี ancestor ตัวไหนตรง.
- อธิบายความต่างของ `event.target` กับ `event.currentTarget` ใน event delegation.
