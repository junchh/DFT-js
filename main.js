const { pi } = require("mathjs");
const math = require("mathjs");

const initial = [5, 4, 3, -29, 32, 9, 1, -0.988];

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
console.log(dft_normal(initial));
console.log(initial);
fft(initial, 1);
console.log(initial);
fft(initial, -1);
console.log(initial);
