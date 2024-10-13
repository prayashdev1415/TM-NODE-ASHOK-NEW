import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from 'crypto'





const algorithm = 'aes-256-ctr'
const secretKey = crypto.createHash('sha256').update('your-secret-key').digest('base64').substring(0, 32);const iv=crypto.randomBytes(16);

const encryptFile = (buffer: Buffer) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
};

export const decryptFile = (hash:any) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrypted;
};




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/temp");
    // Check if the directory exists, and if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create the directory if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits:{fileSize:10*1024*1024},
});
export const saveEncryptedFile=async (file:Express.Multer.File)=>{
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const encryptedData = encryptFile(fileBuffer);
    const encryptedFilePath = path.join(__dirname, `../../uploads/encrypted/${file.filename}.enc`);

    fs.writeFileSync(encryptedFilePath, JSON.stringify(encryptedData));

    // Remove original file after encryption
    fs.unlinkSync(file.path);

    return encryptedFilePath;
  } catch (error) {
    console.error("Error encrypting file:", error);
    throw error;
  }
}
export const decryptAndSendFile = async (filePath: string, res: any) => {
  try {
    const encryptedData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const decryptedData = decryptFile(encryptedData);

    res.setHeader('Content-Type', 'image/jpeg'); // Change based on the file type
    res.send(decryptedData);
  } catch (error) {
    console.error("Error decrypting file:", error);
    res.status(500).send("Error decrypting file");
  }
};

export default upload;