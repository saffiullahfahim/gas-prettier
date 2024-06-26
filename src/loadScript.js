let __tryToLoad = 0;
let __maxTryToLoad = 20;

const __script = async () => {
  if (!window.location.href.match(/\/edit$/)) {
    return;
  }

  console.log(`Try to load GAS Prettier Count: ${__tryToLoad}`);
  if (__tryToLoad > __maxTryToLoad) {
    console.log(`Failed to load GAS Prettier`);
    return;
  }

  if (!window.monaco) {
    __tryToLoad++;
    await new Promise((resolve) => setTimeout(resolve, 5 * 1000));
    return __script();
  }

  __tryToLoad = 0;

  console.log(`Start to load GAS Prettier after ${__tryToLoad} times try`);

  let div = document.createElement("pre");
  div.className = `prettier-snackbar info`;
  div.append("GAS Prettier Loaded!");
  document.body.appendChild(div);

  div.ondblclick = () => {
    div.remove();
  };

  div.className = `${div.className} show`;

  setTimeout(function () {
    div.className = div.className.replace("show", "");

    setTimeout(function () {
      div.remove();
    }, 1000);
  }, 10000);

  // add custom formattor for monaco editor
  const prettierFormat = (value, type) => {
    let prettierConfig = {
      js: {
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
      },
      html: {
        arrowParens: "always",
        bracketSameLine: false,
        bracketSpacing: true,
        semi: true,
        experimentalTernaries: false,
        singleQuote: false,
        jsxSingleQuote: false,
        quoteProps: "as-needed",
        trailingComma: "all",
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: "css",
        vueIndentScriptAndStyle: false,
        proseWrap: "preserve",
        insertPragma: false,
        printWidth: 80,
        requirePragma: false,
        tabWidth: 2,
        useTabs: false,
        embeddedLanguageFormatting: "auto",
        parser: "html",
        prettierVersion: "2.8.7",
        plugins: prettierPlugins,
      },
    };

    let formattedCode = value;
    let error = null;

    try {
      formattedCode = prettier.format(formattedCode, prettierConfig[type]);
    } catch (e) {
      error = e.message;
      console.log(error);
    }

    let div = document.createElement("pre");
    div.className = `prettier-snackbar ${error ? "warning" : "info"}`;
    div.append(error || "Formatted Successfully!");
    document.body.appendChild(div);

    div.ondblclick = () => {
      div.remove();
    };

    div.className = `${div.className} show`;

    setTimeout(function () {
      div.className = div.className.replace("show", "");

      setTimeout(function () {
        div.remove();
      }, 1000);
    }, 10000);

    return formattedCode;
  };

  const javascriptFormatProvider = {
    provideDocumentFormattingEdits(model, options, token) {
      return [
        {
          text: prettierFormat(model.getValue(), "js"), // put formatted text here
          range: model.getFullModelRange(),
        },
      ];
    },
  };

  const htmlFormatProvider = {
    provideDocumentFormattingEdits(model, options, token) {
      return [
        {
          text: prettierFormat(model.getValue(), "html"), // put formatted text here
          range: model.getFullModelRange(),
        },
      ];
    },
  };

  monaco.languages.registerDocumentFormattingEditProvider(
    "javascript",
    javascriptFormatProvider
  );

  monaco.languages.registerDocumentFormattingEditProvider(
    "html",
    htmlFormatProvider
  );

  self.PRETTIER_DEBUG = true;
};

window.addEventListener("load", __script);

navigation.addEventListener("navigate", __script);
