import React from "react";
import toast from "react-hot-toast";

import "./header.css";

import avatarUrl from "../images/avatar.png";

export default function Header() {
  const [showButtons, setShowButtons] = React.useState(true);

  function showSidebar() {
    window.dispatchEvent(new CustomEvent("cp:show-sidebar"));
    setShowButtons(false);
  }

  function resetChat() {
    window.dispatchEvent(new CustomEvent("cp:reset-chat"));
    window.dispatchEvent(new CustomEvent("cp:switch-tab", {
      detail: {
        index: 0
      }
    }));
  }

  React.useEffect(() => {
    function showButton() {
      setShowButtons(true);
    }

    window.addEventListener("cp:show-header-buttons", showButton);
    return () => {
      window.removeEventListener("cp:show-header-buttons", showButton);
    }
  })

  return <header>
    <div className="wrapper">
      <div className="buttons" data-visible={showButtons}>
        <button 
          className="sidebar-toggle reactive" 
          onClick={showSidebar} 
        >
          <span className="symbol m-symbol">
            &#xf7e4;
          </span>
        </button>
        <button 
          className="clear-chat reactive"
          onClick={resetChat}
        >
          <span className="symbol m-symbol">
            &#xe5d5;
          </span>
        </button>
      </div>
      <div className="title">
        <span className="icon m-symbol">&#xe625;</span>
        <h1>ChaosPilot</h1>
      </div>
      <div className="avatar reactive" onClick={() => toast.error("那傢伙竟然敢無視燈！")}>
        <img src={avatarUrl} />
      </div>
    </div>
  </header>;
}
