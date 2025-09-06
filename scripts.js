(function() {
    console.log("Loading XHtmlOcrControls");
    
    // Get the current script's URL
    var currentScript = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    
    var scriptUrl = currentScript.src;
    var scriptDir = scriptUrl.substring(0, scriptUrl.lastIndexOf('/') + 1);
    
    console.log("Current script location:", scriptUrl);
    console.log("Script directory:", scriptDir);
    
    // Load your TeaVM script relative to this script's location
    var controls_script = document.createElement('script');
    controls_script.src = scriptDir + 'XHtmlOcrControls.js';

    console.log("Loading from:", controls_script.src);
    
    controls_script.onload = function() {
        console.log("Calling main");
        if (typeof XHtmlOcrControls__main === 'function') {
            XHtmlOcrControls__main();
        }
    };
    
    controls_script.onerror = function() {
        console.error('Failed to load XHtmlOcrControls.js from:', controls_script.src);
    };
    
    document.head.appendChild(controls_script);
})();