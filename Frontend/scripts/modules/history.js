// history.js
// Page logic for History.html

document.addEventListener('DOMContentLoaded', () => {
    loadHistoryPage();
    
    // Set up clear all button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAll);
    }
});

/**
 * Load and display all history items
 */
function loadHistoryPage() {
    const history = getHistory();
    const container = document.getElementById('historyContainer');
    const emptyState = document.getElementById('emptyState');
    const clearAllContainer = document.getElementById('clearAllContainer');
    
    if (history.length === 0) {
        // Show empty state
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        clearAllContainer.style.display = 'none';
    } else {
        // Show history cards
        container.style.display = 'grid';
        emptyState.style.display = 'none';
        clearAllContainer.style.display = 'block';
        
        // Render history cards
        container.innerHTML = history.map(item => createHistoryCard(item)).join('');
        
        // Attach event listeners to buttons
        attachCardEventListeners();
    }
}

/**
 * Create HTML for a history card
 * @param {Object} item - History item
 * @returns {string} HTML string
 */
function createHistoryCard(item) {
    const formattedDate = formatDate(item.timestamp);
    const resumenPreview = item.result.resumenEjecutivo 
        ? truncateText(stripMarkdown(item.result.resumenEjecutivo), 150)
        : 'Sin resumen disponible';
    
    return `
        <div class="history-card" data-id="${item.id}">
            <div class="history-card-content">
                <div class="history-card-icon">📄</div>
                <div class="history-card-info">
                    <h3 class="history-card-title">${escapeHtml(item.fileName)}</h3>
                    <p class="history-card-date">${formattedDate}</p>
                </div>
            </div>
            <div class="history-card-actions">
                <button class="btn-view btn-primary" data-id="${item.id}">
                    Ver Resultados
                </button>
                <button class="btn-delete btn-danger-outline" data-id="${item.id}">
                    🗑️
                </button>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to card buttons
 */
function attachCardEventListeners() {
    // View buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            handleViewResult(id);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            handleDeleteItem(id);
        });
    });
}

/**
 * Handle viewing a result
 * @param {number} id - Item ID
 */
function handleViewResult(id) {
    const item = getHistoryItem(id);
    if (!item) {
        alert('No se pudo cargar el resultado.');
        return;
    }
    
    // Store in sessionStorage and navigate to Results page
    sessionStorage.setItem('analysisResult', JSON.stringify(item.result));
    sessionStorage.setItem('fileName', item.fileName);
    sessionStorage.setItem('fromHistory', 'true'); // Flag to prevent duplicate save
    window.location.href = 'Results.html';
}

/**
 * Handle deleting a single item
 * @param {number} id - Item ID
 */
function handleDeleteItem(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este análisis del historial?')) {
        if (deleteHistoryItem(id)) {
            // Reload the page
            loadHistoryPage();
        } else {
            alert('Error al eliminar el análisis.');
        }
    }
}

/**
 * Handle clearing all history
 */
function handleClearAll() {
    if (confirm('¿Estás seguro de que deseas eliminar TODO el historial? Esta acción no se puede deshacer.')) {
        if (clearAllHistory()) {
            loadHistoryPage();
        } else {
            alert('Error al eliminar el historial.');
        }
    }
}

/**
 * Strip markdown formatting from text
 * @param {string} text - Text with markdown
 * @returns {string} Plain text
 */
function stripMarkdown(text) {
    return text
        .replace(/[*_~`#]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\n+/g, ' ')
        .trim();
}

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
