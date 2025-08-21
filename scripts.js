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
        layoutMode: 'overlay', // 'overlay' or 'stacked'
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
        calculateImageDimensions();
        classifyWordsByConfidence();
        positionWordsAccurately();
        bindEventHandlers();
        updateDisplay();
        
        state.initialized = true;
        console.log('OCR XHTML Viewer initialized');
    }
    
    function extractDocumentInfo() {
        const section = document.querySelector('section');
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
        
        // Layout Mode Control
        controlPanel.appendChild(createLayoutModeControl());
        
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
    
    function createLayoutModeControl() {
        const group = document.createElement('div');
        group.className = 'control-group';
        
        const labelEl = document.createElement('label');
        labelEl.setAttribute('for', 'layout-mode');
        labelEl.textContent = 'Stacked Layout';
        
        const toggleSwitch = document.createElement('div');
        toggleSwitch.className = 'toggle-switch';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = 'layout-mode';
        input.checked = state.layoutMode === 'stacked';
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        toggleSwitch.appendChild(input);
        toggleSwitch.appendChild(slider);
        
        group.appendChild(labelEl);
        group.appendChild(toggleSwitch);
        
        return group;
    }
    
    function setupBackgroundImage() {
        const section = document.querySelector('section');
        if (!section || !CONFIG.backgroundImagePath) return;
        
        // Create background image element
        const bgImage = document.createElement('div');
        bgImage.className = 'background-image';
        bgImage.style.backgroundImage = `url('${CONFIG.backgroundImagePath}')`;
        
        // Move existing children to content div instead of using innerHTML
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ocr-content';
        
        // Move all existing children to the content div
        while (section.firstChild) {
            contentDiv.appendChild(section.firstChild);
        }
        
        // Add background image and content div back to section
        section.appendChild(bgImage);
        section.appendChild(contentDiv);
        
        // Set initial layout mode
        section.classList.add('layout-' + state.layoutMode);
    }
    
    function calculateImageDimensions() {
        const section = document.querySelector('section');
        if (!section) return;
        
        const imgWidth = parseInt(section.getAttribute('imgWidth')) || 800;
        const imgHeight = parseInt(section.getAttribute('imgHeight')) || 600;
        const aspectRatio = imgWidth / imgHeight;
        
        // Set CSS custom properties for layout calculations
        section.style.setProperty('--image-width', imgWidth + 'px');
        section.style.setProperty('--image-height', imgHeight + 'px');
        section.style.setProperty('--image-aspect-ratio', aspectRatio);
        
        // Store for positioning calculations
        window.ocrImageDimensions = {
            width: imgWidth,
            height: imgHeight,
            aspectRatio: aspectRatio
        };
    }
    
    function updateLayoutMode() {
        const section = document.querySelector('section');
        if (!section) return;
        
        // Remove existing layout classes
        section.classList.remove('layout-overlay', 'layout-stacked');
        
        // Add current layout class
        section.classList.add('layout-' + state.layoutMode);
        
        // Recalculate positioning if needed
        if (state.layoutMode === 'overlay') {
            positionWordsAccurately();
        }
    }
    
    function positionWordsAccurately() {
        if (state.layoutMode !== 'overlay') return;
        
        const section = document.querySelector('section');
        const contentDiv = document.querySelector('.ocr-content');
        if (!section || !contentDiv || !window.ocrImageDimensions) return;
        
        const imageDims = window.ocrImageDimensions;
        const sectionRect = section.getBoundingClientRect();
        
        // Calculate scale factors
        const scaleX = sectionRect.width / imageDims.width;
        const scaleY = sectionRect.height / imageDims.height;
        
        // Use the smaller scale to maintain aspect ratio
        const scale = Math.min(scaleX, scaleY);
        
        // Calculate offset to center the image
        const scaledWidth = imageDims.width * scale;
        const scaledHeight = imageDims.height * scale;
        const offsetX = (sectionRect.width - scaledWidth) / 2;
        const offsetY = (sectionRect.height - scaledHeight) / 2;
        
        // Position each word based on its coordinates
        document.querySelectorAll('w').forEach(word => {
            const bounds = word.getAttribute('b');
            if (!bounds) return;
            
            const coords = bounds.split(',').map(n => parseFloat(n));
            if (coords.length !== 8) return;
            
            const [x1, y1, x2, y2, x3, y3, x4, y4] = coords;
            
            // Calculate word center and dimensions
            const centerX = (x1 + x2 + x3 + x4) / 4;
            const centerY = (y1 + y2 + y3 + y4) / 4;
            
            // Calculate rotation angle from the quad coordinates
            const angle = calculateTextRotation(x1, y1, x2, y2, x3, y3, x4, y4);
            
            // Scale and position the word
            const scaledX = centerX * scale + offsetX;
            const scaledY = centerY * scale + offsetY;
            
            // Apply positioning and rotation
            word.style.left = scaledX + 'px';
            word.style.top = scaledY + 'px';
            word.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            
            // Calculate word dimensions for better positioning
            const wordWidth = Math.abs(x2 - x1) * scale;
            const wordHeight = Math.abs(y3 - y1) * scale;
            word.style.minWidth = wordWidth + 'px';
            word.style.minHeight = wordHeight + 'px';
        });
        
        // Position segments (lines) as well
        document.querySelectorAll('segment').forEach(segment => {
            const bounds = segment.getAttribute('b');
            if (!bounds) return;
            
            const coords = bounds.split(',').map(n => parseFloat(n));
            if (coords.length !== 8) return;
            
            const [x1, y1, x2, y2, x3, y3, x4, y4] = coords;
            
            // Calculate segment position and size
            const left = Math.min(x1, x2, x3, x4) * scale + offsetX;
            const top = Math.min(y1, y2, y3, y4) * scale + offsetY;
            const width = (Math.max(x1, x2, x3, x4) - Math.min(x1, x2, x3, x4)) * scale;
            const height = (Math.max(y1, y2, y3, y4) - Math.min(y1, y2, y3, y4)) * scale;
            
            segment.style.left = left + 'px';
            segment.style.top = top + 'px';
            segment.style.width = width + 'px';
            segment.style.height = height + 'px';
        });
    }
    
    function calculateTextRotation(x1, y1, x2, y2, x3, y3, x4, y4) {
        // Calculate the primary direction vector (usually top edge)
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        // Calculate angle in radians, then convert to degrees
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = angleRad * (180 / Math.PI);
        
        // Normalize to -45 to 45 degrees for better readability
        let normalizedAngle = angleDeg;
        if (normalizedAngle > 45) normalizedAngle -= 90;
        if (normalizedAngle < -45) normalizedAngle += 90;
        
        return normalizedAngle;
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
        // Window resize handler for responsive positioning
        window.addEventListener('resize', function() {
            if (state.layoutMode === 'overlay') {
                // Debounce resize events
                clearTimeout(window.resizeTimeout);
                window.resizeTimeout = setTimeout(function() {
                    positionWordsAccurately();
                }, 250);
            }
        });
        
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
        
        // Layout mode toggle
        document.getElementById('layout-mode').addEventListener('change', function(e) {
            state.layoutMode = e.target.checked ? 'stacked' : 'overlay';
            updateLayoutMode();
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
                    case '5':
                        e.preventDefault();
                        toggleLayoutMode();
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
        
        // Update word positioning if in overlay mode
        if (state.layoutMode === 'overlay') {
            positionWordsAccurately();
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
        },
        
        toggleLayoutMode: function() {
            state.layoutMode = state.layoutMode === 'overlay' ? 'stacked' : 'overlay';
            document.getElementById('layout-mode').checked = state.layoutMode === 'stacked';
            updateLayoutMode();
            updateDisplay();
        }
    };
    
    // Helper functions for direct toggle access
    function toggleBackground() { window.ocrControls.toggleBackground(); }
    function toggleLineBoxes() { window.ocrControls.toggleLineBoxes(); }
    function toggleWordBoxes() { window.ocrControls.toggleWordBoxes(); }
    function toggleText() { window.ocrControls.toggleText(); }
    function toggleLayoutMode() { window.ocrControls.toggleLayoutMode(); }
    
})();