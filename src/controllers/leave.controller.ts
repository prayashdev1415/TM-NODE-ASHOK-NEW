import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';
import {
  sendNotificationFromCompanyToEmployee,
  sendNotificationFromEmployeeToCompany,
} from './notification.controller.js';

// Apply for Leave
export const applyLeave = async (req: any, res: any, next: any) => {
  const employeeId = (req as any).user.employeeId;
  const companyId = (req as any).user.companyId;
  const departmentId = (req as any).user?.departmentId;
  const teamId = (req as any).user?.teamId;
  const {leaveType, reason, noOfDays, leaveSession, leaveFrom, leaveTo} = req.body;

  if (
    !leaveFrom ||
    !leaveTo ||
    !leaveSession ||
    !noOfDays ||
    !reason ||
    !leaveType ||
    !employeeId ||
    !companyId
  ) {
    return next(customErrorHandler(res, 'Pleass provide all the information.', 401));
  }

  const employee: any = await prisma.employee.findUnique({
    where: {
      employeeId,
      companyId,
    },
  });

  if (!employee) {
    return next(customErrorHandler(res, 'Inavlid User', 401));
  }
  const newLeave = await prisma.leave.create({
    data: {
      leaveType,
      reason,
      noOfDays,
      leaveSession,
      leaveFrom: new Date(leaveFrom),
      leaveTo: new Date(leaveTo),
      employeeId,
      companyId,
      departmentId,
      teamId,
    },
  });

  sendNotificationFromEmployeeToCompany(employeeId, companyId, 'Want leave');

  return res.json({message: 'Leave requested successfully.', leave: newLeave});
};

//Delete Applyed Leave befor being approve or reject
export const deleteleave = async (req: any, res: any, next: any) => {
  // const { employeeId} = req.body;
  const employeeId = (req as any).user.employeeId;
  const {leaveId} = req.params;
  const companyId = (req as any).user.companyId;

  const leave = await prisma.leave.findFirst({
    where: {
      leaveId,
    },
  });
  if (leave?.leaveStatus == 'PENDING') {
    const deleteLeave = await prisma.leave.delete({
      where: {
        employeeId,
        leaveId,
        companyId,
      },
    });
    if (deleteLeave) {
      return res.status(200).json({message: 'Leave Deleted', deleteLeave});
    }
  }
  return next(customErrorHandler(res, 'Can not Delete Leave 😔', 400));
};

enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVE = 'APPROVE',
  DECLINED = 'DECLINED',
}

// Update Leave status of employees
export const leaveStatusUpadate = async (req: any, res: any, next: any) => {
  const {leaveId} = req.params;
  const {leaveStatus, employeeId} = req.body;
  const companyId = (req as any).user.companyId;

  if (!leaveStatus) {
    return next(customErrorHandler(res, 'Please provide all the required details.', 401));
  }

  let statusText = LeaveStatus.PENDING;

  if (leaveStatus === 'APPROVE') {
    statusText = LeaveStatus.APPROVE;
    sendNotificationFromCompanyToEmployee(companyId, employeeId, 'Your Leave has been approved');
  } else if (leaveStatus === 'DECLINED') {
    statusText = LeaveStatus.DECLINED;
    sendNotificationFromCompanyToEmployee(companyId, employeeId, 'Your Leave has been declined');
  } else {
    statusText = LeaveStatus.PENDING;
    sendNotificationFromCompanyToEmployee(companyId, employeeId, 'Your Leave is on pending');
  }

  const statusUpdate = await prisma.leave.update({
    where: {
      employeeId,
      companyId,
      leaveId,
    },
    data: {
      leaveStatus: statusText,
    },
  });

  return res.json({message: 'Leave requested successfully.', leave: statusUpdate});
};

export const getallleave = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const allLeave = await prisma.leave.findMany({
    where: {
      companyId,
    },
    include: {
      employee: {
        select: {
          employeeName: true,
          position: true,
        },
      },
      department: {
        select: {
          departmentName: true,
        },
      },
    },
  });
  return res.json({allLeave});
};

// display leave status of employee
export const displayLeaveStatusOfEmployee = async (req: any, res: any, next: any) => {
  const {companyId, employeeId} = (req as any).user;

  const leavestatus = await prisma.leave.findMany({
    where: {
      companyId,
      employeeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return res.json({leavestatus});
};

export const getEmployeAllLeave = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const employeeId = req.params.employeeId;
  const allLeave = await prisma.leave.findMany({
    where: {
      companyId,
      employeeId,
    },
  });
  return res.json({allLeave});
};
