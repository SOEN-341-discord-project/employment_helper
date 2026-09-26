// server/index.js
let http = require('http');
const express = require("express");
const formidable = require("formidable");
const PORT = process.env.PORT || 3001;

const app = express();

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/upload", (req,res) =>{
  res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">')
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
});

app.get("/file", (req,res) => {

})

app.get("/fileupload", (req,res) => {

})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});



