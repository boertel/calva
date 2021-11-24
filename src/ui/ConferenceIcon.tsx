import { ConferenceService } from "@/events";
import { ZoomIcon, GoogleMeetIcon, MicrosoftTeamsIcon, HeadroomIcon } from "@/icons";

export function ConferenceIcon({ service, className }: { service?: ConferenceService; className?: string }) {
  switch (service) {
    case ConferenceService.Headroom:
      return <HeadroomIcon className={className} />;
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
