import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';
import {NextFunction, Request, Response} from 'express';

// export const addUsedApp = async (req: any, res:any, next:any) => {

//     const {appName, appLogo, appUsedDuration, appType, updatedAt, createdAt } = req.body;
//     const companyId = (req as any).user.companyId;
//     const departmentId = (req as any ).user?.departmentId;
//     const teamId = (req as any ).user?.teamId;

//     if ( !appName || !appLogo || !appUsedDuration || !appType || !updatedAt || !createdAt) {
//         return next(customErrorHandler(res, "Please provide all the information.", 401));
//     }

//     const usedApp = await prisma.app.findFirst({
//         where: {
//             appName, companyId
//         }
//     })

//     if(usedApp){
//         return next (customErrorHandler(res, "App already exist", 401));
//     }

//     const newUsedApp = await prisma.app.create({
//         data: {
//             appName,
//             appLogo,
//             appUsedDuration,
//             createdAt,
//             updatedAt,
//             appType,
//             companyId,
//             departmentId,
//             teamId
//         }
//     })

//     return res.json({message: "New used app added. ", app:newUsedApp})
// }

export const addUsedApp = async (req: any, res: any, next: any) => {
  const {appName, appUsedDuration} = req.body;
  const companyId = (req as any).user.companyId;
  const departmentId = (req as any).user?.departmentId;
  const employeeId = (req as any).user?.employeeId;
  const teamId = (req as any).user?.teamId;
  const currentDateAndTime = new Date();
  const day = currentDateAndTime.toISOString().split('T')[0];

  if (!req.file) return customErrorHandler(res, 'App icon is required', 400);
  const filename = req.file.filename;

  // Check if required fields are provided
  if (!appName) {
    return next(customErrorHandler(res, 'Please provide all the information.', 401));
  }

  // If it's an employee request, validate appUsedDuration
  if (!companyId && !appUsedDuration) {
    return next(customErrorHandler(res, 'appUsedDuration is required for employees.', 401));
  }

  // Check if the app already exists
  const usedApp = await prisma.app.findFirst({
    where: {
      appName,
      companyId,
    },
  });

  if (usedApp) {
    return next(customErrorHandler(res, 'App already exists.', 401));
  }

  let appReview = await prisma.appReview.findFirst({
    where: {
      appName,
      companyId,
    },
  });

  if (!appReview) {
    appReview = await prisma.appReview.create({
      data: {
        appName,
        appLogo: `uploads/appLogo/${filename}`,
        appReview: 'NEUTRAL',
        companyId,
      },
    });
  }
  // Create a new app entry
  const newUsedApp = await prisma.app.create({
    data: {
      appName,
      appLogo: `uploads/appLogo/${filename}`,
      appUsedDuration: appUsedDuration,
      appType: appReview.appReview,
      companyId,
      departmentId,
      teamId,
      employeeId,
      day,
    },
  });

  return res.json({message: 'New used app added.', app: newUsedApp});
};

export const usedDesktopApp = async (req: Request, res: Response, next: NextFunction) => {
  const {appDurations} = req.body;
  const companyId = (req as any).user.companyId;
  const departmentId = (req as any).user?.departmentId;
  const employeeId = (req as any).user?.employeeId;
  const teamId = (req as any).user?.teamId;
  const currentDateAndTime = new Date();
  const day = currentDateAndTime.toISOString().split('T')[0];

  if (!appDurations) {
    return next(customErrorHandler(res, 'App durations are required', 401));
  }

  try {
    for (const [appName, appUsedDuration] of Object.entries(appDurations) as [string, number][]) {
      const filename = `${appName}.png`; // Assumes logo filename based on app name

      // Check if the app already exists for the company
      // const usedApp = await prisma.app.findFirst({
      //     where: {
      //         appName,
      //         companyId
      //     }
      // });

      // if (usedApp) {
      //     return next(customErrorHandler(res, "App already exists.", 401));
      // }

      // Check if an app review exists for the app; if not, create a default review
      let appReview = await prisma.appReview.findFirst({
        where: {
          appName,
          companyId,
        },
      });

      if (!appReview) {
        appReview = await prisma.appReview.create({
          data: {
            appName,
            appLogo: `uploads/appLogo/${filename}`,
            appReview: 'NEUTRAL',
            companyId,
          },
        });
      }

      // Create a new app entry
      const newUsedApp = await prisma.app.create({
        data: {
          appName,
          appLogo: `uploads/appLogo/${filename}`,
          appUsedDuration: appUsedDuration.toString(), // Convert to string if needed
          appType: appReview.appReview,
          companyId,
          departmentId,
          teamId,
          employeeId,
          day,
        },
      });
    }

    res.status(201).json({message: 'App durations saved successfully'});
  } catch (error) {
    console.error('Error saving app durations:', error);
    next(customErrorHandler(res, 'Failed to save app durations', 500));
  }
};

enum AppType {
  PRODUCTIVE = 'PRODUCTIVE',
  UNPRODUCTIVE = 'UNPRODUCTIVE',
  NEUTRAL = 'NEUTRAL',
}

// add product and unproductive app by company
export const appProductAndUnproductiveAppByCompany = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {appName, appLogo, appReview} = req.body;
  const companyId = (req as any).user.companyId;

  const apps = await prisma.appReview.findFirst({
    where: {
      appName,
      companyId,
    },
  });

  if (apps) return next(customErrorHandler(res, 'Apps already in Reviewed section', 401));

  const productiveApps = await prisma.appReview.create({
    data: {
      appName,
      appLogo,
      companyId,
      appReview,
    },
  });

  return res.json({
    productiveApps,
  });
};

// update employee appType
export const updateAppType = async (req: any, res: any, next: any) => {
  const {appType} = req.body;
  const companyId = (req as any).user.companyId;
  const {appId} = req.params;

  const company = await prisma.app.findUnique({
    where: {
      companyId,
      appId,
    },
  });

  if (!company) return next(customErrorHandler(res, 'Cannot find app type', 404));

  const updatedAppType = await prisma.app.update({
    where: {
      companyId,
      appId,
    },
    data: {
      appType,
    },
  });

  if (updatedAppType) {
    await prisma.appReview.update({
      where: {
        companyId,
        appName: updatedAppType.appName,
      },
      data: {
        appReview: updatedAppType.appType,
      },
    });
  }

  return res.json({
    message: `Successfully defined as ${updatedAppType.appType}`,
    app: updatedAppType,
  });
};

// get Company App
export const getCompanyApp = async (req: any, res: any, next: any) => {
  const {companyId} = (req as any).user;
  const allapp = await prisma.appReview.findMany({
    where: {
      companyId,
    },
  });
  return res.json({allapp});
};

// get Employee used app in a day
export const getEmployeeUsedAppInADay = async (req: Request, res: Response, next: NextFunction) => {
  const {companyId} = (req as any).user;
  const {employeeId} = req.params;
  const {date} = req.query;

  // Ensure the date is a string
  const dateString = Array.isArray(date) ? date[0] : date;
  if (!dateString) return next(customErrorHandler(res, 'Date is required', 400));
  const employeeUsedAppsOfDay = await prisma.app.findMany({
    where: {
      day: dateString,
      companyId,
      employeeId,
    },
  });

  return res.json({
    employeeUsedAppsOfDay,
  });
};

// update app review
export const updateAppReview = async (req: Request, res: Response, next: NextFunction) => {
  const {companyId} = (req as any).user;
  const {appName, appReview} = req.body;
  const updatedReview = await prisma.appReview.update({
    where: {
      appName,
      companyId,
    },
    data: {
      appReview,
    },
  });
  return res.json({
    message: 'App review Updated',
  });
};

// Reviewed apps fo company
export const reviewedAppsForCompany = async (req: Request, res: Response, next: NextFunction) => {
  const {companyId} = (req as any).user;
  const reviewedApps = await prisma.appReview.findMany({
    where: {
      companyId,
      appReview: {not: 'NEUTRAL'},
    },
  });
  return res.json({reviewedApps});
};

// productive apps used in a day
export const productiveAppsForUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Heating');
  const {companyId, employeeId} = (req as any).user;
  const currentDateAndTime = new Date();
  const day = currentDateAndTime.toISOString().split('T')[0];
  console.log('Query Parameters: ', {companyId, employeeId, day});

  const productiveAppsForCompany = await prisma.appReview.findMany({
    where: {
      companyId,
    },
  });

  console.log('Productive Apps for Company: ', productiveAppsForCompany);

  const appsUsedByEmployee = await prisma.app.findMany({
    where: {
      employeeId,
      companyId,
      day,
    },
  });

  const productiveAppIds = new Set(
    productiveAppsForCompany
      .filter((app) => app.appReview == 'PRODUCTIVE')
      .map((app) => app.appName),
  );

  // Calculate the total number of apps used by the employee
  const totalAppsUsed = appsUsedByEmployee.length;

  // Calculate the number of productive apps used by the employee
  const productiveAppsUsed = appsUsedByEmployee.filter((app) =>
    productiveAppIds.has(app.appName),
  ).length;

  // Calculate the percentage of productive apps used
  const productiveAppsPercentage =
    totalAppsUsed > 0 ? (productiveAppsUsed / totalAppsUsed) * 100 : 0;

  // Respond with the result
  res.json({
    productiveAppsPercentage,
    totalAppsUsed,
    productiveAppsUsed,
  });
};
