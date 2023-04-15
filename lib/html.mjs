export const parse = (s) => {
    const [prefix, ...classes] = s.split('.');
    const [name, id] = prefix.split('#');

    return { name, id, classes };
};
export const create = (s) => {
    const { name, id, classes } = parse(s);
    const el = document.createElement(name);

    if (id) el.id = id;
    classes.forEach((c) => el.classList.add(c));

    return el;
};
export const get = (p) => p.startsWith('.') || p.startsWith('#') ? document.querySelector(p) : document.getElementById(p);
export const clear = (el) => el.innerHTML = '';

export const button = (label, handler) => {
    const button = create('button');

    button.innerHTML = label;
    button.addEventListener('click', handler);

    return button;
};
