
const canvas = document.getElementById("paint-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

ctx.imageSmoothingEnabled = false;

// Drawing settings
let color1 = "#000000";
let isDrawing = false;
let currentTool = "pencil";
let brushSize = 2;
let lastX = 0;
let lastY = 0;

// History
let undoStack = [];
let redoStack = [];
const maxHistory = 30;

// Buttons and controls
const pencilButton = document.getElementById("pencil-button");
const fillButton = document.getElementById("fill-button");
const eraserButton = document.getElementById("eraser-button");
const pickerButton = document.getElementById("picker-button");

const saveButton = document.getElementById("save-button");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");

const editColorsButton = document.getElementById("edit-colors-button");
const colorPickerInput = document.getElementById("color-picker-input");

const sizeSlider = document.getElementById("brush-size-slider");
const sizeLabel = document.getElementById("size-label");

// Initialize canvas
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Save a snapshot for undo
function saveState() {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (undoStack.length > maxHistory) {
        undoStack.shift();
    }

    redoStack = [];
}

// Undo
undoButton.addEventListener("click", () => {
    if (undoStack.length === 0) return;

    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const previousState = undoStack.pop();
    ctx.putImageData(previousState, 0, 0);
});

// Redo
redoButton.addEventListener("click", () => {
    if (redoStack.length === 0) return;

    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const nextState = redoStack.pop();
    ctx.putImageData(nextState, 0, 0);
});

// Save canvas to clipboard
saveButton.addEventListener("click", async () => {
    try {
        if (!navigator.clipboard || !window.ClipboardItem) {
            alert("Clipboard image copying is not supported in this browser.");
            return;
        }

        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("Could not create image.");
                return;
            }

            try {
                const item = new ClipboardItem({
                    "image/png": blob
                });

                await navigator.clipboard.write([item]);
                alert("Canvas copied to clipboard!");
            } catch (error) {
                alert("Could not copy image. Check clipboard permissions.");
                console.error(error);
            }
        }, "image/png");

    } catch (error) {
        console.error(error);
        alert("Something went wrong while saving.");
    }
});

// Tool selection
pencilButton.addEventListener("click", () => {
    currentTool = "pencil";
});

eraserButton.addEventListener("click", () => {
    currentTool = "eraser";
});

fillButton.addEventListener("click", () => {
    currentTool = "fill";
});

pickerButton.addEventListener("click", () => {
    currentTool = "picker";
});

// Open the color picker
editColorsButton.addEventListener("click", () => {
    colorPickerInput.click();
});

// Update foreground color from color picker
colorPickerInput.addEventListener("input", () => {
    color1 = colorPickerInput.value;
    document.querySelector(".foreground").style.backgroundColor = color1;
});

// Brush size
sizeSlider.addEventListener("input", () => {
    brushSize = Number(sizeSlider.value);
    sizeLabel.textContent = brushSize + " px";
});

// Palette
document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
        color1 = getComputedStyle(swatch).getPropertyValue("--swatch").trim();

        document.querySelector(".foreground").style.backgroundColor = color1;
    });
});

// Draw a line using square pixels
function drawPixelLine(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);

    const oldFillStyle = ctx.fillStyle;

    if (currentTool === "eraser") {
        ctx.fillStyle = "#ffffff";
    } else {
        ctx.fillStyle = color1;
    }

    for (let i = 0; i <= steps; i++) {
        const x = Math.round(x1 + (dx * i) / steps);
        const y = Math.round(y1 + (dy * i) / steps);

        ctx.fillRect(
            x - Math.floor(brushSize / 2),
            y - Math.floor(brushSize / 2),
            brushSize,
            brushSize
        );
    }

    ctx.fillStyle = oldFillStyle;
}

// Flood fill
function floodFill(startX, startY) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startIndex = (startY * canvas.width + startX) * 4;

    const target = {
        r: data[startIndex],
        g: data[startIndex + 1],
        b: data[startIndex + 2],
        a: data[startIndex + 3]
    };

    const fill = {
        r: parseInt(color1.slice(1, 3), 16),
        g: parseInt(color1.slice(3, 5), 16),
        b: parseInt(color1.slice(5, 7), 16),
        a: 255
    };

    if (
        target.r === fill.r &&
        target.g === fill.g &&
        target.b === fill.b &&
        target.a === fill.a
    ) {
        return;
    }

    const visited = new Uint8Array(canvas.width * canvas.height);
    const queue = [startX, startY];

    let head = 0;

    while (head < queue.length) {
        const x = queue[head++];
        const y = queue[head++];

        if (
            x < 0 ||
            y < 0 ||
            x >= canvas.width ||
            y >= canvas.height
        ) {
            continue;
        }

        const pixelIndex = y * canvas.width + x;

        if (visited[pixelIndex]) continue;

        visited[pixelIndex] = 1;

        const index = pixelIndex * 4;

        if (
            data[index] !== target.r ||
            data[index + 1] !== target.g ||
            data[index + 2] !== target.b ||
            data[index + 3] !== target.a
        ) {
            continue;
        }

        data[index] = fill.r;
        data[index + 1] = fill.g;
        data[index + 2] = fill.b;
        data[index + 3] = fill.a;

        queue.push(x + 1, y);
        queue.push(x - 1, y);
        queue.push(x, y + 1);
        queue.push(x, y - 1);
    }

    ctx.putImageData(imageData, 0, 0);
}

// Canvas coordinates
function getCanvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: Math.floor((event.clientX - rect.left) * canvas.width / rect.width),
        y: Math.floor((event.clientY - rect.top) * canvas.height / rect.height)
    };
}

// Mouse down
canvas.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    const { x, y } = getCanvasCoordinates(event);

    if (
        x < 0 || y < 0 ||
        x >= canvas.width || y >= canvas.height
    ) {
        return;
    }

    // Eyedropper
    if (currentTool === "picker") {
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        color1 = "#" + [pixel[0], pixel[1], pixel[2]]
            .map(value => value.toString(16).padStart(2, "0"))
            .join("");

        document.querySelector(".foreground").style.backgroundColor = color1;

        return;
    }

    // Fill tool
    if (currentTool === "fill") {
        saveState();
        floodFill(x, y);
        return;
    }

    // Start drawing
    saveState();

    isDrawing = true;
    lastX = x;
    lastY = y;

    drawPixelLine(x, y, x, y);
});

// Mouse move
canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(event);

    drawPixelLine(lastX, lastY, x, y);

    lastX = x;
    lastY = y;
});

// Stop drawing
function stopDrawing() {
    isDrawing = false;
}

canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
document.addEventListener("mouseup", stopDrawing);
