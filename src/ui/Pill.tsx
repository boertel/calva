import { forwardRef, ReactNode, SyntheticEvent, CSSProperties } from "react";
import cn from "classnames";

export const Pill = forwardRef(
  (
    {
      children,
      className,
      onClick,
      style = {},
    }: {
      children: ReactNode;
      className?: string;
      onClick: (evt: SyntheticEvent) => void;
      style?: CSSProperties;
    },
    ref
  ) => {
    return (
      <button
        onClick={onClick}
        className={cn(
          "z-20 sticky overflow-hidden transform flex justify-center w-full flex-grow",
          className
        )}
        // @ts-ignore
        ref={ref}
        style={{
          gridColumn: 2,
          ...style,
        }}
      >
        <div
          className={cn("bg-purple-500 text-white px-3 py-2 rounded-xl w-max")}
        >
          {children}
        </div>
      </button>
    );
  }
);
