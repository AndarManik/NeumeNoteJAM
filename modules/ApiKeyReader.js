function displayApiInput(valueCallback, text = "Paste your OpenAI ") {
  const apiInputContainer = document.createElement("div");
  apiInputContainer.classList.add("apiInputContainer");
  apiInputContainer.textContent = text;

  const link = document.createElement("a");
  link.textContent = "API Key";
  link.href = "https://platform.openai.com/api-keys";
  link.setAttribute("target", "_blank");
  apiInputContainer.appendChild(link);

  const apiInput = document.createElement("input");
  apiInput.classList.add("apiInput");
  apiInputContainer.appendChild(apiInput);

  document.body.appendChild(apiInputContainer);

  apiInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      await valueCallback(apiInput.value);

      document.body.removeChild(apiInputContainer);
    }
  });
}
export default displayApiInput;
