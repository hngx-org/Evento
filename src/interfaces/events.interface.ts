// Interface for payload to create events
interface createEventsInterface {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  time: Date;
  location: string;
  capacity: number;
  entranceFee?: number;
  eventType: string;
  organizerID: string;
  categoryID?: string;
}

interface editEventsInterface extends createEventsInterface {}

export { createEventsInterface, editEventsInterface };
