const express = require("express");
const bodyParser = require("body-parser");
const Database = require("./configs/Database");
const path = require('path')
const multer = require('multer')
const fs = require('fs')

const cors = require("cors");
require("dotenv/config");
const app = express();
const upload = multer({dest: "./uploads"}) 

app.use(express.static('public'))
app.use("/images",express.static('uploads'))
//middleware
app.use(bodyParser.json());
app.use(cors());
app.options("*", cors());

//routes

const usersRoute = require("./routes/Users");
const booksRoute = require("./routes/Books");
const photoeditingRoute = require("./routes/Photoediting");
// const usersRoute = require("./routes/Users");

app.use("/api/users", usersRoute);
app.use("/api/books", booksRoute);
app.use("/api/photoediting", photoeditingRoute);

app.post("/api/upload", upload.single("avatar"), async (req, res) => {
  let fileType = req.file.mimetype.split('/')[1]
  console.log('file type', fileType)
  let newFileName = req.file.filename + '.' + fileType;
  console.log(newFileName);
  fs.rename(`./uploads/${req.file.filename}`, `./uploads/${newFileName}`, function(err){
      if(err) throw err;
      console.log("Success")
  })

  const db = new Database();
  const conn = db.connection;

   const { title, price, description, category} = req.body

  const query = "INSERT INTO books (title, price, description, image, category) VALUES (?,?,?,?,?)"
  

  const values = [
      title,
      parseFloat(price),
      description,
      `images/${newFileName}`,
      category,
  
  ]
  
  await conn.connect((err) => {
      if(err) throw err;
      conn.query(query,values, (err,result) => {
          if(err) throw err;
          console.log(result);
          res.json({data: 'Books added to the database'})
      })
  })
});


app.listen(3000, function () {
  const db = new Database();
  db.TestConnection();
  console.log("Server is up and running http://localhost:3000");
});
