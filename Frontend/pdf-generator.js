// pdf-generator.js
// Módulo para la generación de PDFs de resultados de HealthCheck

/**
 * Genera y descarga un archivo PDF con los resultados del análisis.
 * @param {string} fileName - Nombre del archivo analizado
 * @param {Object} analysisResult - Objeto con los resultados del análisis
 */
function downloadResultsAsPdf(fileName, analysisResult) {
    const { jsPDF } = window.jspdf;
    const { interpretacionConceptos, resultadosSimplificados, resumenEjecutivo } = analysisResult;
    
    // Crear nuevo documento PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    // Colores del tema
    const primaryBlue = [0, 123, 255];
    const darkText = [33, 37, 41];
    const grayText = [108, 117, 125];
    const warningYellow = [255, 193, 7];
    const warningBg = [255, 251, 235];
    const warningText = [133, 100, 4];
    
    // Disclaimer configuration
    const disclaimerBoxHeight = 28; // Height of the disclaimer box (taller for long message)
    const disclaimerTopMargin = 10; // Space from top of page
    const contentStartAfterDisclaimer = disclaimerTopMargin + disclaimerBoxHeight + 8; // Where content starts on pages 2+
    const longDisclaimerText = 'Esta interpretación fue generada con el apoyo de Inteligencia Artificial (IA) y tiene fines meramente informativos. NO sustituye el diagnóstico, la opinión o el tratamiento de un médico o profesional de la salud cualificado. Consulte siempre a su médico con sus resultados originales.';
    
    /**
     * Agrega el disclaimer en la parte superior de una página (estilo similar a Resumen General)
     * @param {number} pageNum - Número de página
     * @param {number} customY - Posición Y personalizada (opcional, para página 1)
     */
    function addDisclaimerBox(pageNum, customY = null) {
        doc.setPage(pageNum);
        
        const boxWidth = pageWidth - (margin * 2);
        const boxY = customY !== null ? customY : disclaimerTopMargin;
        
        // Fondo amarillo claro con borde
        doc.setFillColor(...warningBg);
        doc.setDrawColor(...warningYellow);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, boxY, boxWidth, disclaimerBoxHeight, 3, 3, 'FD');
        
        // Icono y título
        doc.setFontSize(10);
        doc.setTextColor(...warningText);
        doc.setFont('helvetica', 'bold');
        doc.text('Aviso Importante', margin + 5, boxY + 7);
        
        // Texto del disclaimer (mensaje largo)
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const disclaimerLines = doc.splitTextToSize(longDisclaimerText, boxWidth - 10);
        let textY = boxY + 13;
        disclaimerLines.forEach(line => {
            doc.text(line, margin + 5, textY);
            textY += 4;
        });
        
        return boxY + disclaimerBoxHeight; // Return the Y position after the box
    }
    
    /**
     * Limpia el texto de markdown y caracteres especiales
     */
    function cleanText(text) {
        if (!text) return 'N/A';
        return text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold markdown
            .replace(/\*([^*]+)\*/g, '$1')      // Remove italic markdown
            .replace(/#{1,6}\s*/g, '')           // Remove headers markdown
            .replace(/^[-*+]\s+/gm, '• ')        // Convert list markers to bullets
            .replace(/^\d+\.\s+/gm, '')          // Remove numbered list markers
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/`([^`]+)`/g, '$1')         // Remove inline code
            .replace(/\n{3,}/g, '\n\n')          // Reduce multiple newlines
            .trim();
    }
    
    /**
     * Agrega texto con salto de página automático
     */
    function addTextWithPageBreak(text, fontSize, textColor, isBold = false) {
        doc.setFontSize(fontSize);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = fontSize * 0.5;
        
        for (let i = 0; i < lines.length; i++) {
            if (yPosition + lineHeight > pageHeight - margin) {
                doc.addPage();
                yPosition = contentStartAfterDisclaimer; // Account for disclaimer header
            }
            doc.text(lines[i], margin, yPosition);
            yPosition += lineHeight;
        }
    }
    
    /**
     * Agrega una sección con título y contenido
     */
    function addSection(title, content, icon = '') {
        // Verificar espacio para el título
        if (yPosition + 20 > pageHeight - margin) {
            doc.addPage();
            yPosition = contentStartAfterDisclaimer; // Account for disclaimer header
        }
        
        // Línea decorativa
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        
        // Título de sección
        addTextWithPageBreak(`${icon} ${title}`, 14, primaryBlue, true);
        yPosition += 4;
        
        // Contenido
        const cleanedContent = cleanText(content);
        addTextWithPageBreak(cleanedContent, 10, darkText, false);
        yPosition += 10;
    }
    
    // ========== ENCABEZADO ==========
    // Logo/Título principal
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('HealthCheck', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Resultados del Análisis', pageWidth / 2, 28, { align: 'center' });
    
    yPosition = 45;
    
    // Información del archivo
    doc.setFontSize(11);
    doc.setTextColor(...darkText);
    doc.setFont('helvetica', 'bold');
    doc.text(`Archivo: `, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(fileName || 'Sin nombre', margin + 18, yPosition);
    
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha: `, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleString('es-MX'), margin + 14, yPosition);
    
    yPosition += 10;
    
    // ========== DISCLAIMER EN PÁGINA 1 ==========
    addDisclaimerBox(1, yPosition);
    yPosition += disclaimerBoxHeight + 10;
    
    // ========== RESUMEN EJECUTIVO ==========
    if (resumenEjecutivo) {
        // Caja de resumen
        const resumenClean = cleanText(resumenEjecutivo);
        doc.setFontSize(10);
        const resumenLines = doc.splitTextToSize(resumenClean, maxWidth - 10);
        
        // Calcular altura real de la caja basada en el contenido
        const titleHeight = 14; // Espacio para "Resumen General" título
        const lineHeight = 5;   // Altura por línea de texto
        const padding = 16;     // Padding superior e inferior
        const boxHeight = titleHeight + (resumenLines.length * lineHeight) + padding;
        
        if (yPosition + boxHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = contentStartAfterDisclaimer; // Account for disclaimer header
        }
        
        doc.setFillColor(240, 248, 255);
        doc.setDrawColor(...primaryBlue);
        doc.roundedRect(margin, yPosition, maxWidth, boxHeight, 3, 3, 'FD');
        
        const boxStartY = yPosition;
        yPosition += 10;
        doc.setFontSize(12);
        doc.setTextColor(...primaryBlue);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen General', margin + 5, yPosition);
        
        yPosition += 8;
        doc.setFontSize(10);
        doc.setTextColor(...darkText);
        doc.setFont('helvetica', 'normal');
        
        for (let i = 0; i < resumenLines.length; i++) {
            doc.text(resumenLines[i], margin + 5, yPosition);
            yPosition += 5;
        }
        
        // Posicionar después de la caja
        yPosition = boxStartY + boxHeight + 10;
    }
    
    // ========== SECCIONES PRINCIPALES ==========
    addSection('Interpretación de Conceptos', interpretacionConceptos);
    addSection('Resultados Simplificados', resultadosSimplificados);
    
    // ========== AGREGAR DISCLAIMER Y FOOTERS A TODAS LAS PÁGINAS ==========
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        // Agregar disclaimer header en páginas 2 en adelante
        // (la página 1 ya tiene el disclaimer después de Archivo/Fecha)
        if (i > 1) {
            addDisclaimerBox(i);
        }
        
        // Agregar número de página en el footer
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...grayText);
        doc.text(
            `Página ${i} de ${totalPages}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
        doc.text(
            'Generado por HealthCheck',
            pageWidth - margin,
            pageHeight - 10,
            { align: 'right' }
        );
    }
    
    // Descargar el PDF
    const pdfFileName = `Analisis_${(fileName || 'resultado').replace('.pdf', '')}.pdf`;
    doc.save(pdfFileName);
}
