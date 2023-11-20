// Interface for payload to create events
interface createEventsInterface {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  time: string;
  location: string;
  capacity: number;
  entranceFee?: number;
  eventType: string;
  organizerID: string;
  categoryID?: string;
}

export { createEventsInterface };
