
const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");

let color1 = "#000000";
let isDrawing = false;

// Start a new pencil stroke
canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
});

// Stop drawing when the mouse button is released
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.beginPath();
});

// Stop drawing if the mouse leaves the canvas
canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
    ctx.beginPath();
});

// Draw a continuous line while moving the mouse
canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    ctx.strokeStyle = color1;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
});

// Find the color palette
const palette = document.getElementById("color-palette");

// Change the drawing color when a palette color is clicked
palette.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    color1 = getComputedStyle(button)
        .getPropertyValue("--swatch")
        .trim();

    // Update the Color 1 preview square
    const foregroundSwatch = document.querySelector(".foreground");
    foregroundSwatch.style.backgroundColor = color1;

    console.log("Selected color:", color1);
});
