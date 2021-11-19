export { default as MicrosoftTeamsIcon } from "./MicrosoftTeamsIcon";
export { default as ZoomIcon } from "./ZoomIcon";
export { default as GoogleMeetIcon } from "./GoogleMeetIcon";
export { default as GoogleLogo } from "./GoogleLogo";
export * from "./ExternalIcon";

import { AlertCircle, CheckCircle, Repeat } from "react-feather";

const size = (WrappedComponent: React.FunctionComponent) => {
  return function SizeIcon(props: React.SVGProps<SVGSVGElement>) {
    // @ts-ignore
    return <WrappedComponent size="1em" {...props} />;
  };
};

export const WarningIcon = size(AlertCircle);
export const CheckCircleIcon = size(CheckCircle);
export const RecurringIcon = size(Repeat);
