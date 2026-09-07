const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const email = (req.query.email || req.user?.email || '').toLowerCase().trim();
    const role = (req.query.role || req.user?.role || '').toLowerCase().trim();

    let query = {};
    if (role === 'admin' || role === 'administrator' || email === 'admin@gmail.com' || email === 'amin@gmail.com') {
      // Admin sees notifications addressed to admin role, or to their email, or broadcast
      query = {
        $or: [
          { recipientRole: { $in: ['admin', 'administrator'] } },
          ...(email ? [{ recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }] : [])
        ]
      };
    } else if (email && (role === 'worker' || role === 'agent')) {
      query = {
        $or: [
          { recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
          { recipientRole: { $in: ['worker', 'agent'] }, recipientEmail: { $in: [email, '', null] } }
        ]
      };
    } else if (email) {
      query = {
        $or: [
          { recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
          { recipientRole: 'customer', recipientEmail: { $in: [email, '', null] } }
        ]
      };
    } else if (role === 'worker' || role === 'agent') {
      query = { recipientRole: { $in: ['worker', 'agent'] } };
    } else if (role === 'admin' || role === 'administrator') {
      query = { recipientRole: { $in: ['admin', 'administrator'] } };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error('Get Notifications Error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: err.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { recipientEmail, recipientRole, type, title, message, ticketId, senderName, senderEmail, senderAvatar } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Missing title or message for notification' });
    }

    const fallbackEmail = recipientEmail || (recipientRole === 'admin' ? 'admin@civic.gov' : '');

    const notif = await Notification.create({
      recipientEmail: (fallbackEmail || '').toLowerCase().trim(),
      recipientRole: recipientRole || 'worker',
      type: type || 'ticket_assigned',
      title,
      message,
      ticketId: ticketId || '',
      senderName: senderName || 'Citizen',
      senderEmail: senderEmail || '',
      senderAvatar: senderAvatar || '',
      isRead: false
    });

    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create notification', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json({ success: true, notification: notif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const email = (req.body.email || req.query.email || req.user?.email || '').toLowerCase().trim();
    const role = (req.body.role || req.query.role || req.user?.role || '').toLowerCase().trim();

    let query = {};
    if (role === 'admin' || role === 'administrator' || email === 'admin@gmail.com' || email === 'amin@gmail.com') {
      query = {
        $or: [
          { recipientRole: { $in: ['admin', 'administrator'] } },
          ...(email ? [{ recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }] : [])
        ]
      };
    } else if (email) {
      query = { recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } };
    } else if (role) {
      query = { recipientRole: role };
    }

    await Notification.updateMany(query, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    const email = (req.body.email || req.query.email || req.user?.email || '').toLowerCase().trim();
    const role = (req.body.role || req.query.role || req.user?.role || '').toLowerCase().trim();

    let query = {};
    if (role === 'admin' || role === 'administrator' || email === 'admin@gmail.com' || email === 'amin@gmail.com') {
      query = {
        $or: [
          { recipientRole: { $in: ['admin', 'administrator'] } },
          ...(email ? [{ recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } }] : [])
        ]
      };
    } else if (email) {
      query = { recipientEmail: { $regex: new RegExp(`^${email.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } };
    } else if (role) {
      query = { recipientRole: role };
    }

    await Notification.deleteMany(query);
    res.status(200).json({ success: true, message: 'All notifications cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};
