/**
 * Marcas y modelos habituales en Argentina, actuales y de los últimos años (lo que todavía circula y
 * necesita cristales). El seed los agrega sin tocar lo que ya exista; el resto se carga desde Administración.
 */
export const VEHICULOS: Record<string, string[]> = {
  Audi: ["A1", "A3", "A4", "A5", "Q2", "Q3", "Q5", "Q7"],
  BAIC: ["X25", "X35", "X55"],
  BMW: ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5"],
  BYD: ["Dolphin", "Dolphin Mini", "Seal", "Song Pro", "Yuan Pro"],
  Chery: ["Arrizo 5", "Fulwin", "QQ", "Tiggo 2", "Tiggo 3", "Tiggo 4", "Tiggo 5", "Tiggo 7", "Tiggo 8"],
  Chevrolet: [
    "Agile", "Astra", "Aveo", "Blazer", "Captiva", "Celta", "Classic", "Cobalt", "Corsa", "Cruze", "Equinox",
    "Joy", "Meriva", "Montana", "Onix", "Onix Plus", "Prisma", "S10", "Silverado", "Sonic", "Spin", "Tracker",
    "Trailblazer", "Vectra", "Zafira",
  ],
  Citroën: [
    "Basalt", "Berlingo", "C-Elysée", "C3", "C3 Aircross", "C3 Picasso", "C4", "C4 Cactus", "C4 Lounge",
    "C5 Aircross", "Jumper", "Saxo", "Xsara", "Xsara Picasso",
  ],
  Dodge: ["Journey"],
  DS: ["DS3", "DS7"],
  Fiat: [
    "500", "600", "Argo", "Cronos", "Ducato", "Duna", "Fastback", "Fiorino", "Grand Siena", "Idea", "Linea",
    "Mobi", "Palio", "Palio Weekend", "Pulse", "Punto", "Qubo", "Siena", "Stilo", "Strada", "Titano", "Toro",
    "Uno", "Uno Way",
  ],
  Ford: [
    "Bronco Sport", "Courier", "EcoSport", "Escort", "Explorer", "F-100", "F-150", "Falcon", "Fiesta",
    "Fiesta Kinetic", "Focus", "Ka", "Ka+", "Kuga", "Maverick", "Mondeo", "Mustang", "Ranger", "Sierra",
    "Territory", "Transit",
  ],
  Haval: ["H6", "Jolion"],
  Honda: ["Accord", "City", "Civic", "CR-V", "Fit", "HR-V", "Pilot", "WR-V", "ZR-V"],
  Hyundai: ["Accent", "Creta", "Elantra", "Grand i10", "H1", "HB20", "i10", "i30", "Kona", "Santa Fe", "Tucson"],
  Iveco: ["Daily"],
  JAC: ["S2", "S3", "T6", "T8"],
  Jeep: ["Cherokee", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wrangler"],
  Kia: ["Carnival", "Cerato", "Picanto", "Rio", "Seltos", "Sorento", "Soul", "Sportage"],
  "Mercedes-Benz": ["Clase A", "Clase C", "Clase E", "Clase X", "GLA", "GLC", "Sprinter", "Vito"],
  Mitsubishi: ["ASX", "Eclipse Cross", "L200", "Lancer", "Montero", "Outlander"],
  Nissan: ["Frontier", "Kicks", "March", "Note", "Pathfinder", "Sentra", "Tiida", "Versa", "X-Trail"],
  Peugeot: [
    "2008", "206", "207", "207 Compact", "208", "3008", "301", "306", "307", "308", "405", "408", "5008",
    "504", "505", "Boxer", "Expert", "Landtrek", "Partner",
  ],
  RAM: ["1500", "2500", "Dakota", "Rampage"],
  // Los clásicos van solo con el número: se muestran como "Renault 12".
  Renault: [
    "9", "12", "19", "Alaskan", "Captur", "Clio", "Clio Mío", "Duster", "Duster Oroch", "Fluence", "Kangoo",
    "Kardian", "Koleos", "Kwid", "Logan", "Master", "Mégane", "Sandero", "Sandero Stepway", "Scénic", "Symbol",
    "Trafic",
  ],
  Subaru: ["Forester", "Impreza", "Outback", "XV"],
  Suzuki: ["Fun", "Grand Vitara", "Jimny", "S-Cross", "Swift", "Vitara"],
  Toyota: [
    "Camry", "C-HR", "Corolla", "Corolla Cross", "Etios", "Hiace", "Hilux", "Land Cruiser", "Prius", "RAV4",
    "SW4", "Yaris",
  ],
  Volkswagen: [
    "Amarok", "Bora", "CrossFox", "Fox", "Gol", "Gol Trend", "Golf", "Nivus", "Passat", "Polo", "Polo Classic",
    "Quantum", "Saveiro", "Senda", "Sharan", "Suran", "T-Cross", "Taos", "Tiguan", "Tiguan Allspace",
    "Transporter", "Up!", "Vento", "Virtus", "Voyage",
  ],
  Volvo: ["XC40", "XC60", "XC90"],
};
