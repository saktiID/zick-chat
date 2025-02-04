const chatToggle = document.querySelector(".chat-toggle");
const chatHideBtn = document.querySelector(".hide-button");
const chatContainer = document.querySelector(".chat-container");
const chatInputText = document.querySelector(".chat-input-text");
const chatSendBtn = document.querySelector(".chat-send-button");
const chatBody = document.querySelector(".chat-messages");

const API_KEY = "AIzaSyA_pbdtH-v_JTmhNitHVO4v89H2S5geQEg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
// const API_URL = ` https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`;
const userData = {
  message: null,
};

const createMessageElement = (messageContent, classes) => {
  const div = document.createElement("div");
  div.classList.add(classes);
  div.innerHTML = messageContent;
  return div;
};

const generateResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".chat-message-content");

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: userData.message }],
        },
      ],
      system_instruction: {
        parts: {
          text: "Anda adalah Assistane, nama Anda adalah Zick. Anda dikembangkan oleh Romosakti dengan url instagram https://www.instagram.com/ach.m4d22/ di kota Sidoarjo dan diberdayakan oleh Gemini dari Google",
        },
      },
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    const apiResponse = data.candidates[0].content.parts[0].text;
    messageElement.innerText = apiResponse;
    // Scroll to the bottom of the chat body
    chatBody.scrollTop = chatBody.scrollHeight;
  } catch (error) {
    console.error(error);
  }
};

const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = chatInputText.value.trim();
  chatInputText.value = "";
  const messageContent = `<div class="chat-message-content"></div>`;
  const outgoingMessageDiv = createMessageElement(messageContent, "chat-message-right");
  outgoingMessageDiv.querySelector(".chat-message-content").textContent = userData.message;
  chatBody.appendChild(outgoingMessageDiv);

  // Handle incoming message
  setTimeout(() => {
    const messageContent = `<div class="chat-message-avatar">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"/></svg>

          </div>
          <div class="chat-message-content thinking">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
          </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "chat-message-left");
    chatBody.appendChild(incomingMessageDiv);

    // Scroll to the bottom of the chat body
    chatBody.scrollTop = chatBody.scrollHeight;

    // Generate a response
    generateResponse(incomingMessageDiv);
  }, 500);

  // Scroll to the bottom of the chat body
  chatBody.scrollTop = chatBody.scrollHeight;
};

chatInputText.addEventListener("keypress", (e) => {
  const userMessage = e.target.value.trim();
  if (!e.shiftKey && e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
  }
});

chatSendBtn.addEventListener("click", (e) => {
  handleOutgoingMessage(e);
});

chatToggle.addEventListener("click", () => {
  chatContainer.classList.toggle("show-chat");
});

chatHideBtn.addEventListener("click", () => {
  chatContainer.classList.remove("show-chat");
});
