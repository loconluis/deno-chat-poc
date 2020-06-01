// Init ws variable
let ws;
// Message Box
const messageBox = document.getElementById("message-read-box");
// Button send message
const sendButton = document.getElementById("send-button");
sendButton.onclick = send;
const input = document.getElementById("input");
input.addEventListener("keydown", keyDownEvent);
/*
const closeButton = document.getElementById("closeButton");
closeButton.onclick = close;
const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;
const status = document.getElementById("status");
*/

// Connect function of the websocket
function handleConnectWS() {
  if (ws) ws.close();
  // Creating the socket
  ws = new WebSocket(`ws://${location.host}/ws`);

  // Change state when websocket is open
  ws.addEventListener("open", () => {
    console.log("open", ws);
    applyState({ connected: true });
  });

  // Handle Event Message
  ws.addEventListener("message", ({ data }) => {
    messageBox.appendChild(messageDom(data));
  });

  // Change state when websocket is open
  ws.addEventListener("close", () => {
    setState({ connect: false });
  });
}

// Function to render a message on the screen 
function createMessageDOM(message) {
  const li = document.createElement("li");
  li.class = "message";
  li.innerText = message;
  return li;
}

// Send function when clicks on the button
function send() {
  const message = input.value;
  ws.send(message);
  setState({ inputValue: "" });
}

// Handle Event of key down event
function keyDownEvent(e) {
  // 13 is enter key
  if (e.keyCode === 13) {
    return send();
  }
}

// Handle State
function setState({ connected, status, inputValue }) {
  if (inputValue != null) {
    input.value = inputValue;
  }

  if (connected != null) {
    if (connected) {
      sendButton.disabled = false;
    } else {
      sendButton.disabled = true;
    }
  }
}

function close() {
  ws.close();
  setState({ connected: false });
}


handleConnectWS();
