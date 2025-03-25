// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    const bW = bgImg.width;
const bH = bgImg.height;
const fW = fgImg.width;
const fH = fgImg.height;

let dx = fgPos.x;
let dy = fgPos.y;

for (let y = 0; y < fH; y++) {  
    for (let x = 0; x < fW; x++) {  
        let i = (y * fW + x) * 4;  // Indice nel fgImg
        let j = ((y + dy) * bW + (x + dx)) * 4;  // Indice nel bgImg

        // Controllo per evitare accessi fuori dai limiti del background
        if ((x + dx) >= 0 && (x + dx) < bW && (y + dy) >= 0 && (y + dy) < bH) {
            // Colori del background
            let bgr = bgImg.data[j];   // Rosso
            let bgg = bgImg.data[j + 1]; // Verde
            let bgb = bgImg.data[j + 2]; // Blu
            let bga = bgImg.data[j + 3]; // Alpha background

            // Colori del foreground
            let fgr = fgImg.data[i];   // Rosso
            let fgg = fgImg.data[i + 1]; // Verde
            let fgb = fgImg.data[i + 2]; // Blu
            let fga = fgImg.data[i + 3] * fgOpac; // Alpha foreground applicando fgOpac

            // Alpha risultante normalizzato
            let alpha = (bga * (1 - fga / 255)) + fga;
            let invAlpha = 1 - (fga / 255);

            // Fusione dei colori
            bgImg.data[j] = (fgr * (fga / 255)) + (bgr * invAlpha); // Rosso
            bgImg.data[j + 1] = (fgg * (fga / 255)) + (bgg * invAlpha); // Verde
            bgImg.data[j + 2] = (fgb * (fga / 255)) + (bgb * invAlpha); // Blu
            bgImg.data[j + 3] = alpha; // Nuovo alpha
        }
    }
}

erc
}
