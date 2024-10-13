import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import bcrypt from 'bcrypt';
import {createToken} from '../utils/createToken.js';
import prisma from '../models/index.js';
export const registerEmployee = async (req: Request, res: Response, next: NextFunction) => {
  const {employeeName, email, phoneNumber, password, employeeAddress, position} = req.body;
if(!employeeName || !email || !phoneNumber|| !password || !employeeAddress || !position){
  return next(customErrorHandler(res, 'please fill all the fields', 401));

}
  const companyId = (req as any).user.companyId;
  const employee = await prisma.employee.findFirst({
    where: {
      email,
    },
  });
  if (employee)
    return next(customErrorHandler(res, 'Employee With This email Already Exist!', 401));
  const hashedPassword = await bcrypt.hash(password, 10);
  // const newEmployee = await prisma.employee.create({
  //   data: {
  //     employeeName,
  //     email,
  //     employeeAddress,
  //     phoneNumber,
  //     companyId,
  //     position,
  //     password: hashedPassword,
  //     isActive: true,
  //   },
  // });
  // await prisma.company.update({
  //   where: {
  //     companyId,
  //   },
  //   data: {
  //     noOfEmployees: {
  //       increment: 1,
  //     },
  //   },
  // });
 const tempEmployee = await prisma.employeeTemp.create({
    data: {
      employeeName,
      email,
      employeeAddress,
      phoneNumber,
      companyId,
      position,
      password: hashedPassword,
      isActive:false
    },
  });
  setTimeout(async()=>{
    const foundEmployee=await prisma.employeeTemp.findFirst({where:{employeeId:tempEmployee.employeeId}})
    if(foundEmployee){
      await prisma.employeeTemp.delete({where:{employeeId:tempEmployee.employeeId}});

    }
  },10*60*1000)
  return res.json({message: 'Employee Created, awaiting department and team assignment', employee: tempEmployee});
};

export const loginEmployee = async (req: Request, res: Response, next: NextFunction) => {
  const {email, password} = req.body;
  const employee = await prisma.employee.findFirst({
    where: {
      email,
    },
  });
  if (!employee) return next(customErrorHandler(res, 'Invalid Credentials', 401));
  const isMatch = await bcrypt.compareSync(password, employee.password);
  if (!isMatch) return next(customErrorHandler(res, 'Invalid Credentials', 401));
  if (!employee.isActive)
    return next(
      customErrorHandler(res, 'You are currently inactive please contact to your company.', 401),
    );
  const token = createToken(
    {email, employeeId: employee.employeeId},
    process.env.JWT_LOGIN_SECRET,
    process.env.JWT_EXPIRY_TIME,
  );

  return res.status(200).json({message: 'Login Success', token});
};

// Update employee department and table
export const updateEmployeeDepartmentAndTeam = async (req: Request,res: Response, next: NextFunction,) => {
  const {departmentId, teamId} = req.body;
  const {employeeId} = req.params;
  const companyId = (req as any).user.companyId;
  const tempEmployee=await prisma.employeeTemp.findFirst({where:{employeeId,companyId}})
  if(!tempEmployee)return next(customErrorHandler(res,'Temporary employee not found',404));
  const updatedEmployee = await prisma.employee.create({
  
    data: {
      employeeName: tempEmployee.employeeName,
      email: tempEmployee.email,
      employeeAddress: tempEmployee.employeeAddress,
      phoneNumber: tempEmployee.phoneNumber,
      companyId,
      position: tempEmployee.position,
      password: tempEmployee.password,
      departmentId,
      teamId,
      isActive: true,
    },
  });

  await prisma.employeeTemp.delete({where:{employeeId}})

  await prisma.team.update({
    where: {
      companyId,
      teamId,
    },
    data: {
      noOfEmployee: {
        increment: 1,
      },
    },
  });

  return res.json({message: 'Employee Updated', updatedEmployee});
};

export const getEmployeeProfile = async (req: Request, res: Response, next: NextFunction) => {
  const employeeId = (req as any).user.employeeId;
  const profile = await prisma.employee.findFirst({
    where: {
      employeeId,
    },
  });

  return res.json({
    profile,
  });
};

// get all employee of company
export const getAllEmployeeOfCompany = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const employee = await prisma.employee.findMany({
    where: {
      companyId,
    },
  });
  return res.json({
    employee,
  });
};
