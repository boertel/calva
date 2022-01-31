import cn from "classnames";
import { CSSProperties, ReactNode } from "react";

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
    <li style={style} className={cn("top-0 text-4xl px-6 py-2 font-black sticky hidden md:flow-root", className)}>
      {children}
    </li>
  );
}
