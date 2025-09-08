package xyz.jphil.win11_oneocr.xhtml_controls_js.utilities;

import org.teavm.jso.browser.Window;
import org.teavm.jso.dom.html.HTMLDocument;
import org.teavm.jso.dom.html.HTMLElement;
import org.teavm.jso.dom.html.HTMLInputElement;
import java.util.List;

/**
 * Creates HTML UI elements with styling.
 * Deep module that handles DOM element creation and styling complexity.
 */
public final class UIElementFactory {
    
    private UIElementFactory() {
        // Utility class - prevent instantiation
    }
    
    /**
     * Record for control configuration data.
     */
    public record ControlConfig(String id, String label, boolean defaultChecked) {}
    
    /**
     * Record for legend item configuration data.
     */
    public record LegendItemConfig(String colorClass, String text) {}
    
    /**
     * Create hover hint element with standard styling.
     */
    public static void createHoverHint(HTMLElement parent) {
        var hoverHint = (HTMLElement) getDocument().createElement("div");
        hoverHint.setClassName("hover-hint");
        hoverHint.setTextContent("Hover for controls...");
        parent.appendChild(hoverHint);
    }
    
    /**
     * Create title element with standard styling.
     */
    public static void createTitle(HTMLElement parent, String titleText) {
        var title = (HTMLElement) getDocument().createElement("h3");
        title.setTextContent(titleText);
        parent.appendChild(title);
    }
    
    /**
     * Create sticky top control bar with pin/unpin toggle functionality.
     * When pinned: position sticky, stays at top while scrolling.
     * When unpinned: position static, scrolls with content.
     */
    public static HTMLElement createStickyControlBar(List<ControlConfig> controls) {
        var controlBar = (HTMLElement) getDocument().createElement("div");
        controlBar.setClassName("control-bar sticky-pinned");
        controlBar.setId("top-control-bar");
        
        // Sticky control bar styles - full width
        var barStyle = "position: sticky; " +
                      "top: 0; " +
                      "left: 0; " +
                      "right: 0; " +
                      "width: 100%; " +
                      "z-index: 1000; " +
                      "background: linear-gradient(135deg, #2c3e50, #34495e); " +
                      "color: white; " +
                      "padding: 12px 20px; " +
                      "border-bottom: 2px solid #3498db; " +
                      "box-shadow: 0 2px 8px rgba(0,0,0,0.3); " +
                      "display: flex; " +
                      "flex-direction: column; " +
                      "gap: 8px; " +
                      "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; " +
                      "font-size: 13px; " +
                      "transition: all 0.3s ease; " +
                      "box-sizing: border-box;";
        controlBar.getStyle().setCssText(barStyle);
        
        // Create single row with pin toggle + controls
        var controlsRow = (HTMLElement) getDocument().createElement("div");
        controlsRow.getStyle().setCssText("display: flex; flex-wrap: wrap; align-items: center; gap: 12px; width: 100%;");
        
        // Add pin toggle as first item in the controls row
        var pinToggle = createPinToggleButton();
        controlsRow.appendChild(pinToggle);
        
        // Add a small separator after pin toggle
        var separator = (HTMLElement) getDocument().createElement("div");
        separator.getStyle().setCssText("width: 1px; height: 20px; background: rgba(255,255,255,0.3); margin: 0 4px;");
        controlsRow.appendChild(separator);
        
        // Add control groups in responsive layout
        controls.forEach(config -> {
            var controlGroup = createCompactControlGroup(config);
            controlsRow.appendChild(controlGroup);
        });
        
        // Add page navigation controls if this is a multi-page document
        var pageNavControls = createPageNavigationControls();
        if (pageNavControls != null) {
            // Add another separator before page navigation
            var pageSeparator = (HTMLElement) getDocument().createElement("div");
            pageSeparator.getStyle().setCssText("width: 1px; height: 20px; background: rgba(255,255,255,0.3); margin: 0 4px;");
            controlsRow.appendChild(pageSeparator);
            
            controlsRow.appendChild(pageNavControls);
        }
        
        // Add copy all pages button
        var copyAllButton = createCopyAllPagesButton();
        if (copyAllButton != null) {
            // Add separator before copy button
            var copySeparator = (HTMLElement) getDocument().createElement("div");
            copySeparator.getStyle().setCssText("width: 1px; height: 20px; background: rgba(255,255,255,0.3); margin: 0 4px;");
            controlsRow.appendChild(copySeparator);
            
            controlsRow.appendChild(copyAllButton);
        }
        
        controlBar.appendChild(controlsRow);
        
        return controlBar;
    }
    
    /**
     * Create pin/unpin toggle button for sticky control bar.
     */
    private static HTMLElement createPinToggleButton() {
        var pinButton = (HTMLElement) getDocument().createElement("button");
        pinButton.setId("pin-toggle-btn");
        pinButton.setInnerHTML("●"); // Filled circle for pinned/sticky
        pinButton.setTitle("Click to unpin (scroll with content)");
        
        var buttonStyle = "background: rgba(52, 152, 219, 0.2); " +
                         "border: 1px solid rgba(52, 152, 219, 0.5); " +
                         "color: #3498db; " +
                         "padding: 4px 8px; " +
                         "border-radius: 4px; " +
                         "cursor: pointer; " +
                         "font-size: 14px; " +
                         "transition: all 0.2s ease;";
        pinButton.getStyle().setCssText(buttonStyle);
        
        // Add pin/unpin toggle functionality
        pinButton.addEventListener("click", evt -> toggleControlBarPin());
        
        // Hover effects
        pinButton.addEventListener("mouseenter", evt -> 
            pinButton.getStyle().setProperty("background", "rgba(52, 152, 219, 0.4)"));
        pinButton.addEventListener("mouseleave", evt -> 
            pinButton.getStyle().setProperty("background", "rgba(52, 152, 219, 0.2)"));
        
        return pinButton;
    }
    
    /**
     * Toggle between pinned (sticky) and unpinned (static) control bar.
     */
    private static void toggleControlBarPin() {
        var controlBar = getDocument().getElementById("top-control-bar");
        var pinButton = getDocument().getElementById("pin-toggle-btn");
        
        if (controlBar != null && pinButton != null) {
            if (controlBar.getClassList().contains("sticky-pinned")) {
                // Unpin: make it scroll with content
                controlBar.getClassList().remove("sticky-pinned");
                controlBar.getClassList().add("sticky-unpinned");
                controlBar.getStyle().setProperty("position", "static");
                pinButton.setInnerHTML("○"); // Hollow circle for unpinned
                pinButton.setTitle("Click to pin (stay at top while scrolling)");
                pinButton.getStyle().setProperty("color", "#f39c12"); // Orange for unpinned
            } else {
                // Pin: make it stick to top
                controlBar.getClassList().remove("sticky-unpinned");
                controlBar.getClassList().add("sticky-pinned");
                controlBar.getStyle().setProperty("position", "sticky");
                pinButton.setInnerHTML("●"); // Filled circle for pinned/sticky
                pinButton.setTitle("Click to unpin (scroll with content)");
                pinButton.getStyle().setProperty("color", "#3498db");
            }
        }
    }
    
    /**
     * Create compact control group for horizontal layout in control bar.
     */
    private static HTMLElement createCompactControlGroup(ControlConfig config) {
        var group = (HTMLElement) getDocument().createElement("label");
        group.setAttribute("for", config.id());
        group.setClassName("compact-control-group");
        
        var groupStyle = "display: flex; " +
                        "align-items: center; " +
                        "gap: 6px; " +
                        "padding: 2px 6px; " +
                        "border-radius: 4px; " +
                        "background: rgba(255,255,255,0.1); " +
                        "transition: background 0.2s ease; " +
                        "cursor: pointer; " +
                        "user-select: none;";
        group.getStyle().setCssText(groupStyle);
        
        var labelText = (HTMLElement) getDocument().createElement("span");
        labelText.setTextContent(config.label());
        labelText.getStyle().setCssText("font-size: 12px;");
        
        var toggle = createCompactToggleSwitch(config.id(), config.defaultChecked());
        
        group.appendChild(labelText);
        group.appendChild(toggle);
        
        // Hover effect
        group.addEventListener("mouseenter", evt -> 
            group.getStyle().setProperty("background", "rgba(255,255,255,0.15)"));
        group.addEventListener("mouseleave", evt -> 
            group.getStyle().setProperty("background", "rgba(255,255,255,0.1)"));
        
        return group;
    }
    
    /**
     * Create compact toggle switch for horizontal control bar layout.
     */
    private static HTMLElement createCompactToggleSwitch(String id, boolean checked) {
        var toggleSwitch = (HTMLElement) getDocument().createElement("div");
        toggleSwitch.setClassName("compact-toggle-switch");
        
        var switchStyle = "position: relative; " +
                         "width: 32px; " +
                         "height: 16px; " +
                         "background: rgba(255,255,255,0.2); " +
                         "border-radius: 16px; " +
                         "transition: background 0.3s ease; " +
                         "cursor: pointer;";
        toggleSwitch.getStyle().setCssText(switchStyle);
        
        var input = (HTMLInputElement) getDocument().createElement("input");
        input.setType("checkbox");
        input.setId(id);
        input.setChecked(checked);
        input.getStyle().setCssText("position: absolute; opacity: 0; pointer-events: none;");
        
        var slider = (HTMLElement) getDocument().createElement("span");
        slider.setClassName("compact-slider");
        var translateX = checked ? "16px" : "0px";
        var sliderStyle = "position: absolute; " +
                         "top: 2px; " +
                         "left: 2px; " +
                         "width: 12px; " +
                         "height: 12px; " +
                         "background: white; " +
                         "border-radius: 50%; " +
                         "transition: transform 0.3s ease; " +
                         "transform: translateX(" + translateX + ");";
        slider.getStyle().setCssText(sliderStyle);
        
        // Update styles based on checked state
        if (checked) {
            toggleSwitch.getStyle().setProperty("background", "#3498db");
        }
        
        toggleSwitch.appendChild(input);
        toggleSwitch.appendChild(slider);
        
        // Add change event listener to update visual state when input changes
        input.addEventListener("change", evt -> {
            boolean isChecked = input.isChecked();
            if (isChecked) {
                toggleSwitch.getStyle().setProperty("background", "#3498db");
                slider.getStyle().setProperty("transform", "translateX(16px)");
            } else {
                toggleSwitch.getStyle().setProperty("background", "rgba(255,255,255,0.2)");
                slider.getStyle().setProperty("transform", "translateX(0px)");
            }
        });
        
        return toggleSwitch;
    }

    /**
     * Create confidence legend with standard confidence levels.
     * Returns fully configured legend element with high/medium/low confidence indicators.
     */
    public static HTMLElement createConfidenceLegend() {
        var legend = (HTMLElement) getDocument().createElement("div");
        legend.setClassName("confidence-legend");
        
        var legendTitle = (HTMLElement) getDocument().createElement("h4");
        legendTitle.setTextContent("Confidence Legend");
        legend.appendChild(legendTitle);
        
        // Create legend items using modern Java features
        var legendItems = List.of(
            new LegendItemConfig("legend-high", "High (≥80%)"),
            new LegendItemConfig("legend-med", "Medium (50-79%)"),
            new LegendItemConfig("legend-low", "Low (<50%)")
        );
        
        legendItems.stream()
            .map(UIElementFactory::createLegendItem)
            .forEach(legend::appendChild);
        
        return legend;
    }
    
    /**
     * Create individual legend item with color indicator.
     */
    public static HTMLElement createLegendItem(LegendItemConfig config) {
        var item = (HTMLElement) getDocument().createElement("div");
        item.setClassName("legend-item");
        
        var color = (HTMLElement) getDocument().createElement("div");
        color.setClassName("legend-color " + config.colorClass());
        
        var span = (HTMLElement) getDocument().createElement("span");
        span.setTextContent(config.text());
        
        item.appendChild(color);
        item.appendChild(span);
        
        return item;
    }
    
    /**
     * Create stats container for OCR statistics display.
     */
    public static HTMLElement createStatsContainer() {
        var stats = (HTMLElement) getDocument().createElement("div");
        stats.setClassName("stats");
        
        var statsDiv = (HTMLElement) getDocument().createElement("div");
        statsDiv.setId("ocr-stats");
        stats.appendChild(statsDiv);
        
        return stats;
    }
    
    /**
     * Create floating controls container with standard styling.
     */
    public static HTMLElement createFloatingControls() {
        var controls = (HTMLElement) getDocument().createElement("div");
        controls.setId("floating-controls");
        
        var controlsStyle = "position: absolute; " +
                           "background: rgba(0, 0, 0, 0.9); " +
                           "color: white; " +
                           "padding: 5px 10px; " +
                           "border-radius: 4px; " +
                           "font-size: 11px; " +
                           "z-index: 1000; " +
                           "white-space: nowrap; " +
                           "pointer-events: auto;";
        controls.getStyle().setCssText(controlsStyle);
        
        return controls;
    }
    
    /**
     * Create control group with label and toggle switch.
     */
    public static HTMLElement createControlGroup(ControlConfig config) {
        var group = (HTMLElement) getDocument().createElement("div");
        group.setClassName("control-group");
        
        var label = (HTMLElement) getDocument().createElement("label");
        label.setAttribute("for", config.id());
        label.setTextContent(config.label());
        
        var toggleSwitch = createToggleSwitch(config.id(), config.defaultChecked());
        
        group.appendChild(label);
        group.appendChild(toggleSwitch);
        
        return group;
    }
    
    /**
     * Create toggle switch with checkbox input and slider styling.
     */
    public static HTMLElement createToggleSwitch(String id, boolean checked) {
        var toggleSwitch = (HTMLElement) getDocument().createElement("div");
        toggleSwitch.setClassName("toggle-switch");
        
        var input = (HTMLInputElement) getDocument().createElement("input");
        input.setType("checkbox");
        input.setId(id);
        input.setChecked(checked);
        
        var slider = (HTMLElement) getDocument().createElement("span");
        slider.setClassName("slider");
        
        toggleSwitch.appendChild(input);
        toggleSwitch.appendChild(slider);
        
        return toggleSwitch;
    }
    
    /**
     * Create page navigation controls (PDF-style) for multi-page documents.
     * Implements requirement (ii) from navigation enhancements.
     */
    public static HTMLElement createPageNavigationControls() {
        var doc = getDocument();
        
        // Check if this is a multi-page document
        var pageCountMeta = doc.querySelector("meta[name=\"pagesCount\"]");
        var pageCount = 1;
        if (pageCountMeta != null) {
            var content = pageCountMeta.getAttribute("content");
            try {
                pageCount = Integer.parseInt(content);
            } catch (NumberFormatException e) {
                pageCount = doc.querySelectorAll("section.win11OneOcrPage").getLength();
            }
        } else {
            pageCount = doc.querySelectorAll("section.win11OneOcrPage").getLength();
        }
        
        // Only show page navigation for multi-page documents
        if (pageCount <= 1) {
            return null;
        }
        
        var navContainer = (HTMLElement) doc.createElement("div");
        navContainer.setClassName("page-navigation-controls");
        navContainer.getStyle().setCssText("display: flex; align-items: center; gap: 8px;");
        
        // Previous page button
        var prevButton = (HTMLElement) doc.createElement("button");
        prevButton.setId("page-nav-prev");
        prevButton.setInnerHTML("‹");
        prevButton.setTitle("Previous page");
        prevButton.getStyle().setCssText(createNavButtonStyle());
        prevButton.addEventListener("click", evt -> navigateToPage(-1, true));
        
        // Page input field
        var pageInput = (HTMLInputElement) doc.createElement("input");
        pageInput.setId("page-nav-input");
        pageInput.setType("number");
        pageInput.setAttribute("min", String.valueOf(1));
        pageInput.setAttribute("max", String.valueOf(pageCount));
        pageInput.setValue("1");
        pageInput.setTitle("Go to page (1-" + pageCount + ")");
        
        var inputStyle = "width: 50px; " +
                        "padding: 4px 6px; " +
                        "border: 1px solid rgba(255,255,255,0.3); " +
                        "border-radius: 3px; " +
                        "background: rgba(255,255,255,0.1); " +
                        "color: white; " +
                        "text-align: center; " +
                        "font-size: 12px; " +
                        "font-family: monospace;";
        pageInput.getStyle().setCssText(inputStyle);
        pageInput.addEventListener("keypress", evt -> {
            if ("Enter".equals(((org.teavm.jso.dom.events.KeyboardEvent) evt).getKey())) {
                try {
                    int pageNum = Integer.parseInt(pageInput.getValue());
                    navigateToPage(pageNum, false);
                } catch (NumberFormatException e) {
                    // Invalid input - ignore
                }
            }
        });
        
        // Page count label
        var pageLabel = (HTMLElement) doc.createElement("span");
        pageLabel.setTextContent("/ " + pageCount);
        pageLabel.getStyle().setCssText("font-size: 12px; color: rgba(255,255,255,0.8); font-family: monospace;");
        
        // Next page button
        var nextButton = (HTMLElement) doc.createElement("button");
        nextButton.setId("page-nav-next");
        nextButton.setInnerHTML("›");
        nextButton.setTitle("Next page");
        nextButton.getStyle().setCssText(createNavButtonStyle());
        nextButton.addEventListener("click", evt -> navigateToPage(1, true));
        
        navContainer.appendChild(prevButton);
        navContainer.appendChild(pageInput);
        navContainer.appendChild(pageLabel);
        navContainer.appendChild(nextButton);
        
        return navContainer;
    }
    
    /**
     * Create consistent styling for navigation buttons.
     */
    private static String createNavButtonStyle() {
        return "background: rgba(255,255,255,0.1); " +
               "border: 1px solid rgba(255,255,255,0.3); " +
               "color: white; " +
               "padding: 4px 8px; " +
               "border-radius: 3px; " +
               "cursor: pointer; " +
               "font-size: 14px; " +
               "font-weight: bold; " +
               "transition: all 0.2s ease;";
    }
    
    /**
     * Navigate to a specific page or relative page offset.
     * @param pageOrOffset Page number (if isRelative=false) or offset (if isRelative=true)
     * @param isRelative Whether pageOrOffset is a relative offset
     */
    private static void navigateToPage(int pageOrOffset, boolean isRelative) {
        var doc = getDocument();
        var pageInput = (org.teavm.jso.dom.html.HTMLInputElement) doc.getElementById("page-nav-input");
        
        int targetPage;
        if (isRelative) {
            // Relative navigation (prev/next)
            int currentPage = 1;
            try {
                currentPage = Integer.parseInt(pageInput.getValue());
            } catch (NumberFormatException e) {
                // Use default
            }
            targetPage = currentPage + pageOrOffset;
        } else {
            // Direct navigation
            targetPage = pageOrOffset;
        }
        
        // Get page count
        var pageCountMeta = doc.querySelector("meta[name=\"pagesCount\"]");
        int pageCount = doc.querySelectorAll("section.win11OneOcrPage").getLength();
        if (pageCountMeta != null) {
            try {
                pageCount = Integer.parseInt(pageCountMeta.getAttribute("content"));
            } catch (NumberFormatException e) {
                // Use DOM count as fallback
            }
        }
        
        // Clamp to valid range
        targetPage = Math.max(1, Math.min(targetPage, pageCount));
        
        // Update input field
        pageInput.setValue(String.valueOf(targetPage));
        
        // Scroll to page anchor
        var anchor = doc.getElementById("page-" + targetPage);
        if (anchor != null) {
            anchor.scrollIntoView();
        }
        
        // Update button states
        updateNavigationButtonStates(targetPage, pageCount);
    }
    
    /**
     * Update navigation button states based on current page.
     */
    private static void updateNavigationButtonStates(int currentPage, int pageCount) {
        var doc = getDocument();
        var prevButton = doc.getElementById("page-nav-prev");
        var nextButton = doc.getElementById("page-nav-next");
        
        if (prevButton != null) {
            if (currentPage <= 1) {
                prevButton.getStyle().setProperty("opacity", "0.5");
                ((HTMLElement) prevButton).getStyle().setProperty("cursor", "not-allowed");
            } else {
                prevButton.getStyle().setProperty("opacity", "1");
                ((HTMLElement) prevButton).getStyle().setProperty("cursor", "pointer");
            }
        }
        
        if (nextButton != null) {
            if (currentPage >= pageCount) {
                nextButton.getStyle().setProperty("opacity", "0.5");
                ((HTMLElement) nextButton).getStyle().setProperty("cursor", "not-allowed");
            } else {
                nextButton.getStyle().setProperty("opacity", "1");
                ((HTMLElement) nextButton).getStyle().setProperty("cursor", "pointer");
            }
        }
    }
    
    /**
     * Create copy all pages button for plain text extraction.
     * Implements requirement (iii) from navigation enhancements.
     */
    public static HTMLElement createCopyAllPagesButton() {
        var doc = getDocument();
        
        // Check if we have any pages with text content
        var pages = doc.querySelectorAll("section.win11OneOcrPage");
        if (pages.getLength() == 0) {
            return null;
        }
        
        var copyButton = (HTMLElement) doc.createElement("button");
        copyButton.setId("copy-all-pages-btn");
        copyButton.setInnerHTML("📋 Copy All");
        copyButton.setTitle("Copy plain text from all pages");
        
        var buttonStyle = "background: rgba(46, 204, 113, 0.2); " +
                         "border: 1px solid rgba(46, 204, 113, 0.5); " +
                         "color: #2ecc71; " +
                         "padding: 4px 10px; " +
                         "border-radius: 4px; " +
                         "cursor: pointer; " +
                         "font-size: 12px; " +
                         "font-weight: 500; " +
                         "transition: all 0.2s ease; " +
                         "display: flex; " +
                         "align-items: center; " +
                         "gap: 4px;";
        copyButton.getStyle().setCssText(buttonStyle);
        
        // Add click handler
        copyButton.addEventListener("click", evt -> copyAllPagesText());
        
        // Hover effects
        copyButton.addEventListener("mouseenter", evt -> 
            copyButton.getStyle().setProperty("background", "rgba(46, 204, 113, 0.4)"));
        copyButton.addEventListener("mouseleave", evt -> 
            copyButton.getStyle().setProperty("background", "rgba(46, 204, 113, 0.2)"));
        
        return copyButton;
    }
    
    /**
     * Copy plain text from all pages in sequence.
     */
    private static void copyAllPagesText() {
        var doc = getDocument();
        var pages = doc.querySelectorAll("section.win11OneOcrPage");
        var allText = new StringBuilder();
        
        for (int i = 0; i < pages.getLength(); i++) {
            var page = (HTMLElement) pages.get(i);
            var pageNumber = i + 1;
            
            // Get page number from attribute if available
            var pageNumAttr = page.getAttribute("pageNum");
            if (pageNumAttr != null) {
                try {
                    pageNumber = Integer.parseInt(pageNumAttr);
                } catch (NumberFormatException e) {
                    // Use index-based page number as fallback
                }
            }
            
            // Add page header
            if (i > 0) {
                allText.append("\n\n");
            }
            allText.append("=== Page ").append(pageNumber).append(" ===\n");
            
            // Extract text from segments
            var segments = page.querySelectorAll("segment");
            for (int j = 0; j < segments.getLength(); j++) {
                var segment = (HTMLElement) segments.get(j);
                var words = segment.querySelectorAll("w");
                
                for (int k = 0; k < words.getLength(); k++) {
                    var word = (HTMLElement) words.get(k);
                    allText.append(word.getTextContent());
                    if (k < words.getLength() - 1) {
                        allText.append(" ");
                    }
                }
                
                if (j < segments.getLength() - 1) {
                    allText.append("\n");
                }
            }
        }
        
        // Copy to clipboard
        var textToCopy = allText.toString();
        if (!textToCopy.trim().isEmpty()) {
            copyToClipboard(textToCopy);
            showCopyNotification("Copied text from " + pages.getLength() + " pages to clipboard");
        } else {
            showCopyNotification("No text content found to copy", true);
        }
    }
    
    /**
     * Copy text to clipboard using JavaScript API.
     */
    @org.teavm.jso.JSBody(params = {"text"}, script = """
        navigator.clipboard.writeText(text).then(function() {
            console.log('Copied to clipboard');
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
        });
        """)
    private static native void copyToClipboard(String text);
    
    /**
     * Show copy notification with fade-out effect.
     */
    private static void showCopyNotification(String message, boolean isError) {
        var doc = getDocument();
        
        // Remove existing notification
        var existing = doc.getElementById("copy-notification");
        if (existing != null) {
            existing.getParentNode().removeChild(existing);
        }
        
        var notification = (HTMLElement) doc.createElement("div");
        notification.setId("copy-notification");
        notification.setTextContent(message);
        
        var bgColor = isError ? "rgba(231, 76, 60, 0.95)" : "rgba(46, 204, 113, 0.95)";
        var notificationStyle = "position: fixed; " +
                               "top: 80px; " +
                               "right: 20px; " +
                               "background: " + bgColor + "; " +
                               "color: white; " +
                               "padding: 12px 16px; " +
                               "border-radius: 6px; " +
                               "font-size: 13px; " +
                               "font-weight: 500; " +
                               "z-index: 10000; " +
                               "box-shadow: 0 4px 12px rgba(0,0,0,0.3); " +
                               "transition: all 0.3s ease; " +
                               "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";
        
        notification.getStyle().setCssText(notificationStyle);
        doc.getBody().appendChild(notification);
        
        // Auto-hide after 3 seconds
        org.teavm.jso.browser.Window.setTimeout(() -> {
            if (notification.getParentNode() != null) {
                notification.getStyle().setProperty("opacity", "0");
                notification.getStyle().setProperty("transform", "translateX(20px)");
                
                // Remove from DOM after animation
                org.teavm.jso.browser.Window.setTimeout(() -> {
                    if (notification.getParentNode() != null) {
                        notification.getParentNode().removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    /**
     * Show copy notification with default success styling.
     */
    private static void showCopyNotification(String message) {
        showCopyNotification(message, false);
    }
    
    /**
     * Get global document instance - convenience method.
     */
    private static HTMLDocument getDocument() {
        return Window.current().getDocument();
    }
}