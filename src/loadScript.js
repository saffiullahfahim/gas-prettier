const __script = async () => {
  /**
   * Fetches prettier script and adds as script tag to the document body
   * Fetches babel script and adds as script tag to the document body
   */

  if (window.prettier) return;

  let prettierScriptResponse = await (
    await fetch("https://unpkg.com/prettier@2.8.7/standalone.js")
  ).text();

  let babelScriptResponse = await (
    await fetch("https://unpkg.com/prettier@2.8.7/parser-babel.js")
  ).text();

  const script = document.createElement("script");
  script.innerHTML =
    prettierScriptResponse.replace(
      `if(typeof exports=="object"&&typeof module=="object")module.exports=e();else if(typeof define=="function"&&define.amd)define(e);else{var f=typeof globalThis<"u"?globalThis:typeof global<"u"?global:typeof self<"u"?self:this||{};f.prettier=e()}`,
      "window.prettier=e()"
    ) +
    babelScriptResponse.replace(
      `if(typeof exports=="object"&&typeof module=="object")module.exports=e();else if(typeof define=="function"&&define.amd)define(e);else{var i=typeof globalThis<"u"?globalThis:typeof global<"u"?global:typeof self<"u"?self:this||{};i.prettierPlugins=i.prettierPlugins||{},i.prettierPlugins.babel=e()}`,
      "window.prettierPlugins=window.prettierPlugins||{},window.prettierPlugins.babel=e()"
    );
  document.body.insertBefore(script, document.body.lastChild);

  // add custom formattor for monaco editor
  const prettierFormat = (value) => {
    let prettierConfig = {
      arrowParens: "always",
      bracketSameLine: false,
      bracketSpacing: true,
      embeddedLanguageFormatting: "auto",
      htmlWhitespaceSensitivity: "css",
      insertPragma: false,
      jsxSingleQuote: false,
      printWidth: 80,
      proseWrap: "preserve",
      quoteProps: "as-needed",
      requirePragma: false,
      semi: true,
      singleAttributePerLine: false,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "es5",
      useTabs: false,
      vueIndentScriptAndStyle: false,
      parser: "babel",
      prettierVersion: "2.8.7",
      plugins: prettierPlugins,
    };

    let formattedCode = prettier.format(value, prettierConfig);

    return formattedCode;
  };

  const javascriptFormatProvider = {
    provideDocumentFormattingEdits(model, options, token) {
      return [
        {
          text: prettierFormat(model.getValue()), // put formatted text here
          range: model.getFullModelRange(),
        },
      ];
    },
  };
  const languageId = "javascript";

  monaco.languages.registerDocumentFormattingEditProvider(
    languageId,
    javascriptFormatProvider
  );

  // Fetches the script that will be injected into the document body

  let element = document.querySelector(
    `[aria-label="Open the execution log panel"]`
  ).parentElement.parentElement.parentElement.parentElement;

  let formatBtn = document.createElement("div");
  formatBtn.setAttribute(
    "style",
    `font-family: "Google Sans",Roboto,Arial,sans-serif;
    font-size: .875rem;
    letter-spacing: .0107142857em;
    font-weight: 500;
    text-transform: none;
    color: rgb(95,99,104);
    cursor: pointer;
    margin-left: 0.5rem;`
  );
  formatBtn.innerText = "Format";

  element.appendChild(formatBtn);

  formatBtn.onclick = () => {
    const files = document
      .querySelector(`[aria-label="Project files"]`)
      .querySelectorAll("li");

    let filesObj = [];

    files.forEach((file, index) => {
      let fileName = file.innerText;
      let fileClass = file.getAttribute("class");
      filesObj.push({
        fileName,
        fileClassCount: fileClass.split(" ").length,
        index,
      });
    });

    filesObj.sort((a, b) => b.fileClassCount - a.fileClassCount);

    let activeFileValue = monaco.editor.getModels()[0].getValue();

    let prettierConfig = {
      arrowParens: "always",
      bracketSameLine: false,
      bracketSpacing: true,
      embeddedLanguageFormatting: "auto",
      htmlWhitespaceSensitivity: "css",
      insertPragma: false,
      jsxSingleQuote: false,
      printWidth: 80,
      proseWrap: "preserve",
      quoteProps: "as-needed",
      requirePragma: false,
      semi: true,
      singleAttributePerLine: false,
      singleQuote: false,
      tabWidth: 2,
      trailingComma: "es5",
      useTabs: false,
      vueIndentScriptAndStyle: false,
      parser: "babel",
      prettierVersion: "2.8.7",
      plugins: prettierPlugins,
    };

    let formattedCode = prettier.format(activeFileValue, prettierConfig);

    monaco.editor.getModels()[0].setValue(formattedCode);
  };
};

__script();
