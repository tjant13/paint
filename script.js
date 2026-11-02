
const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d");

let color1 = "#000000";
let isDrawing = false;

// Start drawing when the mouse button is pressed
canvas.addEventListener("mousedown", () => {
    isDrawing = true;
});

// Stop drawing when the mouse button is released
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});

// Draw while moving the mouse
canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    ctx.fillStyle = color1;
    ctx.fillRect(event.offsetX, event.offsetY, 2, 2);
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
