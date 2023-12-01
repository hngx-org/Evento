// emailMiddleware.js
const nodemailer = require("nodemailer");
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../middlewares/errorhandler";
import "dotenv/config";

const mailgun = require("nodemailer-mailgun-transport");

// Create a Nodemailer transporter for Mailtrap
const mailtrapTransporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

const username = process.env.MAILGUN_USERNAME;
const pass = process.env.MAILGUN_PASSWORD;

console.log(username, pass);
const mailgunTransporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: username,
    pass: pass,
  },
});

// const mailgunTransporter = nodemailer.createTransport(mailgun(auth));

// Create a Nodemailer transporter for SendGrid if API key is provided
const sendgridTransporter = process.env.SENDGRID_API_KEY
  ? nodemailer.createTransport({
      service: "SendGrid",
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  : null;

// Define a function to send emails using SendGrid or Mailtrap based on configuration
const sendEmail = async (emailContent) => {
  try {
    // const transporter = sendgridTransporter || mailtrapTransporter;
    // const transporter = mailtrapTransporter;
    const transporter = mailgunTransporter;

    if (!transporter) {
      throw new BadRequestError("No email transporter configured.");
    }

    await transporter.sendMail(emailContent);
    return { message: "Email sent successfully." };
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new BadRequestError("Error sending email");
  }
};

// Email middleware that can be extended for various functionalities
export const emailService = (emailContent) => async (req, res, next) => {
  try {
    // Customize the HTML content based on the provided variables
    const { to, subject, userName, eventName, additionalContent } =
      emailContent;

    const dynamicHTML = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #f4f4f4;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #007BFF;
            }
            p {
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hi ${userName}!</h1>
            <p>${additionalContent}</p>
            <p>You are invited to the event "${eventName}". We hope to see you there!</p>
          </div>
        </body>
      </html>
    `;

    const finalEmailContent = {
      from: "your@gmail.com",
      to,
      subject,
      html: dynamicHTML,
    };

    const emailStatus = await sendEmail(finalEmailContent);
    if (emailStatus) {
      return emailStatus;
    }
  } catch (error) {
    console.error("Error in email middleware:", error.message);
    res.status(500).send("Error sending email");
  }
};
