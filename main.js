const { pi } = require("mathjs");
const math = require("mathjs");
const inkjet = require("inkjet");
const fs = require("fs");

const parseMap = (data) => {
  const result = [];
  const features = data.features;
  for (let i = 0; i < features.length; i++) {
    const geometry = features[i].geometry;

    if (geometry.type === "Point") {
      result.push(
        math.complex(geometry.coordinates[0], geometry.coordinates[1])
      );
    } else if (geometry.type === "LineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        result.push(
          math.complex(geometry.coordinates[j][0], geometry.coordinates[j][1])
        );
      }
    } else if (geometry.type === "Polygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          result.push(
            math.complex(
              geometry.coordinates[j][k][0],
              geometry.coordinates[j][k][1]
            )
          );
        }
      }
    } else if (geometry.type === "MultiPoint") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        result.push(
          math.complex(geometry.coordinates[j][0], geometry.coordinates[j][1])
        );
      }
    } else if (geometry.type === "MultiLineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          result.push(
            math.complex(
              geometry.coordinates[j][k][0],
              geometry.coordinates[j][k][1]
            )
          );
        }
      }
    } else if (geometry.type === "MultiPolygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          for (let l = 0; l < geometry.coordinates[j][k].length; l++) {
            result.push(
              math.complex(
                geometry.coordinates[j][k][l][0],
                geometry.coordinates[j][k][l][1]
              )
            );
          }
        }
      }
    }
  }
  return result;
};

const parseComplex = (data, originalMap) => {
  const features = originalMap.features;
  let ptr = 0;
  for (let i = 0; i < features.length; i++) {
    const geometry = features[i].geometry;

    if (geometry.type === "Point") {
      geometry.coordinates[0] = data[ptr].re;
      geometry.coordinates[1] = data[ptr].im;
      ptr++;
    } else if (geometry.type === "LineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        geometry.coordinates[j][0] = data[ptr].re;
        geometry.coordinates[j][1] = data[ptr].im;
        ptr++;
      }
    } else if (geometry.type === "Polygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          geometry.coordinates[j][k][0] = data[ptr].re;
          geometry.coordinates[j][k][1] = data[ptr].im;
          ptr++;
        }
      }
    } else if (geometry.type === "MultiPoint") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        geometry.coordinates[j][0] = data[ptr].re;
        geometry.coordinates[j][1] = data[ptr].im;
        ptr++;
      }
    } else if (geometry.type === "MultiLineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          geometry.coordinates[j][k][0] = data[ptr].re;
          geometry.coordinates[j][k][1] = data[ptr].im;
          ptr++;
        }
      }
    } else if (geometry.type === "MultiPolygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          for (let l = 0; l < geometry.coordinates[j][k].length; l++) {
            geometry.coordinates[j][k][l][0] = data[ptr].re;
            geometry.coordinates[j][k][l][1] = data[ptr].im;
            ptr++;
          }
        }
      }
    }
  }
  const excess = [];
  for (let i = ptr; i < data.length; i++) {
    excess.push([data[i].re, data[i].im]);
  }
  features.push({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: excess,
    },
    properties: {},
  });
};

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

const dft_normal = (arr) => {
  const n = arr.length;
  const res = [];
  for (let i = 0; i < n; i++) {
    let cur = 0;
    for (let j = 0; j < n; j++) {
      cur = math.add(
        cur,
        math.multiply(
          arr[j],
          math.complex({ r: 1, phi: (-2 * pi * i * j) / n })
        )
      );
    }
    res.push(cur);
  }
  return res;
};

const inverse_dft_normal = (arr) => {
  const n = arr.length;
  const res = [];
  for (let i = 0; i < n; i++) {
    let cur = 0;
    for (let j = 0; j < n; j++) {
      cur = math.add(
        cur,
        math.multiply(arr[j], math.complex({ r: 1, phi: (2 * pi * i * j) / n }))
      );
    }
    res.push(math.divide(cur, n));
  }
  return res;
};

const fft = (a, invert) => {
  const fact = invert === 1 ? -1 : 1;
  const n = a.length;
  if (n === 1) return;

  const a0 = Array(Math.floor(n / 2));
  const a1 = Array(Math.floor(n / 2));
  for (let i = 0; i < Math.floor(n / 2); i++) {
    a0[i] = 0;
    a1[i] = 0;
  }
  for (let i = 0; 2 * i < n; i++) {
    a0[i] = a[2 * i];
    a1[i] = a[2 * i + 1];
  }

  fft(a0, invert);
  fft(a1, invert);

  for (let i = 0; 2 * i < n; i++) {
    const multiplier = math.complex({ r: 1, phi: (fact * 2 * pi * i) / n });
    a[i] = math.add(a0[i], math.multiply(multiplier, a1[i]));
    a[i + Math.floor(n / 2)] = math.subtract(
      a0[i],
      math.multiply(multiplier, a1[i])
    );
    if (invert === -1) {
      a[i] = math.divide(a[i], 2);
      a[i + Math.floor(n / 2)] = math.divide(a[i + Math.floor(n / 2)], 2);
    }
  }
};

const normalize = (phase) => {
  let phaseValue = phase % (2 * math.pi);
  if (phaseValue < 0) {
    phaseValue = (phaseValue + 2 * math.pi) % (2 * math.pi);
  }
  return phaseValue;
};

const getCategory = (phase, step) => {
  const region = Math.floor(phase / step);
  if (region % 2 === 0) {
    return 1;
  } else {
    return 0;
  }
};

const embed = (map, watermark, step) => {
  const stepNormalized = (step / 360.0) * 2 * math.pi;
  let mapData = map;
  console.log(mapData.length);
  let cur = 1;
  while (mapData.length > cur) {
    cur *= 2;
  }
  let diff = cur - mapData.length;
  for (let i = 0; i < diff; i++) {
    mapData.push(math.complex(0));
  }
  fft(mapData, 1);
  //mapData = dft_normal(mapData);
  for (let i = 0; i < watermark.length; i++) {
    const polarForm = mapData[i].toPolar();
    const phi = normalize(polarForm.phi);
    if (getCategory(phi, stepNormalized) !== watermark[i]) {
      const newAngle = phi + stepNormalized;
      const r = polarForm.r;
      mapData[i] = math.complex({ r: r, phi: newAngle });
    }
    // if (i < 10) {
    //   console.log(mapData[i]);
    //   console.log(getCategory(mapData[i].toPolar().phi, stepNormalized));
    // }
  }
  fft(mapData, -1);
  //mapData = inverse_dft_normal(mapData);
  // fft(mapData, 1);
  // console.log("batas");
  // // fft(mapData, -1);
};

const extract = (map, width, height, step) => {
  const result = [];
  const stepNormalized = (step / 360.0) * 2 * math.pi;
  let mapData = map;
  console.log(mapData.length);
  let cur = 1;
  while (mapData.length > cur) {
    cur *= 2;
  }
  let diff = cur - mapData.length;
  for (let i = 0; i < diff; i++) {
    mapData.push(math.complex(0));
  }
  //mapData = dft_normal(mapData);
  fft(mapData, 1);

  for (let i = 0; i < width * height; i++) {
    // if (i < 10) {
    //   console.log(mapData[i]);
    //   console.log(getCategory(mapData[i].toPolar().phi, stepNormalized));
    // }
    const polarForm = mapData[i].toPolar();
    const phi = normalize(polarForm.phi);
    result.push(getCategory(phi, stepNormalized));
  }
  return result;
};
// console.log(dft_normal(initial));
// console.log(initial);
// fft(initial, 1);
// console.log(initial);
// fft(initial, -1);
// console.log(initial);

const cmd = process.argv[2];
if (cmd === "embed") {
  const mapfilename = process.argv[3];
  const watermarkfilename = process.argv[4];
  const targetname = process.argv[5];

  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const mapData = parseMap(data);

  const watermarkBuf = fs.readFileSync(watermarkfilename);

  inkjet.decode(watermarkBuf, (err, decoded) => {
    if (err) {
      console.log(err);
    }
    const watermarkArray = convToBlackWhite(decoded.data);

    embed(mapData, watermarkArray, 0.03);
    parseComplex(mapData, data);

    fs.writeFileSync(targetname, JSON.stringify(data));
  });
} else if (cmd === "extract") {
  const mapfilename = process.argv[3];
  const watermarkfilename = process.argv[4];
  const width = parseInt(process.argv[5]);
  const height = parseInt(process.argv[6]);

  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const mapData = parseMap(data);

  const watermarkData = extract(mapData, width, height, 0.03);

  saveToImage(watermarkfilename, watermarkData, width, height);
} else {
  console.log(math.complex({ r: 3, phi: 3.2221111 }));
  console.log(math.complex({ r: 3, phi: 3.2221111 + 20 * math.pi }));
}
