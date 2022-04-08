class TextMessage {
  constructor({ text, onComplete }) {
    this.text = text;
    this.onComplete = onComplete;
    this.element = null;
  }

  createElement() {
    // Create the element
    this.element = document.createElement("div");
    this.element.classList.add("TextMessage");

    this.element.innerHTML = `<p class="TextMessage_p"></p>
            <button class="TextMessage_button">Next</button>
            `;

    // Init the type writter effect
    this.revealingText = new RevealText({
      element: this.element.querySelector(".TextMessage_p"),
      text: this.text,
    });

    this.element.querySelector("button").addEventListener("click", () => {
      // Close the text message
      this.done();
    });

    this.actionListener = new KeyPressListener("Enter", () => {
      // listening to enter key on text screen
      this.done();
    });
  }

  done() {
    if (this.revealingText.isDone) {
      this.element.remove();
      this.onComplete();
      // you dont want to keep listening for Enter key after text message is closed
      this.actionListener.unbind();
    } else {
      this.revealingText.warpToEnd();
    }
  }

  init(container) {
    this.createElement();
    container.appendChild(this.element);
    this.revealingText.init();
  }
}
