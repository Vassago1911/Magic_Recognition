const init = async () => {

const sourceCanvas = document.createElement("canvas");
const targetCanvas = document.createElement("canvas");
document.querySelector("body").appendChild(sourceCanvas);
document.querySelector("body").appendChild(targetCanvas);

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

const sourceImage = await loadSourceImage("bird.jpg");

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

logImage(sourceImage);
logImage(targetImage);

cv.imshow(sourceCanvas, sourceImage);
cv.imshow(targetCanvas, targetImage);

sourceImage.delete();
targetImage.delete();

};
cv["onRuntimeInitialized"] = init;
