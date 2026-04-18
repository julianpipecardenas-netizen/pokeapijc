const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres.zyutndgfepssriaaemls",
  host: "aws-1-us-west-2.pooler.supabase.com",
  database: "postgres",
  password: "TU_PASSWORD",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});




// 🌐 GET → obtener todos los pokemones
app.get("/pokemones", (req, res) => {
  pool.query("SELECT * FROM pokemones", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});


// 🔍 GET → obtener un pokemon por ID
app.get("/pokemones/:id", (req, res) => {
  const { id } = req.params;

  pool.query("SELECT * FROM pokemones WHERE id = ?", [id], (err, result) => {
    if (err) return res.json(err);
    res.json(result[0]);
  });
});


// ➕ POST → agregar pokemon
app.post("/pokemones", (req, res) => {
  const { nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipos } = req.body;

  const sql = `
    INSERT INTO pokemones 
    (nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipos) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipos], (err, result) => {
    if (err) return res.json(err);
    res.json({ mensaje: "✅ Pokemon agregado" });
  });
});


// ✏️ PUT → actualizar pokemon
app.put("/pokemones/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipos } = req.body;

  const sql = `
    UPDATE pokemones SET 
    nombre=?, imagen_frontal=?, imagen_posterior=?, imagen_shiny=?, altura=?, peso=?, tipos=? 
    WHERE id=?
  `;

  db.query(sql, [nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipos, id], (err, result) => {
    if (err) return res.json(err);
    res.json({ mensaje: "✏️ Pokemon actualizado" });
  });
});


// ❌ DELETE → eliminar pokemon
app.delete("/pokemones/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM pokemones WHERE id = ?", [id], (err, result) => {
    if (err) return res.json(err);
    res.json({ mensaje: "🗑️ Pokemon eliminado" });
  });
});


// 🚀 Levantar servidor
app.listen(3000, () => {
  console.log("🚀 Servidor corriendo en http://localhost:3000");
});