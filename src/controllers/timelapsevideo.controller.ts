import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';

// create timelapse video
export const createTimelapseVideo = async (req: Request, res: Response, next: NextFunction) => {
  const nowInUTC = new Date().toISOString();
  const employee = (req as any).user;
  if (!req.file) return customErrorHandler(res, 'Timelapse video is required', 400);
  const filename = req.file.filename;

  const timelapseVideo = await prisma.timeLapseVideo.create({
    data: {
      employeeId: employee.employeeId,
      departmentId: employee.departmentId,
      teamId: employee.teamId,
      companyId: employee.companyId,
      time: nowInUTC,
      videoLink: `uploads/timelapsevideo/${filename}`,
    },
  });

  return res.json({message: 'TimeLapse Video'});
};
// get all timelapse video
export const getAllTimeLapseVideoOfOwn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const employee = (req as any).user;
  const timeLapseVideo = await prisma.timeLapseVideo.findMany({
    where: {
      employeeId: employee.employeeId,
      companyId: employee.companyId,
    },
  });
  return res.json({timeLapseVideo});
};

// Get all timlapse video of user
export const getAllTimeLapseVideoOfUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {employeeId} = req.params;
  const employee = (req as any).user;
  const timeLapseVideo = await prisma.timeLapseVideo.findMany({
    where: {
      employeeId,
      companyId: employee.companyId,
    },
  });
  return res.json({timeLapseVideo});
};

// Get one timelapse video
export const getOneTimeLapseVideo = async (req: Request, res: Response, next: NextFunction) => {
  const {timeLapseVideoId} = req.params;
  const {companyId} = (req as any).user;

  const timeLapseVideo = await prisma.timeLapseVideo.findFirst({
    where: {
      companyId,
      timeLapseVideoId,
    },
  });
  return res.json({timeLapseVideo});
};

export const getAllVideoOfDay = async (req: Request, res: Response, next: NextFunction) => {
  const {companyId} = (req as any).user;
  const currentDate = new Date();
  const startOfToday = currentDate.setHours(0, 0, 0, 0); // Start of today
  const endOfToday = currentDate.setHours(23, 59, 59, 999); // End of today
  const timeLapseVideo = await prisma.timeLapseVideo.findMany({
    where: {
      createdAt: {
        gte: new Date(startOfToday),
        lte: new Date(endOfToday),
      },
      companyId,
    },
    include: {
      employee: {
        select: {
          employeeName: true,
        },
      },
      department: {
        select: {
          departmentName: true,
        },
      },
    },
  });
  return res.json({timeLapseVideo});
};
