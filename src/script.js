const script = document.querySelector("#script");
const button = document.querySelector("#copyBtn");

fetch("./csx.js")
  .then((response) => {
    return response.text();
  })
  .then((data) => {
    script.value = data;
  });

button.addEventListener("click", () => {
  navigator.clipboard.writeText(script.value);
});
