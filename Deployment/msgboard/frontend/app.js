const API = "/api/messages";
const list = document.getElementById("messages");
const form = document.getElementById("post-form");
const errorBox = document.getElementById("error");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.hidden = !msg;
}

function render(messages) {
  list.innerHTML = "";
  for (const m of messages) {
    const li = document.createElement("li");
    li.innerHTML = "<strong></strong> <time></time><p></p>";
    li.querySelector("strong").textContent = m.author;
    li.querySelector("time").textContent = new Date(m.createdAt).toLocaleString();
    li.querySelector("p").textContent = m.body;
    list.appendChild(li);
  }
}

async function load() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error(`GET failed: ${res.status}`);
    render(await res.json());
    showError("");
  } catch (e) {
    showError(e.message);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { author: form.author.value, body: form.body.value };
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `POST failed: ${res.status}`);
    form.reset();
    showError("");
    load();
  } catch (e) {
    showError(e.message);
  }
});

load();
