import React from "react";

import "./alarm.css";

interface AlarmData {
  id: number,
  time: string,
  enabled: boolean
}

const AlarmItem = ({ alarm, updateAlarm, deleteAlarm }: {
  alarm: AlarmData;
  updateAlarm: (id: number, updatedAlarm: AlarmData) => void;
  deleteAlarm: (id: number) => void;
}) => {
  const [time, setTime] = React.useState(alarm.time);

  // 切換鬧鐘啟用狀態
  const handleToggle = () => {
    updateAlarm(alarm.id, { ...alarm, enabled: !alarm.enabled });
  };

  // 調整鬧鐘時間
  const handleTimeChange = (ev: React.ChangeEvent) => {
    let el = ev.target as HTMLInputElement;
    setTime(el.value);
    updateAlarm(alarm.id, { ...alarm, time: el.value });
  };

  return (
    <div className="alarm-item sync-width">
      <input
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="alarm-time-input"
      />
      <div className="toggle-switch">
        <input
          type="checkbox"
          id={`toggle-${alarm.id}`}
          checked={alarm.enabled}
          onChange={handleToggle}
        />
        <label htmlFor={`toggle-${alarm.id}`}></label>
      </div>
      <button onClick={() => deleteAlarm(alarm.id)} className="delete-button">
        <span className="m-symbol">
          &#xe872;
        </span>
      </button>
    </div>
  );
};

let autoId = 0;

function Alarm() {
  const [alarms, setAlarms] = React.useState<AlarmData[]>([]);
  const [newAlarmTime, setNewAlarmTime] = React.useState("");

  // 新增鬧鐘
  const addAlarm = (ev: React.FormEvent) => {
    ev.preventDefault();
    // 若格式不正確就不新增
    const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(newAlarmTime)) {
      return;
    }
    setAlarms((alarms) => [{
      id: autoId++,
      time: newAlarmTime,
      enabled: true
    }, ...alarms]);
    setNewAlarmTime("");
  };

  // 更新單一鬧鐘 (調整時間或切換開關)
  const updateAlarm = (id: number, updatedAlarm: AlarmData) => {
    setAlarms(alarms.map((alarm) => (alarm.id === id ? updatedAlarm : alarm)));
  };

  // 刪除鬧鐘
  const deleteAlarm = (id: number) => {
    setAlarms(alarms.filter((alarm) => alarm.id !== id));
  };

  // 定時檢查鬧鐘時間，並通知使用者
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // 取得目前時間，格式為 "HH:mm"
      const currentTime = now.toTimeString().slice(0, 5);
      alarms.forEach((alarm) => {
        if (alarm.enabled && alarm.time === currentTime) {
          alert(`鬧鐘：${alarm.time}`);

          updateAlarm(alarm.id, { ...alarm, enabled: false });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms]);

  React.useEffect(() => {
    let externalAddAlarm = (ev: CustomEventInit<{ time: string }>) => {
      setAlarms((alarms) => [{
        id: autoId++,
        time: ev.detail!.time,
        enabled: true
      }, ...alarms]);
    }

    window.addEventListener("cp:add-alarm", externalAddAlarm);
    return () => {
      window.removeEventListener("cp:add-alarm", externalAddAlarm);
    };
  }, []);

  return (
    <div className="alarm">
      <div className="alarm-top">
        <h1 className="header">鬧鐘</h1>
        <form onSubmit={addAlarm} className="alarm-form sync-width">
          <input
            type="time"
            placeholder="HH:mm"
            pattern="^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
            value={newAlarmTime}
            onChange={(e) => setNewAlarmTime(e.target.value)}
            className="time-input"
          />
          <button type="submit" className="add-button">
            <span className="m-symbol">
              &#xe145;
            </span>
          </button>
        </form>
      </div>
      <div className="alarms-list scrollbar">
        {alarms.map((alarm) => (
          <AlarmItem
            key={alarm.id}
            alarm={alarm}
            updateAlarm={updateAlarm}
            deleteAlarm={deleteAlarm}
          />
        ))}
      </div>
    </div>
  );
}

export default Alarm;
