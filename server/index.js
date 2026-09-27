// server/index.js
const multer = require("multer");
const express = require("express");
const formidable = require("formidable");
const PORT = process.env.PORT || 3001;
const path = require('path');
const crypto = require('crypto');
const supabase = require("./supabaseClient");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

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

app.post("/api/register", (req, res) => {
  const { fullName, email, password } = req.body ?? {};

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }
  if (password.length < 10 || password.length > 20) {
    return res.status(400).json({ error: "Password must be 10 to 20 characters." });
  }
  if (!/\d/.test(password)) {
    return res.status(400).json({ error: "Password must contain a number." });
  }
  if (!/[!@#$%^&()]/.test(password)) {
    return res.status(400).json({ error: "Password must contain one of: ! @ # $ % ^ & ( )" });
  }

  res.status(501).json({ message: "Input valid. Account creation functionality not yet built." });
});

app.post("/api/login", (req, res) =>{ 
  const { email, password } = req.body ?? {};

  if (!email || !password) { 
    return res.status(400).json({ error: "Email and Password are required." });
  }

  res.status(501).json({ message: "Input valid. Login functionaliity not yet built." });

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



