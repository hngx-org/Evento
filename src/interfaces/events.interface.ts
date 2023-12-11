// Interface for payload to create events
interface createEventsInterface {
  title: string;
  description?: string;
  imageURL?: string;
  startDate: Date;
  endDate: Date;
  locationType: string;
  location?: string;
  virtualLocationLink?: string;
  capacity: number;
  organizerID: string;
  categoryName?: string;
  ticketType: string;
  ticketPrice?: number;
}

interface editEventsInterface extends createEventsInterface {}

export { createEventsInterface, editEventsInterface };
