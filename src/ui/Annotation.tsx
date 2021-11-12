import { ReactNode, CSSProperties } from 'react'
import cn from 'classnames'

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
        "sticky top-0 flex items-start text-4xl px-6 py-2 font-black bg-black",
        className
      )}
    >
      {children}
    </li>
  );
}
