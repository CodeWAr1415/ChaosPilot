import React from "react";

import "./input.css";

export default function InputBox() {
  const inputValueRef = React.useRef<HTMLParagraphElement>(null);
  const placeholderRef = React.useRef<HTMLParagraphElement>(null);

  let inputBoxTickId = -1;
  function doInputBoxTick() {
    if (!inputValueRef.current || !placeholderRef.current) {
      inputBoxTickId = window.requestAnimationFrame(doInputBoxTick);
      return;
    }

    const inputValue = inputValueRef.current, placeholder = placeholderRef.current;

    if (inputValue.innerText.match(/^(\n|\s)*$/g)) {
      placeholder.innerHTML = "";
      placeholder.classList.add("placeholder");
    }
    else {
      placeholder.classList.remove("placeholder");
    }

    inputBoxTickId = window.requestAnimationFrame(doInputBoxTick);
  }

  React.useEffect(() => {
    doInputBoxTick();

    return () => {
      window.cancelAnimationFrame(inputBoxTickId);
    }
  }, []);

  function onKeyDown(ev: React.KeyboardEvent) {
    if (!inputValueRef.current || !placeholderRef.current) {
      inputBoxTickId = window.requestAnimationFrame(doInputBoxTick);
      return;
    }

    const inputValue = inputValueRef.current, placeholder = placeholderRef.current;

    if (inputValue.innerText.match(/^(\n|\s)*$/g) && ev.key === "Backspace") {
      ev.preventDefault();
      return;
    }

    if (!ev.shiftKey && ev.key === "Enter") {
      window.dispatchEvent(new CustomEvent("cp:send-chat", {
        detail: {
          content: inputValue.innerText
        }
      }));
      placeholder.innerHTML = "";

      ev.preventDefault();
      return;
    }
  }

  return <div className="input-box sync-width">
    <div
      className="input-value"
      ref={inputValueRef}
      contentEditable
      suppressContentEditableWarning={true}
      onKeyDown={onKeyDown}
    >
      <p
        ref={placeholderRef}
        data-placeholder="為什麼黑客松的參賽者都那麼電？"
      ></p>
    </div>
    <button className="send-button reactive">
      <span className="m-symbol">
        &#xe163;
      </span>
    </button>
  </div>
}
