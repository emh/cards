import { create, get, clear, button } from '../lib/html.mjs';
import { shuffle, key } from '../lib/utils.mjs';
import { deck, suitClasses, cardValue, royalFlush, straight, flush, fourOfAKind, fullHouse, threeOfAKind, twoPairs, onePair, ACE, JACK, QUEEN, KING } from '../lib/cards.mjs';
import { prng } from '../lib/prng.mjs';
import { getHistory, putHistory } from '../lib/history.mjs';

const GAME = 'double-deal';

const seed = Date.parse(key());
const random = prng(Date.now());

const randInt = (n) => Math.floor(n * random());

function loadGame() {
    const history = getHistory(GAME);

    return history[key()];
}

function saveGame(game) {
    const history = getHistory(GAME);

    history[key()] = game;

    putHistory(GAME, history);
}

const DEALT = 1;

function initialize() {
    // const savedGame = loadGame();

    // if (savedGame) return savedGame;

    const cards = shuffle(deck, random);

    return {
        leftHand: [[null, null, null, null, null]],
        rightHand: [[null, null, null, null, null]],
        leftPile: cards.slice(0, 26),
        rightPile: cards.slice(26),
        deals: 0
    };
};

const leftHand = () => state.leftHand[state.leftHand.length - 1];
const rightHand = () => state.rightHand[state.rightHand.length - 1];

const state = initialize();

function clearSelection(hand) {
    hand.forEach((card) => card && (card.selected = false));
}

function getSelection() {
    const cards = [];
    let side = null;

    if (leftHand().some((card) => card?.selected)) {
        side = 'left';
    } else if (rightHand().some((card) => card?.selected)) {
        side = 'right';
    }

    if (side) {
        const hand = side === 'left' ? [...leftHand()] : [...rightHand()];

        for (let i = 0; i < 5; i++) {
            if (hand[i].selected) {
                cards.push({ value: hand[i].value, suit: hand[i].suit });
                hand[i] = null;
            }
        }

        if (side === 'left') {
            state.leftHand.push(hand);
        } else {
            state.rightHand.push(hand);
        }
    }

    return cards;
}

function renderHand(hand, cards) {
    clear(hand);

    const alreadyDiscarded = cards.some((c) => c === null);

    for (let i = 0; i < 5; i++) {
        const card = cards[i];
        const slot = create('div');

        if (card) {
            slot.classList.add('card', suitClasses[card.suit]);
            if (card.selected) slot.classList.add('discard');
            slot.innerHTML = `${cardValue(card.value)}${card.suit}`;

            if (!alreadyDiscarded) {
                slot.addEventListener('click', () => {
                    card.selected = !card.selected;
                    clearSelection(hand.id === 'left-hand' ? rightHand() : leftHand());

                    render();
                });
            }
        } else {
            slot.classList.add('slot');
        }

        hand.append(slot);
    }
}

function renderBoard() {
    renderHand(get('left-hand'), leftHand());
    renderHand(get('right-hand'), rightHand());
}

function dealHand(cards, pile) {
    let n = 0;

    for (let i = 0; i < 5; i++) {
        if (cards[i] === null) {
            cards[i] = pile.pop();
            n++;
        }
    }

    return n;
}

function deal() {
    const m = dealHand(leftHand(), state.leftPile);
    const n = dealHand(rightHand(), state.rightPile);

    if (m + n > 0) state.deals++;

    return m + n;
}

function calcScore(hand) {
    if (royalFlush(hand)) {
        return { name: 'Royal Flush', points: 100 };
    }

    if (straight(hand) && flush(hand)) {
        return { name: 'Straight Flush', points: 75, suit: hand[0].suit };
    }

    if (fourOfAKind(hand)) {
        return { name: 'Four of a Kind', points: 50 };
    }

    if (fullHouse(hand)) {
        return { name: 'Full House', points: 25 };
    }

    if (flush(hand)) {
        return { name: 'Flush', points: 20, suit: hand[0].suit };
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

    hands.push(calcScore(leftHand()));
    hands.push(calcScore(rightHand()));

    return hands;
}

const totalScore = (scores) => scores.reduce((acc, s) => acc + (s?.points ?? 0), 0);

function renderScore(scores) {
    const score = create('div.score');

    const lines = scores
        .filter((s) => s !== null)
        .map((s) => `<span>${s.name}: ${s.points}</span>`);

    score.innerHTML = lines.join('');

    return score;
}

function renderShareDialog() {
    const scores = calcScores();

    const app = get('app');
    const dialog = create('dialog');

    const div = create('div');
    const scoreDiv = renderScore(scores);
    const message = create('p');

    message.innerHTML = `You're finished! You scored ${totalScore(scores)}. Here are the hands you made.`;

    const buttonDiv = create('div.buttons');

    buttonDiv.append(
        button('OK', () => dialog.remove())
    );

    div.append(
        message,
        scoreDiv,
        buttonDiv
    );

    dialog.append(div);

    app.append(dialog);
    dialog.showModal();
}

function render() {
    // saveGame(state);
    renderBoard();

    console.log(state);

    if (state.deals === 4 || state.noDiscards) {
        renderShareDialog();
    }
}

function handlePileClick() {
    const n = deal();

    if (n === 0) state.noDiscards = true;

    render();
}

function handleDiscardClick(e) {
    const side = e.target.parentElement.id;
    const cards = getSelection();

    for (let i = 0; i < cards.length; i++) {
        const pile = side === 'left-discard' ? state.leftPile : state.rightPile;

        pile.splice(randInt(pile.length), 0, cards[i]);
    }

    render();
}

get('#left-pile .deck').addEventListener('click', handlePileClick);
get('#right-pile .deck').addEventListener('click', handlePileClick);
get('#left-discard div').addEventListener('click', handleDiscardClick);
get('#right-discard div').addEventListener('click', handleDiscardClick);

render();
