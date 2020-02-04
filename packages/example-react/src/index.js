const obj2 = {
  a: 'a',
  b: 'b',
  c: 'c',
};

// const a = { b: { c: { d: 1 } } };
// const c = a?.b?.c?.d;

console.log({  //eslint-disable-line
  ...obj2,
  d: 'd',
  e: 'e',
});
