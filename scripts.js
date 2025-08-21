// OCR XHTML Interactive Controls
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        confidenceThresholds: {
            high: 0.8,
            med: 0.5
        },
        backgroundImagePath: null // Will be determined from the document
    };
    
    // State management
    const state = {
        showBackground: true,
        showLineBoxes: false,
        showWordBoxes: false,
        showText: true,
        initialized: false
    };
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeOCRViewer();
    });
    
    function initializeOCRViewer() {
        if (state.initialized) return;
        
        extractDocumentInfo();
        createControlPanel();
        setupBackgroundImage();
        classifyWordsByConfidence();
        bindEventHandlers();
        updateDisplay();
        
        state.initialized = true;
        console.log('OCR XHTML Viewer initialized');
    }
    
    function extractDocumentInfo() {
        const section = document.querySelector('section');
        if (section) {
            const filename = section.getAttribute('file');
            const words = section.getAttribute('words');
            const segments = section.getAttribute('segments');
            const avgConf = section.getAttribute('avgConf');
            const angle = section.getAttribute('angle');
            
            // Store metadata for display
            window.ocrMetadata = {
                filename: filename || 'Unknown',
                words: parseInt(words) || 0,
                segments: parseInt(segments) || 0,
                avgConf: parseFloat(avgConf) || 0,
                angle: parseFloat(angle) || 0
            };
            
            // Set background image path
            if (filename) {
                CONFIG.backgroundImagePath = filename;
            }
        }
    }
    
    function createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        controlPanel.innerHTML = `
            <div class="hover-hint">Hover for controls...</div>
            <h3>OCR Display Controls</h3>
            
            <div class="control-group">
                <label for="toggle-background">Background Image</label>
                <div class="toggle-switch">
                    <input type="checkbox" id="toggle-background" checked>
                    <span class="slider"></span>
                </div>
            </div>
            
            <div class="control-group">
                <label for="toggle-line-boxes">Line Boxes</label>
                <div class="toggle-switch">
                    <input type="checkbox" id="toggle-line-boxes">
                    <span class="slider"></span>
                </div>
            </div>
            
            <div class="control-group">
                <label for="toggle-word-boxes">Word Boxes</label>
                <div class="toggle-switch">
                    <input type="checkbox" id="toggle-word-boxes">
                    <span class="slider"></span>
                </div>
            </div>
            
            <div class="control-group">
                <label for="toggle-text">Text Content</label>
                <div class="toggle-switch">
                    <input type="checkbox" id="toggle-text" checked>
                    <span class="slider"></span>
                </div>
            </div>
            
            <div class="confidence-legend">
                <h4>Confidence Legend</h4>
                <div class="legend-item">
                    <div class="legend-color legend-high"></div>
                    <span>High (≥80%)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color legend-med"></div>
                    <span>Medium (50-79%)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color legend-low"></div>
                    <span>Low (<50%)</span>
                </div>
            </div>
            
            <div class="stats">
                <div id="ocr-stats"></div>
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        
        // Update stats
        updateStats();
    }
    
    function setupBackgroundImage() {
        const section = document.querySelector('section');
        if (!section || !CONFIG.backgroundImagePath) return;
        
        // Create background image element
        const bgImage = document.createElement('div');
        bgImage.className = 'background-image';
        bgImage.style.backgroundImage = `url('${CONFIG.backgroundImagePath}')`;
        
        // Wrap existing content
        const existingContent = section.innerHTML;
        section.innerHTML = '';
        section.appendChild(bgImage);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ocr-content';
        contentDiv.innerHTML = existingContent;
        section.appendChild(contentDiv);
    }
    
    function classifyWordsByConfidence() {
        const words = document.querySelectorAll('w');
        words.forEach(word => {
            const confidence = parseFloat(word.getAttribute('p'));
            
            if (confidence >= CONFIG.confidenceThresholds.high) {
                word.classList.add('confidence-high');
            } else if (confidence >= CONFIG.confidenceThresholds.med) {
                word.classList.add('confidence-med');
            } else {
                word.classList.add('confidence-low');
            }
            
            // Add tooltip with confidence info
            const wordIndex = word.getAttribute('i');
            const boundingBox = word.getAttribute('b');
            word.title = `Word: "${word.textContent.trim()}"\\nConfidence: ${(confidence * 100).toFixed(1)}%\\nIndex: ${wordIndex}`;
        });
    }
    
    function bindEventHandlers() {
        // Control panel toggles
        document.getElementById('toggle-background').addEventListener('change', function(e) {
            state.showBackground = e.target.checked;
            updateDisplay();
        });
        
        document.getElementById('toggle-line-boxes').addEventListener('change', function(e) {
            state.showLineBoxes = e.target.checked;
            updateDisplay();
        });
        
        document.getElementById('toggle-word-boxes').addEventListener('change', function(e) {
            state.showWordBoxes = e.target.checked;
            updateDisplay();
        });
        
        document.getElementById('toggle-text').addEventListener('change', function(e) {
            state.showText = e.target.checked;
            updateDisplay();
        });
        
        // Word click handlers for detailed info
        document.querySelectorAll('w').forEach(word => {
            word.addEventListener('click', function() {
                showWordDetails(this);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        toggleBackground();
                        break;
                    case '2':
                        e.preventDefault();
                        toggleLineBoxes();
                        break;
                    case '3':
                        e.preventDefault();
                        toggleWordBoxes();
                        break;
                    case '4':
                        e.preventDefault();
                        toggleText();
                        break;
                }
            }
        });
    }
    
    function updateDisplay() {
        const section = document.querySelector('section');
        const bgImage = document.querySelector('.background-image');
        const content = document.querySelector('.ocr-content');
        
        if (!section) return;
        
        // Background image
        if (bgImage) {
            bgImage.style.display = state.showBackground ? 'block' : 'none';
        }
        
        // Line boxes
        document.querySelectorAll('segment').forEach(segment => {
            if (state.showLineBoxes) {
                segment.classList.add('show-line-boxes');
            } else {
                segment.classList.remove('show-line-boxes');
            }
        });
        
        // Word boxes
        if (state.showWordBoxes) {
            section.classList.add('show-word-boxes');
        } else {
            section.classList.remove('show-word-boxes');
        }
        
        // Text content
        if (!state.showText) {
            section.classList.add('hide-text');
        } else {
            section.classList.remove('hide-text');
        }
    }
    
    function updateStats() {
        const statsDiv = document.getElementById('ocr-stats');
        if (statsDiv && window.ocrMetadata) {
            const meta = window.ocrMetadata;
            statsDiv.innerHTML = `
                <div>${meta.segments} lines, ${meta.words} words</div>
                <div>Avg confidence: ${(meta.avgConf * 100).toFixed(1)}%</div>
                <div>Page angle: ${meta.angle.toFixed(1)}°</div>
            `;
        }
    }
    
    function showWordDetails(wordElement) {
        const confidence = parseFloat(wordElement.getAttribute('p'));
        const wordIndex = wordElement.getAttribute('i');
        const boundingBox = wordElement.getAttribute('b');
        const text = wordElement.textContent.trim();
        
        // Create temporary detail popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            font-family: monospace;
            z-index: 1000;
            max-width: 200px;
            pointer-events: none;
        `;
        
        popup.innerHTML = `
            <div><strong>Word:</strong> "${text}"</div>
            <div><strong>Confidence:</strong> ${(confidence * 100).toFixed(1)}%</div>
            <div><strong>Index:</strong> ${wordIndex}</div>
            <div><strong>Bounds:</strong> ${boundingBox ? boundingBox.split(',').map(n => parseFloat(n).toFixed(0)).join(', ') : 'N/A'}</div>
        `;
        
        // Position popup near the word
        const rect = wordElement.getBoundingClientRect();
        popup.style.left = (rect.left + window.scrollX) + 'px';
        popup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
        
        document.body.appendChild(popup);
        
        // Remove popup after 3 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 3000);
    }
    
    // Public API functions
    window.ocrControls = {
        toggleBackground: function() {
            state.showBackground = !state.showBackground;
            document.getElementById('toggle-background').checked = state.showBackground;
            updateDisplay();
        },
        
        toggleLineBoxes: function() {
            state.showLineBoxes = !state.showLineBoxes;
            document.getElementById('toggle-line-boxes').checked = state.showLineBoxes;
            updateDisplay();
        },
        
        toggleWordBoxes: function() {
            state.showWordBoxes = !state.showWordBoxes;
            document.getElementById('toggle-word-boxes').checked = state.showWordBoxes;
            updateDisplay();
        },
        
        toggleText: function() {
            state.showText = !state.showText;
            document.getElementById('toggle-text').checked = state.showText;
            updateDisplay();
        },
        
        getState: function() {
            return { ...state };
        },
        
        setState: function(newState) {
            Object.assign(state, newState);
            updateDisplay();
        }
    };
    
    // Helper functions for direct toggle access
    function toggleBackground() { window.ocrControls.toggleBackground(); }
    function toggleLineBoxes() { window.ocrControls.toggleLineBoxes(); }
    function toggleWordBoxes() { window.ocrControls.toggleWordBoxes(); }
    function toggleText() { window.ocrControls.toggleText(); }
    
})();