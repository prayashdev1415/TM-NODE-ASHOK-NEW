import express from 'express';
const router = express.Router();
import {
  createTeam,
  deleteTeam,
  getAllTeamOfTheCompany,
  getAllTeamOfTheDepartment,
  getTeam,
  updateTeam,
} from '../controllers/teams.controller.js';
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post('/create-team', catchAsync(isAuthenticatedCompany), catchAsync(createTeam));
router.get(
  '/get-all-team-of-company',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllTeamOfTheCompany),
);
router.get(
  '/get-all-team-of-department/:departmentId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllTeamOfTheDepartment),
);
router.get('/get-team', catchAsync(isAuthenticatedCompany), catchAsync(getTeam));
router.patch('/update-team', catchAsync(isAuthenticatedCompany), catchAsync(updateTeam));
router.delete(
  '/delete-team/:teamId/:departmentId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(deleteTeam),
);

export default router;
