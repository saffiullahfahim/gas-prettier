# GAS Extension

This is for GAS (Google Apps Script) extension where you can add prettier formatter. And save the file with prettier format and locally.

## Prerequisite
script need for paste the console
```js
const fetchLink = "https://saffiullahfahim.github.io/gas-extension/src/loadScript.js";

try {
  window.trustedTypes.createPolicy("default", {
    createHTML: (string) => string, // warning: this is unsafe!
    createScriptURL: (string) => string, // warning: this is unsafe!
    createScript: (string) => string, // warning: this is unsafe!
  });
} catch (err) {
  console.log(err);
}

fetch(fetchLink)
  .then((response) => {
    return response.text();
  })
  .then((data) => {
    let script = document.createElement("script");
    script.innerHTML = data;
    document.body.appendChild(script);
  });
```

## Features
- [x] prettier format
- [x] save the file with prettier format
- [ ] save file locally or remotely 
- [ ] push the file to github