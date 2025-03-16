import React from "react";

import "./todo.css";

interface TodoData {
  id: number,
  text: string,
  completed: boolean,
}

function TodoItem({ todo, updateTodo, deleteTodo }: {
  todo: TodoData;
  updateTodo: (id: number, updatedTodo: TodoData) => void;
  deleteTodo: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(todo.text);

  // 切換完成狀態
  const handleCheckboxChange = () => {
    updateTodo(todo.id, { ...todo, completed: !todo.completed });
  };

  // 雙擊文字進入編輯模式
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  // 監聽鍵盤事件，按 Enter 鍵儲存編輯結果
  const handleKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter") {
      if (editText.trim() === "") {
        alert("請輸入內容");
        return;
      }
      updateTodo(todo.id, { ...todo, text: editText });
      setIsEditing(false);
    }
  };

  return (
    <div className="todo-item sync-width">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleCheckboxChange}
      />
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="edit-input"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={handleDoubleClick}
          className={todo.completed ? "completed" : ""}
        >
          {todo.text}
        </span>
      )}
      <button onClick={() => deleteTodo(todo.id)} className="delete-button">
        <span className="m-symbol">
          &#xe872;
        </span>
      </button>
    </div>
  );
}

let autoId = 0;

function Todo() {
  const [todos, setTodos] = React.useState<TodoData[]>([]);
  const [newTodoText, setNewTodoText] = React.useState("");

  // 新增待辦項目
  const addTodo = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (newTodoText.trim() === "") {
      return;
    }
    setTodos((todos) => [{
      id: autoId++,
      text: newTodoText,
      completed: false,
    }, ...todos]);
    setNewTodoText("");
  };

  // 更新單一待辦項目 (包含切換完成狀態或修改內容)
  const updateTodo = (id: number, updatedTodo: TodoData) => {
    setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
  };

  // 刪除待辦項目
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  React.useEffect(() => {
    let externalAddTodo = (ev: CustomEventInit<{ name: string }>) => {
      setTodos((todos) => [{
        id: autoId++,
        text: ev.detail!.name,
        completed: false,
      }, ...todos]);
    }

    window.addEventListener("cp:add-todo", externalAddTodo);
    return () => {
      window.removeEventListener("cp:add-todo", externalAddTodo);
    };
  }, []);

  return (
    <div className="todo">
      <div className="todo-top">
        <h1 className="header">待辦清單</h1>
        <form onSubmit={addTodo} className="todo-form sync-width">
          <input
            type="text"
            placeholder="輸入待辦事項"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="todo-input"
          />
          <button type="submit" className="add-button">
            <span className="m-symbol">
              &#xe145;
            </span>
          </button>
        </form>
      </div>
      <div className="todos-list scrollbar">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            updateTodo={updateTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </div>
    </div>
  );
}

export default Todo;
