  const express = require("express");
  const Database = require("../configs/Database");
  const router = express.Router();
  const bcrypt = require('bcrypt')

  router.post("/login", async function (req, res)  {
    const db = new Database();
    const conn = db.connection;

    const query = "SELECT * FROM users WHERE email = ?";
    const values = [
        req.body.email,
    ]
    await conn.connect((err) => {
      if (err) throw err;
      conn.query(query, values, (err, result) => {
          if(err) throw err;
          if(result.length > 0 && bcrypt.compareSync(req.body.password, result[0].password)){
              res.json({success: true, message: "Login Successful"})
          }
          else{
              res.json({success: false, message: "Login Failed"})
          }
      })
  })
});

  router.post("/register", async function (req, res) {
    const db = new Database();
    const conn = db.connection;

    const query = "INSERT INTO users(`firstname`, `lastname`, `email`, `password`,`role`) VALUES (?,?,?,?,?)";
    const values = [
        req.body.firstname,
        req.body.lastname,
        req.body.email,
        bcrypt.hashSync(req.body.password, 10),
        "normal"
    ]
    await conn.connect((err) => {
      if(err) throw err;
      conn.query(query,values, (err,result) => {
          if(err){
              if(err.code === 'ER_DUP_ENTRY'){
                  return res.json({message: "Email already exist", success: false})
              }
              else{
                  throw err;
              }
          }
          
          console.log(result)
          return res.json({message: "New User has been Registerd"})
      })
  })
});

  module.exports = router;
