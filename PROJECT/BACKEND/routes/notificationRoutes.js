const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/clear-all', notificationController.clearAllNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;