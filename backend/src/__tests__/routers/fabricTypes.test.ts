import express from 'express';
import request from 'supertest';
import fabricTypesRouter from '../../routers/fabricTypes';

function createMockPool(queryFn?: jest.Mock) {
  return {
    query: queryFn ?? jest.fn().mockResolvedValue({ rows: [] }),
  } as any;
}

function createApp(pool: any) {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/fabric-types', fabricTypesRouter(pool));
  return app;
}

describe('GET /api/v1/fabric-types', () => {
  it('returns all types when no query param', async () => {
    const rows = [{ id: 1, name_en: 'Cotton', available: true }];
    const pool = createMockPool(jest.fn().mockResolvedValue({ rows }));
    const app = createApp(pool);

    const res = await request(app).get('/api/v1/fabric-types');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(rows);
    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toContain('available');
  });

  it('filters by available=true when query param is set', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    await request(app).get('/api/v1/fabric-types?available=true');

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toContain('ft.available = $1');
    expect(pool.query.mock.calls[0][1]).toEqual([true]);
  });

  it('ignores invalid available param values', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    await request(app).get('/api/v1/fabric-types?available=banana');

    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toContain('available');
  });
});

describe('PATCH /api/v1/fabric-types/:id', () => {
  it('updates available flag and returns the type', async () => {
    const updated = { id: 5, name_en: 'Silk', available: false };
    const pool = createMockPool(jest.fn().mockResolvedValue({ rows: [updated] }));
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/5')
      .send({ available: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(updated);
  });

  it('returns 404 when fabric type not found', async () => {
    const pool = createMockPool(jest.fn().mockResolvedValue({ rows: [] }));
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/999')
      .send({ available: true });

    expect(res.status).toBe(404);
  });

  it('returns 400 when available is not a boolean', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/5')
      .send({ available: 'yes' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when available is missing', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/5')
      .send({});

    expect(res.status).toBe(400);
  });
});
