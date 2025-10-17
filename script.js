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

async function handleFiles(files) {
    const pdfFiles = [...files].filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        alert('Por favor, selecciona al menos un archivo PDF válido.');
        return;
    }
    
    console.log(`Procesando ${pdfFiles.length} archivo(s)...`);
    
    // Procesar cada PDF
    for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            console.log(`Enviando: ${file.name} (${i + 1}/${pdfFiles.length})`);
            
            const response = await fetch('http://localhost:8000/upload-pdf', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            console.log(`${file.name}:`, result);
            
        } catch (error) {
            console.error(`Error con ${file.name}:`, error);
        }
    }
    
    alert(`${pdfFiles.length} archivo(s) procesado(s). Revisa la consola.`);
}