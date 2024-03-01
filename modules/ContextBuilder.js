class ContextBuilder {
  constructor() {
    this.context = [];
    this.contextThoughts = [];
    this.rightSection = document.getElementById("rightSection");
    this.contextBuilder = document.createElement("div");
    this.contextBuilder.id = "contextBuilder";
  }

  addThought(thought) {
    if (!this.context.length) {
      this.rightSection.append(this.contextBuilder);
    }

    const text = thought.lastChild.textContent;
    this.context.push(text);

    const thoughtClone = thought.cloneNode(true);
    thoughtClone.classList.add("contextThought");
    const thoughtHeader = thoughtClone.firstChild;
    thoughtHeader.innerHTML = "";

    const removeButton = document.createElement("div");
    removeButton.classList.add("thoughtButton");
    removeButton.innerText = "Remove";
    removeButton.addEventListener("click", (e) => {
        const index = this.context.indexOf(text);
        console.log("addThought", index);

        this.context.splice(index,1);
        this.contextThoughts.splice(index, 1)[0].remove();

        if(!this.context.length){
            this.contextBuilder.remove();
        }
    });
    thoughtHeader.appendChild(removeButton);

    this.contextThoughts.push(thoughtClone);
    this.contextBuilder.append(thoughtClone);
  }

  getContextPrompt(){
    var contextPrompt = "External Context: {";
    this.context.forEach(text => {
        contextPrompt += `, "${text}"`;
    });
    contextPrompt += "}";
    return contextPrompt;
  }
}

export default ContextBuilder;
