import { Router } from 'express';
import { updateNotificationPreferences, getNotificationPreferences } from '../controllers/notifications.controller';

const router  = Router();

/**
 * @swagger
 * tags:
 *   name: Notification Preferences
 *   description: Notification Preferences Endpoints
 *
 * /api/v1/settings/{userId}/notifications:
 *   get:
 *     summary: Get notification preferences for a user
 *     tags: [Notification Preferences]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       '200':
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: User's notification preferences
 *               properties:
 *                 newsletter:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       description: Whether in-app notifications are enabled for newsletters
 *                     email:
 *                       type: boolean
 *                       description: Whether email notifications are enabled for newsletters
 *                     push:
 *                       type: boolean
 *                       description: Whether push notifications are enabled for newsletters
 *                   example:
 *                     inApp: true
 *                     email: true
 *                     push: false
 *                 event_registration:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       description: Whether in-app notifications are enabled for event registrations
 *                     email:
 *                       type: boolean
 *                       description: Whether email notifications are enabled for event registrations
 *                     push:
 *                       type: boolean
 *                       description: Whether push notifications are enabled for event registrations
 *                   example:
 *                     inApp: true
 *                     email: false
 *                     push: true
 *                 event_invite:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       description: Whether in-app notifications are enabled for event invites
 *                     email:
 *                       type: boolean
 *                       description: Whether email notifications are enabled for event invites
 *                     push:
 *                       type: boolean
 *                       description: Whether push notifications are enabled for event invites
 *                   example:
 *                     inApp: true
 *                     email: false
 *                     push: false
 *                 join_event:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       description: Whether in-app notifications are enabled for joining events
 *                     email:
 *                       type: boolean
 *                       description: Whether email notifications are enabled for joining events
 *                     push:
 *                       type: boolean
 *                       description: Whether push notifications are enabled for joining events
 *                   example:
 *                     inApp: false
 *                     email: true
 *                     push: true
 *                 event_change:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                       description: Whether in-app notifications are enabled for event changes
 *                     email:
 *                       type: boolean
 *                       description: Whether email notifications are enabled for event changes
 *                     push:
 *                       type: boolean
 *                       description: Whether push notifications are enabled for event changes
 *                   example:
 *                     inApp: true
 *                     email: true
 *                     push: true
 *               example:
 *                 newsletter:
 *                   inApp: true
 *                   email: true
 *                   push: false
 *                 event_registration:
 *                   inApp: true
 *                   email: false
 *                   push: true
 *                 event_invite:
 *                   inApp: true
 *                   email: false
 *                   push: false
 *                 join_event:
 *                   inApp: false
 *                   email: true
 *                   push: true
 *                 event_change:
 *                   inApp: true
 *                   email: true
 *                   push: true
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *   post:
 *     summary: Update notification preferences for a user
 *     tags: [Notification Preferences]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *       - in: body
 *         name: preferences
 *         description: The notification preferences to update
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreference'
 *     responses:
 *       '200':
 *         description: Notification preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Updated notification preferences
 *               properties:
 *                 newsletter:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 *                   example:
 *                     inApp: true
 *                     email: true
 *                     push: false
 *                 event_registration:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 *                   example:
 *                     inApp: true
 *                     email: false
 *                     push: true
 *                 event_invite:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 *                   example:
 *                     inApp: true
 *                     email: false
 *                     push: false
 *                 join_event:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 *                   example:
 *                     inApp: false
 *                     email: true
 *                     push: true
 *                 event_change:
 *                   type: object
 *                   properties:
 *                     inApp:
 *                       type: boolean
 *                     email:
 *                       type: boolean
 *                     push:
 *                       type: boolean
 *                   example:
 *                     inApp: true
 *                     email: true
 *                     push: true
 *               example:
 *                 newsletter:
 *                   inApp: true
 *                   email: true
 *                   push: false
 *                 event_registration:
 *                   inApp: true
 *                   email: false
 *                   push: true
 *                 event_invite:
 *                   inApp: true
 *                   email: false
 *                   push: false
 *                 join_event:
 *                   inApp: false
 *                   email: true
 *                   push: true
 *                 event_change:
 *                   inApp: true
 *                   email: true
 *                   push: true
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 */



router.put('/settings/:userId/notifications', updateNotificationPreferences);

router.get('/settings/:userId/notifications', getNotificationPreferences);

module.exports = router;
