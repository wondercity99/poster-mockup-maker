// Global state
let uploadedImages = []; // Array of {image, data, name, width, height}
let selectedMockups = [];
let mockupsList = [];
let generatedResults = []; // Array of {dataUrl, name} for zip download

// Standard poster sizes in inches (width x height)
const STANDARD_SIZES = [
    { width: 8, height: 10, label: '8" × 10"', folder: '8x10' },
    { width: 11, height: 14, label: '11" × 14"', folder: '11x14' },
    { width: 18, height: 24, label: '18" × 24"', folder: '18x24' }
];

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
const previewGrid = document.getElementById('preview-grid');
const imageCount = document.getElementById('image-count');
const imageDimensions = document.getElementById('image-dimensions');
const continueToMockupsBtn = document.getElementById('continue-to-mockups');
const uploadMoreBtn = document.getElementById('upload-more');

const uploadSection = document.getElementById('upload-section');
const mockupSection = document.getElementById('mockup-section');
const generateSection = document.getElementById('generate-section');

const mockupGrid = document.getElementById('mockup-grid');
const selectedCount = document.getElementById('selected-count');
const continueToGenerateBtn = document.getElementById('continue-to-generate');

const generateBtn = document.getElementById('generate-btn');
const progressSection = document.getElementById('progress-section');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const resultsSection = document.getElementById('results-section');
const resultsGrid = document.getElementById('results-grid');
const downloadAllBtn = document.getElementById('download-all');
const startOverBtn = document.getElementById('start-over');

// Initialize
init();

function init() {
    setupEventListeners();
    loadMockups();
}

function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleMultipleFiles(files);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleMultipleFiles(e.target.files);
            fileInput.value = ''; // Reset so same files can be selected again
        }
    });

    // Upload more button
    uploadMoreBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Continue buttons
    continueToMockupsBtn.addEventListener('click', () => {
        showSection('mockup');
    });

    continueToGenerateBtn.addEventListener('click', () => {
        showSection('generate');
    });

    // Generate button
    generateBtn.addEventListener('click', generateMockups);

    // Download all button
    downloadAllBtn.addEventListener('click', downloadAllAsZip);

    // Start over button
    startOverBtn.addEventListener('click', startOver);
}

function handleMultipleFiles(files) {
    const validFiles = [];

    // Filter valid image files
    for (const file of files) {
        if (file.type.match('image/(jpeg|png)')) {
            validFiles.push(file);
        }
    }

    if (validFiles.length === 0) {
        alert('Please upload JPG or PNG images.');
        return;
    }

    // Process all valid files
    let loadedCount = 0;
    validFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const detectedSize = detectPosterSize(img.width, img.height);
                uploadedImages.push({
                    image: img,
                    data: e.target.result,
                    name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                    width: img.width,
                    height: img.height,
                    size: detectedSize,
                    sizeFolder: detectedSize.folder
                });
                loadedCount++;

                // When all images are loaded, display preview
                if (loadedCount === validFiles.length) {
                    displayImagePreview();
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function detectPosterSize(width, height) {
    const aspectRatio = width / height;

    let closestSize = STANDARD_SIZES[0];
    let minDifference = Infinity;

    STANDARD_SIZES.forEach(size => {
        // Check portrait orientation (e.g., 18x24)
        const portraitRatio = size.width / size.height;
        const portraitDiff = Math.abs(aspectRatio - portraitRatio);

        // Check landscape orientation (e.g., 24x18)
        const landscapeRatio = size.height / size.width;
        const landscapeDiff = Math.abs(aspectRatio - landscapeRatio);

        // Use whichever orientation is closer
        const difference = Math.min(portraitDiff, landscapeDiff);

        if (difference < minDifference) {
            minDifference = difference;
            closestSize = size;
        }
    });

    return closestSize;
}

function displayImagePreview() {
    // Clear previous previews
    previewGrid.innerHTML = '';

    // Add thumbnail for each image
    uploadedImages.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-item';

        const img = document.createElement('img');
        img.src = item.data;
        img.alt = item.name;

        const label = document.createElement('span');
        label.className = 'preview-size-label';
        label.textContent = item.size.label;

        wrapper.appendChild(img);
        wrapper.appendChild(label);
        previewGrid.appendChild(wrapper);
    });

    // Update info - show count by size
    imageCount.textContent = uploadedImages.length;

    // Group by size for dimensions display
    const sizeCounts = {};
    uploadedImages.forEach(item => {
        const label = item.size.label;
        sizeCounts[label] = (sizeCounts[label] || 0) + 1;
    });

    const sizeInfo = Object.entries(sizeCounts)
        .map(([label, count]) => `${count} × ${label}`)
        .join(', ');
    imageDimensions.textContent = sizeInfo;

    uploadArea.style.display = 'none';
    imagePreview.classList.remove('hidden');
}

async function loadMockups() {
    // Mockup filenames to check in each size folder
    const mockupNames = [
        'frame-wall',
        'frame-table',
        'frame-desk',
        'gallery-wall',
        'living-room',
        'office-desk'
    ];

    const extensions = ['jpg', 'jpeg', 'png'];
    const availableMockups = [];
    let idCounter = 0;

    // Check each size folder
    for (const size of STANDARD_SIZES) {
        for (const name of mockupNames) {
            for (const ext of extensions) {
                const path = `mockups/${size.folder}/${name}.${ext}`;
                try {
                    const exists = await checkImageExists(path);
                    if (exists) {
                        availableMockups.push({
                            id: idCounter++,
                            path: path,
                            name: name.replace(/-/g, ' '),
                            size: size,
                            sizeLabel: size.label,
                            folder: size.folder
                        });
                        break; // Found this mockup, don't check other extensions
                    }
                } catch (error) {
                    // Image doesn't exist, skip it
                }
            }
        }
    }

    mockupsList = availableMockups;
    displayMockups();
}

function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function displayMockups() {
    if (mockupsList.length === 0) {
        mockupGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                    No mockup templates found. Please add mockup images to size folders like <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.4rem; border-radius: 3px;">mockups/11x14/</code> or <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.4rem; border-radius: 3px;">mockups/18x24/</code>.
                </p>
                <p style="color: var(--text-secondary); font-size: 0.875rem;">
                    Each mockup should contain pure magenta (#FF00FF) corner markers where the poster will be placed.
                </p>
            </div>
        `;
        return;
    }

    mockupGrid.innerHTML = '';

    mockupsList.forEach(mockup => {
        const mockupItem = document.createElement('div');
        mockupItem.className = 'mockup-item';
        mockupItem.dataset.mockupId = mockup.id;

        mockupItem.innerHTML = `
            <img src="${mockup.path}" alt="${mockup.name}">
            <p>${capitalizeWords(mockup.name)} - ${mockup.sizeLabel}</p>
        `;

        mockupItem.addEventListener('click', () => toggleMockupSelection(mockup.id, mockupItem));

        mockupGrid.appendChild(mockupItem);
    });
}

function toggleMockupSelection(mockupId, element) {
    const index = selectedMockups.indexOf(mockupId);

    if (index > -1) {
        selectedMockups.splice(index, 1);
        element.classList.remove('selected');
    } else {
        selectedMockups.push(mockupId);
        element.classList.add('selected');
    }

    updateSelectedCount();
}

function updateSelectedCount() {
    selectedCount.textContent = selectedMockups.length;
    continueToGenerateBtn.disabled = selectedMockups.length === 0;
}

async function generateMockups() {
    if (uploadedImages.length === 0 || selectedMockups.length === 0) {
        alert('Please upload images and select at least one mockup.');
        return;
    }

    const dimensionType = document.getElementById('dimension-type').value;
    const outputSize = parseInt(document.getElementById('output-size').value);

    // Show progress
    generateBtn.disabled = true;
    progressSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    resultsGrid.innerHTML = '';
    generatedResults = []; // Clear previous results

    // Build list of operations: match each image with mockups of same size
    const operations = [];
    for (const uploadedItem of uploadedImages) {
        for (const mockupId of selectedMockups) {
            const mockup = mockupsList.find(m => m.id === mockupId);
            // Only match if mockup size matches image size
            if (mockup.folder === uploadedItem.sizeFolder) {
                operations.push({ uploadedItem, mockup });
            }
        }
    }

    if (operations.length === 0) {
        alert('No matching mockups found for your uploaded image sizes. Make sure you have mockups in the correct size folders.');
        generateBtn.disabled = false;
        progressSection.classList.add('hidden');
        return;
    }

    const totalOperations = operations.length;
    let currentOperation = 0;

    // Process each matched pair
    for (const { uploadedItem, mockup } of operations) {
        currentOperation++;

        progressText.textContent = `Processing ${currentOperation} of ${totalOperations}...`;
        progressFill.style.width = `${(currentOperation / totalOperations) * 100}%`;

        try {
            const result = await processMockup(mockup, uploadedItem, dimensionType, outputSize);
            addResultToGrid(result, `${uploadedItem.name}-${mockup.name}`);
        } catch (error) {
            console.error('Error processing mockup:', error);
            alert(`Error processing ${uploadedItem.name} with ${mockup.name}: ${error.message}`);
        }
    }

    // Show results
    progressSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    generateBtn.disabled = false;
}

async function processMockup(mockup, uploadedItem, dimensionType, outputSize) {
    return new Promise((resolve, reject) => {
        const mockupImg = new Image();

        mockupImg.onload = () => {
            try {
                // Create canvas for processing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true });

                canvas.width = mockupImg.width;
                canvas.height = mockupImg.height;

                // Draw mockup
                ctx.drawImage(mockupImg, 0, 0);

                // Find magenta box
                const magentaBox = findMagentaBox(ctx, canvas.width, canvas.height);

                if (!magentaBox) {
                    reject(new Error('No magenta box found in mockup'));
                    return;
                }

                // Replace magenta dots with average of surrounding pixels
                replaceMagentaWithSurrounding(ctx, canvas.width, canvas.height);

                // Resize uploaded image to fit the detected box
                const resizedPoster = resizeImageToBox(uploadedItem.image, magentaBox);

                // Draw poster with multiply blend mode so it picks up shadows from mockup beneath
                ctx.globalCompositeOperation = 'multiply';
                ctx.drawImage(resizedPoster, magentaBox.x, magentaBox.y, magentaBox.width, magentaBox.height);

                // Reset composite operation
                ctx.globalCompositeOperation = 'source-over';

                // Resize final output
                const finalCanvas = resizeCanvas(canvas, dimensionType, outputSize);

                resolve(finalCanvas.toDataURL('image/png'));
            } catch (error) {
                reject(error);
            }
        };

        mockupImg.onerror = () => reject(new Error('Failed to load mockup image'));
        mockupImg.src = mockup.path;
    });
}

function findMagentaBox(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    let minX = width, minY = height, maxX = 0, maxY = 0;
    let found = false;

    // Pure magenta is RGB(255, 0, 255)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // Check if pixel is magenta (with small tolerance)
            if (r > 250 && g < 5 && b > 250) {
                found = true;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            }
        }
    }

    if (!found) return null;

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

function createMultiplyLayer(ctx, width, height) {
    // Create a canvas with the mockup where magenta is replaced with white
    const layerCanvas = document.createElement('canvas');
    const layerCtx = layerCanvas.getContext('2d', { willReadFrequently: true });

    layerCanvas.width = width;
    layerCanvas.height = height;

    // Get the image data from the original context
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Replace magenta pixels with white
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is magenta (with small tolerance)
        if (r > 250 && g < 5 && b > 250) {
            data[i] = 255;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 255; // B
            // Alpha stays the same
        }
    }

    layerCtx.putImageData(imageData, 0, 0);
    return layerCanvas;
}

function replaceMagentaWithSurrounding(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const radius = 5; // Sample pixels within this radius

    // Helper to check if a pixel is magenta
    function isMagenta(index) {
        return data[index] > 250 && data[index + 1] < 5 && data[index + 2] > 250;
    }

    // First pass: identify all magenta pixels
    const magentaPixels = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            if (isMagenta(index)) {
                magentaPixels.push({ x, y, index });
            }
        }
    }

    // Second pass: replace each magenta pixel with average of surrounding non-magenta pixels
    for (const pixel of magentaPixels) {
        let totalR = 0, totalG = 0, totalB = 0, count = 0;

        // Sample surrounding pixels
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = pixel.x + dx;
                const ny = pixel.y + dy;

                // Check bounds
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const nIndex = (ny * width + nx) * 4;

                    // Only use non-magenta pixels for averaging
                    if (!isMagenta(nIndex)) {
                        totalR += data[nIndex];
                        totalG += data[nIndex + 1];
                        totalB += data[nIndex + 2];
                        count++;
                    }
                }
            }
        }

        // Apply average color (or black if no valid surrounding pixels)
        if (count > 0) {
            data[pixel.index] = Math.round(totalR / count);
            data[pixel.index + 1] = Math.round(totalG / count);
            data[pixel.index + 2] = Math.round(totalB / count);
        } else {
            data[pixel.index] = 0;
            data[pixel.index + 1] = 0;
            data[pixel.index + 2] = 0;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function resizeImageToBox(img, box) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = box.width;
    canvas.height = box.height;

    // Calculate scaling to fit box while maintaining aspect ratio
    const imgAspect = img.width / img.height;
    const boxAspect = box.width / box.height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgAspect > boxAspect) {
        // Image is wider than box
        drawWidth = box.width;
        drawHeight = box.width / imgAspect;
        drawX = 0;
        drawY = (box.height - drawHeight) / 2;
    } else {
        // Image is taller than box
        drawHeight = box.height;
        drawWidth = box.height * imgAspect;
        drawX = (box.width - drawWidth) / 2;
        drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    return canvas;
}

function resizeCanvas(sourceCanvas, dimensionType, targetSize) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let newWidth, newHeight;

    if (dimensionType === 'width') {
        newWidth = targetSize;
        newHeight = Math.round((sourceCanvas.height / sourceCanvas.width) * targetSize);
    } else {
        newHeight = targetSize;
        newWidth = Math.round((sourceCanvas.width / sourceCanvas.height) * targetSize);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(sourceCanvas, 0, 0, newWidth, newHeight);

    return canvas;
}

function addResultToGrid(imageDataUrl, mockupName) {
    // Store result for batch download
    generatedResults.push({
        dataUrl: imageDataUrl,
        name: mockupName
    });

    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';

    resultItem.innerHTML = `
        <img src="${imageDataUrl}" alt="Generated mockup">
        <button class="btn btn-primary" onclick="downloadImage('${imageDataUrl}', '${mockupName}')">
            Download
        </button>
    `;

    resultsGrid.appendChild(resultItem);
}

function downloadImage(dataUrl, mockupName) {
    const link = document.createElement('a');
    const fileName = `mockup-${mockupName.replace(/\s+/g, '-')}-${Date.now()}.png`;
    link.download = fileName;
    link.href = dataUrl;
    link.click();
}

async function downloadAllAsZip() {
    if (generatedResults.length === 0) {
        alert('No mockups to download.');
        return;
    }

    downloadAllBtn.disabled = true;
    downloadAllBtn.textContent = 'Creating ZIP...';

    try {
        const zip = new JSZip();

        // Add each image to the zip
        generatedResults.forEach((result, index) => {
            // Convert data URL to binary
            const base64Data = result.dataUrl.split(',')[1];
            const fileName = `mockup-${result.name.replace(/\s+/g, '-')}.png`;
            zip.file(fileName, base64Data, { base64: true });
        });

        // Generate the zip file
        const content = await zip.generateAsync({ type: 'blob' });

        // Download the zip
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `mockups-${Date.now()}.zip`;
        link.click();

        // Clean up
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error creating zip:', error);
        alert('Error creating ZIP file. Please try downloading individually.');
    }

    downloadAllBtn.disabled = false;
    downloadAllBtn.textContent = 'Download All as ZIP';
}

function showSection(section) {
    uploadSection.classList.add('hidden');
    mockupSection.classList.add('hidden');
    generateSection.classList.add('hidden');

    if (section === 'upload') {
        uploadSection.classList.remove('hidden');
    } else if (section === 'mockup') {
        mockupSection.classList.remove('hidden');
    } else if (section === 'generate') {
        generateSection.classList.remove('hidden');
    }
}

function startOver() {
    // Reset state
    uploadedImages = [];
    selectedMockups = [];
    generatedResults = [];

    // Reset UI
    fileInput.value = '';
    previewGrid.innerHTML = '';
    uploadArea.style.display = 'block';
    imagePreview.classList.add('hidden');
    progressSection.classList.add('hidden');
    resultsSection.classList.add('hidden');

    // Clear selections
    document.querySelectorAll('.mockup-item').forEach(item => {
        item.classList.remove('selected');
    });
    updateSelectedCount();

    // Show upload section
    showSection('upload');
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}
