import { FabricTypeRepository } from '../../repositories/fabricTypeRepository';

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

      await repo.findAll();

      const sql = pool.query.mock.calls[0][0];
      expect(sql).not.toContain('available');
    });

    it('filters by available=true when requested', async () => {
      const pool = createMockPool([{ id: 1, name_en: 'Cotton', available: true }]);
      const repo = new FabricTypeRepository(pool);

      await repo.findAll({ available: true });

      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain('ft.available = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([true]);
    });

    it('filters by available=false when requested', async () => {
      const pool = createMockPool([]);
      const repo = new FabricTypeRepository(pool);

      await repo.findAll({ available: false });

      const sql = pool.query.mock.calls[0][0];
      expect(sql).toContain('ft.available = $1');
      expect(pool.query.mock.calls[0][1]).toEqual([false]);
    });
  });

  describe('updateAvailable', () => {
    it('updates the available flag and returns the updated row', async () => {
      const updatedRow = { id: 5, name_en: 'Silk', available: false };
      const pool = createMockPool([updatedRow]);
      const repo = new FabricTypeRepository(pool);

      const result = await repo.updateAvailable(5, false);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE fabric_types'),
        [false, 5]
      );
      expect(result).toEqual(updatedRow);
    });

    it('returns null when fabric type not found', async () => {
      const pool = createMockPool([]);
      const repo = new FabricTypeRepository(pool);

      const result = await repo.updateAvailable(999, true);

      expect(result).toBeNull();
    });
  });
});
