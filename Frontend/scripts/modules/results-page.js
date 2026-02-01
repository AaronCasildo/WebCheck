// results-page.js

// Espera a que todo el contenido de la página se cargue
window.addEventListener('DOMContentLoaded', () => {
    // Show disclaimer modal first
    showDisclaimerModal();
    
    // Recuperar los datos de sessionStorage
    const analysisResultString = sessionStorage.getItem('analysisResult');
    const fileName = sessionStorage.getItem('fileName');
    const processingTime = sessionStorage.getItem('processingTime');
    const numPages = sessionStorage.getItem('numPages');
    const fileSize = sessionStorage.getItem('fileSize');
    const wordCount = sessionStorage.getItem('wordCount');
    const analysisTimestamp = sessionStorage.getItem('analysisTimestamp');
    const aiModel = sessionStorage.getItem('aiModel');
    const aiTokensStr = sessionStorage.getItem('aiTokens');
    
    // Si no hay resultados, redirigir a la página principal
    if (!analysisResultString) {
        // (Quitamos el alert() porque no funciona bien en el entorno)
        console.error('No se encontraron datos de análisis. Redirigiendo...');
        window.location.href = '../../../WebCheck.html';
        return;
    }
    
    try {
        // Convertir la cadena de texto de vuelta a un objeto JSON
        const analysisResult = JSON.parse(analysisResultString);

        // Actualizar el título de la página
        const resultsTitle = document.getElementById('resultsTitle');
        if (fileName) {
            resultsTitle.textContent = `Resultados de: ${fileName}`;
        }
        
        // Show timestamp if available
        if (analysisTimestamp) {
            const timestampContainer = document.getElementById('analysisTimestamp');
            const timestampText = document.getElementById('timestampText');
            const timestampRelative = document.getElementById('timestampRelative');
            
            if (timestampText && timestampRelative) {
                const date = new Date(analysisTimestamp);
                const formattedDate = date.toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                const relativeTime = getRelativeTime(date);
                
                timestampText.textContent = `Analizado el ${formattedDate}`;
                timestampRelative.textContent = `(${relativeTime})`;
                
                if (timestampContainer) {
                    timestampContainer.style.display = 'flex';
                }
            }
        }
        
        // Show processing stats if available
        if (processingTime || numPages || fileSize || wordCount) {
            const statsContainer = document.getElementById('processingStats');
            const processingTimeEl = document.getElementById('processingTime');
            const numPagesEl = document.getElementById('numPages');
            const fileSizeEl = document.getElementById('fileSize');
            const wordCountEl = document.getElementById('wordCount');
            
            if (processingTime && processingTimeEl) {
                processingTimeEl.textContent = `${processingTime}s`;
            }
            if (numPages && numPagesEl) {
                numPagesEl.textContent = numPages;
            }
            if (fileSize && fileSizeEl) {
                fileSizeEl.textContent = `${fileSize} MB`;
            }
            if (wordCount && wordCountEl) {
                wordCountEl.textContent = wordCount.toLocaleString();
            }
            if (statsContainer) {
                statsContainer.style.display = 'flex';
            }
        }
        
        // Show AI metrics if available
        if (aiModel || aiTokensStr) {
            const aiMetricsContainer = document.getElementById('aiMetrics');
            const aiModelEl = document.getElementById('aiModel');
            const aiTokensInputEl = document.getElementById('aiTokensInput');
            const aiTokensOutputEl = document.getElementById('aiTokensOutput');
            const aiTokensTotalEl = document.getElementById('aiTokensTotal');
            
            if (aiModel && aiModelEl) {
                aiModelEl.textContent = aiModel;
            }
            
            if (aiTokensStr) {
                try {
                    const aiTokens = JSON.parse(aiTokensStr);
                    if (aiTokensInputEl) aiTokensInputEl.textContent = aiTokens.input.toLocaleString();
                    if (aiTokensOutputEl) aiTokensOutputEl.textContent = aiTokens.output.toLocaleString();
                    if (aiTokensTotalEl) aiTokensTotalEl.textContent = aiTokens.total.toLocaleString();
                } catch (e) {
                    console.error('Error parsing AI tokens:', e);
                }
            }
            
            if (aiMetricsContainer) {
                aiMetricsContainer.style.display = 'flex';
            }
        }

        // Obtener los contenedores por su ID
        const resumenContainer = document.getElementById('resumenEjecutivo');
        const resumenTexto = document.getElementById('resumenTexto');
        const interpretacionContainer = document.getElementById('interpretacionConceptos');
        const simplificadosContainer = document.getElementById('resultadosSimplificados');

        // Llenar el resumen ejecutivo
        if (resumenTexto && analysisResult.resumenEjecutivo) {
            resumenTexto.innerHTML = formatMarkdownToHtml(analysisResult.resumenEjecutivo);
        } else if (resumenContainer) {
            resumenContainer.style.display = 'none';
        }

        // Llenar los contenedores con los datos correspondientes
        interpretacionContainer.innerHTML = `
            <div class="results-header results-header-technical">
                <span>Interpretación de Conceptos</span>
            </div>
            <div class="results-content">
                ${formatMarkdownToHtml(analysisResult.interpretacionConceptos || "No se proporcionó interpretación.")}
            </div>
        `;

        simplificadosContainer.innerHTML = `
            <div class="results-header results-header-simplified">
                <span>Resultados Simplificados</span>
            </div>
            <div class="results-content">
                ${formatMarkdownToHtml(analysisResult.resultadosSimplificados || "No se proporcionaron resultados simplificados.")}
            </div>
        `;

        // Configurar el botón de descarga
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', async () => {
                await downloadResultsAsPdf(fileName, analysisResult);
            });
        }

        // Save to history automatically (only if NOT coming from history)
        const fromHistory = sessionStorage.getItem('fromHistory');
        if (typeof saveToHistory === 'function' && !fromHistory) {
            saveToHistory({
                fileName: fileName,
                result: analysisResult
            });
            console.log('Análisis guardado en el historial');
        }
        
        // Clear the flag after checking
        sessionStorage.removeItem('fromHistory');

    } catch (error) {
        console.error('Error al procesar los resultados:', error);
        alert('Hubo un error al mostrar los resultados. Inténtalo de nuevo.');
    }
});

/**
 * Convierte una cadena de texto con formato Markdown a HTML usando marked.js
 * @param {string} text El texto a convertir.
 * @returns {string} El texto formateado como HTML.
 */
function formatMarkdownToHtml(text) {
    if (!text) return '<p>No hay datos disponibles.</p>';

    // Normalize the text - handle escaped newlines
    let cleanedText = text
        .replace(/\\n/g, '\n')           // Convert literal \n to actual newlines
        .replace(/\\"/g, '"')            // Unescape quotes
        .replace(/\r\n/g, '\n')          // Normalize Windows line endings
        .replace(/\r/g, '\n');           // Normalize old Mac line endings

    // Safety check: if it looks like raw JSON, clean it up first
    if (cleanedText.trim().startsWith('{') || cleanedText.includes('"interpretacionConceptos"')) {
        try {
            const parsed = JSON.parse(cleanedText);
            cleanedText = parsed.resultadosSimplificados || parsed.interpretacionConceptos || cleanedText;
        } catch {
            cleanedText = cleanedText
                .replace(/^\s*\{\s*/, '')
                .replace(/\s*\}\s*$/, '')
                .replace(/"interpretacionConceptos"\s*:\s*"/g, '')
                .replace(/"resultadosSimplificados"\s*:\s*"/g, '')
                .replace(/"resumenEjecutivo"\s*:\s*"/g, '')
                .replace(/",?\s*$/g, '');
        }
    }

    // Use marked.js to parse markdown
    return marked.parse(cleanedText);
}

/**
 * Calculate relative time from a given date
 * @param {Date} date - The date to compare
 * @returns {string} - Relative time string (e.g., "hace 2 minutos")
 */
function getRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
        return 'hace un momento';
    } else if (diffMins < 60) {
        return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
        return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
        return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
}

/**
 * Shows the disclaimer modal and blocks content until user accepts
 */
function showDisclaimerModal() {
    const modal = document.getElementById('disclaimerModal');
    const acceptBtn = document.getElementById('acceptDisclaimerBtn');
    const mainContent = document.querySelector('main');
    
    // Show modal and hide main content
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    if (mainContent) {
        mainContent.style.filter = 'blur(10px)';
        mainContent.style.pointerEvents = 'none';
    }
    
    // Accept button click handler
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            // Hide modal with fade-out animation
            if (modal) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    modal.classList.add('hidden');
                }, 300);
            }
            
            // Show and enable main content
            if (mainContent) {
                mainContent.style.filter = 'none';
                mainContent.style.pointerEvents = 'auto';
            }
        });
    }
}

// ========================================
// BACK TO TOP BUTTON FUNCTIONALITY
// ========================================
const backToTopBtn = document.getElementById('backToTopBtn');

// Show button when user scrolls down 300px
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
});

// Scroll to top when button is clicked
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
