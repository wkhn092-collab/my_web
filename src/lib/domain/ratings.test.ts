import { describe, expect, it } from 'vitest';
import { summarizeRatings } from './ratings';

describe('summarizeRatings', () => {
  it('shows no average below three real ratings', () => {
    expect(summarizeRatings([])).toBeNull();
    expect(summarizeRatings([{ rating: 5 }, { rating: 5 }])).toBeNull();
  });

  it('counts only testimonials that carry a rating', () => {
    expect(summarizeRatings([{ rating: 5 }, {}, { rating: 4 }, { rating: 4 }])).toEqual({ average: '4.3', count: 3 });
  });

  it('ignores out-of-range values', () => {
    expect(summarizeRatings([{ rating: 9 }, { rating: 0 }, { rating: 5 }, { rating: 5 }])).toBeNull();
  });
});
