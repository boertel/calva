import { useCallback } from "react";
import cuid from "cuid";
import useSWR, { useSWRConfig } from "swr";
import dayjs from "@/dayjs";

export type TodoStatus = "todo" | "done" | "delayed";
export type Todo = {
  id: string;
  text: string;
  status: "todo" | "done" | "delayed";
  date?: string;
};

export function useTodos(shouldFetch: boolean = true) {
  const today = dayjs().format("YYYY-MM-DD");
  const path = `/api/todos?today=${today}`;
  const { mutate } = useSWRConfig();
  const { data = [], ...rest } = useSWR<Todo>(shouldFetch ? path : null);

  const addTodo = useCallback(
    (todo: Omit<Todo, "id" | "date">) => {
      const todoWithId = {
        ...todo,
        text: todo.text.trim(),
        id: cuid(),
      };
      fetch(path, {
        method: "POST",
        body: JSON.stringify(todoWithId),
      });
      mutate(
        path,
        (todos: Todo[]) => {
          return [...(todos || []), todoWithId];
        },
        false
      );
    },
    [mutate, path]
  );

  const updateTodo = useCallback(
    (todo: Todo) => {
      fetch(path, {
        method: "PATCH",
        body: JSON.stringify(todo),
      });
      mutate(
        path,
        (todos: Todo[]) => {
          return todos.map((t) => {
            if (t.id === todo.id) {
              return {
                ...t,
                ...todo,
              };
            } else {
              return t;
            }
          });
        },
        false
      );
    },
    [mutate, path]
  );

  return {
    todos: data as Todo[],
    addTodo,
    updateTodo,
    ...rest,
  };
}
