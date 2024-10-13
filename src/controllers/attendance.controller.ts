import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';

// employee clock in attendance
export const employeeAttendanceClockIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentDateAndTime = new Date();
  const actualDate = currentDateAndTime.toISOString().split('T')[0];

  const employee = (req as any).user;
  const companyAttendance = await prisma.actualTimeOfCompany.findFirst({
    where: {
      companyId: employee.companyId,
    },
    orderBy: {
      actualLoginTime: 'desc',
    },
  });

  if (!companyAttendance) {
    return next(customErrorHandler(res, 'Company attendance record not found', 404));
  }

  const attendanceRecords = await prisma.attendance.findUnique({
    where: {
      employeeId_actualDate: {
        employeeId: employee.employeeId,
        actualDate,
      },
    },
  });

  if (attendanceRecords?.employeeLoginTime)
    return next(customErrorHandler(res, 'You have already Clock in', 400));

  const actualLoginTime = companyAttendance?.actualLoginTime;
  const employeeLoginTime = currentDateAndTime.toLocaleTimeString('en-US', {hour12: false});

  // Calculate late minutes
  const [actualCompanyLoginHour, actualCompanyLoginMinutes] = actualLoginTime
    ?.split(':')
    .map(Number);
  const [employeeLoginHour, employeeLoginMinute] = employeeLoginTime.split(':').map(Number);

  let lateClockIn = '';

  if (
    employeeLoginHour > actualCompanyLoginHour ||
    (employeeLoginHour === actualCompanyLoginHour &&
      employeeLoginMinute > actualCompanyLoginMinutes)
  ) {
    const lateMinutes =
      (employeeLoginHour - actualCompanyLoginHour) * 60 +
      (employeeLoginMinute - actualCompanyLoginMinutes);
    lateClockIn = `${lateMinutes} minutes late`;
  } else {
    lateClockIn = 'On time';
  }
  const attendanceRecord = await prisma.attendance.create({
    data: {
      actualDate,
      employeeLoginTime: new Date(currentDateAndTime),
      lateClockIn: lateClockIn,
      employeeId: employee.employeeId,
      departmentId: employee.departmentId,
      teamId: employee.teamId,
      companyId: employee.companyId,
    },
  });
  return res.status(200).json({message: 'Employee attendance recorded', attendanceRecord});
};

// employee attendance clock out attendance
export const employeeAttendanceClockOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentDateAndTime = new Date();
  const actualDate = currentDateAndTime.toISOString().split('T')[0];
  const employee = (req as any).user;
  const companyAttendance = await prisma.actualTimeOfCompany.findFirst({
    where: {
      companyId: employee.companyId,
    },
    orderBy: {
      actualLogoutTime: 'desc',
    },
  });

  if (!companyAttendance) {
    return next(customErrorHandler(res, 'Company attendance record not found', 404));
  }

  const attendanceRecords = await prisma.attendance.findUnique({
    where: {
      employeeId_actualDate: {
        employeeId: employee.employeeId,
        actualDate,
      },
    },
  });

  if (attendanceRecords?.employeeLogoutTime)
    return next(customErrorHandler(res, 'You have already Clock Out', 400));

  const actualLogoutTime = companyAttendance?.actualLogoutTime;
  const EmployeeLogoutTime = currentDateAndTime.toLocaleTimeString('en-US', {hour12: false});

  const [actualCompanyLogOutHour, actualCompanyLogOutMinutes] = actualLogoutTime
    ?.split(':')
    .map(Number);
  const [employeeLogOutHour, employeeLogOutMinute] = EmployeeLogoutTime.split(':').map(Number);

  let overtime = null;
  let earlyClockOut = null;

  if (
    employeeLogOutHour > actualCompanyLogOutHour ||
    (employeeLogOutHour === actualCompanyLogOutHour &&
      employeeLogOutMinute > actualCompanyLogOutMinutes)
  ) {
    const overTimeMinutes =
      (employeeLogOutHour - actualCompanyLogOutHour) * 60 +
      (employeeLogOutMinute - actualCompanyLogOutMinutes);
    overtime = `${overTimeMinutes} minutes overtime`;
  } else if (
    employeeLogOutHour < actualCompanyLogOutHour ||
    (employeeLogOutHour === actualCompanyLogOutHour &&
      employeeLogOutMinute < actualCompanyLogOutMinutes)
  ) {
    const earlyClockOutMinutes =
      (actualCompanyLogOutHour - employeeLogOutHour) * 60 +
      (actualCompanyLogOutMinutes - employeeLogOutMinute);
    earlyClockOut = `${earlyClockOutMinutes} minutes early clock-out`;
  }

  const attendanceRecord = await prisma.attendance.update({
    where: {
      employeeId_actualDate: {
        employeeId: employee.employeeId,
        actualDate: actualDate,
      },
    },
    data: {
      overTime: overtime,
      earlyClockOut,
      employeeLogoutTime: new Date(currentDateAndTime),
    },
  });
  return res.status(200).json({message: 'Employee attendance recorded', attendanceRecord});
};

// employee break in
export const takeBreak = async (req: Request, res: Response, next: NextFunction) => {
  const {employeeId, companyId} = (req as any).user;
  const currentDateAndTime = new Date();
  const actualDate = currentDateAndTime.toISOString().split('T')[0];

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      actualDate,
    },
  });

  if (!attendance) {
    return next(customErrorHandler(res, 'Attendance record not found', 404));
  }

  if (attendance.breakIn) {
    return next(customErrorHandler(res, 'You have already taken a break', 400));
  }
  const updatedAttendance = await prisma.attendance.update({
    where: {
      employeeId_actualDate: {
        employeeId,
        actualDate,
      },
    },
    data: {
      breakIn: currentDateAndTime,
    },
  });

  return res.json({updatedAttendance});
};

// employee breakout
export const breakOut = async (req: Request, res: Response, next: NextFunction) => {
  const {employeeId, companyId} = (req as any).user;
  const currentDateAndTime = new Date();
  const actualDate = currentDateAndTime.toISOString().split('T')[0];

  const attendanceRecord = await prisma.attendance.findUnique({
    where: {
      employeeId_actualDate: {
        employeeId,
        actualDate,
      },
    },
  });

  if (!attendanceRecord) return next(customErrorHandler(res, 'Attendance record not found', 404));
  if (!attendanceRecord.breakIn)
    return next(customErrorHandler(res, "You haven't take break", 404));
  const breakInDate = new Date(attendanceRecord.breakIn);
  const breakOutDate = new Date(currentDateAndTime);

  // calculating difference in millisecond
  const differenceInMilliseconds = breakOutDate.getTime() - breakInDate.getTime();

  // cnverting millisecond to minutes
  const breakInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));

  const updateAttendance = await prisma.attendance.update({
    where: {
      employeeId_actualDate: {
        employeeId,
        actualDate,
      },
    },
    data: {
      breakOut: currentDateAndTime,
      breakInMinutes: `${breakInMinutes.toString()} minutes`,
    },
  });

  return res.json({
    updateAttendance,
  });
};

// Display User clock in
export const displayUserAttendanceOfMonths = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {employeeId} = req.body;
  const companyId = (req as any).user.companyId;
  const currentDateAndTime = new Date();
  const year = currentDateAndTime.getFullYear();
  const month = currentDateAndTime.getMonth() + 1;

  const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript Date constructor
  const endDate = new Date(year, month, 0); // Last day of the month

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      employeeId: employeeId,
      companyId,
      actualDate: {
        gte: startDate.toISOString(),
        lte: endDate.toISOString(),
      },
    },
    include: {
      employee: true,
      department: true,
      company: true,
      team: true,
    },
  });
  return res.json({attendanceRecords});
};

// display users attendance of the current date
export const displayUserAttendanceOfCurrentDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  const currentDateAndTime = new Date();
  const currentDate = currentDateAndTime.toISOString().split('T')[0];
  const attendanceRecord = await prisma.attendance.findMany({
    where: {
      actualDate: currentDate,
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
  return res.json({message: attendanceRecord});
};

// display use attendance of specific date
export const displayUserAttendanceOfSpecificDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  const {date} = req.body;
  const specificDate = date.toISOString().split('T')[0];
  const attendanceRecord = await prisma.attendance.findMany({
    where: {
      actualDate: specificDate,
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
  return res.json({message: attendanceRecord});
};

export const employeeTodayClockInAndClockOutData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const employeeId = (req as any).user.employeeId;
  const companyId = (req as any).user.companyId;
  const currentDateAndTime = new Date();
  const currentDate = currentDateAndTime.toISOString().split('T')[0];

  const attendacneRecord = await prisma.attendance.findFirst({
    where: {
      actualDate: currentDate,
      companyId,
      employeeId,
    },
  });

  const totalWorkedDaysCount = await prisma.attendance.count({
    where: {
      companyId,
      employeeId,
    },
  });

  return res.json({attendacneRecord, totalWorkedDaysCount});
};

// get attendance of all the employee in the company
export const allEmployeeAttendanceInCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  const allAttendanceRecord = await prisma.attendance.findMany({
    where: {
      companyId,
    },
  });
  return res.json({allAttendanceRecord});
};
// export const ownAttendance = async ( req:Request, res:Response, next:NextFunction) => {
//   const companyId = (req as any).user.companyId
//   const employeeId = (req as any).user.employeeId
//   const attendacneRecord = await prisma.attendance.findMany({
//     where:{
//       companyId,employeeId
//     }
//   })
//   return res.json({attendacneRecord})
// }
export const ownAttendance = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const employeeId = (req as any).user.employeeId;
  const attendacneRecord = await prisma.attendance.findMany({
    where: {
      companyId,
      employeeId,
    },
  });
  return res.json({attendacneRecord});
};

export const displayOwnAttendanceOfSpecificDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  const employeeId = (req as any).user.employeeId;
  const {date} = req.body;
  if (!date || !/^\d{4}-\d{2}$/.test(date)) {
    return res.status(400).json({error: "Invalid date format. Expected 'YYYY-MM'."});
  }

  const year = parseInt(date.split('-')[0]);
  const month = parseInt(date.split('-')[1]);

  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]; // Start of the month
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // End of the month
  const attendanceRecord = await prisma.attendance.findMany({
    where: {
      actualDate: {
        gte: startDate,
        lte: endDate,
      },
      companyId,
      employeeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return res.json({attendanceRecord});
};

export const employeeAllAttendance = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const employeeId = req.params.employeeId;
  const attendacneRecord = await prisma.attendance.findMany({
    where: {
      companyId,
      employeeId,
    },
  });
  return res.json({attendacneRecord});
};

export const displayMonthlyInOutReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyId = (req as any).user.companyId;
    const {date} = req.body; // Assuming date is in the format "YYYY-MM"

    if (!date || !/^\d{4}-\d{2}$/.test(date)) {
      return res.status(400).json({error: "Invalid date format. Expected 'YYYY-MM'."});
    }

    const year = parseInt(date.split('-')[0]);
    const month = parseInt(date.split('-')[1]);

    // Calculate the first and last day of the month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]; // Start of the month
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // End of the month

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        actualDate: {
          gte: startDate, // Start of the specified month
          lte: endDate, // End of the specified month
        },
        companyId,
      },
      include: {
        employee: true, // Include related Employee data
        department: true, // Include related Department data
        team: true, // Include related Team data
        company: true, // Include related Company data
      },
    });

    return res.json(attendanceRecords);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return res.status(500).json({error: 'Internal server error'});
  }
};
