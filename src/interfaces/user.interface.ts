// user interface for payload
interface userInterface {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  profileImage?: string;
  googleAccountID?: string;
  slug?: string;
  role?: string;
  location?: string;
}

interface socialInterface {
  userID: string;
  websiteURL?: string;
  twitterURL?: string;
  facebookURL?: string;
  instagramURL?: string;
}

interface contactInterface {
  userID: string;
  email: string;
}

interface preferencesInterface {
  userID: string;
  theme?: string;
  language?: string;
  regionalSettings?: boolean;
  timeZone?: string;
}

export {
  userInterface,
  socialInterface,
  contactInterface,
  preferencesInterface,
};
