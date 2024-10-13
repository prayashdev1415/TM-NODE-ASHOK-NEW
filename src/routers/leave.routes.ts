import express from 'express';
const router = express.Router();
import {
  applyLeave,
  leaveStatusUpadate,
  deleteleave,
  getallleave,
  displayLeaveStatusOfEmployee,
  getEmployeAllLeave,
} from '../controllers/leave.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post('/apply-leave', catchAsync(isAuthenticatedEmployee), catchAsync(applyLeave));
router.put(
  '/leave-status-update/:leaveId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(leaveStatusUpadate),
);
router.delete(
  '/delete-leave/:leaveId',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(deleteleave),
);
router.get('/get-all-leave', catchAsync(isAuthenticatedCompany), catchAsync(getallleave));
router.get(
  '/view-leave-status',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(displayLeaveStatusOfEmployee),
);
router.get(
  '/view-all-leave-of-specific-employees/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getEmployeAllLeave),
);

export default router;
