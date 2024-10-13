import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {createToken} from '../utils/createToken.js';
import prisma from '../models/index.js';
import {otpVerification, forgetPwOTP} from '../lib/mail.js';
export const totalTeamsDepartmentsAndEmployeeOfCompany = async(req:Request,res:Response,next:NextFunction)=>{
  const companyId = (req as any).user.companyId;
  const currentDateAndTime = new Date();
  const currentDate = currentDateAndTime.toISOString().split("T")[0]
//To fetch total number of team
  const noOfTeams = await prisma.team.count({
      where:{
          companyId
      }
  })
// To fetch total number of department
  const noOfDepartments = await prisma.department.count({
      where:{
          companyId
      }
  })
//To fetch the number of employees
  const noOfEmployees = await prisma.employee.count({
      where:{
          companyId
      }
  })
//To fetch the number of present employees
  const employeeActiveToday = await prisma.attendance.findMany({
      where: {
          actualDate: currentDate,
          companyId
      }
  })
//To fetch the number of abscent employees
const allEmployees = await prisma.employee.findMany({
  where:{
    companyId
  },select:{
    employeeId:true,
    employeeName:true
  }
})
console.log("🚀 ~ totalTeamsDepartmentsAndEmployeeOfCompany ~ allEmployees:", allEmployees)
const presentEmployeeIds = employeeActiveToday.map((attendance) => attendance.employeeId);

const nonPresentEmployees=allEmployees.filter(
  (employee)=>!presentEmployeeIds.includes(employee.employeeId)
)
console.log("🚀 ~ totalTeamsDepartmentsAndEmployeeOfCompany ~ nonPresentEmployees:", nonPresentEmployees)
const abscentEmployeeCount = nonPresentEmployees.length

  const noOfEmployeeActieToday = employeeActiveToday.length;
  // Get unique employee IDs from the attendance table
  const uniqueAttendanceEmployees = await prisma.attendance.findMany({
      where: {
          companyId
      },
      distinct: ['employeeId'],
      select: {
          employeeId: true
      }
  });
  const uniqueEmployeeCount = uniqueAttendanceEmployees.length;
  const appNotUsed = noOfEmployees - uniqueEmployeeCount
  return res.json({
      noOfTeams,
      noOfDepartments,
      noOfEmployees,
      appNotUsed,
      noOfEmployeeActieToday,
      abscentEmployeeCount
  });
}
export const topUsedAppAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  const analysis = await prisma.app.groupBy({
    take: 7,
    by: ['appName'],
    where: {
      employeeId: {
        not: null,
      },
    },
    _count: {
      employeeId: true,
    },
    orderBy: {
      _count: {
        employeeId: 'desc',
      },
    },
  });
  const cleanData = analysis.map((data) => ({
    noOfEmployee: data._count.employeeId,
    appName: data.appName,
  }));
  return res.json(cleanData);
};

// work productivity analysis
export const sevenDaysWorkAnalysis = async (req: Request, res: Response, next: NextFunction) => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const analysis = await prisma.app.groupBy({
    take: 7,
    by: ['appType'],
    where: {
      createdAt: {
        gte: sevenDaysAgo.toISOString(),
        lte: today.toISOString(),
      },
    },
    _count: {
      employeeId: true,
    },
    orderBy: {
      _count: {
        employeeId: 'desc',
      },
    },
  });
  const cleanData = analysis.map((data) => ({
    appType: data.appType,
    noOfEmployees: data._count.employeeId,
  }));
  return res.json(cleanData);
};

const getLastNDays = (n: number) => {
  const today = new Date();
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};
export const workAnalysisOfCompany = async (req: Request, res: Response, next: NextFunction) => {
  const sevenDays = getLastNDays(7);
  try {
    // Aggregate counts for each date within the last 7 days
    const analysis = await prisma.attendance.groupBy({
      by: ['actualDate'],
      where: {
        actualDate: {
          in: sevenDays, // Ensure only the last 7 days are considered
        },
      },
      _count: {
        overTime: true,
        earlyClockOut: true,
        breakIn: true,
      },
      orderBy: {
        actualDate: 'desc',
      },
    });
    // Create a map for quick lookup
    const analysisMap = new Map(analysis.map((item) => [item.actualDate, item]));
    // Fill in missing dates with zero counts
    const cleanedAnalysis = sevenDays.map((date) => {
      const data = analysisMap.get(date);
      return {
        actualDate: date,
        dates_count: data
          ? data._count.overTime + data._count.earlyClockOut + data._count.breakIn
          : 0,
        overUtilized: data ? data._count.overTime : 0,
        lessUtilized: data ? data._count.earlyClockOut : 0,
        healthy: data ? data._count.breakIn : 0,
      };
    });
    // Send the cleaned data in the response
    return res.json({
      success: true,
      data: cleanedAnalysis,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing the data.',
    });
  }
};
