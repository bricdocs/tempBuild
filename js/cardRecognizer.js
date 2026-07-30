/*=========================================
cardRecognizer.js
Version 1.0
=========================================*/

function preprocessCorner(card)
{
// Kart boyutuna göre ROI
const x = Math.round(card.cols * 0.02);
const y = Math.round(card.rows * 0.02);

const w = Math.round(card.cols * 0.24);
const h = Math.round(card.rows * 0.24);

    // 1- Önce ROI kutusunu çiz
    cv.rectangle(
        card,
        new cv.Point(x, y),
        new cv.Point(x + w, y + h),
        new cv.Scalar(0, 255, 0, 255),
        2
    );

    // 2- Sonra warpCanvas'ı güncelle
    cv.imshow("warpCanvas", card);

    // 3- Daha sonra ROI'yi al
    const roi = card.roi(
        new cv.Rect(x, y, w, h)
    );

    // 4- Gray
    const gray = new cv.Mat();
    cv.cvtColor(roi, gray, cv.COLOR_RGBA2GRAY);

    // 5- Binary
const binary = new cv.Mat();

cv.threshold(
    gray,
    binary,
    0,
    255,
    cv.THRESH_BINARY + cv.THRESH_OTSU
);

const kernel = cv.Mat.ones(
    3,
    3,
    cv.CV_8U
);

cv.morphologyEx(
    binary,
    binary,
    cv.MORPH_CLOSE,
    kernel
);

kernel.delete();

    // 6- Sonucu göster
    cv.imshow("binaryCanvas", binary);

//----------------------------------
// Rank ROI
//----------------------------------

const rankRect = new cv.Rect(
    0,
    0,
    binary.cols,
    Math.floor(binary.rows * 0.45)
);

const rank = binary.roi(rankRect);

cv.imshow("rankCanvas", rank);

//----------------------------------
// Suit ROI
//----------------------------------

const suitRect = new cv.Rect(
    0,
    Math.floor(binary.rows * 0.45),
    binary.cols,
    binary.rows - Math.floor(binary.rows * 0.45)
);

const suit = binary.roi(suitRect);

cv.imshow("suitCanvas", suit);

// Artık binary silinmeyecek.
// rank ve suit de silinmeyecek.
// Bunları çağıran fonksiyon kullanacak.

roi.delete();
gray.delete();

return {
    binary,
    rank,
    suit
};
    
}
