// Character data with balanced stats for all characters
const characters = {
    // Pyros (Fire) - High attack, low defense
    "diablos": {
        name: "Diablos",
        element: "pyros",
        hp: 120,
        attack: 85,
        defense: 60,
        movement: 3,
        image: "art/pyros/diablos.png"
    },
    "apollos": {
        name: "Apollos",
        element: "pyros",
        hp: 80,
        attack: 95,
        defense: 40,
        movement: 4,
        image: "art/pyros/apollos.png"
    },
    "drumos": {
        name: "Drumos",
        element: "pyros",
        hp: 100,
        attack: 82,
        defense: 62,
        movement: 2,
        image: "art/pyros/drumos.png"
    },
    "griffos": {
        name: "Griffos",
        element: "pyros",
        hp: 85,
        attack: 85,
        defense: 55,
        movement: 4,
        image: "art/pyros/griffos.png"
    },
    "farbos": {
        name: "Farbos",
        element: "pyros",
        hp: 95,
        attack: 88,
        defense: 58,
        movement: 3,
        image: "art/pyros/farbos.png"
    },
    "rubanos": {
        name: "Rubanos",
        element: "pyros",
        hp: 90,
        attack: 90,
        defense: 50,
        movement: 3,
        image: "art/pyros/rubanos.png"
    },
    "rexos": {
        name: "Rexos",
        element: "pyros",
        hp: 110,
        attack: 80,
        defense: 65,
        movement: 2,
        image: "art/pyros/rexos.png"
    },
    "mantos": {
        name: "Mantos",
        element: "pyros",
        hp: 70,
        attack: 75,
        defense: 45,
        movement: 4,
        image: "art/pyros/mantos.png"
    },
    "cerberos": {
        name: "Cerberos",
        element: "pyros",
        hp: 115,
        attack: 78,
        defense: 68,
        movement: 3,
        image: "art/pyros/cerberos.png"
    },

    // Aquos (Water) - Balanced stats, healing abilities
    "surfos": {
        name: "Surfos",
        element: "aquos",
        hp: 85,
        attack: 75,
        defense: 70,
        movement: 4,
        image: "art/aquos/surfos.png"
    },
    "strikos": {
        name: "Strikos",
        element: "aquos",
        hp: 80,
        attack: 80,
        defense: 65,
        movement: 3,
        image: "art/aquos/strikos.png"
    },
    "rayos": {
        name: "Rayos",
        element: "aquos",
        hp: 75,
        attack: 85,
        defense: 60,
        movement: 4,
        image: "art/aquos/stingos.png"
    },
    "crustos": {
        name: "Crustos",
        element: "aquos",
        hp: 100,
        attack: 75,
        defense: 85,
        movement: 2,
        image: "art/aquos/crustos.png"
    },
    "atlantos": {
        name: "Atlantos",
        element: "aquos",
        hp: 90,
        attack: 80,
        defense: 75,
        movement: 3,
        image: "art/aquos/atlantos.png"
    },
    "sharkos": {
        name: "Sharkos",
        element: "aquos",
        hp: 95,
        attack: 90,
        defense: 55,
        movement: 3,
        image: "art/aquos/sharkos.png"
    },
    "ribbitos": {
        name: "Ribbitos",
        element: "aquos",
        hp: 70,
        attack: 70,
        defense: 75,
        movement: 4,
        image: "art/aquos/ribbitos.png"
    },
    "mermos": {
        name: "Mermos",
        element: "aquos",
        hp: 80,
        attack: 65,
        defense: 80,
        movement: 3,
        image: "art/aquos/mermos.png"
    },
    "juggeros": {
        name: "Juggeros",
        element: "aquos",
        hp: 110,
        attack: 85,
        defense: 70,
        movement: 2,
        image: "art/aquos/juggeros.png"
    },
    "hairos": {
        name: "Hairos",
        element: "aquos",
        hp: 75,
        attack: 75,
        defense: 70,
        movement: 4,
        image: "art/aquos/hairos.png"
    },
    "froschos": {
        name: "Froschos",
        element: "aquos",
        hp: 85,
        attack: 70,
        defense: 75,
        movement: 3,
        image: "art/aquos/froschos.png"
    },
    "eelos": {
        name: "Eelos",
        element: "aquos",
        hp: 65,
        attack: 80,
        defense: 60,
        movement: 5,
        image: "art/aquos/eelos.png"
    },

    // Ventos (Wind) - High mobility, evasion
    "vultos": {
        name: "Vultos",
        element: "ventos",
        hp: 70,
        attack: 80,
        defense: 50,
        movement: 5,
        image: "art/ventos/vultos.png"
    },
    "tribos": {
        name: "Tribos",
        element: "ventos",
        hp: 80,
        attack: 75,
        defense: 55,
        movement: 4,
        image: "art/ventos/tribos.png"
    },
    "stingos": {
        name: "Stingos",
        element: "ventos",
        hp: 75,
        attack: 85,
        defense: 50,
        movement: 4,
        image: "art/ventos/stingos.png"
    },
    "quackos": {
        name: "Quackos",
        element: "ventos",
        hp: 85,
        attack: 70,
        defense: 60,
        movement: 4,
        image: "art/ventos/quackos.png"
    },
    "ninjos": {
        name: "Ninjos",
        element: "ventos",
        hp: 65,
        attack: 90,
        defense: 45,
        movement: 5,
        image: "art/ventos/ninjos.png"
    },
    "monaros": {
        name: "Monaros",
        element: "ventos",
        hp: 80,
        attack: 75,
        defense: 55,
        movement: 4,
        image: "art/ventos/monaros.png"
    },
    "harpos": {
        name: "Harpos",
        element: "ventos",
        hp: 70,
        attack: 65,
        defense: 70,
        movement: 4,
        image: "art/ventos/harpos.png"
    },
    "condos": {
        name: "Condos",
        element: "ventos",
        hp: 75,
        attack: 80,
        defense: 50,
        movement: 5,
        image: "art/ventos/condos.png"
    },
    "altairos": {
        name: "Altairos",
        element: "ventos",
        hp: 65,
        attack: 85,
        defense: 45,
        movement: 5,
        image: "art/ventos/altairos.png"
    },

    // Terros (Earth) - High defense, area control
    "cyclos": {
        name: "Cyclos",
        element: "terros",
        hp: 108,
        attack: 76,
        defense: 84,
        movement: 3,
        image: "art/terros/cyclos.png"
    },
    "savatos": {
        name: "Savatos",
        element: "terros",
        hp: 120,
        attack: 65,
        defense: 95,
        movement: 2,
        image: "art/terros/savatos.png"
    },
    "tuskor": {
        name: "Tuskor",
        element: "terros",
        hp: 130,
        attack: 70,
        defense: 90,
        movement: 2,
        image: "art/terros/tuskor.png"
    },
    "sphinos": {
        name: "Sphinos",
        element: "terros",
        hp: 110,
        attack: 80,
        defense: 85,
        movement: 3,
        image: "art/terros/sphinos.png"
    },
    "rattlos": {
        name: "Rattlos",
        element: "terros",
        hp: 100,
        attack: 75,
        defense: 80,
        movement: 3,
        image: "art/terros/rattlos.png"
    },
    "Wormos": {
        name: "Wormos",
        element: "terros",
        hp: 115,
        attack: 70,
        defense: 88,
        movement: 2,
        image: "art/terros/quakos.png"
    },
    "gladios": {
        name: "Gladios",
        element: "terros",
        hp: 105,
        attack: 78,
        defense: 82,
        movement: 3,
        image: "art/terros/gladios.png"
    },
    "dryos": {
        name: "Dryos",
        element: "terros",
        hp: 125,
        attack: 68,
        defense: 92,
        movement: 2,
        image: "art/terros/dryos.png"
    },

    // Haos (Light) - Support and purification
    "angelos": {
        name: "Angelos",
        element: "haos",
        hp: 92,
        attack: 68,
        defense: 85,
        movement: 3,
        image: "art/haos/angelos.png"
    },
    "tentos": {
        name: "Tentos",
        element: "haos",
        hp: 95,
        attack: 75,
        defense: 80,
        movement: 3,
        image: "art/haos/tentos.png"
    },
    "aranos": {
        name: "Aranos",
        element: "haos",
        hp: 82,
        attack: 70,
        defense: 78,
        movement: 3,
        image: "art/haos/aranos.png"
    },
    "tigros": {
        name: "Tigros",
        element: "haos",
        hp: 80,
        attack: 60,
        defense: 75,
        movement: 3,
        image: "art/haos/tigros.png"
    },
    "samuros": {
        name: "Samuros",
        element: "haos",
        hp: 90,
        attack: 70,
        defense: 85,
        movement: 3,
        image: "art/haos/samuros.png"
    },
    "pegasos": {
        name: "Pegasos",
        element: "haos",
        hp: 85,
        attack: 65,
        defense: 80,
        movement: 4,
        image: "art/haos/pegasos.png"
    },
    "jellos": {
        name: "Jellos",
        element: "haos",
        hp: 100,
        attack: 72,
        defense: 82,
        movement: 3,
        image: "art/haos/jellos.png"
    },
    "hammeros": {
        name: "Hammeros",
        element: "haos",
        hp: 88,
        attack: 68,
        defense: 78,
        movement: 3,
        image: "art/haos/hammeros.png"
    },
    "clownos": {
        name: "Clownos",
        element: "haos",
        hp: 75,
        attack: 65,
        defense: 70,
        movement: 4,
        image: "art/haos/clownos.png"
    },

    // Darkos (Dark) - High damage, status effects
    "reapos": {
        name: "Reapos",
        element: "darkos",
        hp: 80,
        attack: 88,
        defense: 55,
        movement: 3,
        image: "art/darkos/reapos.png"
    },
    "hadros": {
        name: "Hadros",
        element: "darkos",
        hp: 65,
        attack: 92,
        defense: 40,
        movement: 5,
        image: "art/darkos/hadros.png"
    },
    "spidos": {
        name: "Spidos",
        element: "darkos",
        hp: 75,
        attack: 90,
        defense: 50,
        movement: 3,
        image: "art/darkos/spidos.png"
    },
    "gargos": {
        name: "Gargos",
        element: "darkos",
        hp: 72,
        attack: 87,
        defense: 48,
        movement: 4,
        image: "art/darkos/gargos.png"
    },
    "exedros": {
        name: "Exedros",
        element: "darkos",
        hp: 68,
        attack: 93,
        defense: 42,
        movement: 4,
        image: "art/darkos/exedros.png"
    },
    "squidos": {
        name: "Squidos",
        element: "darkos",
        hp: 70,
        attack: 95,
        defense: 45,
        movement: 4,
        image: "art/darkos/squidos.png"
    },
    "emperos": {
        name: "Emperos",
        element: "darkos",
        hp: 85,
        attack: 85,
        defense: 60,
        movement: 3,
        image: "art/darkos/emperos.png"
    },
    "centos": {
        name: "Centos",
        element: "darkos",
        hp: 78,
        attack: 89,
        defense: 52,
        movement: 4,
        image: "art/darkos/centos.png"
    }
};

// Elemental relationships for combat bonuses
const elementalAdvantages = {
    pyros: "ventos",
    ventos: "aquos", 
    aquos: "pyros",
    terros: "haos",
    haos: "darkos",
    darkos: "terros"
};

// Helper function to get character by ID
function getCharacter(id) {
    return characters[id];
}

// Helper function to get all characters
function getAllCharacters() {
    return Object.keys(characters).map(id => ({
        id,
        ...characters[id]
    }));
}

// Helper function to get characters by element
function getCharactersByElement(element) {
    return Object.keys(characters)
        .filter(id => characters[id].element === element)
        .map(id => ({
            id,
            ...characters[id]
        }));
}

window.getCharacter = getCharacter;
window.getCharactersByElement = getCharactersByElement; 