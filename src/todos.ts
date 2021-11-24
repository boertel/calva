import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import dayjs from "@/dayjs";

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
      fetch(path, {
        method: "POST",
        body: JSON.stringify(todo),
      })
        .then((response) => response.json())
        .then((data) => {
          mutate(
            path,
            (todos: Todo[]) => {
              return [...(todos || []), data];
            },
            false
          );
        });
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
