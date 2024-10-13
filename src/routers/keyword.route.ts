import express from 'express';
const router = express.Router();
import {catchAsync} from '../utils/catchAsync.js';
import {
  updateKeyword,
  deleteKeyword,
  addKeyWords,
  getAllKeywords,
  captureAndExtractText,
} from '../utils/screenshot-monitor.js';
import {isAuthenticatedCompany} from '../middlewares/isAuthenticatedCompany.js';
import {isAuthenticatedEmployee} from '../middlewares/isAuthenticatedEmployee.js';
router.post('/add-keyword', catchAsync(isAuthenticatedCompany), addKeyWords);
router.post('/check-keyword', catchAsync(isAuthenticatedEmployee), captureAndExtractText);
router.get('/get', catchAsync(isAuthenticatedCompany), getAllKeywords);
router.delete('/delete', catchAsync(deleteKeyword));

router.patch('/update-keyword', catchAsync(updateKeyword));
export default router;
