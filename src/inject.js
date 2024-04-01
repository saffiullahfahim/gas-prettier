function injectScript(file_path, tag) {
  let node = document.getElementsByTagName(tag)[0];
  let script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", file_path);
  node.appendChild(script);
}

[
  "src/lib/prettier/standalone.js",
  "src/lib/prettier/parser-babel.js",
  "src/lib/prettier/parser-html.js",
  "src/loadScript.js",
].forEach((script) => injectScript(chrome.extension.getURL(script), "body"));
