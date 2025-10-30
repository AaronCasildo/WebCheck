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
    
    // Show loading state
    uploadContainer.innerHTML = '<p>Procesando archivo... ⏳</p>';
    
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
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ ${file.name} enviado exitosamente:`, result);
            
            // Store result and redirect to results page
            sessionStorage.setItem('analysisResult', result.analysis_result);
            sessionStorage.setItem('fileName', file.name);
            
            // Redirect to results page
            window.location.href = 'Frontend/Results.html';
            
        } catch (error) {
            console.error(`❌ Error con ${file.name}:`, error);
            alert(`Error procesando ${file.name}: ${error.message}`);
            // Reset upload container on error
            location.reload();
        }
    }
}