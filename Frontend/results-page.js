// results-page.js

// Espera a que todo el contenido de la página se cargue
window.addEventListener('DOMContentLoaded', () => {
    // ... (el código de arriba es igual) ...
// ... (el código de arriba es igual) ...
    // Recuperar los datos de sessionStorage
    const analysisResultString = sessionStorage.getItem('analysisResult');
    const fileName = sessionStorage.getItem('fileName');
    
    // Si no hay resultados, redirigir a la página principal
    if (!analysisResultString) {
        // (Quitamos el alert() porque no funciona bien en el entorno)
        console.error('No se encontraron datos de análisis. Redirigiendo...');
        window.location.href = '../WebCheck.html';
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

        // Obtener los contenedores por su ID
        const interpretacionContainer = document.getElementById('interpretacionConceptos');
        const simplificadosContainer = document.getElementById('resultadosSimplificados');

        // Llenar los contenedores (la IA ya nos da los títulos gracias al prompt de main.py)
        interpretacionContainer.innerHTML = `
            <p class="placeholder-text">📊 Interpretación de Conceptos 📊</p>
            <div class="results-content">
                ${formatMarkdownToHtml(analysisResult.interpretacionConceptos || "No se proporcionó interpretación.")}
            </div>
        `;

        simplificadosContainer.innerHTML = `
            <p class="placeholder-text">📄 Resultados Simplificados 📄</p>
            <div class="results-content">
                ${formatMarkdownToHtml(analysisResult.resultadosSimplificados || "No se proporcionaron resultados simplificados.")}
            </div>
        `;

        // Configurar el botón de descarga
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                // Esta es tu función original de descarga .txt (sin cambios)
                downloadResultsAsTxt(fileName, analysisResult);
            });
        }

    } catch (error) {
        console.error('Error al procesar los resultados:', error);
    }
});

/**
 * Convierte una cadena de texto con formato Markdown básico a HTML.
 * (VERSIÓN MÁS ROBUSTA)
 * @param {string} text El texto a convertir.
 * @returns {string} El texto formateado como HTML.
 */
function formatMarkdownToHtml(text) {
    if (!text) return '<p>No hay datos disponibles.</p>';

    let html = text
        // === MODIFICADO ===
        // Busca títulos (ej. # Título o ## Título) y los convierte en <h2>
        .replace(/^#{1,2}\s*(.+)$/gm, '<h2>$1</h2>')
        
        // Busca subtítulos (ej. ### Título) y los convierte en <h3>
        .replace(/^###\s*(.+)$/gm, '<h3>$1</h3>')

        // Busca negritas (ej. **texto**)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        
        // Busca listas (ej. * elemento)
        .replace(/^\*\s*(.*?)$/gm, '<li>$1</li>');

    // Envuelve grupos de <li> en un <ul>
    html = html.replace(/(<li>(.|\n)*?<\/li>)/g, '<ul>$1</ul>');

    // Envuelve el texto restante en párrafos <p>
    return html.split('\n\n') // Separa por párrafos (doble salto de línea)
        .map(paragraph => {
            paragraph = paragraph.trim();
            if (paragraph.startsWith('<h2>') || paragraph.startsWith('<h3>') || paragraph.startsWith('<ul>')) {
                return paragraph; // Ya está formateado
            }
            if (paragraph === '') {
                return ''; // Ignora líneas vacías
            }
            // Envuelve líneas restantes en <p> y reemplaza saltos de línea simples con <br>
            return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
        })
        .join('');
}


/**
 * Genera y descarga un archivo .txt con los resultados.
 * (Esta es tu función original, la dejamos como estaba)
 */
function downloadResultsAsTxt(fileName, analysisResult) {
    const { interpretacionConceptos, resultadosSimplificados, resumenEjecutivo } = analysisResult;

    const content = `
Resultados del Análisis de HealthCheck
=========================================

Archivo Analizado: ${fileName}
Fecha: ${new Date().toLocaleString('es-MX')}

--- RESUMEN EJECUTIVO ---
${resumenEjecutivo || 'N/A'}

--- INTERPRETACIÓN de CONCEPTOS ---
${interpretacionConceptos || 'N/A'}

--- RESULTADOS SIMPLIFICADOS (PARA EL PACIENTE) ---
${resultadosSimplificados || 'N/A'}


=========================================
AVISO IMPORTANTE:
Esta interpretación fue generada con IA y es solo para fines informativos.
NO reemplaza el diagnóstico de un médico profesional.
Consulte siempre a su médico.
    `;

    // Limpiar el texto para que sea un archivo de texto plano
    const plainTextContent = content.replace(/<[^>]*>/g, ''); // Elimina etiquetas HTML
    
    const blob = new Blob([plainTextContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analisis_${fileName.replace('.pdf', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

