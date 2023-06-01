const express = require("express");
const Database = require("./configs/Database");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser");
const cors = require("cors");
const salt = 5;

const app = express();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3001"],
  method: ["POST", "GET"],
  credentials: true
}));

const usersRoute = require("./routes/Users");
const customer_insuredRoute = require("./routes/CustomerInsured");
const customer_entryRoute = require("./routes/Customer")

app.use("/api/users", usersRoute);
app.use("/api/customer_insured", customer_insuredRoute);
app.use("/api/customer_entry", customer_entryRoute);

app.use(cookieParser());

const db = new Database();
const conn = db.connection;

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ Error: "You are not authenticated" });
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ Error: "Token is not valid" });
      } else {
        req.name = decoded.name;
        next();
      }
    });
  }
};
app.get('/', verifyUser, (req, res) => {
  return res.json({ Status: "Success", name: req.name });
});

  app.post('/register', (req, res) => {
    const sql = "INSERT INTO admin (`name`,`email`,`password`) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
      if (err) return res.json({ Error: "Error for hashing password" });

      const values = [
        req.body.name,
        req.body.email,
        hash
      ];

      conn.query(sql, [values], (err, result) => {
        if (err) return res.json({ Error: "Inserting data error in server" });
        return res.json({ Status: "Success" });
      });
    });
  });



app.post('/login', (req, res) => {
  const sql = 'SELECT * FROM admin WHERE email = ?';
  conn.query(sql, [req.body.email], (err, data) => {
    if(err) return res.json({Error: "Login error in server"})
    if(data.length > 0) {
        bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
          if(err) return res.json({Error:"Password compare error"})
            if(response) {
              const name = data[0].name;
              const token = jwt.sign({name}, "jwt-secret-key", {expiresIn: '1d'})
              res.cookie('token', token);
              return res.json({Status: "Login Successful"})
            } else {
              return res.json({Error: "Password not matched!"});
            }
        })
    } else {
      return res.json({Error: "Invalid email or password!"})
    }
  })
})

app.get('/logout', (req, res) => {
 res.clearCookie('token');
 return res.json({Status: "Success"});
})


app.post("/upload", async (req, res) => {
  try {

    const db = new Database();
    const conn = db.connection;

    const {Name } = req.body;

    const query = "INSERT INTO customer_insured (Name) VALUES (?)";
    const values = [Name];

    await conn.connect((err) => {
      if (err) throw err;
      conn.query(query, values, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.json({ data: 'Customer added to the database' });
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to upload customer' });
  }
});

app.get("/searchEntry/:name", async (req, res) => {
    const { name } = req.params;
    const db = new Database();
    const conn = db.connection;
    const query = "SELECT * FROM customer_entry WHERE Name LIKE ?";
  
    try {
      await conn.connect();
  
      conn.query(query, [`%${name}%`], (error, rows) => {
        if (error) throw error;
        res.json(rows);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
    
app.get("/searchInsured/:name", async (req, res) => {
    const { name } = req.params;
    const db = new Database();
    const conn = db.connection;
    const query = "SELECT * FROM customer_insured WHERE Name LIKE ?";
  
    try {
      await conn.connect();
  
      conn.query(query, [`%${name}%`], (error, rows) => {
        if (error) throw error;
        res.json(rows);
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

app.listen(3000, function () {
  const db = new Database();
  db.TestConnection();
  console.log("Server is up and running at http://localhost:3000");
});
