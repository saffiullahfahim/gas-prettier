let __tryToLoad = 0;
let __maxTryToLoad = 20;

let cachedSuggestions = [];
let lastId;
let pplxSocket;

/**
 * inspiration from:
 * 1. (Building Copilot On The Web) https://spencerporter2.medium.com/building-copilot-on-the-web-f090ceb9b20b
 * 2. Google Apps Script Copilot (https://gscopilot.com/)
 */

function initInlineSuggestions() {
  jsWireMonacoEditor.updateOptions({ inlineSuggest: { enabled: !0 } });

  window.monaco.languages.registerInlineCompletionsProvider("javascript", {
    provideInlineCompletions: async function (e, t, n, o) {
      const console = {
        log: function () {},
      };
      try {
        if (o.isCancellationRequested) return { items: [] };
        const n = e.getValue();
        await delay(2 * 1000);
        const a = e.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: t.lineNumber,
            endColumn: t.column,
          }),
          u = e.getValueInRange({
            startLineNumber: t.lineNumber,
            startColumn: t.column,
            endLineNumber: e.getLineCount(),
            endColumn: e.getLineLength(t.lineNumber),
          }),
          l = e.getLineContent(t.lineNumber),
          g = cachedSuggestions.filter((t) =>
            t?.insertText?.startsWith(e?.getValueInRange(t?.range))
          );
        console.log("suggest", g), console.log("position", t);
        var i = g.filter(
          (e) =>
            e.range.startLineNumber == t.lineNumber &&
            e.range.startColumn >= t.column - 3
        );
        console.log("filtered", i);
        if ((i = i.filter((e) => "" !== e.insertText.trim())).length)
          return { items: i };
        console.log("not found in cache");
        if (n !== e.getValue()) return { items: [] };
        console.log("checkSuggestionNeeded");
        var s = await checkSuggestionNeeded(a, u, { model: e, position: t });
        console.log("checkSuggestionNeeded", s);
        if (!s.allow) return { items: [] };
        var r = await getAiSuggestions(s);
        if (0 === r.length) return { items: [] };
        const d = (r = r.map((e) => removeExtraSuggestion(e))).map((e) => ({
          insertText: e,
          text: e,
          kind: monaco.languages.CompletionItemKind.Snippet,
          range: new window.monaco.Range(
            t.lineNumber,
            t.column,
            t.lineNumber,
            t.column
          ),
        }));
        var c = d.map((e) => ((e.lastLine = l), e));
        return (cachedSuggestions = c), { items: d };
      } catch (e) {
        return { items: [] };
      }
    },
    freeInlineCompletions: function (e) {},
  });
}

async function checkSuggestionNeeded(e, t, n) {
  return e?.trim()?.match(/(\/\/(.*)\?)$/gi)
    ? {
        allow: !0,
        question: e
          .trim()
          .match(/(\/\/(.*)\?)$/gi)[0]
          .replace("//", "")
          .trim(),
        prefix: "",
        suffix: "",
        reason: "question found",
      }
    : e?.trim()?.match(/^(\/\/(.*))$/gi)
    ? {
        allow: !1,
        question: "",
        prefix: "",
        suffix: "",
        reason: "comment found",
      }
    : "" === e.trim() && "" === t.trim()
    ? {
        allow: !1,
        question: "",
        suffix: "",
        prefix: "",
        reason: "empty editor",
      }
    : "" === e.trim()
    ? {
        allow: !1,
        question: "",
        suffix: "",
        prefix: "",
        reason: "empty before cursor",
      }
    : isFunctionClosingBrace(e)
    ? {
        allow: !1,
        question: "",
        prefix: "",
        suffix: "",
        reason: "function closing brace",
      }
    : { allow: !0, question: "", suffix: t, prefix: e, reason: "default" };
}

function isFunctionClosingBrace(e) {
  const t = [];
  for (let n = 0; n < e.length; n++) {
    const o = e[n];
    if ("{" === o) t.push(n);
    else if ("}" === o) {
      if (0 === t.length) return !1;
      if ("function" === e[t.pop() - 1].trim()) return !0;
    }
  }

  var n = (e = e.trim())[e.length - 1];
  return 0 === t.length && ["}", ";"].includes(n);
}

function removeExtraSuggestion(e) {
  var t = e.split("}");
  return 1 === t.length
    ? e
    : t.length > 1 &&
      ("" !== t[t.length - 1].trim() || t[t.length - 1].includes("function"))
    ? (t.pop(), t.join("}") + "}")
    : e;
}

function extractCode(e) {
  return new Promise((t) => {
    const n = e.match(/```([\s\S]+?)```/gi);
    if (n && n?.length) {
      var o = "";
      n.map((e) => {
        var t =
          /```(javascript|typescript|ts|js|python|gs|scss|html|php|java)?([\s\S]+?)```/gi.exec(
            e
          );
        t &&
          t.length &&
          (o +=
            e
              .replace(
                /```(javascript|typescript|ts|js|python|gs|scss|html|php|java)?([\s\S]+?)```/gi,
                t.length > 2 ? "$2" : "$1"
              )
              .trim() + "\n\n");
      }),
        t(o);
    } else t(e);
  });
}

async function getAiSuggestions(e) {
  let isEnable = document.getElementById("pplx-toggle")?.checked;
  if (!isEnable) {
    console.log("Ai Completion is disabled");
    return [];
  }
  lastId = new Date().getTime();
  let obj = { prefix: e.prefix, suffix: e.suffix, question: e.question };
  console.log("getAiSuggestions", obj);

  let model = "llama-3.1-70b-instruct";

  pplxSocket.emit("perplexity_labs", {
    model: model,
    messages: [
      {
        role: "user",
        content: `## Task: Code Completion
  
    ### Language: Google Apps Script
    ### TextBeforeCursor: ${obj.prefix}
    ### TextBeforeCursorOnCurrentLine: ${obj.suffix}
    ### Promt: ${obj.question}

    ### Instructions:
    - You always add "###${lastId}###" on start.
    - You are a world class coding assistant.
    - Given the current text, context, and the last character of the user input, provide a suggestion for code completion.
    - The suggestion must be based on the current text, as well as the text before the cursor.
    - This is not a conversation, so please do not ask questions or prompt for additional information.
    
    ### Notes
    - NEVER INCLUDE ANY MARKDOWN IN THE RESPONSE - THIS MEANS CODEBLOCKS AS WELL.
    - Never include any annotations such as "# Suggestion:" or "# Suggestions:".
    - Newlines should be included after any of the following characters: "{", "[", "(", ")", "]", "}", and ",".
    - Never suggest a newline after a space or newline.
    - Ensure that newline suggestions follow the same indentation as the current line.
    - The suggestion must start with the last character of the current user input.
    - Only ever return the code snippet, do not return any markdown unless it is part of the code snippet.
    - Do not return any code that is already present in the current text.
    - Do not return anything that is not valid code.
    - If you do not have a suggestion, return an empty string.`,
        priority: 1,
      },
    ],
  });

  return new Promise(async (t) => {
    pplxSocket.on(`${model}_query_progress`, async (data) => {
      let output = data?.output;

      let isFinal = data?.final;
      let status = data?.status;

      if (output && output.indexOf(`###${lastId}###`) == -1) {
        if (output.length > 0) {
          return t([]);
        }
        return;
      }

      let finalOutput = await extractCode(
        output?.replace(new RegExp(`###${lastId}###\n|###${lastId}###`), "") ||
          ""
      );

      if (status == "error") {
        console.log("Error", finalOutput);
        return t([]);
      }

      if (status) {
        console.log(finalOutput);
        t([finalOutput]);
        applied = true;
      }
    });
  });
}

function delay(e) {
  return new Promise((t) => setTimeout(t, e));
}

async function pplxLoad() {
  pplxSocket = io("https://www.perplexity.ai", {
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

    let finalDiv = document.querySelector(
      `[aria-label="Run the selected function"]`
    )?.parentElement?.parentElement?.parentElement?.parentElement
      ?.parentElement;

    if (finalDiv) {
      let div = document.createElement("div");
      div.className = "pplx-toggle-div";

      let textDiv = document.createElement("div");
      textDiv.append("Ai Completion");
      div.appendChild(textDiv);

      let toggleSwitch = document.createElement("div");
      toggleSwitch.className = "toggle-switch";

      let input = document.createElement("input");
      input.className = "toggle-input";
      input.id = "pplx-toggle";
      input.type = "checkbox";
      input.checked = localStorage.getItem("pplx-toggle") === "true";
      input.onchange = (e) => {
        localStorage.setItem("pplx-toggle", e.target.checked.toString());
      };

      let label = document.createElement("label");
      label.className = "toggle-label";
      label.htmlFor = "pplx-toggle";

      toggleSwitch.appendChild(input);
      toggleSwitch.appendChild(label);

      div.appendChild(toggleSwitch);

      finalDiv.appendChild(div);
    }
    initInlineSuggestions();
  });

  pplxSocket.on("disconnect", (e) => {
    console.log("Socket disconnected");
  });

  pplxSocket.on("connect_error", async (err) => {
    console.log("pplxSocket connect_error", err.message);
  });
}

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

  if (window.io) {
    pplxLoad();
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
