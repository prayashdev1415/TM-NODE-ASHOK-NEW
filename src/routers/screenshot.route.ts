import express from 'express';
const router = express.Router();
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {screenshot} from '../lib/multer.js';
import {
  addScreenshot,
  getAllScreenshotOfOwn,
  getAllScreenshotOfUser,
  getOneScreenshot,
  getAllScreenshotOfDay,
  getScreenshotOfSpecificDate,
  getScreenshotOfEmployeeSpecificDate,
} from '../controllers/screenshot.controller.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post(
  '/',
  catchAsync(isAuthenticatedEmployee),
  screenshot.single('screenshot'),
  catchAsync(addScreenshot),
);
router.get(
  '/get-screenshot/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllScreenshotOfUser),
);
router.get(
  '/get-screenshot-own',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(getAllScreenshotOfOwn),
);
router.get(
  '/get-one-screenshot/:screenshotId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getOneScreenshot),
);
router.get(
  '/get-screenshot-of-day',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllScreenshotOfDay),
);
router.get(
  '/get-screenshot-of-specific-date/:date',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getScreenshotOfSpecificDate),
);
router.get(
  '/get-screenshot-of-employee-specific-date/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getScreenshotOfEmployeeSpecificDate),
);

export default router;
