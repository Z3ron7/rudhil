const express = require("express");
const Database = require("../configs/Database");
const router = express.Router();
const bcrypt = require('bcrypt')

router.post("/login", async function (req, res) {
    const db = new Database();
    const conn = db.connection;
  
    const query = "SELECT * FROM admin WHERE username = ? OR email = ?";
    const values = [
      req.body.username,
      req.body.email
    ];
  
    await conn.connect((err) => {
      if (err) throw err;
      conn.query(query, values, (err, result) => {
        if (err) throw err;
  
        if (result.length > 0) {
          const storedPassword = result[0].password;
          const enteredPassword = req.body.password;
  
          bcrypt.compare(enteredPassword, storedPassword, (err, passwordMatch) => {
            if (err) throw err;
  
            if (passwordMatch) {
              res.json({ success: true, message: "Login Successful" });
            } else {
              res.json({ success: false, message: "Login Failed" });
            }
          });
        } else {
          res.json({ success: false, message: "Login Failed" });
        }
      });
    });
  });
  
  

  router.post("/register", async function (req, res) {
    try {
      const db = new Database();
      const conn = db.connection;
    
      const adminQuery = "INSERT INTO admin (`email`, `username`, `password`) VALUES (?, ?, ?)";
    
      const values = [
        req.body.email,
        req.body.username,
        bcrypt.hashSync(req.body.password, 10)
      ];
    
      await conn.connect((err) => {
        if (err) throw err;
    
        conn.query(adminQuery, values, (err, result) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              return res.json({ message: "Email already exists", success: false });
            } else {
              throw err;
            }
          }
    
          console.log(result);
          return res.json({ message: "Admin has been registered" });
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ Error: "Internal Server Error" });
    }
  });
  
  module.exports = router;
  