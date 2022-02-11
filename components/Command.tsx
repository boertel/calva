// @ts-nocheck
import CmdK from "@boertel/cmdk";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

const CommandContext = createContext({});

// @ts-ignore
export function CommandProvider({ children, ...props }) {
  const options = useRef([]);

  const addCommand = useCallback((name, callback) => {
    if (options.current.find((command) => command.name === name)) {
      options.current = options.current.filter((command) => {
        return command.name !== name;
      });
    }
    options.current.push({ name, callback });

    console.log("add", options.current);
  }, []);

  const removeCommand = useCallback((name) => {
    options.current = options.current.filter((command) => {
      return command.name !== name;
    });
  }, []);

  const context = useMemo(() => {
    return {
      addCommand,
      removeCommand,
    };
  }, [addCommand, removeCommand]);

  const getOptions = useCallback((query) => {
    if (query.length > 0) {
      return Promise.resolve(options.current.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase())));
    } else {
      return Promise.resolve(options.current);
    }
  }, []);

  return (
    <CommandContext.Provider value={context} {...props}>
      {children}
      <CmdK getOptions={getOptions} />
    </CommandContext.Provider>
  );
}

export function useCommand(name, callback) {
  const { addCommand, removeCommand } = useContext(CommandContext);

  useEffect(() => {
    addCommand(name, callback);
    return () => removeCommand(name);
  }, [addCommand, removeCommand, name, callback]);
}
