(function (document, objectName) {
  // Initialize the chat function
  function init(divId, id) {
    const targetDiv = document.getElementById(divId);
    if (!targetDiv) {
      console.error('Div with ID ' + divId + 'not found.');
      return;
    }

    // Configuration
    const CHAT_URL = 'AI_SASS_CHAT_WIDGET_URL' + '?id=' + id;

    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.minHeight = "200px";
    iframe.style.border = "none";
    iframe.src = CHAT_URL;

    // Append iframe to the target div
    targetDiv.appendChild(iframe);
  }

  // Expose the init function to the global scope
  window.ASIChatWidget = { init };
})(window.document, "ASIChatWidget");
window.ASIChatWidget.init('CHAT_DIV_ID', 'WIDGET_CODE')
