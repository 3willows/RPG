class KeyboardMenu {
  constructor(config = {}) {
    this.options = [];
    this.up = null;
    this.down = null;
    this.prevFocus = null;
    this.descriptionContainer = config.container;
  }

  setOptions(options) {
    this.options = options;
    this.element.innerHTML = this.options
      .map((option, index) => {
        const disabledAttr = option.disabled ? "disabled" : "";

        return `
                <div class="option">
                    <button ${disabledAttr} data-button="${index}" data-description="${
          option.description
        }">
                        ${option.label}
                    </button>
                        <span class="right">${
                          option.right ? option.right() : ""
                        }</span>
                </div>
            `;
      })
      .join("");

    //   adding different listener on each button
    this.element.querySelectorAll("button").forEach((button) => {
      const chosenOption = this.options[Number(button.dataset.button)];
      button.addEventListener("click", () => {
        chosenOption.handler();
      });
      button.addEventListener("mouseenter", () => {
        button.focus();
      });
      button.addEventListener("focus", () => {
        this.prevFocus = button;
        this.descriptionElementText.innerText = chosenOption.description;
      });
    });

    // auto focusing the first available option in the menu
    setTimeout(() => {
      this.element.querySelector("button[data-button]:not([disabled])").focus();
    }, 10);
  }

  end() {
    //   remove elements
    this.element.remove();
    this.descriptionElement.remove();

    // cleanup bindings (removing uncessary listeners on the document)
    this.down.unbind();
    this.up.unbind();
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("KeyboardMenu");

    // Description box element
    this.descriptionElement = document.createElement("div");
    this.descriptionElement.classList.add("DescriptionBox");
    this.descriptionElement.innerHTML = `<p>I love you!!</p>`;
    this.descriptionElementText = this.descriptionElement.querySelector("p");

    // using the menu using arrow down key
    this.down = new KeyPressListener("ArrowDown", () => {
      const prevButtonIndex = Number(this.prevFocus.dataset.button);
      let nextButtonIndex = prevButtonIndex + 1;
      while (nextButtonIndex !== prevButtonIndex) {
        if (nextButtonIndex >= this.options.length) {
          nextButtonIndex = 0;
          continue;
        }
        if (!this.options[nextButtonIndex].disabled) break;
        nextButtonIndex += 1;
      }
      this.element.querySelectorAll("button").forEach((button) => {
        if (button.dataset.button === String(nextButtonIndex)) {
          button.focus();
          return;
        }
      });
    });
    // using the menu using arrow up key
    this.up = new KeyPressListener("ArrowUp", () => {
      const prevButtonIndex = Number(this.prevFocus.dataset.button);
      let nextButtonIndex = prevButtonIndex - 1;
      while (nextButtonIndex !== prevButtonIndex) {
        if (nextButtonIndex <= -1) {
          nextButtonIndex = this.options.length - 1;
          continue;
        }
        if (!this.options[nextButtonIndex].disabled) break;
        nextButtonIndex -= 1;
      }
      this.element.querySelectorAll("button").forEach((button) => {
        if (button.dataset.button === String(nextButtonIndex)) {
          button.focus();
          return;
        }
      });
    });
  }

  init(container) {
    this.createElement();
    (this.descriptionContainer || container).appendChild(
      this.descriptionElement
    );
    container.appendChild(this.element);
  }
}
