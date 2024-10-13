import express from 'express';
const router = express.Router();
import {
  addUsedApp,
  appProductAndUnproductiveAppByCompany,
  getCompanyApp,
  getEmployeeUsedAppInADay,
  productiveAppsForUser,
  reviewedAppsForCompany,
  updateAppReview,
  updateAppType,
  usedDesktopApp,
} from '../controllers/app.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {appLogo, appLogoByCompany} from '../lib/multer.js';

router.post(
  '/add-used-app',
  catchAsync(isAuthenticatedEmployee),
  appLogo.single('appicon'),
  catchAsync(addUsedApp),
);
router.post(
  '/add-used-desktop-app',
  catchAsync(isAuthenticatedEmployee),
  appLogo.single('appicon'),
  catchAsync(usedDesktopApp),
);
router.post(
  '/add-app-review',
  catchAsync(isAuthenticatedCompany),
  appLogoByCompany.single('appicon'),
  catchAsync(appProductAndUnproductiveAppByCompany),
);
router.put('/update-appType/:appId', catchAsync(isAuthenticatedCompany), catchAsync(updateAppType));
router.put('/update-appReview', catchAsync(isAuthenticatedCompany), catchAsync(updateAppReview));
router.get('/get-company-app', catchAsync(isAuthenticatedCompany), catchAsync(getCompanyApp));
router.get(
  '/get-employee-used-app/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getEmployeeUsedAppInADay),
);
router.get(
  '/productive-apps',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(productiveAppsForUser),
);
router.get(
  '/reviewed-apps',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(reviewedAppsForCompany),
);
export default router;
