// Interface for payload to create events
interface createEventsInterface {
  title: string;
  description?: string;
  imageURL?: string;
  startDate: Date;
  endDate: Date;
  time: Date;
  location: string;
  capacity: number;
  entranceFee?: number;
  eventType: string;
  organizerID: string;
  categoryName?: string;
}

interface editEventsInterface extends createEventsInterface {}

export { createEventsInterface, editEventsInterface };
