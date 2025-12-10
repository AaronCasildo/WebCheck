// history-manager.js
// Utility module for managing analysis history in localStorage

const HISTORY_KEY = 'healthcheck-history';
const MAX_HISTORY_ITEMS = 3;

/**
 * Get all history items from localStorage
 * @returns {Array} Array of history items
 */
function getHistory() {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error loading history:', error);
        return [];
    }
}

/**
 * Save a new analysis to history
 * @param {Object} analysisData - The analysis data to save
 * @param {string} analysisData.fileName - Name of the analyzed file
 * @param {Object} analysisData.result - Analysis results
 */
function saveToHistory(analysisData) {
    try {
        const history = getHistory();
        
        // Create history entry with timestamp
        const entry = {
            id: Date.now(),
            fileName: analysisData.fileName,
            timestamp: new Date().toISOString(),
            result: analysisData.result
        };
        
        // Add to beginning of array
        history.unshift(entry);
        
        // Keep only last MAX_HISTORY_ITEMS
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
        
        // Save back to localStorage
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
        
        return true;
    } catch (error) {
        console.error('Error saving to history:', error);
        return false;
    }
}

/**
 * Get a specific history item by ID
 * @param {number} id - The ID of the history item
 * @returns {Object|null} The history item or null if not found
 */
function getHistoryItem(id) {
    const history = getHistory();
    return history.find(item => item.id === id) || null;
}

/**
 * Delete a specific history item
 * @param {number} id - The ID of the history item to delete
 * @returns {boolean} Success status
 */
function deleteHistoryItem(id) {
    try {
        const history = getHistory();
        const filteredHistory = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(filteredHistory));
        return true;
    } catch (error) {
        console.error('Error deleting history item:', error);
        return false;
    }
}

/**
 * Clear all history
 * @returns {boolean} Success status
 */
function clearAllHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
}

/**
 * Get history count
 * @returns {number} Number of items in history
 */
function getHistoryCount() {
    return getHistory().length;
}

/**
 * Format timestamp to readable date
 * @param {string} isoString - ISO timestamp string
 * @returns {string} Formatted date string
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
