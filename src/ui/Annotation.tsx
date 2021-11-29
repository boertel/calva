import { ReactNode, CSSProperties } from "react";
import cn from "classnames";

export function Annotation({
  children,
  className,
  style = {},
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <li
      style={style}
      className={cn(
        "top-0 flex items-start text-4xl px-6 py-2 font-black sticky hidden md:flow-root bg-black",
        className
      )}
    >
      {children}
    </li>
  );
}
