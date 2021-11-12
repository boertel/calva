import { ConferenceService } from "@/events";
import { ZoomIcon, GoogleMeetIcon, MicrosoftTeamsIcon } from "@/icons";

export function ConferenceIcon({
  service,
  className,
}: {
  service?: ConferenceService;
  className?: string;
}) {
  switch (service) {
    case ConferenceService.Zoom:
      return <ZoomIcon className={className} />;
    case ConferenceService.GoogleMeet:
      return <GoogleMeetIcon className={className} />;
    case ConferenceService.MicrosoftTeams:
      return <MicrosoftTeamsIcon className={className} />;
    default:
      return null;
  }
}
