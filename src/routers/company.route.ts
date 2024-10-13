import express from 'express';
const router = express.Router();

import {
  actualTimeOfCompany,
  getAllEmployeeOfCompany,
  getAllEmployeeOfDepartment,
  getAllEmployeeOfTeams,
  loginCompany,
  registerCompany,
  updateActualCompanyTime,
  verifyCompanyRegistrationOTP,
  forgetPassword,
  verifyForgetPwOTP,
  resetPw,
  changePassword,
  getActualTimeOfCompany,
  companyProfile,
  getEmployeeProfileDetails,
  googleLoginCompany,
} from '../controllers/company.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post('/register', catchAsync(registerCompany));
router.post('/login', catchAsync(loginCompany));
router.post('/google-login', catchAsync(googleLoginCompany));
router.post(
  '/actual-company-time',
  catchAsync(isAuthenticatedCompany),
  catchAsync(actualTimeOfCompany),
);
router.get(
  '/company-actual-time',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getActualTimeOfCompany),
);
router.patch(
  '/update-company-time/:actualTimeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(updateActualCompanyTime),
);
router.post('/verify-company-registration-otp', catchAsync(verifyCompanyRegistrationOTP));

router.post('/forget-password', catchAsync(forgetPassword));

router.post('/verify-forget-pw-otp', catchAsync(verifyForgetPwOTP));
router.patch('/reset-password', catchAsync(resetPw));
router.patch('/change-password', catchAsync(isAuthenticatedCompany), catchAsync(changePassword));
router.get(
  '/all-employees',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllEmployeeOfCompany),
);
router.get(
  '/all-employees-department/:teamId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllEmployeeOfDepartment),
);
router.get(
  '/all-employees-team/:teamId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllEmployeeOfTeams),
);
router.get('/profile', catchAsync(isAuthenticatedCompany), catchAsync(companyProfile));
router.get(
  '/employee-profile/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getEmployeeProfileDetails),
);

export default router;
