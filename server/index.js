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

app.post("/api/register", async (req, res) => {
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

    const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return res.status(409).json({ error: "The email you entered is already being used." });
    }
    console.error("Supabase signUp error:", error);
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({
    message: "Account created.",
    user: { id: data.user.id, email: data.user.email },
  });
});

app.post("/api/login", async (req, res) =>{ 
  const { email, password } = req.body ?? {};

  if (!email || !password) { 
    return res.status(400).json({ error: "Email and Password are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ 
    email,
    password 
  });

  if (error) {
    if (error.code === "invalid_credentials") {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    console.error("Supabase login error:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }

  res.status(200).json({
    message: "Login successful.",
    user: { id: data.user.id, email: data.user.email, fullName: data.user.user_metadata.full_name },
    accessToken: data.session.access_token
  });
});

app.post("/upload", upload.single('avatar'), (req,res) =>{
  res.json({
    message: 'File saved to disk',
    path: req.file.path,
    filename: req.file.file.filename,
  })
  if (!req.file){
    return res.status(400).json({ error: 'No file uploaded' });    
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



