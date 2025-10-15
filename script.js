const uploadContainer = document.getElementById('uploadContainer');
const fileInput = document.getElementById('fileInput');

// Drag and drop functionality
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, () => {
        uploadContainer.classList.add('drag-over');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, () => {
        uploadContainer.classList.remove('drag-over');
    }, false);
});

uploadContainer.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    [...files].forEach(file => {
        if (file.type === 'application/pdf') {
            console.log('Archivo seleccionado:', file.name);
            alert(`Archivo "${file.name}" seleccionado. En una aplicación real, aquí se procesaría el PDF.`);
        } else {
            alert('Por favor, selecciona un archivo PDF válido.');
        }
    });
}