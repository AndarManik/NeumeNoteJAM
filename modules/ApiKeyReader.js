function displayApiInput(valueCallback) {
    const apiInputContainer = document.createElement("div");
    apiInputContainer.classList.add("apiInputContainer");
    apiInputContainer.textContent = "Paste your OpenAI API key";
  
    const apiInput = document.createElement("input");
    apiInput.classList.add("apiInput");
    apiInputContainer.appendChild(apiInput);
  
    document.body.appendChild(apiInputContainer);
  
    apiInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        valueCallback(apiInput.value);
  
        document.body.removeChild(apiInputContainer);
      }
    });
  }
export default displayApiInput;