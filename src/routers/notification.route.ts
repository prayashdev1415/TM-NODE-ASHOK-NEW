import express from 'express';
const router = express.Router();
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {screenshot} from '../lib/multer.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {
  getUnreadNotificationsCountOfCompany,
  getUnreadNotificationsCountOfEmployee,
  getUnreadNotificationsOfCompany,
  getUnreadNotificationsOfEmployee,
  markAsReadNotification,
} from '../controllers/notification.controller.js';

router.get(
  '/company-unread',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getUnreadNotificationsOfCompany),
);
router.get(
  '/count-company-unread',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getUnreadNotificationsCountOfCompany),
);
router.get(
  '/employee-unread',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(getUnreadNotificationsOfEmployee),
);
router.get(
  '/count-employee-unread',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(getUnreadNotificationsCountOfEmployee),
);
router.patch(
  '/marked-as-read/:notificationId',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(markAsReadNotification),
);

export default router;
