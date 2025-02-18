const chatToggle = document.querySelector(".chat-toggle");
const chatFullscreenBtn = document.querySelector(".fullscreen-button");
const chatHideBtn = document.querySelector(".hide-button");
const chatContainer = document.querySelector(".chat-container");
const chatInputContainer = document.querySelector(".chat-input-container");
const chatInputText = document.querySelector(".chat-input-text");
const chatSendBtn = document.querySelector(".chat-send-button");
const chatBody = document.querySelector(".chat-messages");
const emojiBtn = document.querySelector("#emoji-button");
const attachmentsBtn = document.querySelector("#attachment-button");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileUpload = document.querySelector("#file-upload");
const scrollButton = document.querySelector(".scroll-down");

const API_KEY = "AIzaSyCciwpJ8p8ShkJ3CbFj0h7eeKdaHTMyoBI";
// const API_KEY = "AIzaSyA_pbdtH-v_JTmhNitHVO4v89H2S5geQEg";
// const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const API_URL = ` https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`;
const userData = {
  message: null,
  chatHistory: [],
  file: {
    data: null,
    mime_type: null,
  },
};

const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (e) => {
    chatInputText.value += e.native;
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-button") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});
chatInputContainer.appendChild(picker);

const checkScroll = () => {
  const scrollPos = chatBody.scrollTop + chatBody.clientHeight;
  const nearBottom = chatBody.scrollHeight - scrollPos > 20;
  if (nearBottom) {
    scrollButton.classList.remove("hide"); // Tampilkan jika agak jauh dari bawah
  } else {
    scrollButton.classList.add("hide"); // Sembunyikan tombol jika dekat bawah
  }
};

const observer = new MutationObserver(() => {
  checkScroll(); // Cek scroll setiap ada perubahan konten
});

const clearFile = () => {
  fileUpload.value = "";
  fileUploadWrapper.classList.remove("show");
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
      contents: userData.chatHistory,
      system_instruction: {
        parts: {
          text: "Anda adalah Assistane, nama Anda adalah Zick. Anda dikembangkan oleh Romosakti dengan url instagram https://www.instagram.com/ach.m4d22/ di Sidoarjo. Anda berada di server miliki MTs Bilingual. Anda mengetahui informasi tentang Romosakti, Romosakti adalah pengembang Anda dan bisa dikenal atau diketahui lebih lanjut dengan mengunjungi link instagram yang sudah diberikan.",
        },
      },
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions).then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let apiResponse = "";

      function readChunk() {
        return reader.read().then(({ done, value }) => {
          if (done) return; // Berhenti jika selesai

          const text = decoder.decode(value, { stream: true }); // Decode chunk
          const lines = text.split("\n"); // Pisahkan berdasarkan newline

          lines.forEach((line) => {
            if (line.startsWith("data: ")) {
              const jsonText = line.replace(/^data:\s*/, ""); // Hapus prefix "data: "
              try {
                const jsonData = JSON.parse(jsonText);
                const content = jsonData.candidates[0]?.content?.parts[0]?.text || "";
                const isDone = jsonData.candidates[0]?.finishReason === "STOP" || false;
                extractResponse(content, isDone);
              } catch (error) {
                console.error("Error parsing JSON:", error);
              }
            }
          });

          return readChunk(); // Lanjutkan membaca chunk berikutnya
        });
      }

      function extractResponse(content, isDone) {
        messageElement.classList.remove("thinking");
        apiResponse += content;
        if (isDone) {
          const conversation = {
            role: "model",
            parts: [{ text: apiResponse }],
          };
          userData.chatHistory.push(conversation);
          messageElement.innerHTML = marked.parse(apiResponse);
          // Handle table
          const tables = document.querySelectorAll(".chat-message-content table");

          tables.forEach((table) => {
            // Buat elemen div dengan class "table-responsive"
            const wrapper = document.createElement("div");
            wrapper.classList.add("table-responsive");

            // Masukkan tabel ke dalam div yang baru dibuat
            table.parentNode.replaceChild(wrapper, table);
            wrapper.appendChild(table);
          });

          // Handle highlighting
          const oldScript = document.getElementById("cdnScript");

          if (oldScript) {
            oldScript.remove(); // Hapus script yang lama
          }

          // Buat elemen script baru
          const newScript = document.createElement("script");
          newScript.src =
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" +
            "?t=" +
            new Date().getTime(); // Tambahkan timestamp untuk bypass cache
          newScript.id = "cdnScript";

          // Tambahkan script baru ke dalam <body>
          document.body.appendChild(newScript);

          // Scroll to the bottom of the chat body
          chatBody.scrollTop = chatBody.scrollHeight;

          return;
        }
        // Scroll to the bottom of the chat body
        chatBody.scrollTop = chatBody.scrollHeight;

        // Insert the content
        messageElement.innerHTML += content;
      }

      return readChunk();
    });

    // if (!response.ok) throw new Error(data.error.message);
    // const apiResponse = data.candidates[0].content.parts[0].text;
    // const htmlContent = marked.parse(apiResponse);
    // messageElement.innerHTML = htmlContent;
    // messageElement.classList.remove("thinking");

    // Handle table
    // const tables = document.querySelectorAll(".chat-message-content table");

    // tables.forEach((table) => {
    // Buat elemen div dengan class "table-responsive"
    // const wrapper = document.createElement("div");
    // wrapper.classList.add("table-responsive");

    // Masukkan tabel ke dalam div yang baru dibuat
    // table.parentNode.replaceChild(wrapper, table);
    // wrapper.appendChild(table);
    // });

    // Handle conversation history
    // const conversation = {
    //   role: "model",
    //   parts: [{ text: apiResponse }],
    // };
    // userData.chatHistory.push(conversation);

    // Handle highlighting
    // const oldScript = document.getElementById("cdnScript");

    // if (oldScript) {
    //   oldScript.remove(); // Hapus script yang lama
    // }

    // Buat elemen script baru
    // const newScript = document.createElement("script");
    // newScript.src =
    //   "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" +
    //   "?t=" +
    //   new Date().getTime(); // Tambahkan timestamp untuk bypass cache
    // newScript.id = "cdnScript";

    // Tambahkan script baru ke dalam <body>
    // document.body.appendChild(newScript);

    // Scroll to the bottom of the chat body
    // chatBody.scrollTop = chatBody.scrollHeight;
  } catch (error) {
    console.error(error);
    messageElement.classList.remove("thinking");
    messageElement.innerHTML = `<p>Maaf, sepertinya ada yang salah. Silakan coba lagi.</p> <br> ${error}`;
    // Scroll to the bottom of the chat body
    chatBody.scrollTop = chatBody.scrollHeight;
  }
};

const handleOutgoingMessage = (e) => {
  e.preventDefault();
  clearFile();
  userData.message = chatInputText.value.trim();
  chatInputText.value = "";
  const messageContent = `<div class="chat-message-content"></div> 
  ${
    userData.file.data
      ? ` <img class="chat-attachment" src="data:${userData.file.mime_type};base64,${userData.file.data}" />`
      : ""
  }`;
  const outgoingMessageDiv = createMessageElement(messageContent, "chat-message-right");
  outgoingMessageDiv.querySelector(".chat-message-content").textContent = userData.message;
  chatBody.appendChild(outgoingMessageDiv);

  // Handle conversation history
  const conversation = {
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data ? [{ inline_data: userData.file }] : []),
    ],
  };
  userData.chatHistory.push(conversation);

  // Handle file history
  userData.file = {
    data: null,
    mime_type: null,
  };

  // Handle overload conversation
  if (userData.chatHistory.length > 30) {
    userData.chatHistory.shift();
  }

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

chatBody.addEventListener("scroll", checkScroll);
observer.observe(chatBody, { childList: true, subtree: true });
scrollButton.addEventListener("click", () => {
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
});

chatInputText.addEventListener("keypress", (e) => {
  const userMessage = e.target.value.trim();
  const screenWidth = window.innerWidth;
  const isDesktop = window.matchMedia("(pointer: fine)").matches;

  if (!e.shiftKey && e.key === "Enter" && userMessage) {
    if (isDesktop || screenWidth > 768) {
      handleOutgoingMessage(e);
    }
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

chatFullscreenBtn.addEventListener("click", () => {
  chatContainer.classList.toggle("fullscreen");
  if (chatFullscreenBtn.classList.toggle("active")) {
    chatFullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M456 224l-144 0c-13.3 0-24-10.7-24-24l0-144c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l40 40L442.3 5.7C446 2 450.9 0 456 0s10 2 13.7 5.7l36.7 36.7C510 46 512 50.9 512 56s-2 10-5.7 13.7L433 143l40 40c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8zm0 64c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-40 40 73.4 73.4c3.6 3.6 5.7 8.5 5.7 13.7s-2 10-5.7 13.7l-36.7 36.7C466 510 461.1 512 456 512s-10-2-13.7-5.7L369 433l-40 40c-6.9 6.9-17.2 8.9-26.2 5.2s-14.8-12.5-14.8-22.2l0-144c0-13.3 10.7-24 24-24l144 0zm-256 0c13.3 0 24 10.7 24 24l0 144c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-40-40L69.7 506.3C66 510 61.1 512 56 512s-10-2-13.7-5.7L5.7 469.7C2 466 0 461.1 0 456s2-10 5.7-13.7L79 369 39 329c-6.9-6.9-8.9-17.2-5.2-26.2s12.5-14.8 22.2-14.8l144 0zM56 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l40-40L5.7 69.7C2 66 0 61.1 0 56s2-10 5.7-13.7L42.3 5.7C46 2 50.9 0 56 0s10 2 13.7 5.7L143 79l40-40c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 144c0 13.3-10.7 24-24 24L56 224z"/></svg>`;
  } else {
    chatFullscreenBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M200 32L56 32C42.7 32 32 42.7 32 56l0 144c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l40-40 79 79-79 79L73 295c-6.9-6.9-17.2-8.9-26.2-5.2S32 302.3 32 312l0 144c0 13.3 10.7 24 24 24l144 0c9.7 0 18.5-5.8 22.2-14.8s1.7-19.3-5.2-26.2l-40-40 79-79 79 79-40 40c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8l144 0c13.3 0 24-10.7 24-24l0-144c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2l-40 40-79-79 79-79 40 40c6.9 6.9 17.2 8.9 26.2 5.2s14.8-12.5 14.8-22.2l0-144c0-13.3-10.7-24-24-24L312 32c-9.7 0-18.5 5.8-22.2 14.8s-1.7 19.3 5.2 26.2l40 40-79 79-79-79 40-40c6.9-6.9 8.9-17.2 5.2-26.2S209.7 32 200 32z"/></svg>`;
  }
});

attachmentsBtn.addEventListener("click", () => {
  fileUpload.click();
});

fileUpload.addEventListener("change", () => {
  const file = fileUpload.files[0];
  if (!file) return;

  const old = fileUploadWrapper.querySelector("img.attachment");
  if (old) old.remove();

  fileUploadWrapper.classList.add("show");

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target.result.split(",")[1];
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };

    console.log(userData.file);

    const img = document.createElement("img");
    img.src = e.target.result;
    img.classList.add("attachment");
    fileUploadWrapper.appendChild(img);

    const deleteAttachmentBtn = document.createElement("button");
    deleteAttachmentBtn.classList.add("delete-attachment");
    deleteAttachmentBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/></svg>`;
    deleteAttachmentBtn.addEventListener("click", () => {
      img.remove();
      deleteAttachmentBtn.remove();
      clearFile();
      userData.file = {
        data: null,
        mime_type: null,
      };
    });
    fileUploadWrapper.appendChild(deleteAttachmentBtn);
  };
  reader.readAsDataURL(file);
});
