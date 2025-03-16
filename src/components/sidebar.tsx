import React from "react";

import "./sidebar.css";

const tabs = [
  {
    id: "chat",
    title: "Chat",
    icon: <>&#xe0ca;</>
  },
  {
    id: "clock",
    title: "Alarms",
    icon: <>&#xe855;</>
  },
  {
    id: "task",
    title: "Checklist",
    icon: <>&#xf0c5;</>
  },
  {
    id: "map",
    title: "Navigation",
    icon: <>&#xe55b;</>
  }
];

export default function Sidebar() {
  const [show, setShow] = React.useState(false);
  const [current, setCurrent] = React.useState(0);

  function toggleShow() {
    setShow(s => !s);
  }

  function hideSidebar() {
    toggleShow();
    window.dispatchEvent(new CustomEvent("cp:show-header-buttons"));
  }

  function resetChat() {
    window.dispatchEvent(new CustomEvent("cp:reset-chat"));
    selectTab(0);
  }

  function selectTab(index: number) {
    document.title = `${tabs[index].title} | ChaosPilot`
    setCurrent(index);
  }

  React.useEffect(() => {
    let tab = tabs[current];

    for (let el of document.querySelectorAll<HTMLDivElement>(".tabs > *")) {
      el.style.display = el.getAttribute("data-tab") === tab.id ? "" : "none";
    }
  }, [current]);

  function onExternalTabSwitch(ev: CustomEventInit<{ index: number }>) {
    setCurrent(ev.detail!.index);
  }

  React.useEffect(() => {
    window.addEventListener("cp:show-sidebar", toggleShow);
    window.addEventListener("cp:switch-tab", onExternalTabSwitch);
    return () => {
      window.removeEventListener("cp:show-sidebar", toggleShow);
      window.removeEventListener("cp:switch-tab", onExternalTabSwitch);
    }
  }, []);

  return <aside data-shown={show}>
    <div className="wrapper">
      <div className="sidebar-header">
        <div className="wrapper">
          <button className="sidebar-toggle reactive" onClick={hideSidebar}>
            <span className="symbol m-symbol">
              &#xf7e4;
            </span>
          </button>
          <div className="title">
            <h2></h2>
          </div>
          <button
            className="clear-chat reactive"
            onClick={resetChat}
          >
            <span className="symbol m-symbol">
              &#xe5d5;
            </span>
          </button>
        </div>
      </div>
      <div className="tab-switcher">
        <ul>
          {tabs.map((t, i) => <li key={i} onClick={() => selectTab(i)}>
            <div className="wrapper" data-selected={i === current}>
              <div className="icon">
                <span className="m-symbol">{t.icon}</span>
              </div>
              <div className="title">
                {t.title}
              </div>
            </div>
          </li>)}
        </ul>
      </div>
      <div className="sidebar-footer">
        &copy;
        <span>&nbsp;</span>
        <span>Code<b>WA</b>r 1415</span>
        <span>&nbsp;-&nbsp;</span>
        <span>HackDay 2025</span>
      </div>
    </div>
  </aside>
}
