export const getHistory = (key) => JSON.parse(localStorage.getItem(key)) ?? {};

export const putHistory = (key, history) => localStorage.setItem(key, JSON.stringify(history));
