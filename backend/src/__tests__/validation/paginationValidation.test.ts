import { parsePagination } from '../../validation/paginationValidation';

describe('parsePagination', () => {
  it('returns defaults when no params provided', () => {
    const result = parsePagination({});
    expect(result).toEqual({ limit: 20, offset: 0 });
  });

  it('parses valid limit and offset', () => {
    const result = parsePagination({ limit: '10', offset: '30' });
    expect(result).toEqual({ limit: 10, offset: 30 });
  })

  it('clamps limit to max 100', () => {
    const result = parsePagination({ limit: '150' });
    expect(result).toEqual({ limit: 100, offset: 0 });
  })


  it('defaults negative values to 0 for offset and default for limit', () => {
    const result = parsePagination({ limit: '-5', offset: '-10' });
    expect(result).toEqual({ limit: 20, offset: 0 });
  });

});
