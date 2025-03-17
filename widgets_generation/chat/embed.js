// Define a self-executing anonymous function
(function () {
  // Define constants
  const CONFIG_NAME = "aiSAASChatbotConfig";
  const BUTTON_ID = "ai-saas-chatbot-bubble-button";
  const WINDOW_ID = "ai-saas-chatbot-bubble-window";

  // Get configuration
  const config = window[CONFIG_NAME];

  // Define SVG icons
  const icons = {
    open: `<svg xmlns=" http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white block border-gray-200 align-middle">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" class="border-gray-200">
      </path>
    </svg>`,
    close: `<svg id="closeIcon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 18L6 6M6 18L18 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  };

  // Dynamicly generate URL parameters
  async function generateUrlParams() {
    if (config && config.token) {
      const params = new URLSearchParams();
      const inputs = config.inputs || {};
      Object.entries(inputs).forEach(([key, value]) => {
        params.append(key, value);
      });
      return params.toString();
    }
    return "";
  }

  // Create a chatbot button
  async function createChatButton() {
    if (config && config.code) {
      const baseUrl = config.baseUrl || "http://localhost:3000/chat/";
      const urlParams = await generateUrlParams();
      const iframeUrl = `${baseUrl}${config.code}?${urlParams}`;

      // Create a button style
      const buttonStyle = `
        #${BUTTON_ID} {
          position: fixed;
          bottom: var(--${BUTTON_ID}-bottom, 1rem);
          right: var(--${BUTTON_ID}-right, 1rem);
          left: var(--${BUTTON_ID}-left, unset);
          top: var(--${BUTTON_ID}-top, unset);
          width: var(--${BUTTON_ID}-width, 50px);
          height: var(--${BUTTON_ID}-height, 50px);
          border-radius: var(--${BUTTON_ID}-border-radius, 25px);
          background-color: var(--${BUTTON_ID}-bg-color, rgb(0 0 0 / var(--tw-bg-opacity, 1)));
          box-shadow: var(--${BUTTON_ID}-box-shadow, rgba(0, 0, 0, 0.2) 0px 4px 8px 0px);
          cursor: pointer;
          z-index: 2147483647;
        }
      `;

      // Create button
      const button = document.createElement("div");
      button.id = BUTTON_ID;
      Object.entries(config.containerProps || {}).forEach(([key, value]) => {
        if (key === "className") {
          button.classList.add(...value.split(" "));
        } else if (key === "style") {
          if (typeof value === "object") {
            Object.assign(button.style, value);
          } else {
            button.style.cssText = value;
          }
        } else if (typeof value === "function") {
          button.addEventListener(key.replace(/^on/, "").toLowerCase(), value);
        } else {
          button[key] = value;
        }
      });

      // Create style tag
      const style = document.createElement("style");
      document.head.appendChild(style);
      style.sheet.insertRule(buttonStyle);

      // Create an icon container
      const iconContainer = document.createElement("div");
      iconContainer.style.cssText =
        "display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; z-index: 2147483647;";
      iconContainer.innerHTML = icons.open;
      button.appendChild(iconContainer);

      // Add a button to the page
      document.body.appendChild(button);

      // Create a chat window
      const chatWindow = document.createElement("iframe");
      chatWindow.id = WINDOW_ID;
      chatWindow.allow = "fullscreen; microphone";
      chatWindow.title = "AI SASS chatbot bubble window";
      chatWindow.style.cssText = `
        border: none;
        position: absolute;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px;
        bottom: 55px;
        right: 0;
        width: 24rem;
        max-width: calc(100vw - 2rem);
        height: 40rem;
        max-height: calc(100vh - 6rem);
        border-radius: 0.75rem;
        display: none;
        z-index: 2147483647;
        overflow: hidden;
        left: unset;
        background-color: #F3F4F6;
        user-select: none;
      `;
      chatWindow.src = iframeUrl;

      // Add chat window to the page
      document.body.appendChild(chatWindow);

      // Show or hide chat window
      button.addEventListener("click", () => {
        const windowElement = document.getElementById(WINDOW_ID);
        if (windowElement) {
          windowElement.style.display = windowElement.style.display === "none" ? "block" : "none";
          iconContainer.innerHTML = windowElement.style.display === "none" ? icons.open : icons.close;
        }
      });

      // Handle keyboard events
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          const windowElement = document.getElementById(WINDOW_ID);
          const buttonElement = document.getElementById(BUTTON_ID);
          if (windowElement && windowElement.style.display !== "none") {
            windowElement.style.display = "none";
            buttonElement.querySelector("div").innerHTML = icons.open;
          }
        }
      });

      // Adjust button position
      function adjustButtonPosition() {
        const buttonElement = document.getElementById(BUTTON_ID);
        const windowElement = document.getElementById(WINDOW_ID);
        if (buttonElement && windowElement) {
          const buttonRect = buttonElement.getBoundingClientRect();
          const windowRect = windowElement.getBoundingClientRect();
          if (buttonRect.top - 5 > windowRect.height) {
            windowElement.style.bottom = `${buttonRect.height + 5}px`;
            windowElement.style.top = "unset";
          } else {
            windowElement.style.bottom = "unset";
            windowElement.style.top = `${buttonRect.height + 5}px`;
          }
          if (buttonRect.right > windowRect.width) {
            windowElement.style.right = "0";
            windowElement.style.left = "unset";
          } else {
            windowElement.style.right = "unset";
            windowElement.style.left = "0";
          }
        }
      }

      // Add drag function
      if (config.draggable) {
        const buttonElement = document.getElementById(BUTTON_ID);
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        buttonElement.addEventListener("mousedown", (event) => {
          isDragging = true;
          offsetX = event.clientX - buttonElement.offsetLeft;
          offsetY = event.clientY - buttonElement.offsetTop;
        });

        document.addEventListener("mousemove", (event) => {
          if (isDragging) {
            buttonElement.style.transition = "none";
            buttonElement.style.cursor = "grabbing";
            const newX = event.clientX - offsetX;
            const newY = event.clientY - offsetY;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const buttonWidth = buttonElement.offsetWidth;
            const buttonHeight = buttonElement.offsetHeight;

            buttonElement.style.setProperty(
              `--${BUTTON_ID}-left`,
              `${Math.max(0, Math.min(newX, windowWidth - buttonWidth))}px`
            );
            buttonElement.style.setProperty(
              `--${BUTTON_ID}-bottom`,
              `${Math.max(0, Math.min(newY, windowHeight - buttonHeight))}px`
            );
          }
        });

        document.addEventListener("mouseup", () => {
          isDragging = false;
          buttonElement.style.transition = "";
          buttonElement.style.cursor = "pointer";
        });
      }

      adjustButtonPosition();
    } else {
      console.error(`${CONFIG_NAME} is empty or token is not provided`);
    }
  }

  // initialization
  if (config?.dynamicScript) {
    createChatButton();
  } else {
    document.body.onload = createChatButton;
  }
})();
