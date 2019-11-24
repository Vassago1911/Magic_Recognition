const init = async imageUrl => {

const targetCanvas = document.getElementById("targetCanvas");


const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = error => reject(error);
  image.src = src;
});


const MAX_IMAGE_WIDTH = 600;
const MAX_IMAGE_HEIGHT = 600;

const loadSourceImage = async uri => {
  const img = await loadImage(uri);
  const src = cv.imread(img);

  let w = src.size().width;
  let h = src.size().height;
  if (w / h > 1) {
    h = MAX_IMAGE_WIDTH * h / w;
    w = MAX_IMAGE_WIDTH;
  } else {
    w = MAX_IMAGE_HEIGHT * w / h;
    h = MAX_IMAGE_HEIGHT;
  }

  const dst = new cv.Mat();
  cv.resize(src, dst, new cv.Size(w, h), 0, 0, cv.INTER_AREA);
  src.delete();
  return dst;
};

const sourceImage = await loadSourceImage(imageUrl);

const convertToGrayscale = src => {
  const dst = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  return dst;
};

const grayScaleImage = convertToGrayscale(sourceImage);


const convertToBinaryImage = src => {
  const dst = new cv.Mat();
  cv.threshold(src, dst, 64, 255, cv.THRESH_BINARY_INV);
  return dst;
};


const binaryImage = convertToBinaryImage(grayScaleImage);
grayScaleImage.delete();


const convertToContours = src => {
  const dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  const contourAreas = [];
  for (let i = 0; i < contours.size(); i++) {
    contourAreas.push({ index: i, area: cv.contourArea(contours.get(i), false) });
  }
  contourAreas.sort((a, b) => b.area - a.area);
  const largestContour = contourAreas[0].index;

  const rnd = max => Math.round(Math.random() * max);
  const rndColor = max => new cv.Scalar(rnd(max), rnd(max), rnd(max));
  const green = new cv.Scalar(0, 255, 0);

  const polys = new cv.MatVector();
  for (let i = 0; i < contourAreas.length; i++) {
    let tmp = new cv.Mat();
    let cnt = contours.get(contourAreas[i].index);
    cv.approxPolyDP(cnt, tmp, 32, true);
    polys.push_back(tmp);
  }

  for (let i = 0; i < polys.size(); i++) {
    cv.drawContours(dst, polys, i, i === 0 ? green : rndColor(128), 1, 8, hierarchy, 0);
  }

  contours.delete();
  hierarchy.delete();
  return dst;
};


const contoursImage = convertToContours(binaryImage);
binaryImage.delete();


const targetImage = contoursImage;


const logImage = image => {
  console.log("LogImage\n"
    + `Image dimensions: ${image.cols}x${image.rows} (${image.size().width}x${image.size().height})\n`
    + `Image depth: ${image.depth()}, Image channels: ${image.channels()}, Image type: ${image.type()}`
  );
};

//logImage(targetImage);

cv.imshow(targetCanvas, targetImage);

targetImage.delete();

};

// The code below was taken from
// https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
// and slightly adjusted

(function() {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  var width = 320;    // We will scale the photo width to this
  var height = 0;     // This will be computed based on the input stream

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  var streaming = false;

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  var video = null;
  var canvas = null;

  function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');

    navigator.mediaDevices
      .getUserMedia({video: true, audio: false})
      .then(function(stream) {
        video.srcObject = stream;
        video.play();
      })
      .catch(function(err) {
        console.log("An error occurred: " + err);
      });

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
          height = width / (4/3);
        }

        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;

        const track = function() {
          takepicture();
          window.setTimeout(track, 150);
        }
        track();
      }
    }, false);

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      var data = canvas.toDataURL('image/png');
      init(data);
    } else {
      clearphoto();
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();
