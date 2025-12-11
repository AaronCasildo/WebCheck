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
    
    // Show progress bar UI
    uploadContainer.innerHTML = `
        <div class="progress-container">
            <div class="progress-icon">📄</div>
            <h3 class="progress-title">Procesando tu archivo</h3>
            <p class="progress-filename" id="progressFilename"></p>
            
            <div class="progress-bar-wrapper">
                <div class="progress-bar" id="progressBar"></div>
            </div>
            <p class="progress-percentage" id="progressPercentage">0%</p>
            
            <div class="progress-steps">
                <div class="progress-step active" id="step1">
                    <div class="step-number">1</div>
                    <span>Subiendo</span>
                </div>
                <div class="progress-step" id="step2">
                    <div class="step-number">2</div>
                    <span>Extrayendo texto</span>
                </div>
                <div class="progress-step" id="step3">
                    <div class="step-number">3</div>
                    <span>Analizando con IA</span>
                </div>
                <div class="progress-step" id="step4">
                    <div class="step-number">4</div>
                    <span>Completado</span>
                </div>
            </div>
        </div>
    `;
    
    const file = pdfFiles[0];
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressFilename = document.getElementById('progressFilename');
    
    progressFilename.textContent = file.name;
    
    // Helper function to update progress
    function updateProgress(percent, stepNumber) {
        progressBar.style.width = `${percent}%`;
        progressPercentage.textContent = `${percent}%`;
        
        // Update steps
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step${i}`);
            step.classList.remove('active', 'completed');
            if (i < stepNumber) {
                step.classList.add('completed');
            } else if (i === stepNumber) {
                step.classList.add('active');
            }
        }
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        console.log(`Enviando: ${file.name}`);
        
        // Step 1: Uploading (0-25%)
        updateProgress(10, 1);
        await sleep(300);
        updateProgress(25, 1);
        
        // Step 2: Start request - Extracting (25-50%)
        updateProgress(30, 2);
        
        const response = await fetch('http://127.0.0.1:8000/upload-pdf', {
            method: 'POST',
            body: formData
        });
        
        updateProgress(50, 2);
        await sleep(200);
        
        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }
        
        // Step 3: Analyzing with AI (50-90%)
        updateProgress(60, 3);
        await sleep(300);
        updateProgress(75, 3);
        
        const result = await response.json();
        console.log(`✅ ${file.name} enviado exitosamente:`, result);
        
        updateProgress(90, 3);
        await sleep(200);
        
        // Step 4: Completed (100%)
        updateProgress(100, 4);
        await sleep(500);
        
        // Store results
        sessionStorage.setItem('analysisResult', JSON.stringify(result.analysis_result));
        sessionStorage.setItem('fileName', file.name);
        
        // Redirect to results page
        window.location.href = 'Frontend/pages/Results.html';
        
    } catch (error) {
        console.error(`❌ Error con ${file.name}:`, error);
        
        // Show error state
        uploadContainer.innerHTML = `
            <div class="progress-container error">
                <div class="progress-icon">❌</div>
                <h3 class="progress-title">Error al procesar</h3>
                <p class="progress-filename">${error.message}</p>
                <button class="btn-primary" onclick="location.reload()">Intentar de nuevo</button>
            </div>
        `;
    }
}

// Helper function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}