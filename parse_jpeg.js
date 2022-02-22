const inkjet = require("inkjet");
const fs = require("fs");

const filepath = "jun.jpg";
const buf = fs.readFileSync(filepath);

const convToBlackWhite = (arr) => {
  const res = [];
  let i = 0;
  for (let i = 0; i < arr.length; i += 4) {
    const cur =
      (arr[i] * 0.2126 + arr[i + 1] * 0.7152 + arr[i + 2] * 0.0722) / 255;
    if (cur >= 0.5) {
      res.push(0);
    } else {
      res.push(1);
    }
  }
  return res;
};

const saveToImage = (filename, arr, width, height) => {
  const frameData = Buffer.alloc(width * height * 4);
  let i = 0;
  let k = 0;

  while (i < frameData.length) {
    if (arr[k] === 1) {
      frameData[i++] = 0;
      frameData[i++] = 0;
      frameData[i++] = 0;
      frameData[i++] = 0xff;
    } else {
      frameData[i++] = 255;
      frameData[i++] = 255;
      frameData[i++] = 255;
      frameData[i++] = 0xff;
    }
    k++;
  }

  const buf = frameData;
  const options = {
    width: width,
    height: height,
    quality: 80,
  };

  inkjet.encode(buf, options, (err, encoded) => {
    fs.writeFileSync(filename, encoded.data);
  });
};

inkjet.decode(buf, (err, decoded) => {
  console.log(decoded);
  const h = convToBlackWhite(decoded.data);
  console.log(h);
  saveToImage("test.jpg", h, 30, 20);
});
