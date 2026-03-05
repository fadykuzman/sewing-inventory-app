import express from 'express';
import request from 'supertest';
import fabricTypesRouter from '../../routers/fabricTypes';

const TEST_USER = { uid: 'test-user-123', email: 'test@example.com' };

function createMockPool(queryFn?: jest.Mock) {
  return {
    query: queryFn ?? jest.fn().mockResolvedValue({ rows: [] }),
  } as any;
}

function createApp(pool: any) {
  const app = express();
  app.use(express.json());
  // Inject fake user to simulate auth middleware
  app.use((req, _res, next) => {
    (req as any).user = TEST_USER;
    next();
  });
  app.use('/api/v1/fabric-types', fabricTypesRouter(pool));
  return app;
}

describe('GET /api/v1/fabric-types', () => {
  it('returns all types when no query param', async () => {
    const rows = [{ id: 1, name_en: 'Cotton', hidden: false }];
    const pool = createMockPool(jest.fn().mockResolvedValue({ rows }));
    const app = createApp(pool);

    const res = await request(app).get('/api/v1/fabric-types');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(rows);
    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toContain('WHERE');
  });

  it('filters by hidden=false when query param is set', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    await request(app).get('/api/v1/fabric-types?hidden=false');

    const sql = pool.query.mock.calls[0][0];
    expect(sql).toContain('uftp.hidden IS NULL OR uftp.hidden = false');
  });

  it('ignores invalid hidden param values', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    await request(app).get('/api/v1/fabric-types?hidden=banana');

    const sql = pool.query.mock.calls[0][0];
    expect(sql).not.toContain('WHERE');
  });
});

describe('PATCH /api/v1/fabric-types/:id', () => {
  it('toggles hidden and returns the type', async () => {
    const typeRow = { id: 5, name_en: 'Silk' };
    const updatedRow = { id: 5, name_en: 'Silk', hidden: true, fabric_count: 0 };
    const queryFn = jest.fn()
      .mockResolvedValueOnce({ rows: [typeRow] })   // findById
      .mockResolvedValueOnce({ rows: [] })           // upsert
      .mockResolvedValueOnce({ rows: [updatedRow] }); // select
    const pool = createMockPool(queryFn);
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/5')
      .send({ hidden: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(updatedRow);
  });

  it('returns 404 when fabric type not found', async () => {
    const pool = createMockPool(jest.fn().mockResolvedValue({ rows: [] }));
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/999')
      .send({ hidden: true });

    expect(res.status).toBe(404);
  });

  it('returns 400 when hidden is not a boolean', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/5')
      .send({ hidden: 'yes' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when hidden is missing', async () => {
    const pool = createMockPool();
    const app = createApp(pool);

    const res = await request(app)
      .patch('/api/v1/fabric-types/5')
      .send({});

    expect(res.status).toBe(400);
  });
});
