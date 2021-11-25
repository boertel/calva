import { useState, ComponentPropsWithoutRef, useEffect, useCallback, useRef } from "react";
import cn from "classnames";
import dayjs from "@/dayjs";
import {
  EditIcon,
  DoneIcon,
  DeleteIcon,
  TodoDelayedIcon,
  TodoDoneIcon,
  TodoTodoIcon,
  TodoCancelledIcon,
} from "@/icons";
import type { Todo, TodoStatus } from "@/todos";
import { useTodos } from "@/todos";

function useEventListener(type: string, listener: (evt: any) => void) {
  useEffect(() => {
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type, listener]);
}

function choice<T>(choices: T[]): T {
  const index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export function TodoList() {
  const { todos, addTodo } = useTodos();
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  const input = useRef<HTMLInputElement>(null);

  useEventListener(
    "keydown",
    useCallback((evt: KeyboardEvent) => {
      // @ts-ignore
      if (evt.key === "i" && input.current && evt?.target?.tagName !== "INPUT") {
        evt.preventDefault();
        input.current.focus();
      }
    }, [])
  );

  function onKeyDown(evt: React.KeyboardEvent<HTMLInputElement>) {
    if (evt.key === "Escape") {
      evt.currentTarget.blur();
    } else if (evt.key === "Enter" || evt.key === "Tab") {
      save(evt.currentTarget.value, evt.metaKey ? "done" : "todo");
      evt.currentTarget.value = "";
    }
  }

  function onFocus(evt: React.SyntheticEvent<HTMLInputElement>) {
    setIsEmpty(false);
  }

  function save(value: string, status: TodoStatus = "todo") {
    if (value.length > 0) {
      addTodo({
        status,
        text: value,
      });
    } else {
      setIsEmpty(true);
    }
  }

  const [placeholder, setPlaceholder] = useState<string>("");

  useEffect(() => {
    const placeholders = [
      "What do you have to do today?",
      "Any task for the day?",
      "Add a task, and feel the satisfaction of completing it!",
    ];
    setPlaceholder(choice<string>(placeholders));
  }, [setPlaceholder]);

  const key = dayjs().format("YYYY-MM-DD");
  return (
    <ul className="pt-6 pb-4">
      {todos
        .filter(({ date }: Todo) => dayjs.utc(date).format("YYYY-MM-DD") === key)
        .map(({ id, status, text }: Todo) => (
          <TodoItem key={id} id={id} status={status} text={text} />
        ))}
      <li className="sticky bottom-0 px-4 pb-2 bg-black mt-2">
        <input
          type="text"
          ref={input}
          placeholder={placeholder}
          className={cn(
            "md:pl-7 bg-transparent focus:ring-2 ring-purple-500 focus:border-purple-500 p-2 font-mono rounded-md focus:outline-none w-full animate placeholder-purple-200",
            isEmpty && "animate-shake"
          )}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
      </li>
    </ul>
  );
}

function TodoItem({ status, text, id }: Todo) {
  const { updateTodo } = useTodos(false);

  function onContextMenu(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    updateTodo({
      id,
      status: status === "delayed" ? "todo" : "delayed",
    } as Todo);
  }

  function onClick(evt: React.MouseEvent<HTMLElement>) {
    evt.preventDefault();
    updateTodo({
      id,
      status: status === "done" ? "todo" : "done",
    } as Todo);
  }

  function onBlur(evt: React.SyntheticEvent<HTMLInputElement>) {
    const { value } = evt.currentTarget;
    if (value !== text) {
      updateTodo({
        id,
        text: value,
      } as Todo);
    }
  }

  function onDelete(evt: React.SyntheticEvent<HTMLButtonElement>) {
    evt.preventDefault();
    updateTodo({
      id,
      status: status === "cancelled" ? "todo" : "cancelled",
    } as Todo);
  }

  return (
    <li className="pl-2 pr-4">
      <Label
        className={cn(
          "transition-opacity",
          ["delayed", "done", "cancelled"].includes(status)
            ? "text-gray-500 hover:text-gray-600"
            : "hover:text-purple-300",
          { "opacity-30 hover:opacity-100": status === "delayed" }
        )}
      >
        <Input onContextMenu={onContextMenu} onClick={onClick} onBlur={onBlur} onDelete={onDelete} status={status}>
          {text}
        </Input>
      </Label>
    </li>
  );
}

function Input({
  className,
  children,
  onClick,
  onBlur,
  onContextMenu,
  onDelete,
  status,
}: {
  className?: string;
  onClick: any;
  onContextMenu: any;
  onDelete: any;
  onBlur: any;
  children: string;
  status: TodoStatus;
}) {
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const input = useRef<HTMLInputElement>(null);

  function handleOnBlur(evt: React.SyntheticEvent<HTMLInputElement>) {
    setIsEditable(false);
    if (onBlur) {
      onBlur(evt);
    }
  }

  function handleOnKeyDown(evt: React.SyntheticEvent<HTMLInputElement>) {
    const { value } = evt.currentTarget;
    // @ts-ignore
    if (evt.key === "Enter") {
      if (value.length > 0) {
        onBlur(evt);
        if (input.current) {
          input.current.blur();
        }
        setIsEditable(false);
      }
      // @ts-ignore
    } else if (evt.key === "Escape" && input.current) {
      if (input.current) {
        input.current.blur();
      }
      setIsEditable(false);
    }
  }

  function handleOnClick(evt: React.SyntheticEvent<HTMLInputElement>) {
    evt.stopPropagation();
  }

  const Icon = isEditable ? DoneIcon : EditIcon;

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn("group w-full flex items-center justify-between select-none font-mono text-sm relative")}
    >
      <div className={cn("absolute top-0 bottom-0 left-0 flex items-center px-3 ")}>
        <Checkbox status={status} onContextMenu={onContextMenu} onClick={onClick} />
      </div>
      <input
        readOnly={!isEditable}
        onBlur={handleOnBlur}
        ref={input}
        type="text"
        onClick={handleOnClick}
        onKeyDown={handleOnKeyDown}
        defaultValue={children}
        className={cn(
          "bg-transparent p-2 font-mono text-sm focus:text-base rounded-md w-full animate focus:outline-none pl-10 group-hover:pr-20",
          { "cursor-pointer pointer-events-none ": !isEditable, "ring-2 ring-purple-500": isEditable },
          ["done", "cancelled"].includes(status) && !isEditable && "line-through",
          ["done", "cancelled"].includes(status) && "filter grayscale",
          className
        )}
      />
      <div
        className={cn(
          "absolute top-0 bottom-0 right-0 flex items-center px-3 transition-opacity text-white text-opacity-40 hover:text-opacity-100 space-x-3",
          {
            "opacity-0 group-hover:opacity-100": !isEditable,
            "opacity-100": isEditable,
          }
        )}
      >
        <button
          onClick={(evt) => {
            evt.stopPropagation();
            onDelete(evt);
          }}
        >
          <DeleteIcon className="w-5 h-5 text-red-500 hover:fill-red" />
        </button>
        <button
          onClick={(evt) => {
            evt.stopPropagation();
            setIsEditable(true);
            setTimeout(() => {
              if (input.current) {
                input.current.focus();
              }
            }, 1);
          }}
        >
          <Icon className="w-5 h-5 hover:fill-gray" />
        </button>
      </div>
    </div>
  );
}

function Label({ children, className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <>
      <div className={cn("flex items-center cursor-pointer space-x-2", className)} {...props}>
        {children}
      </div>
    </>
  );
}

function Checkbox({ status, onClick, onContextMenu }: { status: TodoStatus; onClick: any; onContextMenu: any }) {
  return (
    <button onClick={onClick} onContextMenu={onContextMenu}>
      {status === "todo" && <TodoTodoIcon className="w-5 h-5 text-yellow-500" />}
      {status === "done" && <TodoDoneIcon className="w-5 h-5 text-green-500" />}
      {status === "delayed" && <TodoDelayedIcon className="w-5 h-5 text-blue-500" />}
      {status === "cancelled" && <TodoCancelledIcon className="w-5 h-5 text-red-500" />}
    </button>
  );
}
