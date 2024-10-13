import express from 'express';
const router = express.Router();
import {
  createDepartment,
  deleteDepartment,
  getAllDepartment,
  getAllDepartmentEmployee,
  getDepartment,
  updateDepartment,
} from '../controllers/department.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post('/create-department', catchAsync(isAuthenticatedCompany), catchAsync(createDepartment));
router.patch(
  '/update-department/:departmentId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(updateDepartment),
);
router.get('/get-all-department', catchAsync(isAuthenticatedCompany), catchAsync(getAllDepartment));
router.get(
  '/get-department/:departmentId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getDepartment),
);
router.delete(
  '/delete-department/:departmentId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(deleteDepartment),
);
router.get(
  '/get-department-employees/:departmentId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllDepartmentEmployee),
);

export default router;
