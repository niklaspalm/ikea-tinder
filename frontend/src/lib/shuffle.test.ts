import { describe, expect, it } from 'vitest';
import { seededRandom, shuffleWithinGroups } from './shuffle';

const ranked = Array.from({ length: 200 }, (_, rank) => rank);
const groupOf = (rank: number) => Math.floor(rank / 50);

describe('shuffleWithinGroups', () => {
	it('keeps every item exactly once', () => {
		const shuffled = shuffleWithinGroups(ranked, 4, seededRandom(1));
		expect(shuffled).toHaveLength(200);
		expect([...shuffled].sort((a, b) => a - b)).toEqual(ranked);
	});

	it('keeps the four newness groups in order', () => {
		const shuffled = shuffleWithinGroups(ranked, 4, seededRandom(2));
		expect(shuffled.map(groupOf)).toEqual(ranked.map(groupOf));
	});

	it('actually reorders items inside a group', () => {
		const shuffled = shuffleWithinGroups(ranked, 4, seededRandom(3));
		expect(shuffled.slice(0, 50)).not.toEqual(ranked.slice(0, 50));
	});

	it('is stable for a seed and differs between seeds', () => {
		expect(shuffleWithinGroups(ranked, 4, seededRandom(42))).toEqual(shuffleWithinGroups(ranked, 4, seededRandom(42)));
		expect(shuffleWithinGroups(ranked, 4, seededRandom(42))).not.toEqual(
			shuffleWithinGroups(ranked, 4, seededRandom(43))
		);
	});

	it('handles counts that do not divide evenly, and empty input', () => {
		const shuffled = shuffleWithinGroups([0, 1, 2, 3, 4, 5, 6], 4, seededRandom(5));
		expect([...shuffled].sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
		expect(shuffleWithinGroups([], 4, seededRandom(5))).toEqual([]);
	});

	it('does not mutate its input', () => {
		const input = [...ranked];
		shuffleWithinGroups(input, 4, seededRandom(6));
		expect(input).toEqual(ranked);
	});
});
