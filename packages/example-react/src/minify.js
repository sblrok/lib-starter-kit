/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
const obj = {
  a: 'a',
  b: 'b',
  c: 'c',
};

// eslint-disable-next-line no-new-wrappers
let Hi = new String();
if (true) {
  Hi = '1111';
}
if (false) {
  const a = 1 + 2;
  console.log(2222, a);
  Hi = '2222';
}
const DEV = false;
if (DEV) {
  const b = 1 + 2;
  console.log(3333, b);
  Hi = '3333';
}
let DEV2 = false;
if (true) {
  DEV2 = true;
}
if (DEV2) {
  const b = 1 + 2;
  console.log(4444, b);
  Hi = '4444';
}

console.log({
  Hi,
  ...obj,
  d: 'd',
  e: 'e',
});
