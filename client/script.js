import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
  console.log("loader element: ", element);
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
  return loadInterval;
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqeId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  const uniqueId = generateUniqeId();
  chatContainer.innerHTML += chatStripe(true, "", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);
  const intervalId = loader(messageDiv);

  const response = await fetch("http://localhost:5500/", {
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    mode: "cors",
    method: "POST",
    body: JSON.stringify({ prompt: data.get("prompt") }),
  });

  if (response.ok) {
    const data = await response.json();
    clearInterval(intervalId);
    const parsedData = data.bot.trim();
    messageDiv.innerHTML = "";
    typeText(messageDiv, parsedData);
  } else {
    clearInterval(intervalId);

    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.key === "Enter" || e.keyCode == 13) {
    handleSubmit(e);
  }
});
