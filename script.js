const API_URL = 'http://localhost:5500';

const uploadContainer = document.getElementById('uploadContainer');
const fileInput = document.getElementById('fileInput');

//Function for register validation
async function handleRegister(event) {
    event.preventDefault();
    
    const data = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        edad: parseInt(document.getElementById('edad').value),
        correo: document.getElementById('correo').value,
        contrasena: document.getElementById('contrasena').value
    };
    
    // Validación básica
    if (data.contrasena.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    try {
        console.log('📤 Enviando registro...', { ...data, contrasena: '***' });
        
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || 'Error en el registro');
        }
        
        console.log('✅ Registro exitoso:', result);
        alert('¡Registro exitoso! Redirigiendo al login...');
        window.location.href = 'Login.html';
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        alert(`Error: ${error.message}`);
    }
}

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
    
    for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            console.log(`Enviando: ${file.name} (${i + 1}/${pdfFiles.length})`);
            console.log(`Tamaño del archivo: ${file.size} bytes`);
            
            const response = await fetch('http://localhost:8000/upload-pdf', {
                method: 'POST',
                body: formData
            });
            
            // Check answer status
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log(`✅ ${file.name} enviado exitosamente:`, result);
            
        } catch (error) {
            console.error(`❌ Error con ${file.name}:`, error);
        }
    }
    
    alert(`${pdfFiles.length} archivo(s) procesado(s). Revisa la consola.`);
}