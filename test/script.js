// const URLs = [];
// (async () => {
//   let prettier = await (
//     await fetch(chrome.runtime.getURL("./standalone.js"))
//   ).text();
//   let babel = await (
//     await fetch(chrome.runtime.getURL("./parser-babel.js"))
//   ).text();
//   let script = await (
//     await fetch(chrome.runtime.getURL("./finalScript.js"))
//   ).text();

//   console.log(prettier, babel, script);

//   chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//     if (tab.url.indexOf("https://script.google.com/home/projects/") == 0) {
//       chrome.scripting
//         .executeScript({
//           target: { tabId: tabId },
//           func: (prettier, babel, script) => {
//             const appendScript = async () => {
//               let element = document.querySelector(
//                 `[aria-label="Open the execution log panel"]`
//               ).parentElement.parentElement.parentElement.parentElement;

//               let formetBtn = document.createElement("div");
//               formetBtn.setAttribute(
//                 "style",
//                 `font-family: "Google Sans",Roboto,Arial,sans-serif;
//               font-size: .875rem;
//               letter-spacing: .0107142857em;
//               font-weight: 500;
//               text-transform: none;
//               color: rgb(95,99,104);
//               cursor: pointer;
//               margin-left: 0.5rem;`
//               );
//               formetBtn.innerText = "Init Formet";

//               element.appendChild(formetBtn);

//               document.documentElement.setAttribute(
//                 "onresett",
//                 `${prettier}
//               ${babel}
//               ${script}
//             `
//               );

//               formetBtn.onclick = ( ) => {
//                 document.documentElement.dispatchEvent(new CustomEvent('resett'));
//               }
//             };

//             window.addEventListener("load", appendScript);
//           },
//           args: [prettier, babel, script],
//         })
//         .then(() => {
//           console.log("script injected");
//           URLs.push(tab.url);
//         });
//     }
//   });
// })();

// chrome.scripting.registerContentScripts({
//   scripts: ["./test.js"],

//   callback: (...d) => {
//     console.log(d)
//   },
// })
