
const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");

// Drawing settings
let color1 = "#000000";
let isDrawing = false;
let currentTool = "pencil";
let brushSize = 2;

// Start drawing
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

// Draw while moving the mouse
canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    ctx.strokeStyle = color1;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();

    // Start a new segment at the current position
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
});

// Color palette
const palette = document.getElementById("color-palette");

palette.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    color1 = getComputedStyle(button)
        .getPropertyValue("--swatch")
        .trim();

    // Update the Color 1 preview
    const foregroundSwatch =
        document.querySelector(".foreground");

    foregroundSwatch.style.backgroundColor = color1;

    console.log("Selected color:", color1);
});

// Brush size menu
const sizeButton = document.getElementById("size-button");
const sizeMenu = document.getElementById("size-menu");
const sizeLabel = document.getElementById("size-label");

// Open or close the menu
sizeButton.addEventListener("click", () => {
    sizeMenu.classList.toggle("open");
});

// Choose a brush size
sizeMenu.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    brushSize = Number(button.dataset.size);

    // Update the displayed size
    sizeLabel.textContent = `${brushSize} px`;

    // Close the menu
    sizeMenu.classList.remove("open");

    console.log("Brush size:", brushSize);
});
