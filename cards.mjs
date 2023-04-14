import { range } from './utils.mjs';

export const SPADES = '♠️';
export const CLUBS = '♣️';
export const HEARTS = '♥️';
export const DIAMONDS = '♦️';

export const suits = [SPADES, CLUBS, HEARTS, DIAMONDS];

export const ACE = 1;
export const JACK = 11;
export const QUEEN = 12;
export const KING = 13;

export const deck = suits.map((s) => range(ACE, KING).map((v) => ({ suit: s, value: v }))).flat();

export const sort = (hand) => [...hand].sort((c1, c2) => c1.value - c2.value);

export const aKind = (cards) => cards.every((card) => card.value === cards[0].value);
export const flush = (hand) => hand.every((card) => card.suit === hand[0].suit);
export const royalStraight = (hand) => {
    const sorted = sort(hand);

    return (sorted[0].value === ACE &&
        sorted[1].value === 10 &&
        sorted[2].value === JACK &&
        sorted[3].value === QUEEN &&
        sorted[4].value === KING);
};
export const straight = (hand) => {
    if (royalStraight(hand)) return true;

    const sorted = sort(hand);

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].value - sorted[i - 1].value !== 1) return false;
    }

    return true;
};
export const royalFlush = (hand) => {
    if (!flush(hand)) return false;

    return royalStraight(hand);
};
export const fourOfAKind = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 4))) return true;
    if (aKind(sorted.slice(1, 5))) return true;

    return false;
};
export const fullHouse = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 2)) && aKind(sorted.slice(2, 5))) return true;
    if (aKind(sorted.slice(0, 3)) && aKind(sorted.slice(3, 5))) return true;

    return false;
};
export const threeOfAKind = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 3))) return true;
    if (aKind(sorted.slice(1, 4))) return true;
    if (aKind(sorted.slice(2, 5))) return true;

    return false;
};
export const twoPairs = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 2)) && aKind(sorted.slice(2, 4))) return true;
    if (aKind(sorted.slice(0, 2)) && aKind(sorted.slice(3, 5))) return true;
    if (aKind(sorted.slice(1, 3)) && aKind(sorted.slice(3, 5))) return true;

    return false;
};
export const onePair = (hand) => {
    const sorted = sort(hand);

    if (aKind(sorted.slice(0, 2))) return true;
    if (aKind(sorted.slice(1, 3))) return true;
    if (aKind(sorted.slice(2, 4))) return true;
    if (aKind(sorted.slice(3, 5))) return true;

    return false;
};
