const wait = (timeout = 500) => args =>
  new Promise(resolve => setTimeout(() => resolve(args), timeout));

const serialExec = (promises, options = {}) => {
  const next = res => (options.randomTimeout ? wait(options.randomTimeout) : Promise.resolve(res));
  return promises.reduce(
    (chain, c) =>
      chain.then(res =>
        c()
          .then(next())
          .then(cur => [...res, cur])
      ),
    Promise.resolve([])
  );
};

module.exports = serialExec;
