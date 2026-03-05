import { FabricTypeRepository } from '../../repositories/fabricTypeRepository';

const TEST_USER_ID = 'test-user-123';

function createMockPool(rows: unknown[] = []) {
  return {
    query: jest.fn().mockResolvedValue({ rows }),
  } as any;
}

describe('FabricTypeRepository', () => {
  describe('findAll', () => {
    it('returns all types when no filter is provided', async () => {
      const pool = createMockPool([{ id: 1, name_en: 'Cotton' }]);
      const repo = new FabricTypeRepository(pool);

      await repo.findAll(TEST_USER_ID);

      const sql = pool.query.mock.calls[0][0];
      expect(sql).not.toContain('WHERE');
      expect(pool.query.mock.calls[0][1]).toEqual([TEST_USER_ID]);
    });

    it('filters by hidden=false when requested', async () => {
      const pool = createMockPool([{ id: 1, name_en: 'Cotton', hidden: false }]);
      const repo = new FabricTypeRepository(pool);

      await repo.findAll(TEST_USER_ID, { hidden: false });

      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain('uftp.hidden IS NULL OR uftp.hidden = false');
      expect(pool.query.mock.calls[0][1]).toEqual([TEST_USER_ID]);
    });

    it('filters by hidden=true when requested', async () => {
      const pool = createMockPool([]);
      const repo = new FabricTypeRepository(pool);

      await repo.findAll(TEST_USER_ID, { hidden: true });

      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain('uftp.hidden = true');
      expect(pool.query.mock.calls[0][1]).toEqual([TEST_USER_ID]);
    });
  });

  describe('toggleHidden', () => {
    it('upserts preference and returns the updated type', async () => {
      const typeRow = { id: 5, name_en: 'Silk' };
      const updatedRow = { id: 5, name_en: 'Silk', hidden: true, fabric_count: 0 };
      const pool = createMockPool();
      // findById call, then upsert, then select
      pool.query
        .mockResolvedValueOnce({ rows: [typeRow] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [updatedRow] });
      const repo = new FabricTypeRepository(pool);

      const result = await repo.toggleHidden(TEST_USER_ID, 5, true);

      expect(result).toEqual(updatedRow);
      // Second call is the upsert
      const upsertSql = pool.query.mock.calls[1][0];
      expect(upsertSql).toContain('user_fabric_type_preferences');
      expect(pool.query.mock.calls[1][1]).toEqual([TEST_USER_ID, 5, true]);
    });

    it('returns null when fabric type not found', async () => {
      const pool = createMockPool([]);
      const repo = new FabricTypeRepository(pool);

      const result = await repo.toggleHidden(TEST_USER_ID, 999, true);

      expect(result).toBeNull();
    });
  });
});
