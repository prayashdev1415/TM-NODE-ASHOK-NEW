import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';

export const addRiskUser = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const {employeeId} = req.params;

  const employee = await prisma.employee.findUnique({
    where: {employeeId},
  });

  if (!employee) {
    return next(customErrorHandler(res, 'Employee not found.', 404));
  }

  const existingRiskUser = await prisma.riskUser.findFirst({
    where: {
      employeeId,
      companyId,
    },
  });

  if (existingRiskUser) {
    return next(customErrorHandler(res, 'Employee already exists in RiskUser.', 404));
  }

  const newRiskUser = await prisma.riskUser.create({
    data: {
      employeeId,
      employeeName: employee.employeeName,
      departmentId: employee.departmentId,
      companyId,
      isSafe: false, // Assuming a default value
    },
  });

  return res.status(201).json({message: 'Employee added to RiskUser.', riskUser: newRiskUser});
};

export const getriskUser = async (req: any, res: any, next: any) => {
  const companyId = req.user.company;

  const getuser = await prisma.riskUser.findMany({
    where: {
      companyId,
    },
    include: {
      employee: {
        select: {
          employeeId: true,
          employeeName: true,
          employeeAddress: true,
          position: true,
        },
      },
    },
  });
  return res.json({message: 'employee details', riskUser: getuser});
};

export const safeUser = async (req: any, res: any, next: any) => {
  const {riskUserId} = req.params;
  const companyId = req.user.companyId; // Extract companyId from the decoded JWT token

  const riskUser = await prisma.riskUser.findUnique({
    where: {
      riskUserId,
      companyId,
    },
  });

  if (!riskUser) {
    return next(customErrorHandler(res, 'RiskUser not found.', 404));
  }

  if (riskUser.companyId !== companyId) {
    return next(customErrorHandler(res, 'Unauthorized access to delete this RiskUser.', 403));
  }

  await prisma.riskUser.delete({
    where: {riskUserId},
  });

  return res.status(200).json({message: 'RiskUser deleted successfully.'});
};

export const addToInactive = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const riskUserId = req.body.riskUserId;
  const {employeeId} = req.params;

  if (!employeeId || !companyId || !riskUserId) {
    return next(customErrorHandler(res, 'Please provide all the necessary information', 401));
  }

  const employee = await prisma.employee.findUnique({
    where: {employeeId},
    include: {
      department: true,
      team: true,
    },
  });

  const riskUser = await prisma.riskUser.findUnique({
    where: {
      riskUserId,
      companyId,
      employeeId,
    },
  });

  if (!employee) {
    return next(customErrorHandler(res, 'Employee not found', 404));
  }

  // Save employee details to DeletedEmployee table
  const inactiveUser = await prisma.employee.update({
    where: {
      employeeId,
      companyId,
    },
    data: {
      isActive: false,
    },
  });

  await prisma.company.update({
    where: {
      companyId,
    },
    data: {
      noOfEmployees: {
        decrement: 1,
      },
    },
  });

  await prisma.team.update({
    where: {
      companyId,
      teamId: inactiveUser.teamId?.toString(),
    },
    data: {
      noOfEmployee: {
        decrement: 1,
      },
    },
  });

  await prisma.deletedEmployee.create({
    data: {
      employeeId,
      companyId,
      employeeName: employee.employeeName,
      addedAt: new Date(),
    },
  });

  if (riskUser) {
    await prisma.riskUser.delete({
      where: {riskUserId}, // Use riskUserId here
    });
  }

  return res.json({
    message: `Employee ${employee.employeeName} account has been deactivated.`,
    employee: inactiveUser,
  });
};

export const getAllInactiveUser = async (req: any, res: any, next: any) => {
  const allInactiveUser = await prisma.deletedEmployee.findMany();
  return res.json({allInactiveUser});
};
