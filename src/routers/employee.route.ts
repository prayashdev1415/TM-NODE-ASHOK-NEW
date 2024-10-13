import express from 'express';
const router = express.Router();
import {
  registerEmployee,
  loginEmployee,
  updateEmployeeDepartmentAndTeam,
  getEmployeeProfile,
} from '../controllers/employee.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
router.post('/register', catchAsync(isAuthenticatedCompany), catchAsync(registerEmployee));
router.post('/login', catchAsync(loginEmployee));
router.patch(
  '/update/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(updateEmployeeDepartmentAndTeam),
);
router.get('/profile', catchAsync(isAuthenticatedEmployee), catchAsync(getEmployeeProfile));
export default router;