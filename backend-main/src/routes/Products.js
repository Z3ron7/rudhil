const express = require("express");
const Database = require("../configs/Database");
const router = express.Router();

router.get("/", async (req, res) => {
    const db = new Database(); //Instance
    const conn = db.connection; // Defined conn for connection prop
    const query = "SELECT * FROM products";

    await conn.connect((err) => {
      if (err) throw err;
      conn.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
      });
    });
  });

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const db = new Database(); //Instance
    const conn = db.connection; // Defined conn for connection prop
    await conn.connect((err) => {
      if (err) throw err;
      conn.query(`SELECT * FROM products where id = ${id}`, (error, rows) => {
        if (error) throw error;
        res.json(rows);
      });
    });
  });

  router.post("/", async (req, res) => {
    const { title, price, description, category, image , count } = req.body;
  
    const db = new Database(); //Instance
    const conn = db.connection; // Defined conn for connection prop
  
    await conn.connect((err) => {
      if (err) throw err;
      conn.query(
        `INSERT into products (title, price, description, category, image, count) VALUES (?,?,?,?,?,?)`, 
        [title,price,description,category,image,count],
        (error, result) => {
          if (error) throw error;
          res.json({ success: true, message: "Successfully added" });
        }
      );
    });
  });

  router.put('/update/:id', async function(req,res) {
    const db = new Database();
    const conn = db.connection;

    const {id} = req.params
    const {title,price,description,count,category} = req.body
    

    const query = "UPDATE products SET title = ?, price = ?, description = ?, count = ?, category = ? WHERE id = ?"
    const values = [
        title,
        parseFloat(price),
        description,
        parseInt(count),
        category,
        id
    ]

    await conn.connect((err) => {
        if(err) throw err;
        conn.query(query,values, (err, result) => {
            if(err) throw err;
            console.log(result)
            res.json({message: "Product updated successfully"});
        })
    })

})

router.delete('/delete/:id', async function(req, res) {
  const db = new Database();
  const conn = db.connection;

  const {id} = req.params
  const query = "DELETE FROM products WHERE id = ?"

  await conn.connect((err) => {
      if(err) throw err;
      conn.query(query,id,(err,result) => {
          if(err) throw err;
          console.log(result)
          res.json(result)
      })
  })
})


  module.exports = router;