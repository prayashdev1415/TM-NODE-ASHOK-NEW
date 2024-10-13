import express from 'express';
const router = express.Router();
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {
  sevenDaysWorkAnalysis,
  topUsedAppAnalysis,
  totalTeamsDepartmentsAndEmployeeOfCompany,
  workAnalysisOfCompany,
} from '../controllers/dashboard.controller.js';

router.get(
  '/',
  catchAsync(isAuthenticatedCompany),
  catchAsync(totalTeamsDepartmentsAndEmployeeOfCompany),
);
router.get('/work-analysis', catchAsync(isAuthenticatedCompany), catchAsync(workAnalysisOfCompany));
router.get(
  '/used-app-analysis',
  catchAsync(isAuthenticatedCompany),
  catchAsync(topUsedAppAnalysis),
);
router.get(
  '/seven-days-work-analysis',
  catchAsync(isAuthenticatedCompany),
  catchAsync(sevenDaysWorkAnalysis),
);

export default router;
