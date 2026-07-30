let opencvReady = false;

function waitForOpenCV() {

    return new Promise(resolve => {

        const timer = setInterval(() => {

            if (window.cv && cv.Mat) {

                clearInterval(timer);

                opencvReady = true;

                console.log("OpenCV hazır.");

                resolve();

            }

        }, 100);

    });

}

function isOpenCVReady() {

    return opencvReady;

}
