const obj = {
  a: 'a',
  b: 'b',
  c: 'c',
};

let Hi = new String();  //eslint-disable-line
if (true) {  //eslint-disable-line
  Hi = '1111';
}
if (false) {  //eslint-disable-line
  const a = 1 + 2;
  console.log(2222, a);  //eslint-disable-line
  Hi = '2222';
}
const DEV = false;
if (DEV) {
  const b = 1 + 2;
  console.log(3333, b);  //eslint-disable-line
  Hi = '3333';
}
let DEV2 = false;
if (true) {  //eslint-disable-line
  DEV2 = true;
}
if (DEV2) {
  const b = 1 + 2;
  console.log(4444, b);  //eslint-disable-line
  Hi = '4444';
}

console.log({  //eslint-disable-line
  Hi,
  ...obj,
  d: 'd',
  e: 'e',
});
