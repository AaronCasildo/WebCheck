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
    
    const file = pdfFiles[0]; 
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        console.log(`Enviando: ${file.name}`);
        
        const response = await fetch('http://127.0.0.1:8000/upload-pdf', { // Usar 127.0.0.1 en lugar de localhost a veces evita problemas
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`✅ ${file.name} enviado exitosamente:`, result);
        
        // Almacenamos el resultado como una cadena de texto JSON
        sessionStorage.setItem('analysisResult', JSON.stringify(result.analysis_result));
        sessionStorage.setItem('fileName', file.name);
        
        // Redirigir a la página de resultados
        window.location.href = 'Frontend/Results.html';
        
    } catch (error) {
        console.error(`❌ Error con ${file.name}:`, error);
        alert(`Error procesando ${file.name}: ${error.message}`);
        // Recargar la página para reiniciar el contenedor de carga
        location.reload();
    }
}