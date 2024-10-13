import express from 'express';
const router = express.Router();
import {catchAsync} from '../utils/catchAsync.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
import {timelapse} from '../lib/multer.js';
import {
  createTimelapseVideo,
  getAllTimeLapseVideoOfOwn,
  getAllTimeLapseVideoOfUser,
  getAllVideoOfDay,
  getOneTimeLapseVideo,
} from '../controllers/timelapsevideo.controller.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';

router.post(
  '/',
  catchAsync(isAuthenticatedEmployee),
  timelapse.single('timelapsevideo'),
  catchAsync(createTimelapseVideo),
);
router.get(
  '/get-timelapse-own',
  catchAsync(isAuthenticatedEmployee),
  catchAsync(getAllTimeLapseVideoOfOwn),
);
router.get(
  '/get-timelapse/:employeeId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getAllTimeLapseVideoOfUser),
);
router.get(
  '/get-one-timelapse/:timelapseId',
  catchAsync(isAuthenticatedCompany),
  catchAsync(getOneTimeLapseVideo),
);
router.get('/getallvideoofDay', catchAsync(isAuthenticatedCompany), catchAsync(getAllVideoOfDay));

export default router;
