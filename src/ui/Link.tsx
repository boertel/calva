// @ts-nocheck
import cn from "classnames";
import NextLink from "next/link";

export function Link({ href, as: AsComponent = "a", className, ...props }) {
  return (
    <NextLink href={href}>
      <a {...props} className={cn("text-purple-500 hover:underline", className)} />
    </NextLink>
  );
}
