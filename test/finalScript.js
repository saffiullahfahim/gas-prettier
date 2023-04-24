console.log(monaco);

let element = document.querySelector(
  `[aria-label="Open the execution log panel"]`
).parentElement.parentElement.parentElement.parentElement;

let formetBtn = document.createElement("div");
formetBtn.setAttribute(
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
formetBtn.innerText = "Formet File";

element.appendChild(formetBtn);

formetBtn.onclick = () => {
  console.log(monaco);
  console.log(prettier);
};
