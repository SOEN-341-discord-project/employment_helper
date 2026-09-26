// server/index.js
const multer = require("multer");
const express = require("express");
const formidable = require("formidable");
const PORT = process.env.PORT || 3001;
const path = require('path');
const crypto = require('crypto');
const app = express();

const diskstorage = multer.diskStorage({

  destination: (req,file, cb) => {
    cb(null,'./uploads/');
  },


  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({storage: multer.memoryStorage() });

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.post("/upload", upload.single('avatar'), (req,res) =>{
  res.json({
    message: 'File saved to disk',
    path: req.file.path,
    filename: req.file.file.filename,
  })
  if (!req.file){
    return res.status(400).json({error: 'No file uploaded'});    
  }


  console.log('File received:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  res.json({
    message: 'File uploaded successfully',
    filename: req.file.originalname,
    size: req.file.size,
  });
});

app.get("/file", (req,res) => {

})

app.get("/fileupload", (req,res) => {

})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});



