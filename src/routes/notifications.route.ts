import { Router } from 'express';
import { updateNotificationPreferences } from '../controllers/notifications.controller';

const router  = Router();


router.post('/settings/:userId/notifications', updateNotificationPreferences);

module.exports = router;
