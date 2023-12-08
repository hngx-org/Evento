// emailMiddleware.js
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../middlewares/errorhandler";
const mjml2html = require("mjml");
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

const mailgunTransporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 465,
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

const loadEmailTemplate = async (templatePath) => {
  try {
    const templateContent = await fs.readFile(templatePath, "utf-8");
    return templateContent;
  } catch (error) {
    console.error("Error loading email template:", error.message);
    throw new BadRequestError("Error loading email template");
  }
};

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

export const emailService = async (emailContent, templatePath) => {
  try {
    const { to, subject, variables } = emailContent;

    // Load the email template from the provided file path
    const templateHTML = await loadEmailTemplate(templatePath);

    // Replace variables in the template
    const replacedHTML = replaceVariables(templateHTML, variables);

    // Convert MJML to HTML
    const mjmlOutput = mjml2html(replacedHTML);
    const dynamicHTML = mjmlOutput.html;

    const finalEmailContent = {
      from: "hello@Evento.com",
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
    throw new BadRequestError("Error sending email");
  }
};

const replaceVariables = (template, variables) => {
  // Replace variables in the template
  Object.keys(variables).forEach((variable) => {
    const regex = new RegExp(`\\[\\[${variable}\\]\\]`, "g");
    template = template.replace(regex, variables[variable]);
  });

  return template;
};
