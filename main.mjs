import { create, get, clear } from './html.mjs';
import { shuffle, key } from './utils.mjs';
import { deck, SPADES, CLUBS, HEARTS, DIAMONDS, royalFlush, straight, flush, fourOfAKind, fullHouse, threeOfAKind, twoPairs, onePair, ACE, JACK, QUEEN, KING } from './cards.mjs';
import { prng } from './prng.mjs';

const seed = Date.parse(key());
const random = prng(seed);

const state = {
    board: [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null]
    ],
    pile: shuffle(deck, random).slice(0, 25),
    topCardVisible: false,
    autoDeal: false
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

function dealCard() {
    state.dealtCard = state.pile[0];
    state.pile.shift();
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

                slot.addEventListener('click', () => {
                    if (state.placement) {
                        state.board[state.placement.i][state.placement.j] = null;
                    }

                    state.board[i][j] = state.dealtCard;

                    if (state.autoDeal) {
                        dealCard();
                    } else {
                        state.placement = { i, j };
                        state.topCardVisible = false;
                    }

                    if (state.pile.length === 0) state.dealtCard = null;

                    render();
                });
            }

            row.append(slot);
        }

        board.append(row);
    }
}

function renderAutoDeal() {
    const div = create('div.autodeal');

    const checkbox = create('input#autodeal');
    checkbox.setAttribute('type', 'checkbox');
    if (state.autoDeal) checkbox.setAttribute('checked', true);
    checkbox.addEventListener('change', () => {
        state.autoDeal = !state.autoDeal;
        render();
    });
    const label = create('label');
    label.setAttribute('for', 'autodeal');
    label.innerHTML = 'Autodeal';

    div.append(checkbox, label);

    return div;
}

function renderPile() {
    const pile = get('pile');

    clear(pile);

    const deck = create('div.deck');

    if (state.topCardVisible) {
        deck.classList.add('visible', suitClasses[state.dealtCard.suit]);
        deck.innerHTML = `${cardValue(state.dealtCard.value)}${state.dealtCard.suit}`;
    } else {
        deck.addEventListener('click', () => {
            state.topCardVisible = true;
            dealCard();
            state.placement = null;
            render();
        });
    }

    pile.append(deck, renderAutoDeal());
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

    const lines = scores
        .filter((s) => s !== null)
        .map((s) => s === null ? '<p>nothing: 000</p>' : `<p>${s.name}: ${String(s.points).padStart(3, '0')}</p>`);

    lines.push(`<p>Total: ${String(scores.reduce((acc, s) => acc + (s?.points ?? 0), 0)).padStart(3, '0')}</p>`);

    score.innerHTML = lines.join('');

    pile.append(score);
}

function render() {
    renderBoard();

    if (state.pile.length > 0 || state.dealtCard) {
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

//     if (n < 22) {
//         setTimeout(autoPlay, 250);
//     }
// }

// setTimeout(autoPlay, 250);
