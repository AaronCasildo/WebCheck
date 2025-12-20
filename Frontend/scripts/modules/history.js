// history.js
// Page logic for History.html

let currentSort = 'name-asc'; // Default sort

document.addEventListener('DOMContentLoaded', () => {
    loadHistoryPage();
    
    // Set up clear all button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', handleClearAll);
    }
    
    // Set up sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            loadHistoryPage();
        });
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
        
        // Sort history based on current sort option
        const sortedHistory = sortHistory(history, currentSort);
        
        // Render history cards
        container.innerHTML = sortedHistory.map(item => createHistoryCard(item)).join('');
        
        // Attach event listeners to buttons
        attachCardEventListeners();
    }
}

/**
 * Sort history items based on selected criteria
 * @param {Array} history - History items array
 * @param {string} sortType - Sort type (date-desc, date-asc, name-asc, name-desc)
 * @returns {Array} Sorted history array
 */
function sortHistory(history, sortType) {
    const sorted = [...history]; // Create a copy to avoid mutating original
    
    switch (sortType) {
        case 'date-desc':
            return sorted.sort((a, b) => b.timestamp - a.timestamp);
        case 'date-asc':
            return sorted.sort((a, b) => a.timestamp - b.timestamp);
        case 'name-asc':
            return sorted.sort((a, b) => a.fileName.localeCompare(b.fileName, 'es', { sensitivity: 'base' }));
        case 'name-desc':
            return sorted.sort((a, b) => b.fileName.localeCompare(a.fileName, 'es', { sensitivity: 'base' }));
        default:
            return sorted;
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
