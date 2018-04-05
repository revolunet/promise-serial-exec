const serialExec = require("./src");

const waitPromise = (timeout = 500) => new Promise(resolve => setTimeout(() => resolve(), timeout));

const wait = (timeout = 500) => args => waitPromise(timeout).then(() => args);

const range = (start, end) => Array.from({ length: end - start }, (k, v) => start + v);

const getAsyncPromise = timeout => res => Promise.resolve(res).then(wait(timeout));

const getAsyncPromises = length =>
  Array.from({ length })
    .fill()
    .map((_, i) => getAsyncPromise(Math.random() * 1000)(i));

const makeCallable = f => () => f;
const makeCallablePromises = promises => promises.map(makeCallable);

const getPromises = length =>
  Array.from({ length })
    .fill()
    .map((_, i) => Promise.resolve(i));

it("sync without serialExec should have correct order", async () => {
  expect.assertions(1);
  const result = [];
  const promises = await getPromises(10).map((p, i) => p.then(() => result.push(i)));
  expect(result).toEqual(range(0, 10));
});

it("async without serialExec should not have correct order", async () => {
  expect.assertions(1);
  const rndPromise = () => getAsyncPromise(Math.random() * 100)();
  const result = [];
  return Promise.all(
    Array.from({ length: 10 })
      .fill()
      .map((_, i) => rndPromise().then(() => result.push(i)))
  ).then(res => {
    expect(result).not.toEqual(range(0, 10));
  });
});

it("async with serialExec should have correct order", async () => {
  expect.assertions(1);
  const rndPromise = () => getAsyncPromise(Math.random() * 100)();
  const result = [];
  return serialExec(
    Array.from({ length: 10 })
      .fill()
      .map((_, i) => () => rndPromise().then(() => result.push(i)))
  ).then(res => {
    expect(result).toEqual(range(0, 10));
  });
});

const time = callable =>
  new Promise(resolve => {
    const start = new Date().getTime();
    callable().then(() => {
      const end = new Date().getTime();
      resolve(end - start);
    });
  });

it("serialExec with options.randomTimeout should wait", async () => {
  expect.assertions(2);
  time(() => serialExec(getPromises(10).map(makeCallable)))
    .then(duration => {
      expect(duration).toBeLessThan(5);
    })
    .catch(console.log);
  return time(() =>
    serialExec(getAsyncPromises(10).map(makeCallable), {
      randomTimeout: 100
    })
  )
    .then(duration => {
      expect(duration).toBeGreaterThan(100);
    })
    .catch(console.log);
});

it("serialExec should resolve sequentially", async () => {
  expect.assertions(2);
  let promise1resolved = false;
  let promise2resolved = false;
  const promise1 = () =>
    waitPromise(100).then(() => {
      promise1resolved = true;
      expect(promise2resolved).toBe(false);
    });
  const promise2 = () =>
    Promise.resolve().then(() => {
      promise2resolved = true;
      expect(promise1resolved).toBe(true);
    });

  return serialExec([promise1, promise2]);
});
