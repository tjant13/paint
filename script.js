
const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Drawing settings
let color1 = "#000000";
let isDrawing = false;
let currentTool = "pencil";
let brushSize = 2;

// Initialize a white canvas
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Convert a hex color to RGB
function hexToRgb(hex) {
    const value = hex.replace("#", "");

    return {
        r: parseInt(value.substring(0, 2), 16),
        g: parseInt(value.substring(2, 4), 16),
        b: parseInt(value.substring(4, 6), 16)
    };
}

// Tool buttons
const pencilButton = document.getElementById("pencil-button");
const eraserButton = document.getElementById("eraser-button");
const fillButton = document.getElementById("fill-button");

pencilButton.addEventListener("click", () => {
    currentTool = "pencil";
});

eraserButton.addEventListener("click", () => {
    currentTool = "eraser";
});

fillButton.addEventListener("click", () => {
    currentTool = "fill";
});

// Brush-size slider
const sizeSlider = document.getElementById("brush-size-slider");
const sizeLabel = document.getElementById("size-label");

sizeSlider.addEventListener("input", () => {
    brushSize = Number(sizeSlider.value);
    sizeLabel.textContent = `${brushSize} px`;
});

// Color palette
const palette = document.getElementById("color-palette");

palette.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    color1 = getComputedStyle(button)
        .getPropertyValue("--swatch")
        .trim();

    document.querySelector(".foreground").style.backgroundColor = color1;
});

// Draw a dot
function drawDot(x, y) {
    ctx.fillStyle = currentTool === "eraser" ? "#ffffff" : color1;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

// Start drawing or fill an area
canvas.addEventListener("mousedown", (event) => {
    if (currentTool === "fill") {
        floodFill(event.offsetX, event.offsetY);
        return;
    }

    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
    drawDot(event.offsetX, event.offsetY);
});

// Continue drawing
canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : color1;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
});

// Stop drawing
function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
document.addEventListener("mouseup", stopDrawing);

// Flood-fill tool
function floodFill(x, y) {
    const width = canvas.width;
    const height = canvas.height;

    const startX = Math.floor(x);
    const startY = Math.floor(y);

    if (
        startX < 0 || startX >= width ||
        startY < 0 || startY >= height
    ) {
        return;
    }

    const image = ctx.getImageData(0, 0, width, height);
    const pixels = image.data;

    const startIndex = (startY * width + startX) * 4;

    const target = {
        r: pixels[startIndex],
        g: pixels[startIndex + 1],
        b: pixels[startIndex + 2],
        a: pixels[startIndex + 3]
    };

    const replacement = hexToRgb(color1);

    if (
        target.r === replacement.r &&
        target.g === replacement.g &&
        target.b === replacement.b &&
        target.a === 255
    ) {
        return;
    }

    const tolerance = 32;

    function matches(index) {
        return (
            Math.abs(pixels[index] - target.r) <= tolerance &&
            Math.abs(pixels[index + 1] - target.g) <= tolerance &&
            Math.abs(pixels[index + 2] - target.b) <= tolerance &&
            pixels[index + 3] === target.a
        );
    }

    const totalPixels = width * height;
    const queue = new Int32Array(totalPixels);
    const visited = new Uint8Array(totalPixels);

    let head = 0;
    let tail = 0;

    const startPixel = startY * width + startX;
    queue[tail++] = startPixel;
    visited[startPixel] = 1;

    while (head < tail) {
        const pixel = queue[head++];
        const px = pixel % width;
        const py = Math.floor(pixel / width);
        const index = pixel * 4;

        if (!matches(index)) continue;

        pixels[index] = replacement.r;
        pixels[index + 1] = replacement.g;
        pixels[index + 2] = replacement.b;
        pixels[index + 3] = 255;

        const neighbors = [
            px > 0 ? pixel - 1 : -1,
            px < width - 1 ? pixel + 1 : -1,
            py > 0 ? pixel - width : -1,
            py < height - 1 ? pixel + width : -1
        ];

        for (const next of neighbors) {
            if (next !== -1 && !visited[next]) {
                visited[next] = 1;
                queue[tail++] = next;
            }
        }
    }

    ctx.putImageData(image, 0, 0);
}
