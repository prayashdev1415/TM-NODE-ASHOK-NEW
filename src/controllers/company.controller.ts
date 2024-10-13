import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {createToken} from '../utils/createToken.js';
import prisma from '../models/index.js';
import {otpVerification, forgetPwOTP} from '../lib/mail.js';
import jwt from 'jsonwebtoken';
import {jwtDecode} from 'jwt-decode';

// Register company
export const registerCompany = async (req: any, res: any, next: any) => {
  const {companyEmail, companyName, location, password, companyPhoneNumber} = req.body;

  if (!companyEmail || !companyName || !location || !password)
    return next(customErrorHandler(res, 'Insert all the field', 401));
  const company = await prisma.company.findFirst({
    where: {
      companyEmail,
    },
  });

  if (company) return next(customErrorHandler(res, 'Company with this email already exist', 401));
  const hashedPassword = await bcrypt.hash(password, 10);

  const createdCompany= await prisma.company.create({
    data: {
      companyEmail,
      companyName,
      location,
      companyPhoneNumber,
      password: hashedPassword,
    },
  });

  function generateOTP() {
    const randomNum = Math.random() * 900000;
    const otp = Math.floor(100000 + randomNum);
    return otp;
  }
  const otp = generateOTP();

  await otpVerification({
    email: companyEmail,
    subject: 'Verify your OTP',
    companyName: companyName,
    otp: otp,
  });
  await prisma.companyRegistrationOTP.create({
    data: {
      otp: otp.toString(),
      companyEmail,
    },
  });
  return res.json({
    data:{
     companyId: createdCompany.companyId},
    message: `Otp has been Sent to your email: ${companyEmail} `,
    
  });
};

// company otp verification
export const verifyCompanyRegistrationOTP = async (req: any, res: any, next: any) => {
  const {otp, companyEmail} = req.body;
  const companyOTP = await prisma.companyRegistrationOTP.findFirst({
    where: {
      companyEmail,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (otp == companyOTP?.otp) {
    const company = await prisma.company.findFirst({
      where: {
        companyEmail,
      },
    });

    const updatedCompany = await prisma.company.update({
      where: {
        companyEmail,
      },
      data: {
        isVerified: true,
      },
    });
    return res.json({message: 'Company Verified Wait for Admin approval. '});
  }
  return next(customErrorHandler(res, 'Wrong OTP.', 400));
};

// Login Company
export const loginCompany = async (req: any, res: any, next: any) => {
  console.log('comapny login');
  const {companyEmail, password} = req.body;
  const company = await prisma.company.findFirst({
    where: {
      companyEmail,
    },
  });
  console.log('🚀 ~ loginCompany ~ company:', company);
  if (!company) return next(customErrorHandler(res, 'Invalid Credentials', 401));
  const isMatch = await bcrypt.compareSync(password, company.password);
  console.log('🚀 ~ loginCompany ~ isMatch:', isMatch);
  if (!isMatch) return next(customErrorHandler(res, 'Invalid Credentials', 401));
  const token = createToken(
    {companyEmail, companyId: company.companyId},
    process.env.JWT_LOGIN_SECRET,
    process.env.JWT_EXPIRY_TIME,
  );
  if (!company.isVerified)
    return next(customErrorHandler(res, 'Your OTP verification is not completed.', 400));
  if (!company.isApproved)
    return next(customErrorHandler(res, 'Your company approval is on pending.', 400));
  return res.status(200).json({message: 'Login Success', token});
};

export const googleLoginCompany = async (req: any, res: any, next: any) => {
  const googleId = req.body.googleId;
  console.log('🚀 ~ googleLoginCompany ~ googleId:', googleId);
  const companyDetails: any = jwtDecode(googleId);
  console.log('🚀 ~ googleLoginCompany ~ companyDetails:', companyDetails);
  const companyEmail = companyDetails?.email;
  const companyName = companyDetails.given_name;
  const password = companyDetails?.sub;
  const hashedPassword = await bcrypt.hash(password, 10);
  // const password = companyDetails?.
  console.log('🚀 ~ googleLoginCompany ~ companyDetails:', companyDetails);
  const Exists = await prisma.company.findFirst({
    where: {
      companyEmail,
    },
  });
  console.log('🚀 ~ googleLoginCompany ~ Exists:', Exists);

  if (!Exists) {
    const createCompany = await prisma.company.create({
      data: {
        companyEmail,
        companyName,
        isApproved: true,
        // location,
        // companyPhoneNumber,
        password: hashedPassword,
      },
    });

    //  console.log("🚀 ~ googleLoginCompany ~ createCompany:", createCompany.companyId)
    // const isMatch = bcrypt.compareSync(password,createCompany?.password)
    // console.log("🚀 ~ googleLoginCompany ~ isMatch:", isMatch)
    // if (!isMatch){
    //   return next(customErrorHandler(res, "Invalid Credentials", 401));
    // }
    const token = createToken(
      {companyEmail, companyId: createCompany.companyId},
      process.env.JWT_LOGIN_SECRET,
      process.env.JWT_EXPIRY_TIME,
    );

    return res.status(200).json({message: 'Login Success', token});
  } else {
    const isMatch = bcrypt.compareSync(password, Exists?.password);
    console.log('🚀 ~ googleLoginCompany ~ isMatch:', isMatch);
    if (!isMatch) {
      return next(customErrorHandler(res, 'Invalid Credentials', 401));
    }
    const token = createToken(
      {companyEmail, companyId: Exists.companyId},
      process.env.JWT_LOGIN_SECRET,
      process.env.JWT_EXPIRY_TIME,
    );
    return res.status(200).json({message: 'Login Success', token});
  }
};

//  actual login time of the company
export const actualTimeOfCompany = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const {actualLoginTime, actualLogoutTime} = req.body;
  const timeOfCompany = await prisma.actualTimeOfCompany.findFirst({
    where: {
      companyId,
    },
  });

  if (timeOfCompany)
    return next(
      customErrorHandler(
        res,
        'Already set Login and logout time please update existing time.',
        400,
      ),
    );
  const newTimeOfCompany = await prisma.actualTimeOfCompany.create({
    data: {
      actualLoginTime,
      actualLogoutTime,
      companyId,
    },
  });

  return res.json({companyTime: newTimeOfCompany});
};

// actual company time
export const getActualTimeOfCompany = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const actualCompanyTime = await prisma.actualTimeOfCompany.findFirst({
    where: {
      companyId,
    },
  });
  return res.json({
    actualCompanyTime,
  });
};

// update company time
export const updateActualCompanyTime = async (req: any, res: any, next: any) => {
  const companyId = (req as any).user.companyId;
  const {actualTimeId} = req.params;
  const {actualLoginTime, actualLogoutTime} = req.body;
  const timeOfCompany = await prisma.actualTimeOfCompany.findFirst({
    where: {
      companyId,
    },
  });

  if (!timeOfCompany)
    return next(customErrorHandler(res, 'Actual Time of company not found.', 400));

  const updatedCompanyTime = await prisma.actualTimeOfCompany.update({
    where: {
      companyId,
      actualTimeId,
    },
    data: {
      actualLoginTime,
      actualLogoutTime,
    },
  });

  return res.json({message: 'Update Company Time', updatedCompanyTime});
};

// get all employee of company
export const getAllEmployeeOfCompany = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
    },
  });

  return res.json({
    employees,
  });
};

// get all employee of department
export const getAllEmployeeOfDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const companyId = (req as any).user.companyId;
  const {departmentId} = req.params;

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      departmentId,
    },
  });

  return res.json({employees});
};

// get all employee of teams
export const getAllEmployeeOfTeams = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const {teamId} = req.params;

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      teamId,
    },
  });
  return res.json({employees});
};

export const forgetPassword = async (req: any, res: any, next: any) => {
  const {companyEmail, companyName} = req.body;

  // Find the company by email
  const company = await prisma.company.findFirst({
    where: {
      companyEmail,
    },
  });

  // If the company does not exist, return an error
  if (!company) {
    return next(customErrorHandler(res, 'Email not found.', 400));
  }

  // Function to generate OTP
  function generateOTPforForgetPw() {
    const randomNum = Math.random() * 900000;
    const otp = Math.floor(100000 + randomNum);
    return otp;
  }

  // Generate OTP
  const otp = generateOTPforForgetPw();

  // Send OTP to email (implementation not shown here)
  await forgetPwOTP({
    email: companyEmail,
    subject: 'Verify your OTP',
    companyName: companyName,
    otp: otp,
  });

  // Create entry in the database
  await prisma.forgetPwOTPStore.create({
    data: {
      otp: otp.toString(),
      companyEmail,
    },
  });

  // Respond with a success message
  return res.json({
    message: `OTP has been sent to your email: ${companyEmail}`,
  });
};

export const verifyForgetPwOTP = async (req: any, res: any, next: any) => {
  const {otp, companyEmail} = req.body;

  // Find the most recent OTP entry for the given email
  const PwOTP = await prisma.forgetPwOTPStore.findFirst({
    where: {
      companyEmail,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Check if an OTP was found and if it matches the provided OTP
  if (PwOTP && otp === PwOTP.otp) {
    // OTP is verified; you might want to proceed with password reset or other actions
    const company = await prisma.company.findFirst({
      where: {
        companyEmail,
      },
    });

    return res.json({message: 'Forget Password OTP is verified.'});
  }

  // If OTP is incorrect or no OTP was found
  return next(customErrorHandler(res, 'Wrong OTP.', 400));
};

export const resetPw = async (req: any, res: any, next: any) => {
  const {companyEmail, newPassword, confirmPassword} = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({message: 'Passwords do not match'});
  }

  // Find the company or user based on the decoded email
  const company = await prisma.company.findUnique({
    where: {companyEmail},
  });

  if (!company) {
    return res.status(404).json({message: 'Company not found'});
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the password in the database
  await prisma.company.update({
    where: {companyEmail},
    data: {password: hashedPassword},
  });

  return res.status(200).json({message: 'Password reset successfully'});
};

// export const changePassword = async (req: any, res:any, next:any) => {
//   const { currentPassword, newPassword, confirmPassword } = req.body;
//   const companyId =  (req as any).user.companyId;

//   const company = await prisma.company.findUnique({
//     where: {
//       companyId
//     }
//   })

//   if(!company){
//     return res.status(404).json({ message: "Company not found" });
//   }

//   if(newPassword !== confirmPassword){
//     return res.status(404).json({ message: "Password doesn't match. " });
//   }else if(currentPassword !== company.password){
//     return res.status(404).json({ message: "Old Password doesn't match. " });
//   }

//   const updatePassword = await prisma.company.update({
//     where:{
//       companyId
//     },
//     data:{
//       password: newPassword
//     }
//   })

// }

export const changePassword = async (req: any, res: any, next: any) => {
  const {currentPassword, newPassword, confirmPassword} = req.body;
  const companyId = (req as any).user.companyId;

  // Fetch the company by companyId
  const company = await prisma.company.findUnique({
    where: {
      companyId,
    },
  });

  if (!company) {
    return res.status(404).json({message: 'Company not found'});
  }

  // Compare the provided currentPassword with the stored hashed password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, company.password);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({message: "Old password doesn't match."});
  }

  // Check if the new passwords match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({message: 'New passwords do not match.'});
  }

  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // Update the password in the database
  await prisma.company.update({
    where: {
      companyId,
    },
    data: {
      password: hashedNewPassword,
    },
  });

  // Respond with success message
  return res.json({message: 'Password changed successfully.'});
};

export const companyProfile = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const profile = await prisma.company.findFirst({
    where: {
      companyId,
    },
  });
  return res.json({
    profile,
  });
};

export const getEmployeeProfileDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {employeeId} = req.params;
  const profile = await prisma.employee.findFirst({
    where: {
      employeeId,
    },
  });

  return res.json({
    profile,
  });
};
