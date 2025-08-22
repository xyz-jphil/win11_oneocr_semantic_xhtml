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
        const section = document.querySelector('section.win11OneOcrPage');
        if (section) {
            const filename = section.getAttribute('srcName');
            const words = section.getAttribute('ocrWordsCount');
            const segments = section.getAttribute('ocrSegmentsCount');
            const avgConf = section.getAttribute('averageOcrConfidence');
            const angle = section.getAttribute('angle');
            const imgWidth = section.getAttribute('imgWidth');
            const imgHeight = section.getAttribute('imgHeight');
            
            // Store metadata for display
            window.ocrMetadata = {
                filename: filename || 'Unknown',
                words: parseInt(words) || 0,
                segments: parseInt(segments) || 0,
                avgConf: parseFloat(avgConf) || 0,
                angle: parseFloat(angle) || 0,
                imgWidth: parseInt(imgWidth) || 0,
                imgHeight: parseInt(imgHeight) || 0
            };
            
            // Set background image path
            if (filename) {
                CONFIG.backgroundImagePath = filename;
            }
        }
    }
    
    function createControlPanel() {
        // Create elements using DOM methods instead of innerHTML for XML compatibility
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        
        // Hover hint
        const hoverHint = document.createElement('div');
        hoverHint.className = 'hover-hint';
        hoverHint.textContent = 'Hover for controls...';
        controlPanel.appendChild(hoverHint);
        
        // Title
        const title = document.createElement('h3');
        title.textContent = 'OCR Display Controls';
        controlPanel.appendChild(title);
        
        // Background Image Control
        controlPanel.appendChild(createControlGroup('toggle-background', 'Background Image', true));
        
        // Line Boxes Control
        controlPanel.appendChild(createControlGroup('toggle-line-boxes', 'Line Boxes', false));
        
        // Word Boxes Control
        controlPanel.appendChild(createControlGroup('toggle-word-boxes', 'Word Boxes', false));
        
        // Text Content Control
        controlPanel.appendChild(createControlGroup('toggle-text', 'Text Content', true));
        
        // Confidence Legend
        const legend = document.createElement('div');
        legend.className = 'confidence-legend';
        
        const legendTitle = document.createElement('h4');
        legendTitle.textContent = 'Confidence Legend';
        legend.appendChild(legendTitle);
        
        legend.appendChild(createLegendItem('legend-high', 'High (≥80%)'));
        legend.appendChild(createLegendItem('legend-med', 'Medium (50-79%)'));
        legend.appendChild(createLegendItem('legend-low', 'Low (<50%)'));
        
        controlPanel.appendChild(legend);
        
        // Stats container
        const stats = document.createElement('div');
        stats.className = 'stats';
        const statsDiv = document.createElement('div');
        statsDiv.id = 'ocr-stats';
        stats.appendChild(statsDiv);
        controlPanel.appendChild(stats);
        
        document.body.appendChild(controlPanel);
        
        // Update stats
        updateStats();
    }
    
    function createControlGroup(id, label, checked) {
        const group = document.createElement('div');
        group.className = 'control-group';
        
        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', id);
        labelEl.textContent = label;
        
        const toggleSwitch = document.createElement('div');
        toggleSwitch.className = 'toggle-switch';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        if (checked) input.checked = true;
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        toggleSwitch.appendChild(input);
        toggleSwitch.appendChild(slider);
        
        group.appendChild(labelEl);
        group.appendChild(toggleSwitch);
        
        return group;
    }
    
    function createLegendItem(colorClass, text) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const color = document.createElement('div');
        color.className = 'legend-color ' + colorClass;
        
        const span = document.createElement('span');
        span.textContent = text;
        
        item.appendChild(color);
        item.appendChild(span);
        
        return item;
    }
    
    function setupBackgroundImage() {
        const section = document.querySelector('section.win11OneOcrPage');
        if (!section || !CONFIG.backgroundImagePath) return;
        
        // Create background image element
        const bgImage = document.createElement('div');
        bgImage.className = 'background-image';
        bgImage.style.backgroundImage = `url('${CONFIG.backgroundImagePath}')`;
        
        // Check if ocrContent wrapper already exists
        const existingContent = section.querySelector('.ocrContent');
        if (!existingContent) {
            // Move existing children to content div
            const contentDiv = document.createElement('div');
            contentDiv.className = 'ocrContent';
            
            // Move all existing children to the content div
            while (section.firstChild) {
                contentDiv.appendChild(section.firstChild);
            }
            
            // Add background image and content div back to section
            section.appendChild(bgImage);
            section.appendChild(contentDiv);
        } else {
            // ocrContent already exists, just add background
            section.insertBefore(bgImage, existingContent);
        }
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
        const section = document.querySelector('section.win11OneOcrPage');
        const bgImage = document.querySelector('.background-image');
        const content = document.querySelector('.ocrContent');
        
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
            
            // Clear existing content
            while (statsDiv.firstChild) {
                statsDiv.removeChild(statsDiv.firstChild);
            }
            
            // Create stats elements
            const line1 = document.createElement('div');
            line1.textContent = `${meta.segments} lines, ${meta.words} words`;
            
            const line2 = document.createElement('div');
            line2.textContent = `Avg confidence: ${(meta.avgConf * 100).toFixed(1)}%`;
            
            const line3 = document.createElement('div');
            line3.textContent = `Page angle: ${meta.angle.toFixed(1)}°`;
            
            statsDiv.appendChild(line1);
            statsDiv.appendChild(line2);
            statsDiv.appendChild(line3);
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
        
        // Create content using DOM methods for XML compatibility
        const line1 = document.createElement('div');
        const strong1 = document.createElement('strong');
        strong1.textContent = 'Word:';
        line1.appendChild(strong1);
        line1.appendChild(document.createTextNode(` "${text}"`));
        
        const line2 = document.createElement('div');
        const strong2 = document.createElement('strong');
        strong2.textContent = 'Confidence:';
        line2.appendChild(strong2);
        line2.appendChild(document.createTextNode(` ${(confidence * 100).toFixed(1)}%`));
        
        const line3 = document.createElement('div');
        const strong3 = document.createElement('strong');
        strong3.textContent = 'Index:';
        line3.appendChild(strong3);
        line3.appendChild(document.createTextNode(` ${wordIndex}`));
        
        const line4 = document.createElement('div');
        const strong4 = document.createElement('strong');
        strong4.textContent = 'Bounds:';
        line4.appendChild(strong4);
        const boundsText = boundingBox ? boundingBox.split(',').map(n => parseFloat(n).toFixed(0)).join(', ') : 'N/A';
        line4.appendChild(document.createTextNode(` ${boundsText}`));
        
        popup.appendChild(line1);
        popup.appendChild(line2);
        popup.appendChild(line3);
        popup.appendChild(line4);
        
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