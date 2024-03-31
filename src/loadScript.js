const __script = async () => {
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

    let formattedCode = prettier.format(value, prettierConfig[type]);

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
};

window.addEventListener("load", __script);
