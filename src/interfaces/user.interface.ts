// user interface for payload
interface userInterface {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  websiteURL?: string;
  profileImage?: string;
  googleAccountID?: string;
  slug?: string;
  role?: string;
  location?: string;
}

export { userInterface };
