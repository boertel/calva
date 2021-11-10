import * as React from "react";

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 8a8 8 0 018-8h8a8 8 0 018 8v8a8 8 0 01-8 8H8a8 8 0 01-8-8V8z"
        fill="#3984FD"
      />
      <path
        d="M5 9a1 1 0 011-1h6a3 3 0 013 3v4a1 1 0 01-1 1H8a3 3 0 01-3-3V9zM15.5 11.752a2 2 0 01.495-1.318l1.69-1.932c.457-.52 1.315-.198 1.315.494v6.008c0 .693-.858 1.015-1.314.494l-1.691-1.932a2 2 0 01-.495-1.317v-.498z"
        fill="#fff"
      />
    </svg>
  );
}

export default SvgComponent;
