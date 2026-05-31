// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
let handler = async (m, { conn }) => {
    const basi = [
        "Rosa Cipria", "Nude Caldo", "Bianco Lattiginoso", "Trasparente Crystal", "Beige Naturale", 
        "Pesca Camouflage", "Rosa Antico", "Bianco Latte", "Fucsia Shimmer", "Milky Rose", 
        "Pesca Neon", "Lilla Pastello", "Avorio Satin", "Champagne", "Ghiaccio",
        "Vaniglia", "Moka Soft", "Miele Dorato", "Rosa Quarzo", "Malva Polvere",
        "Crema Perlato", "Nude Freddo", "Marshmallow", "Guscio d'Uovo", "Trasparente Rosa"
    ];

    const forme = [
        "Mandorla Russa", "Square Definita", "Coffin Elegante", "Stiletto Audace", "Ballerina Chic", 
        "Ovale Classica", "Squoval Moderna", "Mandorla Gotica", "Pipe Line", "Edge", "Lipstick"
    ];

    const stili = [
        "Struttura a Muretto", "French Classico", "French a V (Chevron)", "Babyboomer Sfumato", "Deep French", 
        "Micro-French", "Effetto Marmo", "Effetto Cat-Eye", "French Obliquo", "Effetto Fumo",
        "Aura Nails", "Chrome Specchio", "Effetto Seta", "Glazed Donut", "3D Liquid Gold",
        "Water Droplets", "Glow in the Dark", "Mélange Minerale", "Tortoiseshell", "Velvet Effect",
        "French Inverso", "Geometrico Minimal", "Abstract Lines", "Effetto Coccodrillo", "Swirl Art"
    ];

    const colori = [
        "Nero Profondo", "Bianco Gesso", "Rosso Rubino", "Blu Elettrico", "Oro Specchio", 
        "Argento Glitter", "Verde Smeraldo", "Bordeaux", "Lilla", "Rosa Neon",
        "Blu Notte", "Verde Salvia", "Cioccolato", "Terracotta", "Giallo Pastello",
        "Fucsia Shocking", "Arancione Vitaminico", "Turchese", "Grigio Antracite", "Platino",
        "Malva Scuro", "Verde Oliva", "Blu Cobalto", "Prugna", "Rosso Ciliegia"
    ];

    const commenti = [
        "Un design sofisticato studiato per esaltare la naturale eleganza delle mani.",
        "L'equilibrio perfetto tra tecnica d'avanguardia e stile senza tempo.",
        "Una creazione esclusiva pensata per chi non vuole mai passare inosservata.",
        "Linee pulite e dettagli specchiati per un look minimalista ma di forte impatto.",
        "Una vera opera d'arte geometrica che trasforma la manicure in un gioiello.",
        "Audacia e modernità si fondono in una combinazione magnetica e luminosa.",
        "La scelta d'eccellenza per valorizzare ogni dettaglio con un tocco luxury.",
        "Un'armonia cromatica che esprime lusso discreto e massima cura del dettaglio.",
        "Design d'alta moda nato per ridefinire i canoni della manicure contemporanea.",
        "Raffinatezza audace pensata per vestire le mani con pura personalità.",
        "Un impatto visivo magnetico che unisce precisione millimetrica e stile d'élite.",
        "L'accessorio definitivo per completare un outfit d'alta classe.",
        "Sfumature ricercate e geometrie perfette per unghie che dettano tendenza.",
        "Un capolavoro minimal-chic che cattura la luce ad ogni singolo movimento."
    ];

    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    const basiShuffled = shuffle([...basi]);
    const formeShuffled = shuffle([...forme]);
    const stiliShuffled = shuffle([...stili]);
    const coloriShuffled = shuffle([...colori]);

    let database_500 = [];
    
    for (let b of basiShuffled) {
        for (let f of formeShuffled) {
            for (let s of stiliShuffled) {
                for (let c of coloriShuffled) {
                    if (database_500.length >= 500) break;
                    
                    let com = commenti[Math.floor(Math.random() * commenti.length)];
                    let frase = `╭────────────────────╮\n` +
                                `   ✦  𝖭𝖠𝖨𝖫  𝖠𝖱𝖳  𝖢𝖮𝖴𝖳𝖴𝖱𝖤  ✦\n` +
                                `╰────────────────────╯\n\n` +
                                `  ◈  *BASE:* ${b.toUpperCase()}\n` +
                                `  ◈  *FORMA:* ${f.toUpperCase()}\n` +
                                `  ◈  *STILE:* ${s.toUpperCase()}\n` +
                                `  ◈  *COLORE:* ${c.toUpperCase()}\n` +
                                `  ◈  *FINISH:* EXTRA GLOSS ULTRA GLASS\n\n` +
                                `──────────────────────\n` +
                                `  *Concept:* _${com}_`;
                    
                    database_500.push(frase);
                }
                if (database_500.length >= 500) break;
            }
            if (database_500.length >= 500) break;
        }
        if (database_500.length >= 500) break;
    }

    const scelta = database_500[Math.floor(Math.random() * database_500.length)];

    await conn.reply(m.chat, scelta, m);
};

handler.help = ['unghie'];
handler.tags = ['giochi'];
handler.command = /^(unghie)$/i;

export default handler;
