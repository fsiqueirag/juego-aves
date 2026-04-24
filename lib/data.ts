import type {
  Bird,
  BirdWithLevel,
  DifficultyKey,
  GameMode,
  RankDef,
  UnlockRule,
} from "@/lib/types";

const facil: Bird[] = [
  { image: "/imagenes/facil/benteveo.jpg", name: "Benteveo", obra: "Pitangus sulphuratus", cat: ["Tiránidos", "Paseriformes"] },
  { image: "/imagenes/facil/hornero.jpg", name: "Hornero", obra: "Furnarius rufus", cat: ["Furnáridos", "Paseriformes"] },
  { image: "/imagenes/facil/zorzal.jpg", name: "Zorzal", obra: "Turdus amaurochalinus", cat: ["Tordos", "Paseriformes"] },
  { image: "/imagenes/facil/calandria.jpg", name: "Calandria", obra: "Mimus saturninus", cat: ["Mímidos", "Paseriformes"] },
  { image: "/imagenes/facil/gorrion.jpg", name: "Gorrión", obra: "Passer domesticus", cat: ["Gorriones", "Paseriformes"] },
  { image: "/imagenes/facil/paloma.jpg", name: "Paloma", obra: "Columba livia", cat: ["Palomas"] },
  { image: "/imagenes/facil/torcaza.jpg", name: "Torcaza", obra: "Zenaida auriculata", cat: ["Palomas"] },
  { image: "/imagenes/facil/picazuro.jpg", name: "Picazuro", obra: "Patagioenas picazuro", cat: ["Palomas"] },
  { image: "/imagenes/facil/cardenal.jpg", name: "Cardenal", obra: "Paroaria coronata", cat: ["Tangaras", "Paseriformes"] },
  { image: "/imagenes/facil/golondrina.jpg", name: "Golondrina", obra: "Progne tapera", cat: ["Golondrinas", "Paseriformes"] },
  { image: "/imagenes/facil/ratona.jpg", name: "Ratona", obra: "Troglodytes aedon", cat: ["Troglodítidos", "Paseriformes"] },
  { image: "/imagenes/facil/tordomusico.jpg", name: "Tordo músico", obra: "Agelaioides badius", cat: ["Ictéridos", "Paseriformes"] },
  { image: "/imagenes/facil/churrinche.jpg", name: "Churrinche", obra: "Pyrocephalus rubinus", cat: ["Tiránidos", "Paseriformes"] },
  { image: "/imagenes/facil/suiriri.jpg", name: "Suirirí real", obra: "Tyrannus melancholicus", cat: ["Tiránidos", "Paseriformes"] },
  { image: "/imagenes/facil/gaviota.jpg", name: "Gaviota", obra: "Larus dominicanus", cat: ["Gaviotas", "Playeras"] },
  { image: "/imagenes/facil/canario.jpg", name: "Canario", obra: "Serinus canaria", cat: ["Fringílidos", "Paseriformes"] },
];

const medio: Bird[] = [
  { image: "/imagenes/facil/chimango.jpg", name: "Chimango", obra: "Milvago chimango", cat: ["Rapaces", "Falcónidos"] },
  { image: "/imagenes/facil/caracho.jpg", name: "Carancho", obra: "Caracara plancus", cat: ["Rapaces", "Falcónidos"] },
  { image: "/imagenes/facil/cotorra.jpg", name: "Cotorra", obra: "Myiopsitta monachus", cat: ["Loros", "Psitácidos"] },
  { image: "/imagenes/facil/pirincho.jpg", name: "Pirincho", obra: "Guira guira", cat: ["Cucúlidos"] },
  { image: "/imagenes/facil/lechuzaviscachera.jpg", name: "Lechuza vizcachera", obra: "Athene cunicularia", cat: ["Rapaces", "Lechuzas", "Búhos"] },
  { image: "/imagenes/facil/garzablanca.jpg", name: "Garza blanca", obra: "Ardea alba", cat: ["Garzas", "Zancudas"] },
  { image: "/imagenes/facil/coscoroba.jpg", name: "Coscoroba", obra: "Coscoroba coscoroba", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/facil/gallareta.jpg", name: "Gallareta", obra: "Fulica armillata", cat: ["Gallaretas", "Acuáticas"] },
  { image: "/imagenes/facil/patopicazo.jpg", name: "Pato picazo", obra: "Netta peposaca", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/facil/patomaicero.jpg", name: "Pato maicero", obra: "Anas georgica", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/facil/patocapuchino.jpg", name: "Pato capuchino", obra: "Anas versicolor", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/facil/patobarcino.jpg", name: "Pato barcino", obra: "Anas flavirostris", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/facil/picabuey.jpg", name: "Pica buey", obra: "Molothrus bonariensis", cat: ["Ictéridos", "Paseriformes"] },
  { image: "/imagenes/facil/gavilanmixto.jpg", name: "Gavilán mixto", obra: "Parabuteo unicinctus", cat: ["Rapaces", "Accipítridos"] },
  { image: "/imagenes/facil/carpinteroreal.jpg", name: "Carpintero real común", obra: "Colaptes melanochloros", cat: ["Carpinteros", "Pícidos"] },
  { image: "/imagenes/facil/carpinterogigante.jpg", name: "Carpintero gigante", obra: "Campephilus robustus", cat: ["Carpinteros", "Pícidos"] },
  { image: "/imagenes/facil/chinchero.jpg", name: "Chinchero", obra: "Drymornis bridgesii", cat: ["Trepadoras", "Dendrocoláptidos"] },
  { image: "/imagenes/facil/diamantemandarin.jpg", name: "Diamante mandarín", obra: "Taeniopygia guttata", cat: ["Estrildidos", "Paseriformes"] },
];

const dificil: Bird[] = [
  { image: "/imagenes/siriripampa.jpg", name: "Sirirí pampa", obra: "Dendrocygna viduata", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/atajacaminoschico.jpg", name: "Atajacaminos chico", obra: "Setopagis parvula", cat: ["Chotacabras", "Caprimúlgidos"] },
  { image: "/imagenes/bailarinblanco.jpg", name: "Bailarín blanco", obra: "Manacus manacus", cat: ["Manaquines", "Paseriformes"] },
  { image: "/imagenes/bandurriaaustral.jpg", name: "Bandurria austral", obra: "Theristicus melanopis", cat: ["Zancudas", "Ibis"] },
  { image: "/imagenes/becasinacomun.jpg", name: "Becasina común", obra: "Gallinago gallinago", cat: ["Playeras", "Escolopácidos"] },
  { image: "/imagenes/bigua.jpg", name: "Biguá", obra: "Nannopterum brasilianus", cat: ["Acuáticas", "Cormoranes"] },
  { image: "/imagenes/caburechico.jpg", name: "Caburé chico", obra: "Glaucidium brasilianum", cat: ["Rapaces", "Lechuzas", "Búhos"] },
  { image: "/imagenes/celestino.jpg", name: "Celestino", obra: "Thraupis sayaca", cat: ["Tangaras", "Paseriformes"] },
  { image: "/imagenes/chaja.jpg", name: "Chajá", obra: "Chauna torquata", cat: ["Acuáticas", "Anátidos"] },
  { image: "/imagenes/chiflon.JPG", name: "Chiflón", obra: "Syrigma sibilatrix", cat: ["Garzas", "Zancudas"] },
  { image: "/imagenes/doraditopardo.jpg", name: "Doradito pardo", obra: "Pseudocolopteryx dinellianus", cat: ["Tiránidos", "Paseriformes"] },
  { image: "/imagenes/hococolorado.jpg", name: "Hocó colorado", obra: "Tigrisoma lineatum", cat: ["Garzas", "Zancudas", "Acuáticas"] },
  { image: "/imagenes/mosquitero.jpg", name: "Mosquitero", obra: "Phylloscopus collybita", cat: ["Sylviidos", "Paseriformes"] },
  { image: "/imagenes/nacurutu.jpg", name: "Ñacurutú", obra: "Bubo virginianus", cat: ["Rapaces", "Lechuzas", "Búhos"] },
  { image: "/imagenes/patofierro.jpg", name: "Pato fierro", obra: "Anas platalea", cat: ["Patos", "Acuáticas"] },
  { image: "/imagenes/pinguinorey.jpg", name: "Pingüino rey", obra: "Aptenodytes patagonicus", cat: ["Pingüinos", "Acuáticas"] },
  { image: "/imagenes/pitiayumi.jpg", name: "Pitiayumí", obra: "Setophaga pitiayumi", cat: ["Parúlidos", "Paseriformes"] },
  { image: "/imagenes/reinamoragrande.jpg", name: "Reina mora grande", obra: "Cyanocompsa brissonii", cat: ["Cardenálidos", "Paseriformes"] },
  { image: "/imagenes/sietevestidospampeano.jpg", name: "Siete vestidos pampeano", obra: "Poospiza nigrorufa", cat: ["Tangaras", "Paseriformes"] },
  { image: "/imagenes/tacuaritaazul.jpg", name: "Tacuarita azul", obra: "Polioptila dumicola", cat: ["Sylviidos", "Paseriformes"] },
  { image: "/imagenes/urutau.jpg", name: "Urutaú", obra: "Nyctibius griseus", cat: ["Chotacabras", "Nyctibiidos"] },
  { image: "/imagenes/jilguero.jpg", name: "Jilguero", obra: "Sicalis flaveola", cat: ["Fringílidos", "Paseriformes"] },
];

export const databases: Record<DifficultyKey, Bird[]> = {
  facil,
  medio,
  dificil,
  experto: [...facil, ...medio, ...dificil],
};

export const allBirds: BirdWithLevel[] = [
  ...facil.map((bird) => ({ ...bird, level: "facil" as const })),
  ...medio.map((bird) => ({ ...bird, level: "medio" as const })),
  ...dificil.map((bird) => ({ ...bird, level: "dificil" as const })),
];

export const ALL_CATS = [...new Set(allBirds.flatMap((bird) => bird.cat))].sort((a, b) =>
  a.localeCompare(b, "es"),
);

export const RANKS: RankDef[] = [
  { min: 0, label: "🥚 Amateur" },
  { min: 10, label: "🌱 Observador Inicial" },
  { min: 22, label: "🔭 Explorador" },
  { min: 35, label: "🦜 Aficionado" },
  { min: 48, label: "🌿 Naturalista" },
  { min: 60, label: "🦅 Avistador Experimentado" },
  { min: 72, label: "📚 Ornitólogo Aficionado" },
  { min: 82, label: "🏆 Profesional de Aves" },
  { min: 90, label: "🌟 Observador Veterano" },
  { min: 97, label: "🦉 Gran Experto en Aves" },
];

export const DEFAULT_UNLOCKED = new Set(["imagen_facil"]);

export const ALL_GAME_MODES: GameMode[] = [
  "imagen",
  "imagen-libre",
  "nombre",
  "nombre-sonido",
  "sonido",
  "sonido-libre",
  "aleatorio-opc",
  "aleatorio-libre",
];

export const ALL_DBS: DifficultyKey[] = ["facil", "medio", "dificil", "experto"];

export const TOTAL_STARS = ALL_GAME_MODES.length * ALL_DBS.length;

export const UNLOCK_RULES: UnlockRule[] = [
  { from: "imagen_facil", pct: 40, unlock: "nombre_facil", label: "Por Nombre — Imagen 🟢 Fácil" },
  { from: "imagen_facil", pct: 50, unlock: "imagen-libre_facil", label: "Por Imagen — Escribir 🟢 Fácil" },
  { from: "imagen_facil", pct: 60, unlock: "imagen_medio", label: "Por Imagen — Opciones 🔵 Medio" },
  { from: "imagen_facil", pct: 80, unlock: "sonido_facil", label: "Por Sonido — Opciones 🟢 Fácil" },
  { from: "imagen-libre_facil", pct: 50, unlock: "imagen-libre_medio", label: "Por Imagen — Escribir 🔵 Medio" },
  { from: "imagen-libre_medio", pct: 60, unlock: "imagen-libre_dificil", label: "Por Imagen — Escribir 🔴 Difícil" },
  { from: "imagen_medio", pct: 50, unlock: "nombre_medio", label: "Por Nombre — Imagen 🔵 Medio" },
  { from: "imagen_medio", pct: 60, unlock: "imagen_dificil", label: "Por Imagen — Opciones 🔴 Difícil" },
  { from: "imagen_dificil", pct: 70, unlock: "nombre_dificil", label: "Por Nombre — Imagen 🔴 Difícil" },
  { from: "nombre_facil", pct: 50, unlock: "nombre-sonido_facil", label: "Por Nombre — Sonido 🟢 Fácil" },
  { from: "nombre_medio", pct: 50, unlock: "nombre-sonido_medio", label: "Por Nombre — Sonido 🔵 Medio" },
  { from: "nombre_dificil", pct: 60, unlock: "nombre-sonido_dificil", label: "Por Nombre — Sonido 🔴 Difícil" },
  { from: "nombre-sonido_facil", pct: 60, unlock: "nombre-sonido_medio", label: "Por Nombre — Sonido 🔵 Medio" },
  { from: "nombre-sonido_medio", pct: 70, unlock: "nombre-sonido_dificil", label: "Por Nombre — Sonido 🔴 Difícil" },
  { from: "sonido_facil", pct: 50, unlock: "sonido-libre_facil", label: "Por Sonido — Escribir 🟢 Fácil" },
  { from: "sonido_facil", pct: 60, unlock: "sonido_medio", label: "Por Sonido — Opciones 🔵 Medio" },
  { from: "sonido_medio", pct: 60, unlock: "sonido-libre_medio", label: "Por Sonido — Escribir 🔵 Medio" },
  { from: "sonido_medio", pct: 70, unlock: "sonido_dificil", label: "Por Sonido — Opciones 🔴 Difícil" },
  { from: "sonido_dificil", pct: 70, unlock: "sonido-libre_dificil", label: "Por Sonido — Escribir 🔴 Difícil" },
  { from: "sonido-libre_facil", pct: 60, unlock: "sonido-libre_medio", label: "Por Sonido — Escribir 🔵 Medio" },
  { from: "sonido-libre_medio", pct: 70, unlock: "sonido-libre_dificil", label: "Por Sonido — Escribir 🔴 Difícil" },
  { from: "imagen_dificil", pct: 70, unlock: "imagen_experto", label: "Por Imagen — Opciones 🟣 Experto" },
  { from: "imagen-libre_dificil", pct: 70, unlock: "imagen-libre_experto", label: "Por Imagen — Escribir 🟣 Experto" },
  { from: "nombre_dificil", pct: 70, unlock: "nombre_experto", label: "Por Nombre — Imagen 🟣 Experto" },
  { from: "nombre-sonido_dificil", pct: 70, unlock: "nombre-sonido_experto", label: "Por Nombre — Sonido 🟣 Experto" },
  { from: "sonido_dificil", pct: 70, unlock: "sonido_experto", label: "Por Sonido — Opciones 🟣 Experto" },
  { from: "sonido-libre_dificil", pct: 70, unlock: "sonido-libre_experto", label: "Por Sonido — Escribir 🟣 Experto" },
  { from: "imagen_facil", pct: 40, unlock: "_aleopc_img_ok", label: "" },
  { from: "nombre_facil", pct: 40, unlock: "_aleopc_nom_ok", label: "" },
  { from: "sonido_facil", pct: 40, unlock: "_aleopc_snd_ok", label: "" },
  { from: "imagen_medio", pct: 40, unlock: "_aleopc_img_med_ok", label: "" },
  { from: "nombre_medio", pct: 40, unlock: "_aleopc_nom_med_ok", label: "" },
  { from: "sonido_medio", pct: 40, unlock: "_aleopc_snd_med_ok", label: "" },
  { from: "imagen_dificil", pct: 40, unlock: "_aleopc_img_dif_ok", label: "" },
  { from: "nombre_dificil", pct: 40, unlock: "_aleopc_nom_dif_ok", label: "" },
  { from: "sonido_dificil", pct: 40, unlock: "_aleopc_snd_dif_ok", label: "" },
  { from: "imagen_experto", pct: 40, unlock: "_aleopc_img_exp_ok", label: "" },
  { from: "nombre_experto", pct: 40, unlock: "_aleopc_nom_exp_ok", label: "" },
  { from: "sonido_experto", pct: 40, unlock: "_aleopc_snd_exp_ok", label: "" },
  { from: "imagen-libre_facil", pct: 40, unlock: "_alelib_img_ok", label: "" },
  { from: "nombre-sonido_facil", pct: 40, unlock: "_alelib_nom_ok", label: "" },
  { from: "sonido-libre_facil", pct: 40, unlock: "_alelib_snd_ok", label: "" },
  { from: "imagen-libre_medio", pct: 40, unlock: "_alelib_img_med_ok", label: "" },
  { from: "nombre-sonido_medio", pct: 40, unlock: "_alelib_nom_med_ok", label: "" },
  { from: "sonido-libre_medio", pct: 40, unlock: "_alelib_snd_med_ok", label: "" },
  { from: "imagen-libre_dificil", pct: 40, unlock: "_alelib_img_dif_ok", label: "" },
  { from: "nombre-sonido_dificil", pct: 40, unlock: "_alelib_nom_dif_ok", label: "" },
  { from: "sonido-libre_dificil", pct: 40, unlock: "_alelib_snd_dif_ok", label: "" },
  { from: "imagen-libre_experto", pct: 40, unlock: "_alelib_img_exp_ok", label: "" },
  { from: "nombre-sonido_experto", pct: 40, unlock: "_alelib_nom_exp_ok", label: "" },
  { from: "sonido-libre_experto", pct: 40, unlock: "_alelib_snd_exp_ok", label: "" },
];

export const UNLOCK_HINTS: Record<string, string> = {};

const dbNames: Record<DifficultyKey, string> = {
  facil: "🟢 Fácil",
  medio: "🔵 Medio",
  dificil: "🔴 Difícil",
  experto: "🟣 Experto",
};

const modeNames: Record<string, string> = {
  imagen: "Imagen-Opc",
  "imagen-libre": "Imagen-Esc",
  nombre: "Nombre-Img",
  "nombre-sonido": "Nombre-Snd",
  sonido: "Sonido-Opc",
  "sonido-libre": "Sonido-Esc",
  "aleatorio-opc": "Aleatorio-Opc",
  "aleatorio-libre": "Aleatorio-Libre",
};

for (const rule of UNLOCK_RULES) {
  if (rule.unlock.startsWith("_") || UNLOCK_HINTS[rule.unlock]) continue;
  const parts = rule.from.split("_");
  const db = parts.at(-1) as DifficultyKey;
  const mode = parts.slice(0, -1).join("_");
  UNLOCK_HINTS[rule.unlock] = `Obtener ${rule.pct}% en ${modeNames[mode] ?? mode} ${dbNames[db] ?? db}`;
}

export const ALE_OPC_HINT = "Necesitás 40% en Imagen-Opc, Nombre-Img y Sonido-Opc del mismo nivel";
export const ALE_LIB_HINT = "Necesitás 40% en Imagen-Esc, Nombre-Snd y Sonido-Esc del mismo nivel";
