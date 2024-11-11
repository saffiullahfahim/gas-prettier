async function pplxLoad() {
  if (window.parent) {
    window.parent.postMessage(
      {
        type: "INIT",
      },
      "*"
    );
  } else {
    console.error("Parent window not found");
    return;
  }

  let pplxSocket = io("https://www.perplexity.ai", {
    auth: {
      jwt: "anonymous-ask-user",
    },
    reconnection: !0,
    reconnectionDelay: 1e3,
    reconnectionDelayMax: 3e4,
    reconnectionAttempts: 999,
    withCredentials: true,
  });

  pplxSocket.on("connect", async () => {
    console.log("Socket connected");

    window.parent.postMessage(
      {
        type: "CONNECTED",
      },
      "*"
    );
  });

  pplxSocket.on("disconnect", (e) => {
    console.log("Socket disconnected");
  });

  pplxSocket.on("connect_error", async (err) => {
    console.log("pplxSocket connect_error", err.message);
  });

  // listen for the response
  window.addEventListener("message", function (event) {
    if (event.data.emit && event.data.payload) {
      pplxSocket.emit(event.data.emit, event.data.payload);
    }
  });

  pplxSocket.onAny((event, ...args) => {
    window.parent.postMessage(
      {
        type: "RESPONSE",
        event: event,
        args: args,
      },
      "*"
    );
  });
}

pplxLoad();
