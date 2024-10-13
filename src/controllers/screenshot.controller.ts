import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';
import { saveEncryptedFile,decryptAndSendFile } from '../lib/multer.js';
// crete Screenshot
export const addScreenshot = async (req: Request, res: Response, next: NextFunction) => {
  const nowInUTC = new Date().toISOString();
  const employee = (req as any).user;
  if (!req.file) return customErrorHandler(res, 'Screenshot is required', 400);
  // const filename = req.file.filename;
  // const filePath = path.join(__dirname, '../uploads/screenshot', req.file.filename);
//encrypt the image
// const encryptedImageBuffer = encryptImage(filePath)
//overwrite the original file with the encrypted data
// fs.writeFileSync(filePath,encryptedImageBuffer)
//store the encrypted image

const uploadedFiles = await Promise.all(
  req.files?.map(async (file: any) => {
    const encryptedFilePath = await saveEncryptedFile(file);
    return {
      name: file.originalname,
      filePath: encryptedFilePath, // Save encrypted file path
      mimeType: file.mimetype,
    };
  }) || []
);
  const findCompanyIsINFreeTrail= await prisma.freeTrail.findUnique({
  where:{
    companyId:employee.companyId
  }
})
console.log("🚀 ~ addScreenshot ~ findCompanyIsINFreeTrail:", findCompanyIsINFreeTrail)
if(findCompanyIsINFreeTrail){
  const company = await prisma.company.findUnique({
    where:{companyId:employee.companyId},
    select:{dailyScreenshotCount:true,totalScreenShots:true}
  })
  console.log("🚀 ~ addScreenshot ~ company:", company)
if(!company){
  console.log("haha")
  return res.status(400).json({error: 'Daily Screenshot not found'});

}
  if(company?.dailyScreenshotCount>=25){
    console.log('limit pugo')
    return res.status(403).json({message:"Screenshot limit for the day is reached."})
  }
}
console.log('haha2')
  const screenshot = await prisma.screenshot.create({
    data: {
      employeeId: employee.employeeId,
      departmentId: employee.departmentId,
      teamId: employee.teamId,
      companyId: employee.companyId,
      time: nowInUTC,
      imageLink: `uploads/screenshot/${req.file.filename}`,
    },
  });
 const update= await prisma.company.update({
    where:{
      companyId:employee.companyId
    },data:{
      dailyScreenshotCount:{
        increment:1
      },
      totalScreenShots:{
      increment:1
    }
  }
  }) 
  console.log("🚀 ~ addScreenshot ~ update:", update)
  return res.json({message: 'Screenshot'});
};

// Get all screenshot of own
export const getAllScreenshotOfOwn = async (req: Request, res: Response, next: NextFunction) => {
  const employee = (req as any).user;
  const screenshots = await prisma.screenshot.findMany({
    where: {
      employeeId: employee.employeeId,
      companyId: employee.companyId,
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
  return res.json({screenshots});
};

// get screenshot of the user
export const getAllScreenshotOfUser = async (req: Request, res: Response, next: NextFunction) => {
  const {employeeId} = req.params;
  // const employee = (req as any).user;
  const companyId = (req as any).user.companyId;
  const screenshots = await prisma.screenshot.findMany({
    where: {
      employeeId,
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
  return res.json({screenshots});
};

// Get one screenshot
export const getOneScreenshot = async (req: Request, res: Response, next: NextFunction) => {
  const {screenshotId} = req.params;
  const {companyId} = (req as any).user;

  const screenshot = await prisma.screenshot.findFirst({
    where: {
      companyId,
      screenshotId,
    },
  });
  return res.json({screenshot});
};

export const getAllScreenshotOfDay = async (req: Request, res: Response, next: NextFunction) => {
  const {companyId} = (req as any).user;
  const currentDate = new Date();
  const startOfToday = currentDate.setHours(0, 0, 0, 0); // Start of today
  const endOfToday = currentDate.setHours(23, 59, 59, 999); // End of today
  const screenshots = await prisma.screenshot.findMany({
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
  return res.json({screenshots});
};

export const getScreenshotOfSpecificDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {companyId} = (req as any).user;
    const {date} = req.params;
    console.log(date, 'DAT');

    // Check if date is a string and is not empty
    if (typeof date !== 'string' || !date) {
      return res.status(400).json({error: 'Invalid date parameter'});
    }

    const parsedDate = new Date(date);

    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({error: 'Invalid date format'});
    }

    const screenshots = await prisma.screenshot.findMany({
      where: {
        companyId,
        createdAt: {
          gte: parsedDate,
        },
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

    res.json(screenshots);
  } catch (error) {
    next(error);
  }
};

export const getScreenshotOfEmployeeSpecificDate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {companyId} = (req as any).user;
    const {employeeId} = req.params;
    const {date} = req.query;
    console.log(date, 'DAT');

    // Check if date is a string and is not empty
    if (typeof date !== 'string' || !date) {
      return res.status(400).json({error: 'Invalid date parameter'});
    }

    const parsedDate = new Date(date);

    // Check if the parsed date is valid
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({error: 'Invalid date format'});
    }

    const screenshots = await prisma.screenshot.findMany({
      where: {
        companyId,
        employeeId,
        createdAt: {
          gte: parsedDate,
        },
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

    res.json(screenshots);
  } catch (error) {
    next(error);
  }
};
