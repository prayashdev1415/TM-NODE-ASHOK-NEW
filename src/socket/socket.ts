import {Server} from 'socket.io';
import http from 'http';
import express from 'express';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {findOrCreateIfNotExist, getAllRoomIds} from '../controllers/message.controller.js';
import prisma from '../models/index.js';

// import {} from '../'
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', '*'],
    methods: ['GET', 'POST'],
  },
});

const userSocketMap: {[key: string]: string} = {};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getReceiverSocketId = (receiverId: string) => {
  console.log('🚀 ~ getReceiverSocketId ~ receiverId:', receiverId);
  return userSocketMap[receiverId];
};
console.log(userSocketMap, 'SUSf');

// socket.on('joinRoom', async ({receiverId}) => {
//   const userId = socket.handshake.query.userId as string;
//   console.log(userId, receiverId)
//   console.log("xiro");
//   const room = await findOrCreateIfNotExist([userId,receiverId])
//   console.log('🚀 ~ ChatSocket ~ socket.on ~ room:', room);
//   if (room) {

//     // Leave any other room the user might have joined previously
//     const currentRooms = Array.from(socket.rooms);
//     currentRooms.forEach((roomId) => {
//       if (roomId !== socket.id) {
//         // socket.id is the default room, don't leave it
//         socket.leave(roomId);
//       }
//     });
//     console.log(room.id)
//     socket.join(room.id);
//   } else {
//     console.error('Room creation or retrieval failed');
//   }
// });

io.on('connection', async (socket) => {
  console.log(socket.id, 'socket ko id::');
  const userId = socket.handshake.query.userId as string;
  const companyId = socket.handshake.query.companyId as string;
  console.log('🚀 ~ io.on ~ companyId:', companyId);

  const roomsForCompany = await prisma.companyAndEmployeeRoom.findMany({
    where: {
      participants: {
        some: {
          companyId: companyId,
        },
      },
    },
  });
  console.log('🚀 ~ io.on ~ roomsForCompany:', roomsForCompany);
  if (roomsForCompany) {
    roomsForCompany.forEach((room) => {
      socket.join(room.id);
    });
  }

  const roomsForEmployee = await prisma.companyAndEmployeeRoom.findMany({
    where: {
      participants: {
        some: {
          employeeId: userId,
        },
      },
    },
  });
  console.log('🚀 ~ io.on ~ roomsForEmployee:', roomsForEmployee);
  if (roomsForEmployee) {
    roomsForEmployee.forEach((room) => {
      socket.join(room.id);
    });
  }

  const roomsForUser = await prisma.room.findMany({
    where: {
      participants: {
        some: {
          employeeId: userId,
        },
      },
    },
  });

  console.log('🚀 ~ io.on ~ roomsForUser:', roomsForUser);
  if (roomsForUser) {
    roomsForUser.forEach((room) => {
      socket.join(room.id);
      console.log(`Socket ${socket.id} joined room ${room.id}`);
    });
  }

  console.log('🚀 ~ io.on ~ userId:', userId);
  if (userId) userSocketMap[userId] = socket.id;
  if (companyId) userSocketMap[companyId] = socket.id;

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  let fileStream: any;
  let filePath: any;
  socket.on('video-data', ({userId, chunk}) => {
    console.log('VIDEO CONNECTION CONNECTED');
    if (!fileStream) {
      filePath = path.join(__dirname, `video-${Date.now()}.webm`);
      fileStream = fs.createWriteStream(filePath, {flags: 'a'});
      console.log(`Recording started, saving to: ${filePath}`);
    }
    // Check if the stream is still writable before writing
    if (fileStream && !fileStream.closed) {
      fileStream.write(Buffer.from(new Uint8Array(chunk)));
    } else {
      console.error('Attempted to write after stream ended.');
    }
  });
  socket.on('end-recording', () => {
    console.log('Recording ended');
    if (fileStream && !fileStream.closed) {
      fileStream.end();
      console.log(`Video saved at: ${filePath}`);
    }
  });
  // socket.on('typing', ({ senderId, receiverId }) => {
  //   console.log('typing ko socket')
  //   const receiverSocketId = getReceiverSocketId(receiverId);
  //   socket.to(receiverSocketId).emit('displayTyping', { senderId });
  // });
  // socket.on('stopTyping',({senderId,receiverId})=>{

  //   socket.to(receiverId).emit('hideTyping',{senderId})
  // })

  socket.on('typing', async ({senderId, receiverId}) => {
    console.log('🚀 ~ socket.on ~ senderId:', senderId);
    console.log('🚀 ~ socket.on ~ receiverId:', receiverId);
    console.log('typing');
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log('🚀 ~ socket.on ~ receiverSocketId:', receiverSocketId);
    socket.to(receiverSocketId).emit('typing', {userId: senderId, receiverId});
  });
  socket.on('companyTyping', async ({senderId, receiverId}) => {
    console.log('🚀 ~ socket.on ~ senderId:', senderId);
    console.log('🚀 ~ socket.on ~ receiverId:', receiverId);
    console.log('typing');
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log('🚀 ~ socket.on ~ receiverSocketId:', receiverSocketId);
    socket.to(receiverSocketId).emit('companyTyping', {userId: senderId, receiverId});
  });
  socket.on('employeeTyping', async ({senderId, receiverId}) => {
    console.log('🚀 ~ socket.on ~ senderId:', senderId);
    console.log('🚀 ~ socket.on ~ receiverId:', receiverId);
    console.log('typing');
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log('🚀 ~ socket.on ~ receiverSocketId:', receiverSocketId);
    socket.to(receiverSocketId).emit('employeeTyping', {userId: senderId, receiverId});
  });

  // socket.on('joinRoom', async ({receiverId}) => {
  //   const userId = socket.handshake.query.userId as string;
  //   console.log(userId, receiverId)
  //   console.log("xiro");
  //   const room = await findOrCreateIfNotExist([userId,receiverId])
  //   console.log('🚀 ~ ChatSocket ~ socket.on ~ room:', room);
  //   if (room) {

  //     // Leave any other room the user might have joined previously
  //     const currentRooms = Array.from(socket.rooms);
  //     currentRooms.forEach((roomId) => {
  //       if (roomId !== socket.id) {
  //         // socket.id is the default room, don't leave it
  //         socket.leave(roomId);
  //       }
  //     });
  //     console.log(room.id)
  //     socket.join(room.id);
  //   } else {
  //     console.error('Room creation or retrieval failed');
  //   }
  // });
  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    if (fileStream && !fileStream.closed) {
      fileStream.end();
    }
  });
});
export {app, io, server};
