import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import {NotificationType } from '@prisma/client';
import { ResponseHandler } from '../utils';
import {NotificationPreference, Preference} from '../interfaces/notification.interface'


export const getNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;

        // Check if the user exists
        const user = await prisma.user.findUnique({
        where: {
            userID: userId,
        },
        });

        if (!user) {
        throw new Error("User not found");
        }

        // Get all notification preferences for the user
        const preferences = await prisma.notificationPreferences.findMany({
        where: {
            userId: userId,
        },
        });

        // Convert the preferences into an object
        const preferencesObject = preferences.reduce((acc, preference) => {
        acc[preference.type.toLocaleLowerCase()] = {
            inApp: preference.inApp,
            email: preference.email,
            push: preference.push,
        };
        return acc;
        }, {});

        ResponseHandler.success(res, preferencesObject, 200, "Preferences retrieved successfully");
    } catch (error) {
        next(error);
    }
};

export const updateNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
    
      const { newsletter, event_registration, event_invite, join_event, event_change } = req.body as NotificationPreference;
      const userId = req.params.userId;
  
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: {
          userID: userId,
        },
      });
  
      if (!user) {
        throw new Error("User not found");
      }
  
      // Filter out properties that are not present or not objects
      const preferencesToUpdate = [
        { type: "NEWSLETTER" as NotificationType, preferences: newsletter },
        { type: "EVENT_REGISTRATION" as NotificationType, preferences: event_registration },
        { type: "EVENT_INVITE" as NotificationType, preferences: event_invite },
        { type: "EVENT_CHANGE" as NotificationType, preferences: event_change },
        { type: "JOIN_EVENT" as NotificationType, preferences: join_event },
      ].filter(({ preferences }) => preferences && typeof preferences === 'object');
  
      // Collect promises for each type
      const preferencesPromises = preferencesToUpdate.map(({ type, preferences }) => updatePreferences(userId, type, preferences));
      
      if (preferencesPromises.length === 0) {
        throw new Error("No preferences to update");
      }

      // Run all promises concurrently
      await Promise.all(preferencesPromises);

        // Get all notification preferences for the user
        const data = await prisma.notificationPreferences.findMany({
        where: {
            userId: userId,
        },
        });

        const outputData = {};

        data.forEach(item => {
            const eventType = item.type.toLowerCase();
            outputData[eventType] = {
                inApp: item.inApp,
                email: item.email,
                push: item.push
            };
        });
  
      ResponseHandler.success(res, outputData, 200, "Preferences updated successfully")
    } catch (error) {
      next(error);
    }
};
  
const updatePreferences = async (userId: string, type: NotificationType, preferences: Preference) => {
try {
    // Check if the record exists before attempting an upsert
    const existingRecord = await prisma.notificationPreferences.findFirst({
    where: {
        userId: userId,
        type: type,
    },
    });

    if (existingRecord) {
    // Record exists, proceed with update
    await prisma.notificationPreferences.update({
        where: {
        id: existingRecord.id,
        },
        data: {
        type: type,
        inApp: preferences.inApp,
        email: preferences.email,
        push: preferences.push,
        },
    });
    } else {
    // Record does not exist, create a new record
    await prisma.notificationPreferences.create({
        data: {
        userId: userId,
        type: type,
        inApp: preferences.inApp,
        email: preferences.email,
        push: preferences.push,
        },
    });
    }
} catch (error) {
    if (error.code === 'P2025' && error.message.includes('RecordDoesNotExist')) {
   
    console.error(`Record with userId: ${userId} and type: ${type} does not exist.`);
    } else {
  

    throw error;
    }
}
};

export const createNotification = async (userId: string, type: NotificationType, message: string) => {
    try {
        const notifcation = await prisma.notification.create({
            data: {
                userId: userId,
                type: type,
                message: message,
            },
        });
        return notifcation;
    } catch (error) {
        console.error(`Failed to create notification for user ${userId}, type ${type}: ${error.message}`);
        throw error;
    }
}

export const updateReadStatus = async (notificationId: string, read: boolean) => {
    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                read: read,
            },
        });
    } catch (error) {
        throw error;
    }
}

export const getAllUserNotifications = async (userId: string ) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return notifications;
    } catch (error) {
        throw error;
    }
}

//get all notifcations for user
export const getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId;
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        ResponseHandler.success(res, notifications, 200, "Notifications retrieved successfully");
    } catch (error) {
        next(error);
    }
}