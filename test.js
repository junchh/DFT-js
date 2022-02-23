const math = require("mathjs");

const a = math.complex(3, 4);

const pol = a.toPolar();

const r = pol.r;
const phi = pol.phi;

console.log(math.complex({ r: r, phi: phi }));
