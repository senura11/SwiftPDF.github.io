// Light/Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light');
});


// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});


const fileInput = document.getElementById('file-input');
const convertButton = document.getElementById('convert-button');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const downloadButton = document.getElementById('download-button');
const formatSelector = document.getElementById('format-selector');
const uploadSection = document.getElementById('upload-section');
const conversionSection = document.getElementById('conversion-section');
const errorMessage = document.getElementById('error-message');

let convertedFileUrl = null;

// File selection handler
const chooseFilesButton = document.getElementById('choose-files');
const deviceUploadButton = document.getElementById('device-upload');

if (chooseFilesButton) {
    chooseFilesButton.addEventListener('click', () => fileInput.click());
}

if (deviceUploadButton) {
    deviceUploadButton.addEventListener('click', () => fileInput.click());
}

// File input change handler
fileInput.addEventListener('change', handleFileSelect);

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        showConversionSection(file);
        errorMessage.classList.add('hidden');
    } else {
        errorMessage.classList.remove('hidden');
    }
}


// Show conversion section with file details
function showConversionSection(file) {
    uploadSection.classList.add('hidden');
    conversionSection.classList.remove('hidden');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = `${(file.size / 1024).toFixed(2)} KB`;
    convertButton.disabled = false;
}

// Conversion handler
convertButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    const selectedFormat = formatSelector.value.toLowerCase();

    progressBarContainer.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = 'Progress: 0%';

    try {
        const formData = new FormData();
        formData.append('File', file);

        const response = await fetch(`https://v2.convertapi.com/convert/pdf/to/${selectedFormat}?auth=secret_nGwFt2XLz4qDooU3&download=attachment`, {
            method: 'POST',
            body: formData,
        });

        // Progress handling (same as original)
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;
        const chunks = [];

        while(true) {
            const {done, value} = await reader.read();
            if (done) break;

            chunks.push(value);
            receivedLength += value.length;
            const progress = Math.round((receivedLength / contentLength) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Progress: ${progress}%`;
        }

        const blob = new Blob(chunks);
        convertedFileUrl = URL.createObjectURL(blob);

        progressBarContainer.classList.add('hidden');
        downloadButton.classList.remove('hidden');
    } catch (error) {
        alert('Conversion failed: ' + error.message);
        progressBarContainer.classList.add('hidden');
    }
});

// Download handler
downloadButton.addEventListener('click', () => {
    if (convertedFileUrl) {
        const link = document.createElement('a');
        link.href = convertedFileUrl;
        link.download = `converted-file.${formatSelector.value.toLowerCase()}`;
        link.click();
    }
});

// Format change handler
formatSelector.addEventListener('change', () => {
    downloadButton.classList.add('hidden');
});

// Drag and drop handlers (same functionality)
const dropArea = document.getElementById('drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add('dragover');
}

function unhighlight(e) {
    dropArea.classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    
    if (file && file.type === 'application/pdf') {
        fileInput.files = dt.files;
        showConversionSection(file);
        errorMessage.classList.add('hidden');
    } else {
        errorMessage.classList.remove('hidden');
    }
}
// Theme Toggle Logic එකට අදාල update
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}
// Initialize theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}