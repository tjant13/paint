const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");
let color1 = "#000000";
let isDrawing = false;

canvas.addEventListener("mousedown", () => {
    isDrawing = true;
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    ctx.fillStyle = color1;
    ctx.fillRect(event.offsetX, event.offsetY, 2, 2);
});

const palette = document.getElementById("color-palette");

palette.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    color1 = getComputedStyle(button)
        .getPropertyValue("--swatch")
        .trim();

    console.log("Selected color:", color1);
});
