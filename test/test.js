document.querySelector("h1").addEventListener("click", async () => {
  let blob = new Blob(["console.log(monaco)"], { type: "text/javascript" });
  let link = "http://127.0.0.1:5500/standalone.js"

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: (link) => {
        console.log(link);
        window.trustedTypes.createPolicy("default", {
          createHTML: (string) => string,
          createScriptURL: (string) => string, // warning: this is unsafe!
          createScript: (string) => string, // warning: this is unsafe!
        });
        let s = document.createElement("script");
        // s.nonce = document.querySelector("script").nonce;
        // s.innerHTML = `console.log(monaco)`;
        s.src = link;
        document.body.appendChild(s);
      },
      args: [link],
    },
    (d) => {
      console.log(d);
    }
  );
});
