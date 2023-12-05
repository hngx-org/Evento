import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import {NotificationType } from '@prisma/client';
import { ResponseHandler } from '../utils';



interface NotificationPreference {
    newsletter: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_registration: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_invite: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_update: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
    event_change: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
}

interface Preference {
    inApp: boolean;
    email: boolean;
    push: boolean;
}


export const updateNotificationPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
    
      const { newsletter, event_registration, event_invite, event_update, event_change } = req.body as NotificationPreference;
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
        { type: "EVENT_UPDATE" as NotificationType, preferences: event_update },
        { type: "EVENT_CHANGE" as NotificationType, preferences: event_change },
      ].filter(({ preferences }) => preferences && typeof preferences === 'object');
  
      // Collect promises for each type
      const preferencesPromises = preferencesToUpdate.map(({ type, preferences }) => updatePreferences(userId, type, preferences));
      
      if (preferencesPromises.length === 0) {
        throw new Error("No preferences to update");
      }

      // Run all promises concurrently
      const data = await Promise.all(preferencesPromises);
  
      ResponseHandler.success(res, data , 200, "Preferences updated successfully")
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
    // Handle the specific case where the record does not exist
    console.error(`Record with userId: ${userId} and type: ${type} does not exist.`);
    } else {
    // Handle other errors or rethrow them if needed
    console.error(`Failed to update preferences for user ${userId}, type ${type}: ${error.message}`);
    throw error;
    }
}
};

export const createNotification = async (userId: string, type: NotificationType, message: string) => {
    try {
        await prisma.notification.create({
            data: {
                userId: userId,
                type: type,
                message: message,
            },
        });
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
    