-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "bio" TEXT,
    "socialLinks" TEXT,
    "profileImage" TEXT,
    "googleAccountID" TEXT,
    "displayName" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "location" TEXT,
    "otp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "otp_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp_ascii" TEXT,
    "otp_hex" TEXT,
    "otp_base32" TEXT,
    "otp_auth_url" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Event" (
    "eventID" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "entranceFee" DOUBLE PRECISION,
    "eventType" TEXT NOT NULL,
    "organizerID" TEXT NOT NULL,
    "categoryID" TEXT,
    "categoryCategoryID" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("eventID")
);

-- CreateTable
CREATE TABLE "Verification" (
    "userID" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "SocialLink" (
    "linkID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "websiteURL" TEXT,
    "twitterURL" TEXT,
    "facebookURL" TEXT,
    "instagramURL" TEXT,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("linkID")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticketID" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "ticketType" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL,
    "isValid" BOOLEAN NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticketID")
);

-- CreateTable
CREATE TABLE "Location" (
    "locationID" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("locationID")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "userID" TEXT NOT NULL,
    "resetCode" TEXT NOT NULL,
    "expiryTimestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Preferences" (
    "userID" TEXT NOT NULL,
    "notificationPreferences" TEXT,
    "language" TEXT,
    "regionalSettings" TEXT,

    CONSTRAINT "Preferences_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Security" (
    "userID" TEXT NOT NULL,
    "twoFactorAuthenticationSettings" TEXT,
    "connectedDevices" TEXT,

    CONSTRAINT "Security_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentID")
);

-- CreateTable
CREATE TABLE "Category" (
    "categoryID" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("categoryID")
);

-- CreateTable
CREATE TABLE "UserEventInteraction" (
    "interactionID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,
    "like" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,

    CONSTRAINT "UserEventInteraction_pkey" PRIMARY KEY ("interactionID")
);

-- CreateTable
CREATE TABLE "EventAnalytics" (
    "analyticsID" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,
    "participantsCount" INTEGER NOT NULL,
    "viewsCount" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EventAnalytics_pkey" PRIMARY KEY ("analyticsID")
);

-- CreateTable
CREATE TABLE "PrivacySetting" (
    "privacySettingID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,

    CONSTRAINT "PrivacySetting_pkey" PRIMARY KEY ("privacySettingID")
);

-- CreateTable
CREATE TABLE "UserSupportTicket" (
    "ticketID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "UserSupportTicket_pkey" PRIMARY KEY ("ticketID")
);

-- CreateTable
CREATE TABLE "_attendees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventID_key" ON "Event"("eventID");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLink_linkID_key" ON "SocialLink"("linkID");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketID_key" ON "Ticket"("ticketID");

-- CreateIndex
CREATE UNIQUE INDEX "Location_locationID_key" ON "Location"("locationID");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentID_key" ON "Payment"("paymentID");

-- CreateIndex
CREATE UNIQUE INDEX "Category_categoryID_key" ON "Category"("categoryID");

-- CreateIndex
CREATE UNIQUE INDEX "UserEventInteraction_interactionID_key" ON "UserEventInteraction"("interactionID");

-- CreateIndex
CREATE UNIQUE INDEX "EventAnalytics_analyticsID_key" ON "EventAnalytics"("analyticsID");

-- CreateIndex
CREATE UNIQUE INDEX "EventAnalytics_eventID_key" ON "EventAnalytics"("eventID");

-- CreateIndex
CREATE UNIQUE INDEX "PrivacySetting_privacySettingID_key" ON "PrivacySetting"("privacySettingID");

-- CreateIndex
CREATE UNIQUE INDEX "UserSupportTicket_ticketID_key" ON "UserSupportTicket"("ticketID");

-- CreateIndex
CREATE UNIQUE INDEX "_attendees_AB_unique" ON "_attendees"("A", "B");

-- CreateIndex
CREATE INDEX "_attendees_B_index" ON "_attendees"("B");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryCategoryID_fkey" FOREIGN KEY ("categoryCategoryID") REFERENCES "Category"("categoryID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerID_fkey" FOREIGN KEY ("organizerID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Security" ADD CONSTRAINT "Security_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventInteraction" ADD CONSTRAINT "UserEventInteraction_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventInteraction" ADD CONSTRAINT "UserEventInteraction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAnalytics" ADD CONSTRAINT "EventAnalytics_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacySetting" ADD CONSTRAINT "PrivacySetting_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Event"("eventID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivacySetting" ADD CONSTRAINT "PrivacySetting_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSupportTicket" ADD CONSTRAINT "UserSupportTicket_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_attendees" ADD CONSTRAINT "_attendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("eventID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_attendees" ADD CONSTRAINT "_attendees_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userID") ON DELETE CASCADE ON UPDATE CASCADE;
