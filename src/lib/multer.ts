import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import crypto, { hash } from 'crypto'

//screenshot encryption starts here
const algorithm ='aes-256-ctr'

//AES-256-CTR (Advanced Encryption Standard with a 256-bit key in Counter 
//mode) is a symmetric encryption algorithm that encrypts data in blocks of 128 bits.
//Symmetric Encryption: Uses the same key for both encryption and decryption, which means the key must be kept secret.
//Block Size: AES operates on fixed-size blocks of data (128 bits), regardless of the key size.
const secretKey=crypto.createHash('sha256').update('mine-secret-key').digest('base64').substring(0,32);
const iv=crypto.randomBytes(16);
const encryptFile = (buffer:Buffer)=>{
  const cipher = crypto.createCipheriv(algorithm,secretKey,iv);
  const encrypted = Buffer.concat([cipher.update(buffer),cipher.final()])
  return {iv:iv.toString('hex'),content:encrypted.toString('hex')};
}
export const decryptFile = (hash:any)=>{
  const decipher = crypto.createDecipheriv(algorithm,secretKey,Buffer.from(hash.iv,'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content,'hex')),decipher.final()])
  return decrypted
}
const storageScreenShot = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/screenshot/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split('.')[0];
    const fileExtension = file.originalname.split('.').pop();
    cb(null, filename + '-' + uniqueSuffix + '.' + fileExtension);
  },
});
export const saveEncryptedFile=async(file:Express.Multer.File)=>{
  try{
    const fileBuffer=fs.readFileSync(file.path);
    const encryptedData=encryptFile(fileBuffer)
    const encryptedFilePath=path.join(__dirname,`../../uploads/encryptedScreenshot/${file.filename}.enc`)
    fs.writeFileSync(encryptedFilePath,JSON.stringify(encryptedData));
    fs.unlinkSync(file.path)
    return encryptedFilePath
  }catch(error){
    console.error("Error encrypting file:",error)
    throw error
    }
}
export const decryptAndSendFile=async(filePath:string,res:any)=>{
  try{
    const encryptedData=JSON.parse(fs.readFileSync(filePath,'utf-8'));
    const decryptedData= decryptFile(encryptedData);
    res.setHeader('Content-Type','image/jpeg');
    res.send(decryptedData)
  }catch(error){
    console.error("Error decrypting file:",error);
    res.status(500).send("Error decrypting file.")
  }
}
















const storageMessage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/message/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split('.')[0];
    const fileExtension = file.originalname.split('.').pop();
    cb(null, filename + '-' + uniqueSuffix + '.' + fileExtension);
  },
});
const storageTimelapseVideo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/timelapsevideo/');
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split('.')[0];
    const fileExtension = file.originalname.split('.').pop();
    cb(null, filename + '-' + uniqueSuffix + '.' + fileExtension);
  },
});
const storageAppLogo = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/appLogo/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split('.')[0];
    const fileExtension = file.originalname.split('.').pop();
    cb(null, filename + '-' + uniqueSuffix + '.' + fileExtension);
  },
});

const storageAppLogoByCompany = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/appLogoByCompany/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split('.')[0];
    const fileExtension = file.originalname.split('.').pop();
    cb(null, filename + '-' + uniqueSuffix + '.' + fileExtension);
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIDEO_DIR = path.join(__dirname, 'videos');

if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR);
}

const storageChunkVideo = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEO_DIR);
  },
  filename: (req, file, cb) => {
    const chunkFilename = `video-chunk-${Date.now()}.webm`;
    cb(null, chunkFilename);
  },
});
export const screenshot = multer({
  storage: storageScreenShot,
});

export const timelapse = multer({
  storage: storageTimelapseVideo,
});

export const appLogo = multer({
  storage: storageAppLogo,
});
export const appLogoByCompany = multer({
  storage: storageAppLogoByCompany,
});

export const chunkVideoUpload = multer({
  storage: storageChunkVideo,
});
export const message = multer({
  storage: storageMessage,
});
