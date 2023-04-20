import { create, get, clear, button } from '../lib/html.mjs';
import { shuffle, key, div } from '../lib/utils.mjs';
import { deck, suitClasses, cardValue, royalFlush, straight, flush, fourOfAKind, fullHouse, threeOfAKind, twoPairs, onePair, ACE, JACK, QUEEN, KING } from '../lib/cards.mjs';
import { prng } from '../lib/prng.mjs';
import { getHistory, putHistory } from '../lib/history.mjs';

const GAME = 'poker-squares';

function goal(name) {
    try {
        clicky.goal(`[${GAME}] ${name}`);
    } catch (e) {
        console.error('Error logging goal', name, e);
    }
}

function loadGame() {
    const history = getHistory(GAME);

    return history[key()];
}

function saveGame(game) {
    const history = getHistory(GAME);

    history[key()] = game;

    putHistory(GAME, history);
}

function getAutoDeal() {
    const history = getHistory(GAME);
    const keys = Object.keys(history);

    const lastKey = keys.sort().pop();

    return lastKey ? history[lastKey].autoDeal : false;
}

function initialize(practice = false) {
    const seed = Date.parse(key());
    const random = practice ? Math.random : prng(seed);

    let state = practice ? null : loadGame();

    if (!state) {
        state = {
            board: [
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null],
                [null, null, null, null, null]
            ],
            pile: shuffle(deck, random).slice(0, 25),
            topCardVisible: false,
            autoDeal: getAutoDeal(),
            practice
        };
    }

    return state;
}

function dealCard(state) {
    state.dealtCard = state.pile[0];
    state.pile.shift();
}

function renderBoard(state) {
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

                if (state.dealtCard) {
                    slot.addEventListener('click', () => {
                        if (state.placement) {
                            state.board[state.placement.i][state.placement.j] = null;
                        }

                        state.board[i][j] = state.dealtCard;

                        if (state.autoDeal) {
                            dealCard(state);
                        } else {
                            state.placement = { i, j };
                            state.topCardVisible = false;
                        }

                        if (!state.autoDeal && state.pile.length === 0) state.dealtCard = null;

                        render(state);
                    });
                }
            }

            row.append(slot);
        }

        board.append(row);
    }
}

function renderAutoDeal(state) {
    const div = create('div.autodeal');

    const checkbox = create('input#autodeal');
    checkbox.setAttribute('type', 'checkbox');
    if (state.autoDeal) checkbox.setAttribute('checked', true);
    checkbox.addEventListener('change', () => {
        state.autoDeal = !state.autoDeal;
        if (!state.placement && !state.topCardVisible) dealCard(state);
        state.topCardVisible = true;
        state.placement = null;
        render(state);
    });
    const label = create('label');
    label.setAttribute('for', 'autodeal');
    label.innerHTML = 'Autodeal';

    div.append(checkbox, label);

    return div;
}

function renderPile(state) {
    const pile = get('pile');

    clear(pile);

    const deck = create('div.deck');

    if (state.topCardVisible) {
        deck.classList.add('visible', suitClasses[state.dealtCard.suit]);
        deck.innerHTML = `${cardValue(state.dealtCard.value)}${state.dealtCard.suit}`;
    } else {
        deck.addEventListener('click', () => {
            state.topCardVisible = true;
            dealCard(state);
            state.placement = null;
            render(state);
        });
    }

    pile.append(deck, renderAutoDeal(state));
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

function calcScores(state) {
    const hands = [];

    for (let i = 0; i < 5; i++) {
        hands.push(calcScore([...state.board[i]]));
    }

    for (let j = 0; j < 5; j++) {
        hands.push(calcScore(state.board.map((row) => row.slice(j, j + 1)).flat()));
    }

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

const emojiHand = ({ name, suit }) => {
    switch (name) {
        case 'Royal Flush': return '👑';
        case 'Straight Flush': return '🍍';
        case 'Four of a Kind': return '4️⃣';
        case 'Full House': return '🏠';
        case 'Flush': return suit;
        case 'Straight': return '🔢';
        case 'Three of a Kind': return '3️⃣';
        case 'Two Pairs': return '👯';
        case 'One Pair': return '🍐';
        default:
            console.log(name);
            return '';
    }
}

function generateShare(scores) {
    const share = [
        'Poker Squares by @emh',
        key(),
        scores.filter((s) => s !== null).map(emojiHand).join(''),
        `Score: ${totalScore(scores)}`,
        'https://emh.io/cards/ps'
    ];

    return {
        title: 'Poker Squares',
        text: share.join('\n')
    };
}

function handleCopy(data) {
    navigator.clipboard.writeText(data.text);
}

function handleShare(data) {
    if (navigator.canShare && navigator.canShare(data)) {
        navigator.share(data);
    } else {
        handleCopy(data);
    }
}

function renderShareDialog(state) {
    const scores = calcScores(state);
    const shareData = generateShare(scores);

    const app = get('app');
    const dialog = create('dialog');

    const div = create('div');
    const scoreDiv = renderScore(scores);
    const message = create('p');

    message.innerHTML = `You're finished! You scored ${totalScore(scores)}. Here are the hands you made.`;

    const buttonDiv = create('div.buttons');

    if (state.practice) {
        buttonDiv.append(
            button('Play', () => {
                play(false);
                dialog.remove();
            }),
            button('Practice', () => {
                play(true);
                dialog.remove();
            })
        );
    } else {
        buttonDiv.append(
            button('Share', () => handleShare(shareData)),
            button('Copy', (e) => {
                goal('Shared');
                e.target.innerHTML = 'Copied!';
                handleCopy(shareData);
                setTimeout(() => e.target.innerHTML = 'Copy', 1000);
            }),
            button('Practice', () => {
                play(true);
                dialog.remove();
            }),
            button('OK', () => dialog.remove())
        );
    }

    div.append(
        message,
        scoreDiv,
        buttonDiv
    );

    dialog.append(div);

    app.append(dialog);
    dialog.showModal();
}

function render(state) {
    console.log(state);

    if (!state.practice) saveGame(state);

    renderBoard(state);

    if (state.pile.length > 0 || state.dealtCard) {
        renderPile(state);
    } else {
        renderShareDialog(state);
    }
}

function play(practice) {
    if (practice) goal('Practice');
    const state = initialize(practice);

    if (state.autoDeal && !state.topCardVisible) {
        state.topCardVisible = true;
        dealCard(state);
    }

    render(state);
}

function renderWelcomeDialog() {
    const app = get('app');
    const dialog = create('dialog');

    const div = create('div');
    const message = create('p');

    message.innerHTML = `Welcome to poker squares. You'll be dealt 25 cards. Arrange them in a 5x5 grid such that you make the best poker hands you can in all 5 rows AND all 5 columns.`;

    const buttonDiv = create('div.buttons');

    buttonDiv.append(
        button('Play', () => {
            play(false);
            dialog.remove();
        }),
        button('Practice', () => {
            play(true);
            dialog.remove();
        })
    );

    div.append(
        message,
        buttonDiv
    );

    dialog.append(div);

    app.append(dialog);
    dialog.showModal();
}

renderWelcomeDialog();

// const autoPlay = () => {
//     const n = 25 - state.pile.length;
//     const { q: i, r: j } = div(n, 5);

//     state.board[i][j] = state.pile[0];
//     state.pile.shift();

//     render(state);

//     if (n < 24) {
//         setTimeout(autoPlay, 250);
//     }
// }

// setTimeout(autoPlay, 250);
