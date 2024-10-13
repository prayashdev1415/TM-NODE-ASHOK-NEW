import express from 'express';
const router = express.Router();
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {
  allEmployeeAttendanceInCompany,
  breakOut,
  displayMonthlyInOutReport,
  displayOwnAttendanceOfSpecificDate,
  displayUserAttendanceOfCurrentDate,
  displayUserAttendanceOfMonths,
  displayUserAttendanceOfSpecificDate,
  employeeAllAttendance,
  employeeAttendanceClockIn,
  employeeAttendanceClockOut,
  employeeTodayClockInAndClockOutData,
  ownAttendance,
  takeBreak,
} from '../controllers/attendance.controller.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post(
  '/clock-in',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(employeeAttendanceClockIn),
);
router.post(
  '/clock-out',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(employeeAttendanceClockOut),
);
router.get(
  '/employee/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(displayUserAttendanceOfMonths),
);
router.get(
  '/now',
  catchAsync(isAuthenticatedCompany),
  catchAsync(displayUserAttendanceOfCurrentDate),
);
router.get(
  '/date',
  catchAsync(isAuthenticatedCompany),
  catchAsync(displayUserAttendanceOfSpecificDate),
);
router.post('/take-break', catchAsync(isAuthenticatedEmployee), catchAsync(takeBreak));
router.post('/break-out', catchAsync(isAuthenticatedEmployee), catchAsync(breakOut));
router.get(
  '/today-clockin',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(employeeTodayClockInAndClockOutData),
);
router.get(
  '/all-employee-attendance',
  catchAsync(isAuthenticatedCompany),
  catchAsync(allEmployeeAttendanceInCompany),
);
router.get('/get-own-attendance', catchAsync(isAuthenticatedEmployee), catchAsync(ownAttendance));
router.post(
  '/get-own-attendance-specific-date',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(displayOwnAttendanceOfSpecificDate),
);
router.get(
  '/get-employee-all-attendance/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(employeeAllAttendance),
);
router.post(
  '/monthly-report',
  catchAsync(isAuthenticatedCompany),
  catchAsync(displayMonthlyInOutReport),
);

export default router;
