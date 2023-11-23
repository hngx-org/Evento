interface User {
    userID: string;
    email: string;
    password: string;
    bio?: string;
    socialLinks: string;
    websiteURL?: string;
    profileImage?: string;
    googleAccountID?: string;
    displayName?: string;
    firstName: string;
    lastName: string;
    slug: string;
    role: "USER" | "ADMIN";
    location?: string;
    myEvents: any[];
    PasswordReset: "" |  null;
    Payment: any[];
    Preferences?: any[];
    PrivacySetting: any[];
    Security?: string;
    SocialLink: any[];
    Ticket: any[];
    UserEventInteraction: any[];
    UserSupportTicket: any[];
    Verification?: String;
    signedUpEvents: any[]; // Assuming this should be an array of signed up events
  }

  export type { User };