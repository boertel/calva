export { default as MicrosoftTeamsIcon } from "./MicrosoftTeamsIcon";
export { default as ZoomIcon } from "./ZoomIcon";
export { default as GoogleMeetIcon } from "./GoogleMeetIcon";
export { default as HeadroomIcon } from "./HeadroomIcon";
export { default as GoogleLogo } from "./GoogleLogo";
export * from "./ExternalIcon";
export * from "./HideIcon";

import { AlertCircle, CheckCircle, Repeat, ChevronRight, Circle, Edit, X, Trash } from "react-feather";

const size = (WrappedComponent: React.FunctionComponent) => {
  return function SizeIcon(props: React.SVGProps<SVGSVGElement>) {
    // @ts-ignore
    return <WrappedComponent size="1em" {...props} />;
  };
};

export const WarningIcon = size(AlertCircle);
export const CheckCircleIcon = size(CheckCircle);
export const RecurringIcon = size(Repeat);
export const EditIcon = size(Edit);
export const DeleteIcon = size(Trash);
export const DoneIcon = size(X);

export const TodoTodoIcon = size(Circle);
export const TodoDelayedIcon = size(ChevronRight);
export const TodoDoneIcon = size(CheckCircle);
export const TodoCancelledIcon = size(X);
