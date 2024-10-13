import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';

export const createDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const {departmentName,employeeEmail} = req.body;

  const companyId = (req as any).user.companyId;


  const transaction = await prisma.$transaction(async (prisma) => {
    // Find the employee in the temporary table
    const tempEmployee = await prisma.employeeTemp.findFirst({
      where: {
        email: employeeEmail,
        companyId,
      },
    });

    if (!tempEmployee) {
      throw new Error('No temporary employee found, cannot proceed.');
    }


  const department = await prisma.department.findFirst({
    where: {
      departmentName,
      companyId,
    },
  });

  if (!department)
    return next(customErrorHandler(res, 'Invalid Department selection', 400));

  // const newDepartment = await prisma.department.create({
  //   data: {
  //     departmentName,
  //     companyId,
  //   },
  // });
   // Finalize employee registration by moving data from EmployeeTemp to Employee
   const newEmployee = await prisma.employee.create({
    data: {
      employeeName: tempEmployee.employeeName,
      email: tempEmployee.email,
      employeeAddress: tempEmployee.employeeAddress,
      phoneNumber: tempEmployee.phoneNumber,
      companyId: tempEmployee.companyId,
      position: tempEmployee.position,
      password: tempEmployee.password,
      isActive: true,
    },
  });
      // Clean up temporary employee record
      await prisma.employeeTemp.delete({
        where: {
          email: employeeEmail,
        },
      })
  await prisma.company.update({
    where: {
      companyId,
    },
    data: {
      noOfDepartments: {
        increment: 1,
      },
    },
  });
  return newEmployee;
})
  return res.json({message: 'Department Created',employee:transaction});
};

// update Department
export const updateDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const {departmentId} = req.params;
  const {
    departmentName,
    departmentHead,
  }: {departmentName: string; noOfTeams: number; departmentHead: any} = req.body;
  const companyId = (req as any).user.companyId;
  const department = await prisma.department.findFirst({
    where: {
      departmentId,
      companyId,
    },
  });

  if (!department) return next(customErrorHandler(req, 'Department does not exist', 404));

  const updatedDepartment = await prisma.department.update({
    where: {
      departmentId: department.departmentId,
      companyId,
    },
    data: {
      departmentName,
      departmentHead,
    },
  });

  return res.json({message: 'Department Updated!', updatedDepartment});
};

// Get all department of company
export const getAllDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const departments = await prisma.department.findMany({
    where: {
      companyId,
    },
  });
  return res.json({departments});
};

// department
export const getDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const {departmentId} = req.params;
  const companyId = (req as any).user.companyId;
  const department = await prisma.department.findFirst({
    where: {
      companyId,
      departmentId,
    },
  });
  return res.json({department});
};

// Delete department
export const deleteDepartment = async (req: Request, res: Response, next: NextFunction) => {
  const {departmentId} = req.params;
  const companyId = (req as any).user.companyId;
  const deletedDepartment = await prisma.department.delete({
    where: {
      departmentId,
      companyId,
    },
  });

  await prisma.company.update({
    where: {
      companyId,
    },
    data: {
      noOfDepartments: {
        decrement: 1,
      },
    },
  });

  if (deletedDepartment) {
    res.status(200).json({message: 'Department Deleted', deletedDepartment});
  } else {
    res.status(404).json({message: 'Department not found'});
  }
};

export const getAllDepartmentEmployee = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const {departmentId} = req.params;
  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      departmentId,
    },
    select: {
      employeeId: true,
      employeeName: true,
      email: true,
      team: {
        select: {
          teamId: true,
          teamName: true,
        },
      },
    },
  });
  res.json(employees);
};
