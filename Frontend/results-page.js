// results-page.js

// Espera a que todo el contenido de la página se cargue
window.addEventListener('DOMContentLoaded', () => {
    // Recuperar los datos de sessionStorage
    const analysisResultString = sessionStorage.getItem('analysisResult');
    const fileName = sessionStorage.getItem('fileName');
    
    // Si no hay resultados, redirigir a la página principal
    if (!analysisResultString) {
        alert('No se encontraron datos de análisis. Por favor, carga un archivo primero.');
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

        // Llenar los contenedores con los datos correspondientes
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
                downloadResultsAsTxt(fileName, analysisResult);
            });
        }

    } catch (error) {
        console.error('Error al procesar los resultados:', error);
        alert('Hubo un error al mostrar los resultados. Inténtalo de nuevo.');
    }
});

/**
 * Convierte una cadena de texto con formato Markdown básico a HTML.
 * @param {string} text El texto a convertir.
 * @returns {string} El texto formateado como HTML.
 */
function formatMarkdownToHtml(text) {
    if (!text) return '<p>No hay datos disponibles.</p>';

    // Reemplazar títulos, negritas, itálicas y listas
    let html = text
        .replace(/##\s*(.+)/g, '<h2>$1</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*\s(.*?)$/gm, '<li>$1</li>'); // Para listas como '* elemento'

    // Envolver grupos de <li> en un <ul>
    html = html.replace(/(<li>(.|\n)*?<\/li>)/g, '<ul>$1</ul>');

    // Reemplazar saltos de línea con <br> dentro de párrafos
    // y saltos de línea dobles con párrafos nuevos.
    return html.split('\n').map(p => p.trim()).filter(p => p).map(p => {
        if (p.startsWith('<h2>') || p.startsWith('<ul>')) return p;
        return `<p>${p}</p>`;
    }).join('');
}

/**
 * Genera y descarga un archivo .txt con los resultados.
 * @param {string} fileName El nombre del archivo original.
 * @param {object} analysisResult El objeto con los resultados del análisis.
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

--- INTERPRETACIÓN DE CONCEPTOS ---
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