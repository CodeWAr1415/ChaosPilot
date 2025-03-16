import React from "react";

import "./input.css";

export default function InputBox(props: { blockInput: boolean }) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function sendChat() {
    if (!textareaRef.current) return;
    let el = textareaRef.current;

    window.dispatchEvent(new CustomEvent("cp:send-chat", {
      detail: {
        content: el.value
      }
    }));
    el.value = "";
  }

  function calculateHeight() {
    if (!textareaRef.current) return;
    let el = textareaRef.current;

    let height = (
      Array.from(el.value).reduce((v, c) => c === "\n" ? v + 1 : v, 0) + 1
    ) * 24;

    el.style.height = Math.min(height, 24 * 10) + "px";
  };

  function onKeyDown(ev: React.KeyboardEvent) {
    let el = ev.target as HTMLTextAreaElement;

    if (!ev.shiftKey && ev.key === "Enter") {
      ev.preventDefault();

      if (!props.blockInput && el.value.match(/./)) {
        sendChat();
      }
    }

    window.requestAnimationFrame(calculateHeight);
  }

  function onClick(ev: React.MouseEvent) {
    let el = ev.target as HTMLInputElement;
    if (el.disabled) return;

    sendChat();
    window.requestAnimationFrame(calculateHeight);
  }

  return <label htmlFor="input-textarea">
    <div className="input-box sync-width">
      <textarea
        id="input-textarea"
        ref={textareaRef}
        autoFocus
        className="scrollbar"
        placeholder="為什麼黑客松的參賽者都那麼電？"
        onKeyDown={onKeyDown}
        style={{
          userSelect: textareaRef.current && 
          textareaRef.current.textContent
            ? "auto"
            : "none"
        }}
      ></textarea>
      <button className="send-button reactive" disabled={props.blockInput} onClick={onClick}>
        <span className="m-icon">
          &#xe163;
        </span>
      </button>
    </div>
  </label>
}
