import express from 'express';
const router = express.Router();
import {
  addHoliday,
  editHoliday,
  deleteHoliday,
  getallHoliday,
  getholidaybyId,
  displayHolidayOfCompany,
} from '../controllers/holiday.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';

router.post('/create-holiday', catchAsync(isAuthenticatedCompany), catchAsync(addHoliday));
router.patch(
  '/edit-holiday/:holidayId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(editHoliday),
);
router.delete(
  '/delete-holiday/:holidayId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(deleteHoliday),
);
router.get('/get-all-holiday', catchAsync(isAuthenticatedCompany), catchAsync(getallHoliday));
router.get(
  '/get-all-holiday-employee',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(getallHoliday),
);
router.get(
  '/get-holiday/:holidayId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getholidaybyId),
);
router.get(
  '/display-holiday',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(displayHolidayOfCompany),
);

export default router;
