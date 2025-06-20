document.addEventListener("DOMContentLoaded", () => {
    const dropArea = document.getElementById("dropArea");
    const output = document.getElementById("output");
    const form = document.getElementById("emojiForm");

    dropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropArea.classList.add("hover");
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.classList.remove("hover");
    });

    dropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dropArea.classList.remove("hover");
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith("image/")) {
            output.textContent = "이미지 파일을 올려주세요.";
            return;
        }
        processImage(file);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fileInput = document.getElementById("imageInput");
        const file = fileInput.files[0];
        if (!file || !file.type.startsWith("image/")) {
            output.textContent = "이미지 파일을 선택해주세요.";
            return;
        }
        processImage(file);
    });

    function processImage(file) {
        const cols = parseInt(document.getElementById("cols").value);
        const rows = parseInt(document.getElementById("rows").value);
        output.textContent = "이미지 처리 중...";

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = cols;
                canvas.height = rows;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, cols, rows);
                const imageData = ctx.getImageData(0, 0, cols, rows).data;

                const getEmoji = (r, g, b) => {
                    const dist = (c1, c2) =>
                        Math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2 + (c1[2] - c2[2])**2);
                    const colors = {
                        "⬜": [255, 255, 255],
                        "◼️": [0, 0, 0],
                        "🟥": [255, 0, 0],
                        "🟦": [0, 0, 255],
                        "🟩": [0, 255, 0],
                        "🟧": [255, 165, 0],
                        "🟪": [128, 0, 128],
                        "🟫": [139, 69, 19]
                    };
                    let min = Infinity, selected = "⬜";
                    for (const [emoji, rgb] of Object.entries(colors)) {
                        const d = dist([r, g, b], rgb);
                        if (d < min) { min = d; selected = emoji; }
                    }
                    return selected;
                };

                let result = "";
                for (let y = 0; y < rows; y++) {
                    for (let x = 0; x < cols; x++) {
                        const idx = (y * cols + x) * 4;
                        result += getEmoji(imageData[idx], imageData[idx+1], imageData[idx+2]);
                    }
                    result += "\n";
                }
                output.textContent = result;
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
});