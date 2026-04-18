// src/db.js
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'pokemon.db');

let _db = null;

async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  _db.run(`PRAGMA journal_mode = WAL;`);

  _db.run(`
    CREATE TABLE IF NOT EXISTS tipos (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS pokemon (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre           TEXT NOT NULL UNIQUE,
      altura           REAL NOT NULL,
      peso             REAL NOT NULL,
      imagen_frontal   TEXT NOT NULL,
      imagen_posterior TEXT NOT NULL,
      imagen_shiny     TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pokemon_tipos (
      pokemon_id INTEGER NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
      tipo_id    INTEGER NOT NULL REFERENCES tipos(id)   ON DELETE CASCADE,
      PRIMARY KEY (pokemon_id, tipo_id)
    );
  `);

  save(_db);
  return _db;
}

function save(db) {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

module.exports = { getDb, save };