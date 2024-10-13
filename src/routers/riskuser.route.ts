import express from 'express';
const router = express.Router();
import {
  addRiskUser,
  safeUser,
  addToInactive,
  getAllInactiveUser,
  getriskUser,
} from '../controllers/riskuser.controller.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {catchAsync} from '../utils/catchAsync.js';
// , , deleteEmployee
router.post(
  '/add-to-riskUser/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(addRiskUser),
);
router.delete(
  '/safe-from-riskUser/:riskUserId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(safeUser),
);
router.put(
  '/add-to-inactive/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(addToInactive),
);
router.get(
  '/get-all-deleatedEmployee',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllInactiveUser),
);
router.get('/getRiskUser', catchAsync(isAuthenticatedCompany), catchAsync(getriskUser));

export default router;
