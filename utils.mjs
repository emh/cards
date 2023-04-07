export const range = (m, n) => [...Array(n + 1).keys()].slice(m);
export const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
export const div = (n, d) => ({ q: Math.floor(n / d), r: n % d });

