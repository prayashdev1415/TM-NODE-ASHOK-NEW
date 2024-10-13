import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';
import {NextFunction, Request, Response} from 'express';

// Add Company Holiday

export const addHoliday = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  // const departmentId = (req as any ).user?.departmentId;
  // const teamId = (req as any ).user?.teamId;
  const {holidayTitle, holidayType, fromDate, toDate, holidaySession} = req.body;

  if (!holidayTitle || !fromDate || !toDate || !holidaySession || !companyId) {
    return next(customErrorHandler(res, 'Please provide all the information.', 401));
  }

  const company: any = await prisma.company.findUnique({
    where: {
      companyId,
    },
  });

  if (!company) {
    return next(customErrorHandler(res, 'Invalid Company', 401));
  }

  // Validate that toDate is greater than or equal to fromDate
  if (new Date(toDate) <= new Date(fromDate)) {
    return next(
      customErrorHandler(res, 'To date must be greater than or equal to from date.', 400),
    );
  }

  // Manually check for duplicate holidays based on title and date range
  const existingHoliday = await prisma.holiday.findFirst({
    where: {
      OR: [{holidayTitle, fromDate, toDate}],
    },
  });

  if (existingHoliday) {
    return next(customErrorHandler(res, 'Holiday Title and date range already exist.', 401));
  }

  const newHoliday: any = await prisma.holiday.create({
    data: {
      holidayTitle: holidayTitle,
      holidayType: holidayType,
      holidaySession: holidaySession,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      companyId: companyId,
      // departmentId: departmentId,
      // teamId: teamId
    },
  });

  return res.json({message: 'Holiday successfully added ✨', holiday: newHoliday});
};

//Edit Holiday

export const editHoliday = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const {holidayId} = req.params;

  const {holidayTitle, holidayType, holidaySession, fromDate, toDate} = req.body;

  if (
    !holidayId ||
    !holidayTitle ||
    !holidayType ||
    !holidaySession ||
    !fromDate ||
    !toDate ||
    !companyId
  ) {
    return next(customErrorHandler(res, 'Please provide all the information', 401));
  }

  const company = await prisma.company.findUnique({
    where: {
      companyId,
    },
  });

  if (!company) {
    return next(customErrorHandler(res, 'Invalid User', 401));
  }

  const updatedHoliday = await prisma.holiday.update({
    where: {
      holidayId,
    },
    data: {
      holidayTitle,
      holidaySession,
      holidayType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    },
  });

  return res.json({message: 'Holiday successfully updated ✨', holiday: updatedHoliday});
};

// Delete Holiday
export const deleteHoliday = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const {holidayId} = req.params;

  const holiday = await prisma.holiday.delete({
    where: {
      holidayId,
      companyId,
    },
  });

  return res.json({message: ` ${holiday.holidayTitle}successfully deleted.`});
};

// Get all Holiday list
export const getallHoliday = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const allHolidays = await prisma.holiday.findMany({
    where: {
      companyId,
    },
  });
  return res.json({allHolidays});
};

// Get Holiday By Id
export const getholidaybyId = async (req: any, res: any, next: any) => {
  const {holidayId} = req.params;
  const companyId = (req as any).user.companyId;
  const holiday = await prisma.holiday.findUnique({
    where: {
      holidayId,
      companyId,
    },
  });

  if (!holiday) {
    return next(customErrorHandler(res, 'Holiday not forund.', 401));
  }
  return res.json({holiday});
};

function getStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

// display holidays
export const displayHolidayOfCompany = async (req: Request, res: Response, next: NextFunction) => {
  const {companyId} = (req as any).user;
  const currentDate = getStartOfDay(new Date());
  const fiveDaysLater = getStartOfDay(new Date());
  fiveDaysLater.setDate(currentDate.getDate() + 5);

  const holidaysOfCompany = await prisma.holiday.findMany({
    where: {
      companyId: companyId,
      toDate: {
        gte: currentDate,
        lte: fiveDaysLater,
      },
    },
    orderBy: {
      fromDate: 'asc',
    },
  });
  return res.json({holidaysOfCompany});
};
