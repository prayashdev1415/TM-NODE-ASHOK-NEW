import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';
import {getReceiverSocketId, io} from '../socket/socket.js';

export const sendNotificationFromCompanyToEmployee = async (
  from: string,
  to: string,
  message: string,
  links?: string,
) => {
  try {
    const data = await prisma.notification.create({
      data: {
        message,
        senderCompanyId: from,
        receiverEmployeeId: to,
        links,
      },
    });
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('send-notification', {
        data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// send notification
export const sendNotificationFromEmployeeToCompany = async (
  from: string,
  to: string,
  message: string,
  links?: string,
) => {
  try {
    const data = await prisma.notification.create({
      data: {
        message,
        senderEmployeeId: from,
        receiverCompanyId: to,
        links,
      },
    });
    const receiverSocketId = getReceiverSocketId('company_' + to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('send-notification', {
        data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Get unread notification
export const getUnreadNotificationsOfCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  try {
    const unReadNotifications = await prisma.notification.findMany({
      where: {
        receiverCompanyId: companyId,
        isRead: false,
      },
      include: {
        senderEmployee: {
          select: {
            employeeName: true,
            position: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.json({
      unReadNotifications,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUnreadNotificationsCountOfCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  try {
    const unReadNotifications = await prisma.notification.count({
      where: {
        receiverCompanyId: companyId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.json({
      unReadNotifications,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUnreadNotificationsOfEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const employeeId = (req as any).user.employeeId;
  try {
    const unReadNotifications = await prisma.notification.findMany({
      where: {
        receiverEmployeeId: employeeId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.json({
      unReadNotifications,
    });
  } catch (error) {
    console.log(error);
  }
};

// notification count employee
export const getUnreadNotificationsCountOfEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const employeeId = (req as any).user.employeeId;
  try {
    const unReadNotifications = await prisma.notification.count({
      where: {
        receiverEmployeeId: employeeId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return res.json({
      unReadNotifications,
    });
  } catch (error) {
    console.log(error);
  }
};

// mark as read notification
export const markAsReadNotification = async (req: Request, res: Response, next: NextFunction) => {
  const {notificationId} = req.params;
  try {
    const notification = await prisma.notification.update({
      where: {
        notificationId,
      },
      data: {
        isRead: true,
      },
    });
    return res.json({message: 'Notification marked as read', notification});
  } catch (error) {
    console.log(error);
  }
};
