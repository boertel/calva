import { useState, useCallback, useMemo, useRef } from "react";

export enum LeftFrom {
  Top = "top",
  Bottom = "bottom",
}

export function useBackToElement<T extends HTMLElement>() {
  const [elementLeftFrom, setElementLeftFrom] = useState<
    LeftFrom | undefined
  >();
  const ref = useRef<T>();
  const observer = useRef<IntersectionObserver>();

  const onObserve = useCallback(
    (entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting) {
        if (entry.boundingClientRect.top < 0) {
          setElementLeftFrom(LeftFrom.Top);
        } else {
          setElementLeftFrom(LeftFrom.Bottom);
        }
      } else {
        setElementLeftFrom(undefined);
      }
    },
    [setElementLeftFrom]
  );

  const backToElement = useCallback(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.scrollIntoView();
    }
  }, []);

  const focusOnLoad = useCallback(
    (node: T) => {
      if (node) {
        observer.current = new IntersectionObserver(onObserve);
        ref.current = node;
        observer.current.observe(ref.current);
        node.scrollIntoView();
        node.focus();
      }
    },
    [onObserve]
  );

  return useMemo(
    () => ({ backToElement, ref: focusOnLoad, elementLeftFrom }),
    [elementLeftFrom, focusOnLoad, backToElement]
  );
}
