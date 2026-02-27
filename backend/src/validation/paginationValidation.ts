interface PaginationParams {
  limit: number;
  offset: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  const rawLimit = Number(query.limit);
  const rawOffset = Number(query.offset);

  const limit = rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = rawOffset > 0 ? rawOffset : 0;
  return { limit, offset };
}
