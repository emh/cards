export const range = (m, n) => [...Array(n + 1).keys()].slice(m);
export const shuffle = (a, fn = Math.random) => [...a].sort(() => fn() - 0.5);
export const div = (n, d) => ({ q: Math.floor(n / d), r: n % d });

export const key = () => {
    const d = new Date(); // local time

    return `${d.getFullYear() + 1}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
