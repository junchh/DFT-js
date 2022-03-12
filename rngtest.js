var width = 256, // each RC4 output is 0 <= x < 256
  mask = width - 1;
function ARC4(key) {
  var t,
    keylen = key.length,
    me = this,
    i = 0,
    j = (me.i = me.j = 0),
    s = (me.S = []);

  // The empty key [] is treated as [0].
  if (!keylen) {
    key = [keylen++];
  }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[(j = mask & (j + key[i % keylen] + (t = s[i])))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function (count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t,
      r = 0,
      i = me.i,
      j = me.j,
      s = me.S;
    while (count--) {
      t = s[(i = mask & (i + 1))];
      r = r * width + s[mask & ((s[i] = s[(j = mask & (j + t))]) + (s[j] = t))];
    }
    me.i = i;
    me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

function test(seed) {
  var arc4 = new ARC4(seed);

  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
  console.log(arc4.g(2));
}

test("hello.");
