const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

// ─── Setup ────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "pokemon.db");
const db = new Database(DB_PATH);

// Enable WAL for better performance
db.pragma("journal_mode = WAL");

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    name_es    TEXT,
    type1      TEXT NOT NULL,
    type2      TEXT,
    hp         INTEGER NOT NULL,
    attack     INTEGER NOT NULL,
    defense    INTEGER NOT NULL,
    sp_attack  INTEGER NOT NULL,
    sp_defense INTEGER NOT NULL,
    speed      INTEGER NOT NULL,
    total      INTEGER NOT NULL,
    generation INTEGER NOT NULL,
    legendary  INTEGER DEFAULT 0,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS evolutions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    from_id     INTEGER NOT NULL,
    to_id       INTEGER NOT NULL,
    method      TEXT,
    FOREIGN KEY (from_id) REFERENCES pokemon(id),
    FOREIGN KEY (to_id)   REFERENCES pokemon(id)
  );

  CREATE TABLE IF NOT EXISTS moves (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,
    category    TEXT NOT NULL,
    power       INTEGER,
    accuracy    INTEGER,
    pp          INTEGER,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS pokemon_moves (
    pokemon_id INTEGER NOT NULL,
    move_id    INTEGER NOT NULL,
    learn_method TEXT,
    PRIMARY KEY (pokemon_id, move_id),
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
    FOREIGN KEY (move_id)    REFERENCES moves(id)
  );
`);

// ─── Seed Data ────────────────────────────────────────────────────────────────
function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as n FROM pokemon").get().n;
  if (count > 0) return console.log("✅ Database already seeded.");

  console.log("🌱 Seeding Pokémon database...");

  const insertPokemon = db.prepare(`
    INSERT OR IGNORE INTO pokemon
      (id, name, name_es, type1, type2, hp, attack, defense, sp_attack, sp_defense, speed, total, generation, legendary, description)
    VALUES
      (@id, @name, @name_es, @type1, @type2, @hp, @attack, @defense, @sp_attack, @sp_defense, @speed, @total, @generation, @legendary, @description)
  `);

  const pokemons = [
    // Gen 1 Starters
    { id: 1,   name: "Bulbasaur",   name_es: "Bulbasaur",   type1: "Grass",    type2: "Poison",   hp: 45,  attack: 49,  defense: 49,  sp_attack: 65,  sp_defense: 65,  speed: 45,  total: 318, generation: 1, legendary: 0, description: "Hay una semilla en su lomo desde que nace. La semilla crece con él." },
    { id: 2,   name: "Ivysaur",     name_es: "Ivysaur",     type1: "Grass",    type2: "Poison",   hp: 60,  attack: 62,  defense: 63,  sp_attack: 80,  sp_defense: 80,  speed: 60,  total: 405, generation: 1, legendary: 0, description: "Cuando el bulbo de su lomo empieza a hincharse, es señal de que va a evolucionar." },
    { id: 3,   name: "Venusaur",    name_es: "Venusaur",    type1: "Grass",    type2: "Poison",   hp: 80,  attack: 82,  defense: 83,  sp_attack: 100, sp_defense: 100, speed: 80,  total: 525, generation: 1, legendary: 0, description: "La flor de su lomo absorbe los rayos del sol para convertirlos en energía." },
    { id: 4,   name: "Charmander",  name_es: "Charmander",  type1: "Fire",     type2: null,       hp: 39,  attack: 52,  defense: 43,  sp_attack: 60,  sp_defense: 50,  speed: 65,  total: 309, generation: 1, legendary: 0, description: "Desde que nace, tiene una llama en la punta de la cola. Si la llama se apaga, muere." },
    { id: 5,   name: "Charmeleon",  name_es: "Charmeleon",  type1: "Fire",     type2: null,       hp: 58,  attack: 64,  defense: 58,  sp_attack: 80,  sp_defense: 65,  speed: 80,  total: 405, generation: 1, legendary: 0, description: "Es muy agresivo. Si encuentra un enemigo fuerte, su llama se vuelve azul-blanca." },
    { id: 6,   name: "Charizard",   name_es: "Charizard",   type1: "Fire",     type2: "Flying",   hp: 78,  attack: 84,  defense: 78,  sp_attack: 109, sp_defense: 85,  speed: 100, total: 534, generation: 1, legendary: 0, description: "Escupe fuego tan caliente que puede derretir rocas. Causa incendios accidentalmente." },
    { id: 7,   name: "Squirtle",    name_es: "Squirtle",    type1: "Water",    type2: null,       hp: 44,  attack: 48,  defense: 65,  sp_attack: 50,  sp_defense: 64,  speed: 43,  total: 314, generation: 1, legendary: 0, description: "Después del nacimiento, su espalda se hincha y endurece en forma de caparazón." },
    { id: 8,   name: "Wartortle",   name_es: "Wartortle",   type1: "Water",    type2: null,       hp: 59,  attack: 63,  defense: 80,  sp_attack: 65,  sp_defense: 80,  speed: 58,  total: 405, generation: 1, legendary: 0, description: "Se dice que su cola esponjosa simboliza longevidad. Es muy popular como mascota." },
    { id: 9,   name: "Blastoise",   name_es: "Blastoise",   type1: "Water",    type2: null,       hp: 79,  attack: 83,  defense: 100, sp_attack: 85,  sp_defense: 105, speed: 78,  total: 530, generation: 1, legendary: 0, description: "Los cañones de agua de su caparazón pueden perforar el acero y hundir barcos." },
    { id: 10,  name: "Caterpie",    name_es: "Caterpie",    type1: "Bug",      type2: null,       hp: 45,  attack: 30,  defense: 35,  sp_attack: 20,  sp_defense: 20,  speed: 45,  total: 195, generation: 1, legendary: 0, description: "Come hojas de plantas. Suele camuflarse entre la vegetación." },
    { id: 11,  name: "Metapod",     name_es: "Metapod",     type1: "Bug",      type2: null,       hp: 50,  attack: 20,  defense: 55,  sp_attack: 25,  sp_defense: 25,  speed: 30,  total: 205, generation: 1, legendary: 0, description: "La coraza que envuelve su cuerpo es tan dura como el hierro." },
    { id: 12,  name: "Butterfree",  name_es: "Butterfree",  type1: "Bug",      type2: "Flying",   hp: 60,  attack: 45,  defense: 50,  sp_attack: 90,  sp_defense: 80,  speed: 70,  total: 395, generation: 1, legendary: 0, description: "Sus alas están cubiertas de escamas venenosas que suelta cuando bate sus alas." },
    { id: 25,  name: "Pikachu",     name_es: "Pikachu",     type1: "Electric", type2: null,       hp: 35,  attack: 55,  defense: 40,  sp_attack: 50,  sp_defense: 50,  speed: 90,  total: 320, generation: 1, legendary: 0, description: "Acumula electricidad en sus mejillas. Si se cargan demasiado, las descarga sobre objetos cercanos." },
    { id: 26,  name: "Raichu",      name_es: "Raichu",      type1: "Electric", type2: null,       hp: 60,  attack: 90,  defense: 55,  sp_attack: 90,  sp_defense: 80,  speed: 110, total: 485, generation: 1, legendary: 0, description: "Si acumula demasiada electricidad se vuelve agresivo. Suele dar descargas sin querer." },
    { id: 39,  name: "Jigglypuff",  name_es: "Jigglypuff",  type1: "Normal",   type2: "Fairy",    hp: 115, attack: 45,  defense: 20,  sp_attack: 45,  sp_defense: 25,  speed: 20,  total: 270, generation: 1, legendary: 0, description: "Canta una canción hipnótica que pone a dormir a sus enemigos. Sus ojos nunca pestañean." },
    { id: 52,  name: "Meowth",      name_es: "Meowth",      type1: "Normal",   type2: null,       hp: 40,  attack: 45,  defense: 35,  sp_attack: 40,  sp_defense: 40,  speed: 90,  total: 290, generation: 1, legendary: 0, description: "Le brillan los ojos en la oscuridad. Le fascinan los objetos redondos y brillantes." },
    { id: 54,  name: "Psyduck",     name_es: "Psyduck",     type1: "Water",    type2: null,       hp: 50,  attack: 52,  defense: 48,  sp_attack: 65,  sp_defense: 50,  speed: 55,  total: 320, generation: 1, legendary: 0, description: "Siempre tiene un terrible dolor de cabeza. Cuando el dolor es insoportable, suelta poderes psíquicos." },
    { id: 63,  name: "Abra",        name_es: "Abra",        type1: "Psychic",  type2: null,       hp: 25,  attack: 20,  defense: 15,  sp_attack: 105, sp_defense: 55,  speed: 90,  total: 310, generation: 1, legendary: 0, description: "Duerme 18 horas al día. Puede teletransportarse mientras está dormido." },
    { id: 66,  name: "Machop",      name_es: "Machop",      type1: "Fighting", type2: null,       hp: 70,  attack: 80,  defense: 50,  sp_attack: 35,  sp_defense: 35,  speed: 35,  total: 305, generation: 1, legendary: 0, description: "Tiene la fuerza de 100 adultos. Entrena levantando a Graveler." },
    { id: 74,  name: "Geodude",     name_es: "Geodude",     type1: "Rock",     type2: "Ground",   hp: 40,  attack: 80,  defense: 100, sp_attack: 30,  sp_defense: 30,  speed: 20,  total: 300, generation: 1, legendary: 0, description: "Se confunde con rocas en los caminos de montaña. Los excursionistas a veces se tropiezan con él." },
    { id: 94,  name: "Gengar",      name_es: "Gengar",      type1: "Ghost",    type2: "Poison",   hp: 60,  attack: 65,  defense: 60,  sp_attack: 130, sp_defense: 75,  speed: 110, total: 500, generation: 1, legendary: 0, description: "Se esconde en las sombras. Baja la temperatura del lugar donde está para 10°C." },
    { id: 116, name: "Horsea",      name_es: "Horsea",      type1: "Water",    type2: null,       hp: 30,  attack: 40,  defense: 70,  sp_attack: 70,  sp_defense: 25,  speed: 60,  total: 295, generation: 1, legendary: 0, description: "Puede enroscarse a raíces y corales con su cola para no ser arrastrado por la corriente." },
    { id: 129, name: "Magikarp",    name_es: "Magikarp",    type1: "Water",    type2: null,       hp: 20,  attack: 10,  defense: 55,  sp_attack: 15,  sp_defense: 20,  speed: 80,  total: 200, generation: 1, legendary: 0, description: "Es muy débil y solo puede saltar. Hay quien lo llama el Pokémon más débil del mundo." },
    { id: 130, name: "Gyarados",    name_es: "Gyarados",    type1: "Water",    type2: "Flying",   hp: 95,  attack: 125, defense: 79,  sp_attack: 60,  sp_defense: 100, speed: 81,  total: 540, generation: 1, legendary: 0, description: "Una vez enojado, no se detiene hasta destruir todo a su alrededor. Se le teme desde la antigüedad." },
    { id: 131, name: "Lapras",      name_es: "Lapras",      type1: "Water",    type2: "Ice",      hp: 130, attack: 85,  defense: 80,  sp_attack: 85,  sp_defense: 95,  speed: 60,  total: 535, generation: 1, legendary: 0, description: "Un Pokémon gentil que lleva a la gente en su lomo a través del mar. Su especie casi se extinguió." },
    { id: 132, name: "Ditto",       name_es: "Ditto",       type1: "Normal",   type2: null,       hp: 48,  attack: 48,  defense: 48,  sp_attack: 48,  sp_defense: 48,  speed: 48,  total: 288, generation: 1, legendary: 0, description: "Puede transformarse en cualquier cosa. Si se cansa puede olvidar cómo se veía." },
    { id: 133, name: "Eevee",       name_es: "Eevee",       type1: "Normal",   type2: null,       hp: 55,  attack: 55,  defense: 50,  sp_attack: 45,  sp_defense: 65,  speed: 55,  total: 325, generation: 1, legendary: 0, description: "Tiene una composición genética irregular que le permite adaptarse al entorno evolucionando de muchas formas." },
    { id: 143, name: "Snorlax",     name_es: "Snorlax",     type1: "Normal",   type2: null,       hp: 160, attack: 110, defense: 65,  sp_attack: 65,  sp_defense: 110, speed: 30,  total: 540, generation: 1, legendary: 0, description: "Come 400 kg de comida al día, luego duerme. Los niños juegan encima de su enorme barriga." },
    // Legendarios Gen 1
    { id: 144, name: "Articuno",    name_es: "Articuno",    type1: "Ice",      type2: "Flying",   hp: 90,  attack: 85,  defense: 100, sp_attack: 95,  sp_defense: 125, speed: 85,  total: 580, generation: 1, legendary: 1, description: "Ave Pokémon legendaria de hielo. Puede congelar el agua en el aire, creando nieve al volar." },
    { id: 145, name: "Zapdos",      name_es: "Zapdos",      type1: "Electric", type2: "Flying",   hp: 90,  attack: 90,  defense: 85,  sp_attack: 125, sp_defense: 90,  speed: 100, total: 580, generation: 1, legendary: 1, description: "Ave Pokémon legendaria eléctrica. Aparece en tormentas y cobra energía de los rayos." },
    { id: 146, name: "Moltres",     name_es: "Moltres",     type1: "Fire",     type2: "Flying",   hp: 90,  attack: 100, defense: 90,  sp_attack: 125, sp_defense: 85,  speed: 90,  total: 580, generation: 1, legendary: 1, description: "Ave Pokémon legendaria de fuego. Con cada aleteo, ráfagas de llamas iluminan el cielo." },
    { id: 147, name: "Dratini",     name_es: "Dratini",     type1: "Dragon",   type2: null,       hp: 41,  attack: 64,  defense: 45,  sp_attack: 50,  sp_defense: 50,  speed: 50,  total: 300, generation: 1, legendary: 0, description: "Muda de piel muchas veces mientras crece. Vive en el fondo de ríos profundos." },
    { id: 148, name: "Dragonair",   name_es: "Dragonair",   type1: "Dragon",   type2: null,       hp: 61,  attack: 84,  defense: 65,  sp_attack: 70,  sp_defense: 70,  speed: 70,  total: 420, generation: 1, legendary: 0, description: "Se dice que puede cambiar el clima a su antojo. Las cristales de su cuerpo brillan en azul." },
    { id: 149, name: "Dragonite",   name_es: "Dragonite",   type1: "Dragon",   type2: "Flying",   hp: 91,  attack: 134, defense: 95,  sp_attack: 100, sp_defense: 100, speed: 80,  total: 600, generation: 1, legendary: 0, description: "Puede rodear el globo terráqueo en solo 16 horas. Ayuda a marineros en peligro." },
    { id: 150, name: "Mewtwo",      name_es: "Mewtwo",      type1: "Psychic",  type2: null,       hp: 106, attack: 110, defense: 90,  sp_attack: 154, sp_defense: 90,  speed: 130, total: 680, generation: 1, legendary: 1, description: "Pokémon creado por manipulación genética. Se dice que tiene el corazón más salvaje de todos." },
    { id: 151, name: "Mew",         name_es: "Mew",         type1: "Psychic",  type2: null,       hp: 100, attack: 100, defense: 100, sp_attack: 100, sp_defense: 100, speed: 100, total: 600, generation: 1, legendary: 1, description: "Su ADN contiene el código genético de todos los Pokémon. Puede aprender cualquier movimiento." },
    // Gen 2
    { id: 152, name: "Chikorita",   name_es: "Chikorita",   type1: "Grass",    type2: null,       hp: 45,  attack: 49,  defense: 65,  sp_attack: 49,  sp_defense: 65,  speed: 45,  total: 318, generation: 2, legendary: 0, description: "El aroma dulce de su hoja calma las emociones y crea una atmósfera amistosa." },
    { id: 155, name: "Cyndaquil",   name_es: "Cyndaquil",   type1: "Fire",     type2: null,       hp: 39,  attack: 52,  defense: 43,  sp_attack: 60,  sp_defense: 50,  speed: 65,  total: 309, generation: 2, legendary: 0, description: "Tímido por naturaleza, prende el fuego de su lomo cuando se asusta." },
    { id: 158, name: "Totodile",    name_es: "Totodile",    type1: "Water",    type2: null,       hp: 50,  attack: 65,  defense: 64,  sp_attack: 44,  sp_defense: 48,  speed: 43,  total: 314, generation: 2, legendary: 0, description: "Sus mandíbulas son muy poderosas. Puede morder a su entrenador sin mala intención." },
    { id: 175, name: "Togepi",      name_es: "Togepi",      type1: "Fairy",    type2: null,       hp: 35,  attack: 20,  defense: 65,  sp_attack: 40,  sp_defense: 65,  speed: 20,  total: 245, generation: 2, legendary: 0, description: "Se dice que la cáscara de su huevo contiene la felicidad del mundo." },
    { id: 196, name: "Espeon",      name_es: "Espeon",      type1: "Psychic",  type2: null,       hp: 65,  attack: 65,  defense: 60,  sp_attack: 130, sp_defense: 95,  speed: 110, total: 525, generation: 2, legendary: 0, description: "Desarrolló poderes psíquicos para proteger a su entrenador de ataques enemigos." },
    { id: 197, name: "Umbreon",     name_es: "Umbreon",     type1: "Dark",     type2: null,       hp: 95,  attack: 65,  defense: 110, sp_attack: 60,  sp_defense: 130, speed: 65,  total: 525, generation: 2, legendary: 0, description: "Cuando está acechado por el peligro, los anillos de su cuerpo brillan con un halo amarillo." },
    { id: 243, name: "Raikou",      name_es: "Raikou",      type1: "Electric", type2: null,       hp: 90,  attack: 85,  defense: 75,  sp_attack: 115, sp_defense: 100, speed: 115, total: 580, generation: 2, legendary: 1, description: "Lleva consigo tormentas. Ruge con un trueno atronador para intimidar a sus enemigos." },
    { id: 244, name: "Entei",       name_es: "Entei",       type1: "Fire",     type2: null,       hp: 115, attack: 115, defense: 85,  sp_attack: 90,  sp_defense: 75,  speed: 100, total: 580, generation: 2, legendary: 1, description: "Cada vez que ruge, un volcán explota en algún lugar del mundo." },
    { id: 245, name: "Suicune",     name_es: "Suicune",     type1: "Water",    type2: null,       hp: 100, attack: 75,  defense: 115, sp_attack: 90,  sp_defense: 115, speed: 85,  total: 580, generation: 2, legendary: 1, description: "Corre por el norte purificando los lagos y mares contaminados a su paso." },
    { id: 248, name: "Tyranitar",   name_es: "Tyranitar",   type1: "Rock",     type2: "Dark",     hp: 100, attack: 134, defense: 110, sp_attack: 95,  sp_defense: 100, speed: 61,  total: 600, generation: 2, legendary: 0, description: "Su poderoso cuerpo puede cambiar el paisaje. Los mapas deben rehacerse cada vez que se enfada." },
    { id: 249, name: "Lugia",       name_es: "Lugia",       type1: "Psychic",  type2: "Flying",   hp: 106, attack: 90,  defense: 130, sp_attack: 90,  sp_defense: 154, speed: 110, total: 680, generation: 2, legendary: 1, description: "Señor de los mares. Se dice que un aleteo suyo puede provocar una tempestad de 40 días." },
    { id: 250, name: "Ho-Oh",       name_es: "Ho-Oh",       type1: "Fire",     type2: "Flying",   hp: 106, attack: 130, defense: 90,  sp_attack: 110, sp_defense: 154, speed: 90,  total: 680, generation: 2, legendary: 1, description: "Sus plumas multicolor cambian de color según el ángulo de la luz. Se rumorea que otorga felicidad eterna." },
    // Gen 3
    { id: 252, name: "Treecko",     name_es: "Treecko",     type1: "Grass",    type2: null,       hp: 40,  attack: 45,  defense: 35,  sp_attack: 65,  sp_defense: 55,  speed: 70,  total: 310, generation: 3, legendary: 0, description: "No pierde la calma ante nada. Se agarra a superficies lisas con sus pies especiales." },
    { id: 255, name: "Torchic",     name_es: "Torchic",     type1: "Fire",     type2: null,       hp: 45,  attack: 60,  defense: 40,  sp_attack: 70,  sp_defense: 50,  speed: 45,  total: 310, generation: 3, legendary: 0, description: "Tiene un fuego en su interior. Abraza a su entrenador emitiendo calor cálido." },
    { id: 258, name: "Mudkip",      name_es: "Mudkip",      type1: "Water",    type2: null,       hp: 50,  attack: 70,  defense: 50,  sp_attack: 50,  sp_defense: 50,  speed: 40,  total: 310, generation: 3, legendary: 0, description: "La aleta de su cabeza detecta corrientes de agua. Puede sobrevivir en tierra usando su piel." },
    { id: 280, name: "Ralts",       name_es: "Ralts",       type1: "Psychic",  type2: "Fairy",    hp: 28,  attack: 25,  defense: 25,  sp_attack: 45,  sp_defense: 35,  speed: 40,  total: 198, generation: 3, legendary: 0, description: "Puede sentir las emociones de las personas gracias a los cuernos de su cabeza." },
    { id: 302, name: "Sableye",     name_es: "Sableye",     type1: "Dark",     type2: "Ghost",    hp: 50,  attack: 75,  defense: 75,  sp_attack: 65,  sp_defense: 65,  speed: 50,  total: 380, generation: 3, legendary: 0, description: "Vive en cavernas oscuras. Sus ojos son gemas preciosas con las que puede ver en la oscuridad." },
    { id: 350, name: "Milotic",     name_es: "Milotic",     type1: "Water",    type2: null,       hp: 95,  attack: 60,  defense: 79,  sp_attack: 100, sp_defense: 125, speed: 81,  total: 540, generation: 3, legendary: 0, description: "Se considera el Pokémon más bello del mundo. Sus escamas brillan con siete colores bajo la luz." },
    { id: 380, name: "Latias",      name_es: "Latias",      type1: "Dragon",   type2: "Psychic",  hp: 80,  attack: 80,  defense: 90,  sp_attack: 110, sp_defense: 130, speed: 110, total: 600, generation: 3, legendary: 1, description: "Puede doblar la luz alrededor de su cuerpo para hacerse invisible o cambiar de forma." },
    { id: 381, name: "Latios",      name_es: "Latios",      type1: "Dragon",   type2: "Psychic",  hp: 80,  attack: 90,  defense: 80,  sp_attack: 130, sp_defense: 110, speed: 110, total: 600, generation: 3, legendary: 1, description: "Muy inteligente. Puede entender el lenguaje humano y compartir memorias con quien confíe." },
    { id: 382, name: "Kyogre",      name_es: "Kyogre",      type1: "Water",    type2: null,       hp: 100, attack: 100, defense: 90,  sp_attack: 150, sp_defense: 140, speed: 90,  total: 670, generation: 3, legendary: 1, description: "Creó los océanos expandiendo los mares con sus aletas. Se lo describe en leyendas antiguas." },
    { id: 383, name: "Groudon",     name_es: "Groudon",     type1: "Ground",   type2: null,       hp: 100, attack: 150, defense: 140, sp_attack: 100, sp_defense: 90,  speed: 90,  total: 670, generation: 3, legendary: 1, description: "Creó los continentes. Duerme en el magma de la tierra y su cuerpo irradia calor intenso." },
    { id: 384, name: "Rayquaza",    name_es: "Rayquaza",    type1: "Dragon",   type2: "Flying",   hp: 105, attack: 150, defense: 90,  sp_attack: 150, sp_defense: 90,  speed: 95,  total: 680, generation: 3, legendary: 1, description: "Vive en la capa de ozono. Calma las batallas entre Groudon y Kyogre desde tiempos remotos." },
    // Gen 4
    { id: 387, name: "Turtwig",     name_es: "Turtwig",     type1: "Grass",    type2: null,       hp: 55,  attack: 68,  defense: 64,  sp_attack: 45,  sp_defense: 55,  speed: 31,  total: 318, generation: 4, legendary: 0, description: "El caparazón de su espalda es tierra endurecida. Si está bien hidratado, el ramita de su cabeza se torna fresca." },
    { id: 390, name: "Chimchar",    name_es: "Chimchar",    type1: "Fire",     type2: null,       hp: 44,  attack: 58,  defense: 44,  sp_attack: 58,  sp_defense: 44,  speed: 61,  total: 309, generation: 4, legendary: 0, description: "Trepa a las rocas escarpadas con facilidad. La llama de su trasero proviene del gas de su estómago." },
    { id: 393, name: "Piplup",      name_es: "Piplup",      type1: "Water",    type2: null,       hp: 53,  attack: 51,  defense: 53,  sp_attack: 61,  sp_defense: 56,  speed: 40,  total: 314, generation: 4, legendary: 0, description: "Es muy orgulloso y no acepta comida de extraños. Puede sobrevivir en agua helada." },
    { id: 448, name: "Lucario",     name_es: "Lucario",     type1: "Fighting", type2: "Steel",    hp: 70,  attack: 110, defense: 70,  sp_attack: 115, sp_defense: 70,  speed: 90,  total: 525, generation: 4, legendary: 0, description: "Puede leer la mente del oponente usando ondas de aura. Un entrenador virtuoso puede comunicarse con él." },
    { id: 445, name: "Garchomp",    name_es: "Garchomp",    type1: "Dragon",   type2: "Ground",   hp: 108, attack: 130, defense: 95,  sp_attack: 80,  sp_defense: 85,  speed: 102, total: 600, generation: 4, legendary: 0, description: "Vuela tan rápido que parece un avión de caza. Puede atrapar su presa sin que esta lo vea." },
    { id: 484, name: "Palkia",      name_es: "Palkia",      type1: "Water",    type2: "Dragon",   hp: 90,  attack: 120, defense: 100, sp_attack: 150, sp_defense: 120, speed: 100, total: 680, generation: 4, legendary: 1, description: "Pokémon del espacio. Sus poderes pueden distorsionar el espacio a su antojo." },
    { id: 483, name: "Dialga",      name_es: "Dialga",      type1: "Steel",    type2: "Dragon",   hp: 100, attack: 120, defense: 120, sp_attack: 150, sp_defense: 100, speed: 90,  total: 680, generation: 4, legendary: 1, description: "Pokémon del tiempo. Dicen que el tiempo fluye cuando late su corazón." },
    { id: 487, name: "Giratina",    name_es: "Giratina",    type1: "Ghost",    type2: "Dragon",   hp: 150, attack: 100, defense: 120, sp_attack: 100, sp_defense: 120, speed: 90,  total: 680, generation: 4, legendary: 1, description: "Fue desterrado a otra dimensión por su violencia. Observa el mundo desde su dimensión inversa." },
    // Gen 5
    { id: 495, name: "Snivy",       name_es: "Snivy",       type1: "Grass",    type2: null,       hp: 45,  attack: 45,  defense: 55,  sp_attack: 45,  sp_defense: 55,  speed: 63,  total: 308, generation: 5, legendary: 0, description: "Photosintesiza usando su cola. Cuando está débil, su cola se aleja." },
    { id: 498, name: "Tepig",       name_es: "Tepig",       type1: "Fire",     type2: null,       hp: 65,  attack: 63,  defense: 45,  sp_attack: 45,  sp_defense: 45,  speed: 45,  total: 308, generation: 5, legendary: 0, description: "Escupe fuego por su nariz. Cuando se resfría, escupe humo negro." },
    { id: 501, name: "Oshawott",    name_es: "Oshawott",    type1: "Water",    type2: null,       hp: 55,  attack: 55,  defense: 45,  sp_attack: 63,  sp_defense: 45,  speed: 45,  total: 308, generation: 5, legendary: 0, description: "La concha de su vientre sirve como escudo y como arma. Puede desprenderla para atacar." },
    { id: 547, name: "Whimsicott", name_es: "Whimsicott",  type1: "Grass",    type2: "Fairy",    hp: 60,  attack: 67,  defense: 85,  sp_attack: 77,  sp_defense: 75,  speed: 116, total: 480, generation: 5, legendary: 0, description: "Se cuela por cualquier grieta como el viento. Deja un rastro de pelusas blancas." },
    { id: 643, name: "Reshiram",    name_es: "Reshiram",    type1: "Dragon",   type2: "Fire",     hp: 100, attack: 120, defense: 100, sp_attack: 150, sp_defense: 120, speed: 90,  total: 680, generation: 5, legendary: 1, description: "Su cola genera un plasma que puede calentar la atmósfera y cambiar el clima del mundo." },
    { id: 644, name: "Zekrom",      name_es: "Zekrom",      type1: "Dragon",   type2: "Electric", hp: 100, attack: 150, defense: 120, sp_attack: 120, sp_defense: 100, speed: 90,  total: 680, generation: 5, legendary: 1, description: "Su cola genera electricidad. Puede cubrirse en plasma negro para ocultarse en las nubes de tormenta." },
    { id: 646, name: "Kyurem",      name_es: "Kyurem",      type1: "Dragon",   type2: "Ice",      hp: 125, attack: 130, defense: 90,  sp_attack: 130, sp_defense: 90,  speed: 95,  total: 660, generation: 5, legendary: 1, description: "Un antiguo dragón de hielo. Puede congelar todo a su alrededor con su aliento helado." },
    // Gen 6
    { id: 650, name: "Chespin",     name_es: "Chespin",     type1: "Grass",    type2: null,       hp: 56,  attack: 61,  defense: 65,  sp_attack: 48,  sp_defense: 45,  speed: 38,  total: 313, generation: 6, legendary: 0, description: "Su suave cabeza puede endurecer sus espinas para protegerse de cualquier ataque." },
    { id: 653, name: "Fennekin",    name_es: "Fennekin",    type1: "Fire",     type2: null,       hp: 40,  attack: 45,  defense: 40,  sp_attack: 62,  sp_defense: 60,  speed: 60,  total: 307, generation: 6, legendary: 0, description: "Expulsa aire caliente a 200°C por sus orejas. Le gusta masticar ramitas." },
    { id: 656, name: "Froakie",     name_es: "Froakie",     type1: "Water",    type2: null,       hp: 41,  attack: 56,  defense: 40,  sp_attack: 62,  sp_defense: 44,  speed: 71,  total: 314, generation: 6, legendary: 0, description: "La espuma de su pecho absorbe los daños. Es muy ágil y puede saltar altísimo." },
    { id: 716, name: "Xerneas",     name_es: "Xerneas",     type1: "Fairy",    type2: null,       hp: 126, attack: 131, defense: 95,  sp_attack: 131, sp_defense: 98,  speed: 99,  total: 680, generation: 6, legendary: 1, description: "Puede conceder vida eterna. Al final de su vida, duerme transformado en un árbol por mil años." },
    { id: 717, name: "Yveltal",     name_es: "Yveltal",     type1: "Dark",     type2: "Flying",   hp: 126, attack: 131, defense: 95,  sp_attack: 131, sp_defense: 98,  speed: 99,  total: 680, generation: 6, legendary: 1, description: "Absorbe la energía vital de todo ser vivo. Al final de su vida, se convierte en un capullo." },
    { id: 718, name: "Zygarde",     name_es: "Zygarde",     type1: "Dragon",   type2: "Ground",   hp: 108, attack: 100, defense: 121, sp_attack: 81,  sp_defense: 95,  speed: 95,  total: 600, generation: 6, legendary: 1, description: "Cuida el ecosistema del mundo. Puede cambiar de forma según cuántas de sus células reúna." },
    // Gen 7
    { id: 722, name: "Rowlet",      name_es: "Rowlet",      type1: "Grass",    type2: "Flying",   hp: 68,  attack: 55,  defense: 55,  sp_attack: 50,  sp_defense: 50,  speed: 42,  total: 320, generation: 7, legendary: 0, description: "Puede rotar 180° su cabeza. Recarga energía realizando fotosíntesis durante el día." },
    { id: 725, name: "Litten",      name_es: "Litten",      type1: "Fire",     type2: null,       hp: 45,  attack: 65,  defense: 40,  sp_attack: 60,  sp_defense: 40,  speed: 70,  total: 320, generation: 7, legendary: 0, description: "Muy independiente. Traga su propio pelo para crear bolas de fuego." },
    { id: 728, name: "Popplio",     name_es: "Popplio",     type1: "Water",    type2: null,       hp: 50,  attack: 54,  defense: 54,  sp_attack: 66,  sp_defense: 56,  speed: 40,  total: 320, generation: 7, legendary: 0, description: "Puede hacer globos de agua con su nariz. Sus actuaciones circenses son muy populares." },
    { id: 785, name: "Tapu Koko",   name_es: "Tapu Koko",   type1: "Electric", type2: "Fairy",    hp: 70,  attack: 115, defense: 85,  sp_attack: 95,  sp_defense: 75,  speed: 130, total: 570, generation: 7, legendary: 1, description: "Deidad protectora de Melemele. Caprichoso, puede olvidar a quien ayuda al instante." },
    { id: 800, name: "Necrozma",    name_es: "Necrozma",    type1: "Psychic",  type2: null,       hp: 97,  attack: 107, defense: 101, sp_attack: 127, sp_defense: 89,  speed: 79,  total: 600, generation: 7, legendary: 1, description: "Absorbe la luz para moverse. Antiguamente brillaba como el sol antes de ser hecho pedazos." },
    // Gen 8
    { id: 810, name: "Grookey",     name_es: "Grookey",     type1: "Grass",    type2: null,       hp: 50,  attack: 65,  defense: 50,  sp_attack: 40,  sp_defense: 40,  speed: 65,  total: 310, generation: 8, legendary: 0, description: "Golpea con su palo a todo lo que le rodea. Con ese golpeteo da vida a las plantas." },
    { id: 813, name: "Scorbunny",   name_es: "Scorbunny",   type1: "Fire",     type2: null,       hp: 50,  attack: 71,  defense: 40,  sp_attack: 40,  sp_defense: 40,  speed: 69,  total: 310, generation: 8, legendary: 0, description: "Corre siempre a plena velocidad. Al calentarse sus patas, tiene fuerza de fuego." },
    { id: 816, name: "Sobble",      name_es: "Sobble",      type1: "Water",    type2: null,       hp: 50,  attack: 40,  defense: 40,  sp_attack: 70,  sp_defense: 40,  speed: 70,  total: 310, generation: 8, legendary: 0, description: "Al sumergirse en agua se camufla. Sus lágrimas son tan potentes que hacen llorar a todos." },
    { id: 888, name: "Zacian",      name_es: "Zacian",      type1: "Fairy",    type2: null,       hp: 92,  attack: 130, defense: 115, sp_attack: 80,  sp_defense: 115, speed: 138, total: 670, generation: 8, legendary: 1, description: "Héroe legendario. Porta una espada en su boca y puede derrotar a cualquier enemigo." },
    { id: 889, name: "Zamazenta",   name_es: "Zamazenta",   type1: "Fighting", type2: null,       hp: 92,  attack: 130, defense: 115, sp_attack: 80,  sp_defense: 115, speed: 138, total: 670, generation: 8, legendary: 1, description: "Héroe legendario. Su escudo de acero refleja todos los ataques y protege a quienes están cerca." },
    { id: 890, name: "Eternatus",   name_es: "Eternatus",   type1: "Poison",   type2: "Dragon",   hp: 140, attack: 85,  defense: 95,  sp_attack: 145, sp_defense: 95,  speed: 130, total: 690, generation: 8, legendary: 1, description: "Cayó del cielo hace 20,000 años. Su cuerpo contiene una energía infinita." },
    // Gen 9
    { id: 906, name: "Sprigatito",  name_es: "Sprigatito",  type1: "Grass",    type2: null,       hp: 40,  attack: 61,  defense: 54,  sp_attack: 45,  sp_defense: 45,  speed: 65,  total: 310, generation: 9, legendary: 0, description: "Amasa sus patas para liberar un aroma que hipnotiza a quienes lo rodean." },
    { id: 909, name: "Fuecoco",     name_es: "Fuecoco",     type1: "Fire",     type2: null,       hp: 67,  attack: 45,  defense: 59,  sp_attack: 63,  sp_defense: 40,  speed: 36,  total: 310, generation: 9, legendary: 0, description: "Absorbe el calor y lo convierte en energía. Los cuadros de su cabeza emiten fuego." },
    { id: 912, name: "Quaxly",      name_es: "Quaxly",      type1: "Water",    type2: null,       hp: 55,  attack: 65,  defense: 45,  sp_attack: 50,  sp_defense: 45,  speed: 50,  total: 310, generation: 9, legendary: 0, description: "Muy pulcro. Repele el agua con el gel de su capello para mantenerse limpio." },
    { id: 1007, name: "Koraidon",   name_es: "Koraidon",    type1: "Fighting", type2: "Dragon",   hp: 100, attack: 135, defense: 115, sp_attack: 85,  sp_defense: 100, speed: 135, total: 670, generation: 9, legendary: 1, description: "Pokémon del pasado. Se cree que los antiguos lo veneraban como deidad del Sol." },
    { id: 1008, name: "Miraidon",   name_es: "Miraidon",    type1: "Electric", type2: "Dragon",   hp: 100, attack: 85,  defense: 100, sp_attack: 135, sp_defense: 115, speed: 135, total: 670, generation: 9, legendary: 1, description: "Pokémon del futuro. Genera electricidad en su cuerpo y puede transformarse en varios vehículos." },
  ];

  const seedAll = db.transaction(() => {
    for (const p of pokemons) {
      insertPokemon.run(p);
    }
  });
  seedAll();

  // Seed evolutions
  const insertEvo = db.prepare(
    "INSERT OR IGNORE INTO evolutions (from_id, to_id, method) VALUES (?, ?, ?)"
  );
  const evolutions = [
    [1, 2, "Nivel 16"],   [2, 3, "Nivel 32"],
    [4, 5, "Nivel 16"],   [5, 6, "Nivel 36"],
    [7, 8, "Nivel 16"],   [8, 9, "Nivel 36"],
    [10, 11, "Nivel 7"],  [11, 12, "Nivel 10"],
    [25, 26, "Piedra Trueno"],
    [129, 130, "Nivel 20"],
    [133, 196, "Amistad (Día)"],
    [133, 197, "Amistad (Noche)"],
    [147, 148, "Nivel 30"],  [148, 149, "Nivel 55"],
    [152, 153, "Nivel 16"], [153, 154, "Nivel 32"],
    [155, 156, "Nivel 14"], [156, 157, "Nivel 36"],
    [158, 159, "Nivel 18"], [159, 160, "Nivel 30"],
    [252, 253, "Nivel 16"], [253, 254, "Nivel 36"],
    [255, 256, "Nivel 16"], [256, 257, "Nivel 36"],
    [258, 259, "Nivel 16"], [259, 260, "Nivel 36"],
    [280, 281, "Nivel 20"], [281, 282, "Nivel 30"],
    [387, 388, "Nivel 18"], [388, 389, "Nivel 32"],
    [390, 391, "Nivel 14"], [391, 392, "Nivel 36"],
    [393, 394, "Nivel 16"], [394, 395, "Nivel 36"],
    [495, 496, "Nivel 17"], [496, 497, "Nivel 36"],
    [498, 499, "Nivel 17"], [499, 500, "Nivel 36"],
    [501, 502, "Nivel 17"], [502, 503, "Nivel 36"],
    [650, 651, "Nivel 16"], [651, 652, "Nivel 36"],
    [653, 654, "Nivel 16"], [654, 655, "Nivel 36"],
    [656, 657, "Nivel 16"], [657, 658, "Nivel 36"],
    [722, 723, "Nivel 17"], [723, 724, "Nivel 34"],
    [725, 726, "Nivel 17"], [726, 727, "Nivel 34"],
    [728, 729, "Nivel 17"], [729, 730, "Nivel 34"],
    [810, 811, "Nivel 16"], [811, 812, "Nivel 35"],
    [813, 814, "Nivel 16"], [814, 815, "Nivel 35"],
    [816, 817, "Nivel 16"], [817, 818, "Nivel 35"],
    [906, 907, "Nivel 16"], [907, 908, "Nivel 36"],
    [909, 910, "Nivel 16"], [910, 911, "Nivel 36"],
    [912, 913, "Nivel 16"], [913, 914, "Nivel 36"],
  ];

  const seedEvos = db.transaction(() => {
    for (const [f, t, m] of evolutions) insertEvo.run(f, t, m);
  });
  seedEvos();

  // Seed moves
  const insertMove = db.prepare(`
    INSERT OR IGNORE INTO moves (id, name, type, category, power, accuracy, pp, description)
    VALUES (@id, @name, @type, @category, @power, @accuracy, @pp, @description)
  `);
  const moves = [
    { id: 1,  name: "Placaje",         type: "Normal",    category: "Físico",   power: 40,  accuracy: 100, pp: 35, description: "Un ataque de carga en el que el usuario se abalanza con todo su cuerpo." },
    { id: 2,  name: "Látigo",          type: "Normal",    category: "Estado",   power: null, accuracy: 100, pp: 30, description: "Bate la cola para bajar la Defensa del objetivo." },
    { id: 3,  name: "Arañazo",         type: "Normal",    category: "Físico",   power: 40,  accuracy: 100, pp: 35, description: "El usuario arañazo al objetivo con garras afiladas." },
    { id: 4,  name: "Gruñido",         type: "Normal",    category: "Estado",   power: null, accuracy: 100, pp: 40, description: "Emite un adorable gruñido para bajar el Ataque." },
    { id: 5,  name: "Ascuas",          type: "Fire",      category: "Especial", power: 40,  accuracy: 100, pp: 25, description: "Lanza pequeñas llamas al objetivo. Puede causar quemaduras." },
    { id: 6,  name: "Pistola Agua",    type: "Water",     category: "Especial", power: 40,  accuracy: 100, pp: 25, description: "Dispara agua al objetivo." },
    { id: 7,  name: "Hoja Afilada",    type: "Grass",     category: "Especial", power: 55,  accuracy: 95,  pp: 25, description: "Dispara hojas afiladas al objetivo. Crítico frecuente." },
    { id: 8,  name: "Impactrueno",     type: "Electric",  category: "Especial", power: 40,  accuracy: 100, pp: 30, description: "Ataque eléctrico. Puede paralizar al objetivo." },
    { id: 9,  name: "Rayo",            type: "Electric",  category: "Especial", power: 90,  accuracy: 100, pp: 15, description: "Ataque eléctrico muy preciso. Puede paralizar." },
    { id: 10, name: "Lanzallamas",     type: "Fire",      category: "Especial", power: 90,  accuracy: 100, pp: 15, description: "Abrasa al objetivo con llamas. Puede causar quemaduras." },
    { id: 11, name: "Hidrobomba",      type: "Water",     category: "Especial", power: 110, accuracy: 80,  pp: 5,  description: "Dispara un torrente de agua a alta presión. Muy poderoso." },
    { id: 12, name: "Sofoco",          type: "Fire",      category: "Especial", power: 110, accuracy: 85,  pp: 5,  description: "El usuario escupe un flujo de fuego intenso." },
    { id: 13, name: "Terremoto",       type: "Ground",    category: "Físico",   power: 100, accuracy: 100, pp: 10, description: "Hace temblar el suelo con fuerza. Daña a todos en el campo." },
    { id: 14, name: "Surf",            type: "Water",     category: "Especial", power: 90,  accuracy: 100, pp: 15, description: "Ataca a todo en el campo con una gran ola." },
    { id: 15, name: "Psíquico",        type: "Psychic",   category: "Especial", power: 90,  accuracy: 100, pp: 10, description: "Un ataque télépático. Puede bajar el Sp. Def del objetivo." },
    { id: 16, name: "Bola Sombra",     type: "Ghost",     category: "Especial", power: 80,  accuracy: 100, pp: 15, description: "Lanza una sombra condensada. Puede bajar el Sp. Def." },
    { id: 17, name: "Dracoaliento",    type: "Dragon",    category: "Especial", power: 60,  accuracy: 100, pp: 20, description: "Echa un aliento al rival. Puede paralizarlo." },
    { id: 18, name: "Pulso Dragón",    type: "Dragon",    category: "Especial", power: 85,  accuracy: 100, pp: 10, description: "Dispara un pulso de energía dragón." },
    { id: 19, name: "Rayo Hielo",      type: "Ice",       category: "Especial", power: 90,  accuracy: 100, pp: 10, description: "Ataca con hielo. Puede congelar al objetivo." },
    { id: 20, name: "Aura Esfera",     type: "Fighting",  category: "Especial", power: 80,  accuracy: null, pp: 20, description: "Lanza una esfera de aura que nunca falla." },
  ];
  const seedMoves = db.transaction(() => {
    for (const m of moves) insertMove.run(m);
  });
  seedMoves();

  // Assign some moves to pokemon
  const insertPM = db.prepare(
    "INSERT OR IGNORE INTO pokemon_moves (pokemon_id, move_id, learn_method) VALUES (?, ?, ?)"
  );
  const pokemonMoves = [
    [1, 1, "Nivel 1"], [1, 2, "Nivel 1"], [1, 7, "Nivel 7"],
    [4, 1, "Nivel 1"], [4, 4, "Nivel 1"], [4, 5, "Nivel 7"],
    [7, 1, "Nivel 1"], [7, 6, "Nivel 1"], [7, 2, "Nivel 4"],
    [25, 8, "Nivel 1"], [25, 4, "Nivel 1"], [25, 9, "Nivel 26"],
    [94, 16, "Nivel 1"], [94, 3, "Nivel 1"],
    [130, 14, "MO"], [130, 1, "Nivel 1"],
    [149, 17, "Nivel 1"], [149, 18, "Nivel 1"], [149, 9, "Nivel 55"],
    [150, 15, "Nivel 1"], [150, 20, "Nivel 1"],
    [448, 20, "Nivel 1"], [448, 13, "MO"],
  ];
  const seedPM = db.transaction(() => {
    for (const [pid, mid, lm] of pokemonMoves) insertPM.run(pid, mid, lm);
  });
  seedPM();

  console.log(`✅ Database seeded: ${pokemons.length} Pokémon, ${evolutions.length} evoluciones, ${moves.length} movimientos.`);
}

seedDatabase();

// ─── Helpers ──────────────────────────────────────────────────────────────────
const VALID_TYPES = ["Normal","Fire","Water","Grass","Electric","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /  → info
app.get("/", (_, res) => {
  res.json({
    api: "Pokémon DB API",
    version: "1.0.0",
    endpoints: {
      "GET /pokemon":                     "Lista todos los Pokémon (paginado)",
      "GET /pokemon/:id":                 "Obtiene un Pokémon por ID",
      "GET /pokemon/name/:name":          "Busca por nombre",
      "GET /pokemon/type/:type":          "Filtra por tipo",
      "GET /pokemon/generation/:gen":     "Filtra por generación",
      "GET /pokemon/legendary":           "Solo legendarios",
      "GET /pokemon/:id/evolutions":      "Cadena evolutiva",
      "GET /pokemon/:id/moves":           "Movimientos del Pokémon",
      "GET /moves":                       "Lista todos los movimientos",
      "GET /moves/:id":                   "Obtiene un movimiento por ID",
      "GET /types":                       "Lista todos los tipos",
      "GET /stats/top":                   "Top 10 por estadística",
      "POST /pokemon":                    "Crea un nuevo Pokémon",
      "PUT /pokemon/:id":                 "Actualiza un Pokémon",
      "DELETE /pokemon/:id":              "Elimina un Pokémon",
    }
  });
});

// GET /types
app.get("/types", (_, res) => res.json({ types: VALID_TYPES }));

// GET /pokemon  → paginated list
app.get("/pokemon", (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  const search = req.query.search ? `%${req.query.search}%` : null;

  let where = "";
  let params = [];
  if (search) {
    where = "WHERE name LIKE ? OR name_es LIKE ?";
    params = [search, search];
  }

  const total = db.prepare(`SELECT COUNT(*) as n FROM pokemon ${where}`).get(...params).n;
  const rows  = db.prepare(`SELECT * FROM pokemon ${where} ORDER BY id LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.json({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    data: rows
  });
});

// GET /pokemon/legendary
app.get("/pokemon/legendary", (_, res) => {
  const rows = db.prepare("SELECT * FROM pokemon WHERE legendary = 1 ORDER BY id").all();
  res.json({ total: rows.length, data: rows });
});

// GET /pokemon/type/:type
app.get("/pokemon/type/:type", (req, res) => {
  const type = req.params.type;
  const rows = db.prepare(
    "SELECT * FROM pokemon WHERE LOWER(type1) = LOWER(?) OR LOWER(type2) = LOWER(?) ORDER BY id"
  ).all(type, type);
  if (!rows.length) return res.status(404).json({ error: `No se encontraron Pokémon de tipo '${type}'` });
  res.json({ type, total: rows.length, data: rows });
});

// GET /pokemon/generation/:gen
app.get("/pokemon/generation/:gen", (req, res) => {
  const gen = parseInt(req.params.gen);
  if (isNaN(gen) || gen < 1 || gen > 9)
    return res.status(400).json({ error: "Generación debe ser un número entre 1 y 9" });
  const rows = db.prepare("SELECT * FROM pokemon WHERE generation = ? ORDER BY id").all(gen);
  res.json({ generation: gen, total: rows.length, data: rows });
});

// GET /pokemon/name/:name
app.get("/pokemon/name/:name", (req, res) => {
  const row = db.prepare(
    "SELECT * FROM pokemon WHERE LOWER(name) = LOWER(?) OR LOWER(name_es) = LOWER(?)"
  ).get(req.params.name, req.params.name);
  if (!row) return res.status(404).json({ error: "Pokémon no encontrado" });
  res.json(row);
});

// GET /pokemon/:id
app.get("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const row = db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Pokémon no encontrado" });
  res.json(row);
});

// GET /pokemon/:id/evolutions
app.get("/pokemon/:id/evolutions", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const pokemon = db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id);
  if (!pokemon) return res.status(404).json({ error: "Pokémon no encontrado" });

  const evolvesFrom = db.prepare(`
    SELECT e.method, p.* FROM evolutions e
    JOIN pokemon p ON p.id = e.from_id
    WHERE e.to_id = ?
  `).all(id);

  const evolvesTo = db.prepare(`
    SELECT e.method, p.* FROM evolutions e
    JOIN pokemon p ON p.id = e.to_id
    WHERE e.from_id = ?
  `).all(id);

  res.json({ pokemon, evolvesFrom, evolvesTo });
});

// GET /pokemon/:id/moves
app.get("/pokemon/:id/moves", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const moves = db.prepare(`
    SELECT m.*, pm.learn_method FROM pokemon_moves pm
    JOIN moves m ON m.id = pm.move_id
    WHERE pm.pokemon_id = ?
    ORDER BY m.name
  `).all(id);
  res.json({ pokemon_id: id, total: moves.length, moves });
});

// GET /moves
app.get("/moves", (req, res) => {
  const type = req.query.type;
  let rows;
  if (type) {
    rows = db.prepare("SELECT * FROM moves WHERE LOWER(type) = LOWER(?) ORDER BY name").all(type);
  } else {
    rows = db.prepare("SELECT * FROM moves ORDER BY name").all();
  }
  res.json({ total: rows.length, data: rows });
});

// GET /moves/:id
app.get("/moves/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const row = db.prepare("SELECT * FROM moves WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "Movimiento no encontrado" });
  res.json(row);
});

// GET /stats/top?stat=attack&limit=10
app.get("/stats/top", (req, res) => {
  const validStats = ["hp","attack","defense","sp_attack","sp_defense","speed","total"];
  const stat  = validStats.includes(req.query.stat) ? req.query.stat : "total";
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const rows  = db.prepare(`SELECT * FROM pokemon ORDER BY ${stat} DESC LIMIT ?`).all(limit);
  res.json({ stat, data: rows });
});

// POST /pokemon
app.post("/pokemon", (req, res) => {
  const r = req.body;
  const required = ["id","name","type1","hp","attack","defense","sp_attack","sp_defense","speed","generation"];
  const missing  = required.filter(f => r[f] === undefined || r[f] === null || r[f] === "");
  if (missing.length) return res.status(400).json({ error: `Campos requeridos: ${missing.join(", ")}` });

  const total = (r.hp||0) + (r.attack||0) + (r.defense||0) + (r.sp_attack||0) + (r.sp_defense||0) + (r.speed||0);
  try {
    db.prepare(`
      INSERT INTO pokemon (id,name,name_es,type1,type2,hp,attack,defense,sp_attack,sp_defense,speed,total,generation,legendary,description)
      VALUES (@id,@name,@name_es,@type1,@type2,@hp,@attack,@defense,@sp_attack,@sp_defense,@speed,@total,@generation,@legendary,@description)
    `).run({ ...r, total, name_es: r.name_es || null, type2: r.type2 || null, legendary: r.legendary ? 1 : 0, description: r.description || null });
    res.status(201).json({ message: "Pokémon creado", id: r.id });
  } catch (e) {
    if (e.message.includes("UNIQUE")) return res.status(409).json({ error: "Ya existe un Pokémon con ese ID o nombre" });
    res.status(500).json({ error: e.message });
  }
});

// PUT /pokemon/:id
app.put("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const existing = db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Pokémon no encontrado" });

  const updated = { ...existing, ...req.body, id };
  updated.total = updated.hp + updated.attack + updated.defense + updated.sp_attack + updated.sp_defense + updated.speed;

  db.prepare(`
    UPDATE pokemon SET name=@name,name_es=@name_es,type1=@type1,type2=@type2,
    hp=@hp,attack=@attack,defense=@defense,sp_attack=@sp_attack,sp_defense=@sp_defense,
    speed=@speed,total=@total,generation=@generation,legendary=@legendary,description=@description
    WHERE id=@id
  `).run(updated);
  res.json({ message: "Pokémon actualizado", data: db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id) });
});

// DELETE /pokemon/:id
app.delete("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const info = db.prepare("DELETE FROM pokemon WHERE id = ?").run(id);
  if (!info.changes) return res.status(404).json({ error: "Pokémon no encontrado" });
  res.json({ message: `Pokémon #${id} eliminado` });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Pokémon API corriendo en puerto ${PORT}`);
  console.log(`📖 Documentación disponible en GET /`);
});

module.exports = app;
