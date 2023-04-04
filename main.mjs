const parse = (s) => {
    const [prefix, ...classes] = s.split('.');
    const [name, id] = prefix.split('#');

    return { name, id, classes };
};
const create = (s) => {
    const { name, id, classes } = parse(s);
    const el = document.createElement(name);

    if (id) el.id = id;
    classes.forEach((c) => el.classList.add(c));

    return el;
};
const get = (id) => document.getElementById(id);
const clear = (el) => el.innerHTML = '';

const range = (m, n) => [...Array(n + 1).keys()].slice(m);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const div = (n, d) => ({ q: Math.floor(n / d), r: n % d });

const SPADES = '♠';
const CLUBS = '♣';
const HEARTS = '♥';
const DIAMONDS = '♦';

const suits = [SPADES, CLUBS, HEARTS, DIAMONDS];

const ACE = 1;
const JACK = 11;
const QUEEN = 12;
const KING = 13;

const deck = suits.map((s) => range(ACE, KING).map((v) => ({ suit: s, value: v }))).flat();

const state = {
    board: [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
    ],
    pile: shuffle(deck).slice(0, 25),
    topCardVisible: false
};

const suitClasses = {
    [SPADES]: 'spades',
    [CLUBS]: 'clubs',
    [HEARTS]: 'hearts',
    [DIAMONDS]: 'diamonds'
};

const cardValue = (v) => {
    switch (v) {
        case ACE: return 'A';
        case JACK: return 'J';
        case QUEEN: return 'Q';
        case KING: return 'K';
        default: return v;
    }
}

function renderBoard() {
    const board = get('board');

    clear(board);

    for (let i = 0; i < 5; i++) {
        const row = create('div.row');

        for (let j = 0; j < 5; j++) {
            const slot = create('div');
            const card = state.board[i][j];

            if (card) {
                slot.classList.add('card', suitClasses[card.suit]);
                slot.innerHTML = `${cardValue(card.value)}${card.suit}`;
            } else {
                slot.classList.add('slot');

                if (state.topCardVisible) {
                    slot.addEventListener('click', () => {
                        state.board[i][j] = state.pile[0];
                        state.pile.shift();
                        state.topCardVisible = false;
                        render();
                    });
                }
            }

            row.append(slot);
        }

        board.append(row);
    }
}

function renderPile() {
    const pile = get('pile');

    clear(pile);

    const deck = create('div.deck');

    if (state.topCardVisible) {
        deck.classList.add('visible', suitClasses[state.pile[0].suit]);
        deck.innerHTML = `${cardValue(state.pile[0].value)}${state.pile[0].suit}`;
    } else {
        deck.addEventListener('click', () => {
            state.topCardVisible = true;
            render();
        });
    }

    pile.append(deck);
}

const sort = (hand) => [...hand].sort((c1, c2) => c1.value - c2.value);
const aKind = (cards) => cards.every((card) => card.value === cards[0].value);
const flush = (hand) => hand.every((card) => card.suit === hand[0].suit);
const straight = (hand) => {
    const sorted = sort(hand);

    if (sorted[4].value - sorted[0].value === 4) return true;

    return false;
}
const royalFlush = (hand) => {
    if (!flush(hand)) return false;

    const sorted = sort(hand);

    if (sorted[0].value === ACE && sorted[4].value === KING && sorted[4].value - sorted[1].value === 3) return true;

    return false;
};
const fourOfAKind = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 4))) return true;
    if (aKind(sorted.slice(1, 5))) return true;

    return false;
};
const fullHouse = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 2)) && aKind(sorted.slice(2, 5))) return true;
    if (aKind(sorted.slice(0, 3)) && aKind(sorted.slice(3, 5))) return true;

    return false;
};
const threeOfAKind = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 3))) return true;
    if (aKind(sorted.slice(1, 4))) return true;
    if (aKind(sorted.slice(2, 5))) return true;

    return false;
};
const twoPairs = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 2)) && aKind(sorted.slice(2, 4))) return true;
    if (aKind(sorted.slice(0, 2)) && aKind(sorted.slice(3, 5))) return true;
    if (aKind(sorted.slice(1, 3)) && aKind(sorted.slice(3, 5))) return true;

    return false;
};
const onePair = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 2))) return true;
    if (aKind(sorted.slice(1, 3))) return true;
    if (aKind(sorted.slice(2, 4))) return true;
    if (aKind(sorted.slice(3, 5))) return true;

    return false;
}

function calcScore(hand) {
    if (royalFlush(hand)) {
        return { name: 'Royal Flush', points: 100 };
    }

    if (straight(hand) && flush(hand)) {
        return { name: 'Straight Flush', points: 75 };
    }

    if (fourOfAKind(hand)) {
        return { name: 'Four of a Kind', points: 50 };
    }

    if (fullHouse(hand)) {
        return { name: 'Full House', points: 25 };
    }

    if (flush(hand)) {
        return { name: 'Flush', points: 20 };
    }

    if (straight(hand)) {
        return { name: 'Straight', points: 15 };
    }

    if (threeOfAKind(hand)) {
        return { name: 'Three of a Kind', points: 10 };
    }

    if (twoPairs(hand)) {
        return { name: 'Two Pairs', points: 5 };
    }

    if (onePair(hand)) {
        return { name: 'One Pair', points: 2 };
    }

    return null;
}

function calcScores() {
    const hands = [];

    for (let i = 0; i < 5; i++) {
        hands.push(calcScore([...state.board[i]]));
    }

    for (let j = 0; j < 5; j++) {
        hands.push(calcScore(state.board.map((row) => row.slice(j, j + 1)).flat()));
    }

    return hands;
}

function renderScore() {
    const pile = get('pile');

    clear(pile);

    const score = create('div.score');
    const scores = calcScores();

    console.log(scores);

    const lines = scores
        .filter((s) => s !== null)
        .map((s) => s === null ? '<p>nothing: 000</p>' : `<p>${s.name}: ${String(s.points).padStart(3, '0')}</p>`);

    lines.push(`<p>Total: ${String(scores.reduce((acc, s) => acc + (s?.points ?? 0), 0)).padStart(3, '0')}</p>`);

    score.innerHTML = lines.join('');

    pile.append(score);
}

function render() {
    renderBoard();

    if (state.pile.length > 0) {
        renderPile();
    } else {
        renderScore();
    }
}

render();

// const autoPlay = () => {
//     const n = 25 - state.pile.length;
//     const { q: i, r: j } = div(n, 5);

//     state.board[i][j] = state.pile[0];
//     state.pile.shift();

//     render();

//     if (state.pile.length > 0) {
//         setTimeout(autoPlay, 250);
//     }
// }

// setTimeout(autoPlay, 250);