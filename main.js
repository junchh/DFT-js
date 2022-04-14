const { pi } = require("mathjs");
const math = require("mathjs");
const inkjet = require("inkjet");
const fs = require("fs");
const seedrandom = require("seedrandom");

function dec2bin(dec) {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setFloat64(0, dec, false);
  const newBuf = new Uint8Array(buffer);

  const res = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 7; j >= 0; j--) {
      if (newBuf[i] & (1 << j)) {
        res.push(1);
      } else {
        res.push(0);
      }
    }
  }
  return res;
}

function bin2dec(bin) {
  const arr = [];
  for (let i = 0; i < 64; i += 8) {
    let k = 7;
    let num = 0;
    for (let j = i; j < i + 8; j++) {
      if (bin[j] === 1) {
        num += 1 << k;
      }
      k--;
    }
    arr.push(num);
  }
  const buffer = new ArrayBuffer(8);
  new Uint8Array(buffer).set(arr);
  return new DataView(buffer).getFloat64(0, false);
}

const parseMap = (data) => {
  const result = [];
  const features = data.features;
  let ptr = 0;
  const forbidden = new Map();
  for (let i = 0; i < features.length; i++) {
    const geometry = features[i].geometry;

    if (geometry.type === "Point") {
      result.push(
        math.complex(geometry.coordinates[0], geometry.coordinates[1])
      );
      ptr++;
    } else if (geometry.type === "LineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        result.push(
          math.complex(geometry.coordinates[j][0], geometry.coordinates[j][1])
        );
        ptr++;
      }
    } else if (geometry.type === "Polygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          if (k === 0 || k === geometry.coordinates[j].length - 1) {
            forbidden.set(ptr, 1);
          }
          result.push(
            math.complex(
              geometry.coordinates[j][k][0],
              geometry.coordinates[j][k][1]
            )
          );
          ptr++;
        }
      }
    } else if (geometry.type === "MultiPoint") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        result.push(
          math.complex(geometry.coordinates[j][0], geometry.coordinates[j][1])
        );
        ptr++;
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
          ptr++;
        }
      }
    } else if (geometry.type === "MultiPolygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          for (let l = 0; l < geometry.coordinates[j][k].length; l++) {
            if (l === 0 || l === geometry.coordinates[j][k].length - 1) {
              forbidden.set(ptr, 1);
            }
            result.push(
              math.complex(
                geometry.coordinates[j][k][l][0],
                geometry.coordinates[j][k][l][1]
              )
            );
            ptr++;
          }
        }
      }
    }
  }
  return [result, forbidden];
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

const deleteVertices = (data, num) => {
  const features = data.features;
  let ptr = 0;
  for (let i = 0; i < features.length; i++) {
    const geometry = features[i].geometry;

    if (geometry.type === "Point") {
      ptr++;
    } else if (geometry.type === "LineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        ptr++;
      }
    } else if (geometry.type === "Polygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          ptr++;
        }
      }
    } else if (geometry.type === "MultiPoint") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        ptr++;
      }
    } else if (geometry.type === "MultiLineString") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          ptr++;
        }
      }
    } else if (geometry.type === "MultiPolygon") {
      for (let j = 0; j < geometry.coordinates.length; j++) {
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          for (let l = 0; l < geometry.coordinates[j][k].length; l++) {
            ptr++;
          }
        }
      }
    }
  }
  const myrng = seedrandom("ayayayaya");
  const order = [];
  const mp = new Map();
  for (let i = 0; i < num; ) {
    const g = (myrng.int32() >>> 0) % ptr;
    if (!mp.has(g)) {
      order.push(g);
      i++;
      mp.set(g, 1);
    }
  }
  order.sort((a, b) => a - b);
  let h = 0;
  ptr = 0;
  for (let i = 0; i < features.length; i++) {
    const geometry = features[i].geometry;

    if (geometry.type === "Polygon") {
      const temp = [];
      for (let j = 0; j < geometry.coordinates.length; j++) {
        const temp2 = [];
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          if (ptr === order[h]) {
            h++;
          } else {
            temp2.push([
              geometry.coordinates[j][k][0],
              geometry.coordinates[j][k][1],
            ]);
          }
          ptr++;
        }
        temp.push(temp2);
      }

      geometry.coordinates = temp;
    } else if (geometry.type === "MultiLineString") {
      const temp = [];
      for (let j = 0; j < geometry.coordinates.length; j++) {
        const temp2 = [];
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          if (ptr === order[h]) {
            h++;
          } else {
            temp2.push([
              geometry.coordinates[j][k][0],
              geometry.coordinates[j][k][1],
            ]);
          }
          ptr++;
        }
        temp.push(temp2);
      }

      geometry.coordinates = temp;
    } else if (geometry.type === "MultiPolygon") {
      const temp = [];
      for (let j = 0; j < geometry.coordinates.length; j++) {
        const temp2 = [];
        for (let k = 0; k < geometry.coordinates[j].length; k++) {
          const temp3 = [];
          for (let l = 0; l < geometry.coordinates[j][k].length; l++) {
            if (ptr === order[h]) {
              h++;
            } else {
              temp3.push([
                geometry.coordinates[j][k][l][0],
                geometry.coordinates[j][k][l][1],
              ]);
            }
            ptr++;
          }
          temp2.push(temp3);
        }
        temp.push(temp2);
      }

      geometry.coordinates = temp;
    } else if (geometry.type === "LineString") {
      const temp = [];
      for (let j = 0; j < geometry.coordinates.length; j++) {
        if (ptr === order[h]) {
          h++;
        } else {
          temp.push([geometry.coordinates[j][0], geometry.coordinates[j][1]]);
        }
        ptr++;
      }
      geometry.coordinates = temp;
    }
  }
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
  const frameData = new Array(width * height * 4);
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

const embed_fft = (map, watermark, step, key, width, height, forbidden) => {
  const stepNormalized = (step / 360.0) * 2 * math.pi;
  const newKey =
    key +
    "-" +
    width.toString() +
    "-" +
    height.toString() +
    "-" +
    map.length.toString();
  let mapData = map;
  const initialMapSize = mapData.length;
  const myrng = seedrandom(key);
  const order = [];
  const mp = new Map();
  for (let i = 0; i < watermark.length; ) {
    const g = (myrng.int32() >>> 0) % mapData.length;
    if (!mp.has(g) && !forbidden.has(g)) {
      order.push(g);
      i++;
      mp.set(g, 1);
    }
  }
  order.sort((a, b) => a - b);
  let newMap = [];
  for (let i = 0; i < watermark.length; i++) {
    newMap.push(mapData[order[i]]);
  }

  let cur = 1;
  while (watermark.length > cur) {
    cur *= 2;
  }
  let diff = cur - watermark.length;
  for (let i = 0; i < diff; i++) {
    newMap.push(math.complex(0));
  }
  fft(newMap, 1);

  //mapData = dft_normal(mapData);
  for (let i = 0; i < watermark.length; i++) {
    const polarForm = newMap[i].toPolar();
    const phi = normalize(polarForm.phi);
    if (getCategory(phi, stepNormalized) !== watermark[i]) {
      const newAngle = phi + stepNormalized;
      const r = polarForm.r;
      newMap[i] = math.complex({ r: r, phi: newAngle });
    }
    // if (i < 10) {
    //   console.log(mapData[i]);
    //   console.log(getCategory(mapData[i].toPolar().phi, stepNormalized));
    // }
  }
  fft(newMap, -1);
  for (let i = 0; i < watermark.length; i++) {
    mapData[order[i]] = newMap[i];
  }
  for (let i = watermark.length; i < newMap.length; i++) {
    mapData.push(newMap[i]);
  }
  let k = 0;
  for (let i = 0; i < mapData.length; i++) {
    if (order[k] === i || i >= initialMapSize) {
      const arr = dec2bin(mapData[i].re);
      if (arr[63] === 0) {
        arr[63] = 1;
      }
      mapData[i].re = bin2dec(arr);
      k++;
    } else {
      const arr = dec2bin(mapData[i].re);
      if (arr[63] === 1) {
        arr[63] = 0;
      }
      mapData[i].re = bin2dec(arr);
    }
  }
  return newKey;
  //mapData = inverse_dft_normal(mapData);
  // fft(mapData, 1);
  // console.log("batas");
  // // fft(mapData, -1);
};

const extract_fft = (map, step, keyString) => {
  const myKey = keyString.split("-");
  const key = myKey[0];
  const width = myKey[1];
  const height = myKey[2];
  const mapSize = myKey[3];
  const result = [];
  const stepNormalized = (step / 360.0) * 2 * math.pi;
  const myrng = seedrandom(key);
  const order = [];
  const mp = new Map();
  let cur = 1;
  while (width * height > cur) {
    cur *= 2;
  }
  let diff = cur - width * height;
  for (let i = 0; i < width * height; ) {
    const g = (myrng.int32() >>> 0) % (map.length - diff);
    if (!mp.has(g)) {
      order.push(g);
      i++;
      mp.set(g, 1);
    }
  }
  let mapData = map;
  let newMap = [];
  for (let i = 0; i < width * height; i++) {
    newMap.push(mapData[order[i]]);
  }
  for (let i = 0; i < diff; i++) {
    newMap.push(mapData[mapData.length - diff + i]);
  }
  //mapData = dft_normal(mapData);
  fft(newMap, 1);

  for (let i = 0; i < width * height; i++) {
    // if (i < 10) {
    //   console.log(mapData[i]);
    //   console.log(getCategory(mapData[i].toPolar().phi, stepNormalized));
    // }
    const polarForm = newMap[i].toPolar();
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

const extract_fft_new = (map, step, keyString, forbidden) => {
  const myKey = keyString.split("-");
  const key = myKey[0];
  const width = parseInt(myKey[1]);
  const height = parseInt(myKey[2]);
  const mapSize = parseInt(myKey[3]);
  const result = [];
  const stepNormalized = (step / 360.0) * 2 * math.pi;
  const myrng = seedrandom(key);
  const order = [];
  const mp = new Map();
  let cur = 1;
  while (width * height > cur) {
    cur *= 2;
  }
  let diff = cur - width * height;
  if (diff + mapSize === map.length) {
    for (let i = 0; i < width * height; ) {
      const g = (myrng.int32() >>> 0) % (map.length - diff);
      if (!mp.has(g) && !forbidden.has(g)) {
        order.push(g);
        i++;
        mp.set(g, 1);
      }
    }
    order.sort((a, b) => a - b);
    let mapData = map;
    let newMap = [];
    for (let i = 0; i < width * height; i++) {
      newMap.push(mapData[order[i]]);
    }
    for (let i = 0; i < diff; i++) {
      newMap.push(mapData[mapData.length - diff + i]);
    }
    //mapData = dft_normal(mapData);
    fft(newMap, 1);

    for (let i = 0; i < width * height; i++) {
      const polarForm = newMap[i].toPolar();
      const phi = normalize(polarForm.phi);
      result.push(getCategory(phi, stepNormalized));
    }
    return result;
  } else {
    let mapData = map;
    let newMap = [];
    for (let i = 0; i < mapData.length; i++) {
      const arr = dec2bin(mapData[i].re);
      if (arr[63] === 1) {
        newMap.push(mapData[i]);
      }
    }
    console.log(newMap.length);
    fft(newMap, 1);

    for (let i = 0; i < width * height; i++) {
      const polarForm = newMap[i].toPolar();
      const phi = normalize(polarForm.phi);
      result.push(getCategory(phi, stepNormalized));
    }
    return result;
  }
};

const cmd = process.argv[2];
if (cmd === "embed_fft") {
  const mapfilename = process.argv[3];
  const watermarkfilename = process.argv[4];
  const targetname = process.argv[5];
  const key = process.argv[6];

  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const [mapData, forbidden] = parseMap(data);

  const watermarkBuf = fs.readFileSync(watermarkfilename);

  inkjet.decode(watermarkBuf, (err, decoded) => {
    if (err) {
      console.log(err);
    }
    const watermarkArray = convToBlackWhite(decoded.data);

    const newKey = embed_fft(
      mapData,
      watermarkArray,
      0.03,
      key,
      decoded.width,
      decoded.height,
      forbidden
    );
    parseComplex(mapData, data);

    console.log(newKey);

    fs.writeFileSync(targetname, JSON.stringify(data));
  });
} else if (cmd === "extract_fft") {
  const mapfilename = process.argv[3];
  const watermarkfilename = process.argv[4];
  const key = process.argv[5];

  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const [mapData, forbidden] = parseMap(data);

  const watermarkData = extract_fft_new(mapData, 0.03, key, forbidden);

  const myArr = key.split("-");

  saveToImage(watermarkfilename, watermarkData, myArr[1], myArr[2]);
} else if (cmd === "translate") {
  const mapfilename = process.argv[3];
  const x_trans = parseFloat(process.argv[4]);
  const y_trans = parseFloat(process.argv[5]);
  const targetname = process.argv[6];
  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const [mapData, forbidden] = parseMap(data);

  for (let i = 0; i < mapData.length; i++) {
    mapData[i].re += x_trans;
    mapData[i].im += y_trans;
  }

  parseComplex(mapData, data);

  fs.writeFileSync(targetname, JSON.stringify(data));
} else if (cmd === "rotate") {
  const mapfilename = process.argv[3];
  const degree = parseFloat(process.argv[4]);
  const targetname = process.argv[5];
  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const [mapData, forbidden] = parseMap(data);
  const deg = (degree / 360.0) * 2 * math.pi;
  const angle = math.complex({ r: 1, phi: deg });
  for (let i = 0; i < mapData.length; i++) {
    mapData[i] = math.multiply(mapData[i], angle);
  }

  parseComplex(mapData, data);

  fs.writeFileSync(targetname, JSON.stringify(data));
} else if (cmd === "scale") {
  const mapfilename = process.argv[3];
  const x_trans = parseFloat(process.argv[4]);
  const y_trans = parseFloat(process.argv[5]);
  const targetname = process.argv[6];
  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const [mapData, forbidden] = parseMap(data);

  for (let i = 0; i < mapData.length; i++) {
    mapData[i].re *= x_trans;
    mapData[i].im *= y_trans;
  }

  parseComplex(mapData, data);

  fs.writeFileSync(targetname, JSON.stringify(data));
} else if (cmd === "delete") {
  const mapfilename = process.argv[3];
  const num = parseInt(process.argv[4]);
  const targetname = process.argv[5];
  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  deleteVertices(data, num);

  fs.writeFileSync(targetname, JSON.stringify(data));
} else if (cmd === "alter") {
  const mapfilename = process.argv[3];
  const targetname = process.argv[4];

  let rawdata = fs.readFileSync(mapfilename);
  let data = JSON.parse(rawdata);

  const [mapData, forbidden] = parseMap(data);

  for (let i = 0; i < mapData.length; i++) {
    mapData[i].re;
    const arr = dec2bin(mapData[i].re);
    arr[63] = 1;
    mapData[i].re = bin2dec(arr);
  }

  parseComplex(mapData, data);
  fs.writeFileSync(targetname, JSON.stringify(data));
} else {
  console.log(math.complex({ r: 3, phi: 3.2221111 }));
  console.log(math.complex({ r: 3, phi: 3.2221111 + 20 * math.pi }));
}
