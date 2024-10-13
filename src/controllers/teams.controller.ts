import {NextFunction, Request, Response} from 'express';
import {customErrorHandler} from '../utils/customErrorHandler.js';
import prisma from '../models/index.js';

// create Teams
export const createTeam = async (req: Request, res: Response, next: NextFunction) => {
  const {teamName, departmentId} = req.body;
  const companyId = (req as any).user.companyId;
  const team = await prisma.team.findFirst({
    where: {
      teamName,
      departmentId,
      companyId,
    },
  });

  if (team)
    return next(
      customErrorHandler(res, 'Team already exist for the this department of company', 402),
    );
  const newTeam = await prisma.team.create({
    data: {
      teamName,
      departmentId,
      companyId,
    },
  });

  await prisma.department.update({
    where: {
      departmentId,
      companyId,
    },
    data: {
      noOfTeams: {
        increment: 1,
      },
    },
  });

  await prisma.company.update({
    where: {
      companyId,
    },
    data: {
      noOfTeams: {
        increment: 1,
      },
    },
  });

  return res.json({message: 'Team Created', team: newTeam});
};

//get all team of the company
export const getAllTeamOfTheCompany = async (req: Request, res: Response, next: NextFunction) => {
  const companyId = (req as any).user.companyId;
  const teams = await prisma.team.findMany({
    where: {
      companyId,
    },
  });
  return res.json({teams});
};

//get all team of the department of company
export const getAllTeamOfTheDepartment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {departmentId} = req.params;
  const companyId = (req as any).user.companyId;
  const teams = await prisma.team.findMany({
    where: {
      companyId,
      departmentId,
    },
  });
  return res.json({teams});
};

//get One team of the department
export const getTeam = async (req: Request, res: Response, next: NextFunction) => {
  const {teamId, departmentId} = req.body;
  const companyId = (req as any).user.companyId;
  const team = await prisma.team.findFirst({
    where: {
      companyId,
      teamId,
      departmentId,
    },
  });
  return res.json({team});
};

// Update Team
export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
  const {teamId, departmentId, teamName, teamHead} = req.body;
  const companyId = (req as any).user.companyId;
  const team = await prisma.team.findFirst({
    where: {
      companyId,
      teamId,
    },
  });
  if (!team) return next(customErrorHandler(res, 'Team not found', 404));

  const updatedTeam = await prisma.team.update({
    where: {
      teamId: team.teamId,
      companyId,
    },
    data: {
      teamName,
      teamHead,
      departmentId,
    },
  });
  return res.json({message: 'Team Updated', updatedTeam});
};

// delete Team
export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
  const {teamId, departmentId} = req.params;
  const companyId = (req as any).user.companyId;

  const deletedTeam = await prisma.team.delete({
    where: {teamId, companyId},
  });

  await prisma.department.update({
    where: {
      departmentId,
      companyId,
    },
    data: {
      noOfTeams: {
        decrement: 1,
      },
    },
  });

  await prisma.company.update({
    where: {
      companyId,
    },
    data: {
      noOfTeams: {
        decrement: 1,
      },
    },
  });

  if (deletedTeam) {
    res.status(200).json({message: 'Team Deleted!', deletedTeam});
  } else {
    res.status(404).json({message: 'Team not found'});
  }
};
