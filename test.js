//src: https://github.com/bartaz/ieee754-visualization/blob/master/src/ieee754.js
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
const h = dec2bin(132.3212223292);
h[63] = 0;
console.log(bin2dec(h));
