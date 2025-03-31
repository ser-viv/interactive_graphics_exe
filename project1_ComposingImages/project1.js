// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite(bgImg, fgImg, fgOpac, fgPos) {
    const bW = bgImg.width;
    const bH = bgImg.height;
    const fW = fgImg.width;
    const fH = fgImg.height;

    let dx = fgPos.x;
    let dy = fgPos.y;

    for (let y = 0; y < fH; y++) {
        for (let x = 0; x < fW; x++) {
            let i = (y * fW + x) * 4; // Indice nel fgImg
            let j = ((y + dy) * bW + (x + dx)) * 4; // Indice nel bgImg

            // Controllo per evitare accessi fuori dai limiti del background
            if ((x + dx) >= 0 && (x + dx) < bW && (y + dy) >= 0 && (y + dy) < bH) {
                // Colori del background
                let bgr = bgImg.data[j];
                let bgg = bgImg.data[j + 1];
                let bgb = bgImg.data[j + 2];
                let bga = bgImg.data[j + 3] / 255; // Normalizzato [0,1]

                // Colori del foreground
                let fgr = fgImg.data[i];
                let fgg = fgImg.data[i + 1];
                let fgb = fgImg.data[i + 2];
                let fga = (fgImg.data[i + 3] * fgOpac) / 255; // Normalizzato [0,1]

                // Alpha risultante
                let alpha = fga + bga * (1 - fga);

                if (alpha > 0) {
                    // Fusione dei colori con premoltiplicazione alpha
                    bgImg.data[j] = (fgr * fga + bgr * bga * (1 - fga)) / alpha;
                    bgImg.data[j + 1] = (fgg * fga + bgg * bga * (1 - fga)) / alpha;
                    bgImg.data[j + 2] = (fgb * fga + bgb * bga * (1 - fga)) / alpha;
                    bgImg.data[j + 3] = alpha * 255; // Ripristino range [0,255]
                }
            }
        }
    }
}

