/*=========================================
 templateBuilder.js
 Version 1.0
=========================================*/

//----------------------------------
// Mouse Points
//----------------------------------

let clickPoints = [];

let sourceImage = null;

window.onload = async function ()
{
    await waitForOpenCV();

    console.log("OpenCV hazır.");
    console.log("Template Builder hazır.");

    const imageFile = document.getElementById("imageFile");

    imageFile.addEventListener("change", loadImage);
};


function loadImage(event)
{
    const file = event.target.files[0];

    if (!file)
        return;

    const img = new Image();

    img.onload = function ()
    {
        //--------------------------------------------------
        // Source Canvas
        //--------------------------------------------------

        const canvas = document.getElementById("sourceCanvas");
        const ctx = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

sourceImage = img;

// Eski noktaları temizle
clickPoints = [];

// Mouse event
canvas.onclick = onCanvasClick;
     
        console.log(
            "Image loaded:",
            img.width,
            "x",
            img.height
        );

 console.log(
    "Lütfen kartın 4 köşesini seçiniz."
);    
 
    };

    img.src = URL.createObjectURL(file);
}

function onCanvasClick(event)
{
    const canvas = event.target;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    clickPoints.push({
        x: x,
        y: y
    });

    console.log(
        "Point",
        clickPoints.length,
        x,
        y
    );

    drawPoints();

    //----------------------------------
    // 4 köşe tamamlandı
    //----------------------------------

    if (clickPoints.length == 4)
    {
        console.log("4 corner selected.");

 const quad = makeQuad(clickPoints);
console.log("Quad OK");

const src = cv.imread("sourceCanvas");
console.log("imread OK");

const warped = warpCardManual(
    src,
    clickPoints
);
console.log("warp OK");

preprocessCorner(warped);
console.log("preprocess OK");

        quad.delete();
        warped.delete();
        src.delete();
    }
}

function drawPoints()
{
    const canvas = document.getElementById("sourceCanvas");
    const ctx = canvas.getContext("2d");

    // Resmi tekrar çiz
    ctx.drawImage(
        sourceImage,
        0,
        0
    );

    ctx.fillStyle = "red";

    for (const p of clickPoints)
    {
        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}
//----------------------------------
// Mouse points -> Quad
//----------------------------------

function makeQuad(points)
{
    const quad = new cv.Mat(
        4,
        1,
        cv.CV_32SC2
    );

    const p = quad.data32S;

    for (let i = 0; i < 4; i++)
    {
        p[i * 2]     = Math.round(points[i].x);
        p[i * 2 + 1] = Math.round(points[i].y);
    }

    return quad;
}

//----------------------------------
// Manuel Warp (Template Builder)
//----------------------------------

function warpCardManual(src, points)
{
    const W = 200;
    const H = 300;

    const srcPts = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [
            points[0].x, points[0].y,   // TL
            points[1].x, points[1].y,   // TR
            points[2].x, points[2].y,   // BR
            points[3].x, points[3].y    // BL
        ]
    );

    const dstPts = cv.matFromArray(
        4,
        1,
        cv.CV_32FC2,
        [
            0,0,
            W-1,0,
            W-1,H-1,
            0,H-1
        ]
    );

    const M = cv.getPerspectiveTransform(
        srcPts,
        dstPts
    );

    const warped = new cv.Mat();

    cv.warpPerspective(
        src,
        warped,
        M,
        new cv.Size(W,H)
    );

    cv.imshow("warpCanvas", warped);

    srcPts.delete();
    dstPts.delete();
    M.delete();

    return warped;
}


function saveMat(mat,fileName)
{
    const canvas=document.createElement("canvas");

    cv.imshow(canvas,mat);

    const link=document.createElement("a");

    link.download=fileName;

    link.href=canvas.toDataURL("image/png");

    link.click();
}

function saveCanvas(canvasId, fileName)
{
    const canvas = document.getElementById(canvasId);

    const link = document.createElement("a");

    link.download = fileName;

    link.href = canvas.toDataURL("image/png");

    link.click();
}

function saveRank()
{
    const name =
        document.getElementById("rankName").value;

const src=cv.imread("rankCanvas");

const crop=cropBinary(src);

cv.imshow("rankCanvas",crop);

saveMat(crop,name+".png");

src.delete();
crop.delete();
}


function saveSuit()
{
    const name =
        document.getElementById("suitName").value;

const src=cv.imread("suitCanvas");

const crop=cropBinary(src);

cv.imshow("suitCanvas",crop);

saveMat(crop,name+".png");

src.delete();
crop.delete();
}

//----------------------------------
// Beyaz kenarları otomatik kırp
//----------------------------------

function cropBinary(src)
{
    let minX = src.cols;
    let minY = src.rows;

    let maxX = 0;
    let maxY = 0;

    for(let y=0;y<src.rows;y++)
    {
        for(let x=0;x<src.cols;x++)
        {
            const value = src.ucharPtr(y,x)[0];

            // Siyah piksel
            if(value==0)
            {
                if(x<minX) minX=x;
                if(y<minY) minY=y;

                if(x>maxX) maxX=x;
                if(y>maxY) maxY=y;
            }
        }
    }

    if(maxX<=minX || maxY<=minY)
        return src.clone();

    const rect=new cv.Rect(
        minX,
        minY,
        maxX-minX+1,
        maxY-minY+1
    );

    return src.roi(rect).clone();
}
