import express from 'express';
import cors from 'cors';
import {errorMiddleware} from './middlewares/error.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
import {app, server} from './socket/socket.js';
import path from 'path';
import {fileURLToPath} from 'url';
import multer from 'multer';
import fs from 'fs';
import {isAuthenticatedEmployee} from './middlewares/isAuthenticatedEmployee.js';
import prisma from './models/index.js';
import ampq from 'amqplib' //package to connect rabbitMQ with node.
import {cronService}  from './utils/tempEmpDelete.cron.js'
import {  resetDailyScreenshotCount} from './utils/resetScreenshotCount.js'

//............Redis Code.........................
// import { createClient } from 'redis';
// const redisClient = createClient();
// redisClient.on('error', (err) => {
//   console.error('Redis Client Error', err);
// });
// (async () => {
//   await redisClient.connect();
//   console.log('Connected to Redis');
// })();

// .........RabbitMQ code................:

// async function connect (){
//   console.log("haha")
//   const connection = await ampq.connect('amqp://localhost');
//   console.log("🚀 ~ connection:", connection)
//   const channel = await connection.createChannel();
//   const queue = 'test_queue';
//   await channel.assertQueue(queue,{durable:false});
//   channel.sendToQueue(queue,Buffer.from('hello world'));
//   console.log("Sent 'Hello World!'");
//   await channel.close();
//   await connection.close();
// }
// connect().catch(console.error)

cronService()
resetDailyScreenshotCount()












// import {captureAndExtractText} from './utils/screenshot-monitor.js'
import {captureAndExtractText} from './utils/screenshot-monitor.js';
dotenv.config({path: './.env'});

// setInterval(()=>{
//   captureAndExtractText();
// },10000)
app.use('/uploads', express.static('uploads'));
export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
const port = process.env.PORT || 3000;

// const app = express();

// const allowedOrigins = ["https://motherboard-filtering-participate-starting.trycloudflare.com","http://localhost:5173","http://192.168.1.64:5173","http://localhost:50960"]

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({origin: ' * ', credentials: true}));

// app.use(cors({
//   origin: function(origin: any, callback) {
//       console.log(origin)
//       // Allow requests with no origin (Flutter apps, Postman) or from allowed origins
//       if (!origin || allowedOrigins.includes(origin)) {
//           callback(null, true); // Allow these origins
//       } else {
//           callback(new Error("Not allowed by CORS"), false); // Block other origins
//       }
//   },
//   credentials: true // Allow credentials (cookies, authorization headers, etc.)
// }));
app.use(morgan('dev'));
// app.use(express.static('setupfile'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a folder to store video chunks
// const VIDEO_DIR = path.join(__dirname, 'videos');

// // Ensure the directory exists
// if (!fs.existsSync(VIDEO_DIR)) {
//   fs.mkdirSync(VIDEO_DIR);
// }

// Use diskStorage to store files directly on disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination for video chunks
    cb(null, 'uploads/timelapsevideo');
  },
  filename: (req, file, cb) => {
    // Set the filename for each uploaded chunk
    const chunkFilename = `video-chunk-${Date.now()}.webm`;
    cb(null, chunkFilename);
  },
});

const VIDEO_DIR = 'uploads/timelapsevideo';
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, {recursive: true});
}

// const upload = multer({ storage });
// Middleware to parse multipart/form-data
// const storage = multer.memoryStorage(); // Store the video chunks in memory first
const upload = multer({storage});

// Storage for video files
let fileStream: any = null;
let filePath: any = null;

// app.use("/download",express.static('setupfile'));

app.use('/setupfile', express.static(path.join(__dirname, 'setupfile')));

app.get('/download-exe', (req, res) => {
  console.log('Downloading file...');
  const filePath = path.join(__dirname, 'setupfile', 'TeamMonitor.exe');
  console.log('File path:', filePath);
  res.download(filePath, 'TeamMonitor.exe', (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Error downloading file');
    }
  });
});

// Store streams and paths for each user (indexed by employee ID)
const userFileStreams: {[key: string]: {fileStream: fs.WriteStream; filePath: string}} = {};

// Route to upload video chunks
app.post(
  '/upload-video',
  upload.single('video'),
  isAuthenticatedEmployee,
  async (req: any, res) => {
    try {
      const videoChunkPath = req.file.path; // Get the path of the uploaded chunk
      const employee = req.user;
      const employeeId = employee.employeeId;
      const nowInUTC = new Date().toISOString();

      // Initialize the stream and file path for the employee if not already open
      if (!userFileStreams[employeeId]) {
        const filePath = path.join(VIDEO_DIR, `video-${employeeId}-${Date.now()}.webm`);
        const fileStream = fs.createWriteStream(filePath, {flags: 'a'});

        userFileStreams[employeeId] = {fileStream, filePath};
        console.log(`Recording started for Employee ID: ${employeeId}, saving to: ${filePath}`);
      }

      // Get the employee's file stream and file path
      const {fileStream, filePath} = userFileStreams[employeeId];

      // Read the uploaded chunk and append it to the user's video file
      const chunkData = fs.readFileSync(videoChunkPath);
      if (fileStream && !fileStream.closed) {
        fileStream.write(chunkData);
        console.log(`Video chunk written to file for Employee ID: ${employeeId}.`);
        res.status(200).json({message: 'Chunk received and written.'});
      } else {
        console.error(`Attempted to write after stream ended for Employee ID: ${employeeId}.`);
        res.status(500).json({message: 'Stream is closed.'});
      }

      // Remove the temporary chunk file after writing
      fs.unlinkSync(videoChunkPath);

      // Check if the video path already exists in the database for the user
      const existingVideo = await prisma.timeLapseVideo.findFirst({
        where: {
          videoLink: filePath,
          employeeId: employeeId,
        },
      });

      if (existingVideo) {
        console.log(
          `Video already exists in the database for Employee ID: ${employeeId}, skipping insert.`,
        );
      } else {
        // Save the video info in the database if it doesn't exist
        const savedVideo = await prisma.timeLapseVideo.create({
          data: {
            videoLink: filePath, // Save the final video path
            employeeId: employeeId,
            departmentId: employee.departmentId,
            teamId: employee.teamId,
            companyId: employee.companyId,
            time: nowInUTC,
          },
        });
        console.log(`Video path saved to database for Employee ID: ${employeeId}.`, savedVideo);
      }
    } catch (error) {
      console.error('Error writing video chunk:', error);
      res.status(500).json({message: 'Error writing video chunk.'});
    }
  },
);

// // Route to stop recording and close the file stream
app.post('/end-recording', isAuthenticatedEmployee, (req, res) => {
  try {
    console.log('Recording ended');

    if (fileStream && !fileStream.closed) {
      fileStream.end();
      console.log(`Video saved at: ${filePath}`);
      res.status(200).json({message: `Recording saved at ${filePath}`});
    } else {
      res.status(400).json({message: 'No active recording.'});
    }
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({message: 'Error stopping recording.'});
  }
});

app.get('/download', (req, res) => {
  const file = path.join(__dirname, 'setupfile', 'TeamMonitor.exe'); // change file path
  res.download(file); // This method prompts the client to download the file
});

import companyRoute from './routers/company.route.js';
import superAdminRoute from './routers/superadmin.route.js';
import holidayRoute from './routers/holiday.route.js';
import employeeRoute from './routers/employee.route.js';
import departmentRoute from './routers/department.route.js';
import teamRoute from './routers/teams.route.js';
import leaveRoute from './routers/leave.routes.js';
import attendanceRoute from './routers/attendance.route.js';
import riskUserRoute from './routers/riskuser.route.js';
import notificationRoute from './routers/notification.route.js';
import messagesRoute from './routers/message.route.js';
import screenshotRoute from './routers/screenshot.route.js';
import timelapseVideoRoute from './routers/timelapsevideo.route.js';
import dashboardRoute from './routers/dashboard.route.js';
import appRoute from './routers/app.route.js';
import chunkVideoRoute from './routers/chunkvideo.route.js';
import subscriptionRoute from './routers/subscription.route.js';
import Keyword from './routers/keyword.route.js';
import freeTrail from './routers/freeTrail.route.js'
app.use('/api/v1/company', companyRoute);
app.use('/api/v1/superadmin', superAdminRoute);
app.use('/api/v1/employee', employeeRoute);
app.use('/api/v1/department', departmentRoute);
app.use('/api/v1/team', teamRoute);
app.use('/api/v1/attendance', attendanceRoute);
app.use('/api/v1/leave', leaveRoute);
app.use('/api/v1/holiday', holidayRoute);
app.use('/api/v1/riskuser', riskUserRoute);
app.use('/api/v1/notifications', notificationRoute);
app.use('/api/v1/messages', messagesRoute);
app.use('/api/v1/screenshot', screenshotRoute);
app.use('/api/v1/timelapsevideo', timelapseVideoRoute);
app.use('/api/v1/dashboard', dashboardRoute);
app.use('/api/v1/app', appRoute);
app.use('/api/v1/chunk-video', chunkVideoRoute);
app.use('/api/v1/subscription', subscriptionRoute);
app.use('/api/v1/keyword', Keyword);
app.use('/api/v1/freeTrail',freeTrail);
app.get('/', (req, res) => {
  res.send('Welcome to Team Monitor Backend!');
});

app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found',
  });
});
app.use(errorMiddleware);
server.listen(port, () =>
  console.log('Server is working on Port:' + port + ' in ' + envMode + ' Mode.'),
);
