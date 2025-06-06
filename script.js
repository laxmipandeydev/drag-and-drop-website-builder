/****************  DRAG-DROP WEBSITE BUILDER  ****************/

const sidebarItems = document.querySelectorAll(".draggable");
const canvas = document.getElementById("canvas");
const form = document.getElementById("property-form");

let pendingTouchType = null; // mobile tap-and-drop helper
let selectedElement = null;

/* ----------  SIDEBAR  ---------- */
// Desktop drag
sidebarItems.forEach((item) => {
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("type", item.dataset.type);
  });
  // Mobile touch
  item.addEventListener("touchstart", () => {
    pendingTouchType = item.dataset.type; // remember
    item.classList.add("dragging-temp");
    setTimeout(() => item.classList.remove("dragging-temp"), 150);
  });
});

/* ----------  CANVAS DROP  ---------- */
// Desktop HTML5 drop
canvas.addEventListener("dragover", (e) => e.preventDefault());
canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  const type = e.dataTransfer.getData("type");
  createElement(type, e.clientX, e.clientY);
});

// Mobile tap-and-drop
canvas.addEventListener("touchend", (e) => {
  if (!pendingTouchType) return;
  const rect = canvas.getBoundingClientRect();
  const t = e.changedTouches[0];
  createElement(pendingTouchType, t.clientX, t.clientY, rect);
  pendingTouchType = null;
});

/* ----------  CREATE ELEMENT  ---------- */
function createElement(
  type,
  clientX,
  clientY,
  rect = canvas.getBoundingClientRect()
) {
  let el;
  switch (type) {
    case "text":
      el = document.createElement("p");
      el.textContent = "Editable Text";
      break;
    case "image":
      el = document.createElement("img");
      el.src = "https://via.placeholder.com/150";
      el.alt = "Img";
      el.style.width = "150px";
      break;
    case "button":
      el = document.createElement("button");
      el.textContent = "Click Me";
      break;
    default:
      return;
  }

  const wrap = document.createElement("div");
  wrap.classList.add("canvas-element");
  wrap.style.position = "absolute";
  wrap.style.left = clientX - rect.left + "px";
  wrap.style.top = clientY - rect.top + "px";

  /* delete icon */
  const del = document.createElement("button");
  del.textContent = "❌";
  del.classList.add("delete-icon");
  del.addEventListener("click", (ev) => {
    ev.stopPropagation();
    canvas.removeChild(wrap);
    form.innerHTML = "";
  });

  wrap.append(del, el);
  wrap.addEventListener("click", () => showProperties(el));
  enablePointerDrag(wrap); // move inside canvas
  canvas.appendChild(wrap);
}

/* ----------  POINTER-BASED MOVE  ---------- */
function enablePointerDrag(wrap) {
  wrap.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return; // left/touch only
    const shiftX = e.clientX - wrap.getBoundingClientRect().left;
    const shiftY = e.clientY - wrap.getBoundingClientRect().top;

    const onMove = (ev) => {
      wrap.style.left = ev.clientX - canvas.offsetLeft - shiftX + "px";
      wrap.style.top = ev.clientY - canvas.offsetTop - shiftY + "px";
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener(
      "pointerup",
      () => {
        document.removeEventListener("pointermove", onMove);
      },
      { once: true }
    );
  });
}

/* ----------  PROPERTIES PANEL  ---------- */
function showProperties(el) {
  selectedElement = el;
  form.innerHTML = "";

  if (el.tagName === "P" || el.tagName === "BUTTON") {
    form.innerHTML = `
      <label>Text:</label>
      <input id="textInput"  type="text"  value="${el.textContent}"><br/>
      <label>Font Size:</label>
      <input id="fontSizeInput" type="number" value="${parseInt(
        getComputedStyle(el).fontSize
      )}"><br/>
      <label>Color:</label>
      <input id="colorInput" type="color">
    `;
    form.oninput = () => {
      el.textContent = textInput.value;
      el.style.fontSize = fontSizeInput.value + "px";
      el.style.color = colorInput.value;
    };
  } else if (el.tagName === "IMG") {
    form.innerHTML = `
      <label>Upload Image:</label>
      <input id="imgUploadInput" type="file" accept="image/*"><br/>
      <label>Image URL:</label>
      <input id="imgInput" type="text" value="${el.src}"><br/>
      <label>Width:</label>
      <input id="widthInput" type="number" value="${
        parseInt(el.style.width) || el.width
      }">
    `;
    imgUploadInput.onchange = (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      el.onload = () => (el.style.width = widthInput.value + "px");
      el.src = url;
      imgInput.value = url;
    };
    form.oninput = (ev) => {
      if (ev.target.id === "imgInput") el.src = imgInput.value;
      if (ev.target.id === "widthInput")
        el.style.width = widthInput.value + "px";
    };
  }
}

/****************  End of JS  ****************/
