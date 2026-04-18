// src/seed.js
const { getDb, save } = require('./db');

const pokemones = [
  {
    nombre: 'bulbasaur', altura: 0.7, peso: 6.9,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png',
    tipos: ['planta', 'veneno']
  },
  {
    nombre: 'charmander', altura: 0.6, peso: 8.5,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png',
    tipos: ['fuego']
  },
  {
    nombre: 'squirtle', altura: 0.5, peso: 9.0,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/7.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/7.png',
    tipos: ['agua']
  },
  {
    nombre: 'pikachu', altura: 0.4, peso: 6.0,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
    tipos: ['electrico']
  },
  {
    nombre: 'mewtwo', altura: 2.0, peso: 122.0,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/150.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png',
    tipos: ['psiquico']
  },
  {
    nombre: 'gengar', altura: 1.5, peso: 40.5,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/94.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/94.png',
    tipos: ['veneno']
  },
  {
    nombre: 'eevee', altura: 0.3, peso: 6.5,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/133.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/133.png',
    tipos: ['normal']
  },
  {
    nombre: 'snorlax', altura: 2.1, peso: 460.0,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/143.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png',
    tipos: ['normal']
  },
  {
    nombre: 'dragonite', altura: 2.2, peso: 210.0,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/149.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/149.png',
    tipos: ['dragon', 'volador']
  },
  {
    nombre: 'ditto', altura: 0.3, peso: 4.0,
    imagen_frontal:   'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png',
    imagen_posterior: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/132.png',
    imagen_shiny:     'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png',
    tipos: ['normal']
  }
];

async function seed() {
  const db = await getDb();

  const tipos = [...new Set(pokemones.flatMap(p => p.tipos))];
  for (const t of tipos) {
    db.run(`INSERT OR IGNORE INTO tipos (nombre) VALUES (?)`, [t]);
  }

  for (const p of pokemones) {
    db.run(`
      INSERT OR IGNORE INTO pokemon
        (nombre, altura, peso, imagen_frontal, imagen_posterior, imagen_shiny)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [p.nombre, p.altura, p.peso, p.imagen_frontal, p.imagen_posterior, p.imagen_shiny]);

    const [[pokemonId]] = db.exec(
      `SELECT id FROM pokemon WHERE nombre = '${p.nombre}'`
    )[0].values;

    for (const tipo of p.tipos) {
      const res = db.exec(`SELECT id FROM tipos WHERE nombre = '${tipo}'`);
      if (res.length > 0) {
        const [[tipoId]] = res[0].values;
        db.run(
          `INSERT OR IGNORE INTO pokemon_tipos (pokemon_id, tipo_id) VALUES (?, ?)`,
          [pokemonId, tipoId]
        );
      }
    }
  }

  save(db);
  console.log('✅ Base de datos poblada con 10 pokémones correctamente.');
}

seed().catch(console.error);