import * as React from "react";

function SvgComponent(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15.235 0H9.806c-.387 0-.72.302-.72.687H9.06v2.746a3.384 3.384 0 003.379 3.378c1.856 0 3.379-1.51 3.379-3.378V.714h.028v-.11a.612.612 0 00-.61-.604z"
        fill="#8DB2FC"
      />
      <path
        d="M15.817 21.038a3.384 3.384 0 00-3.38-3.378 3.384 3.384 0 00-3.378 3.378v2.747h.027a.725.725 0 00.72.686h5.43c.332 0 .609-.274.609-.604v-.11h-.028v-2.719zM12.437 15.545c1.851 0 3.352-1.488 3.352-3.323 0-1.836-1.5-3.324-3.352-3.324-1.85 0-3.351 1.488-3.351 3.324 0 1.835 1.5 3.323 3.351 3.323zM21.492 15.545c1.851 0 3.352-1.488 3.352-3.323 0-1.836-1.5-3.324-3.352-3.324-1.85 0-3.351 1.488-3.351 3.324 0 1.835 1.5 3.323 3.351 3.323zM3.383 15.543c1.85 0 3.351-1.488 3.351-3.323 0-1.836-1.5-3.324-3.351-3.324S.03 10.384.03 12.22c0 1.835 1.5 3.323 3.352 3.323z"
        fill="#0D64F6"
      />
      <path
        d="M6.177 0H2.798C1.246.055 0 1.318 0 2.856v3.241c0 .33.277.604.61.604 3.406 0 6.148-2.746 6.148-6.097C6.786.274 6.51 0 6.177 0zM22.075 0h-3.38a.612.612 0 00-.61.604c0 3.406 2.77 6.125 6.178 6.125.332 0 .609-.275.609-.605V2.966v-.11c0-1.538-1.246-2.801-2.797-2.856z"
        fill="#8DB2FC"
      />
      <path
        d="M.64 17.742a.612.612 0 00-.609.604V21.587c0 1.538 1.247 2.802 2.798 2.856h3.379c.332 0 .61-.274.61-.604-.028-3.35-2.77-6.097-6.177-6.097zM24.872 18.374a.612.612 0 00-.61-.604c-3.407 0-6.149 2.746-6.149 6.096 0 .33.277.605.61.605H22.102c1.55-.055 2.797-1.319 2.797-2.857v-.11c-.027-1.482-.027-3.13-.027-3.13z"
        fill="#0D64F6"
      />
    </svg>
  );
}

export default SvgComponent;
