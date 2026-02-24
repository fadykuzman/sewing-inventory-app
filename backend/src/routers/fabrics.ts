import { Pool } from 'pg';
import { Router, Request, Response, NextFunction } from 'express';

export default function fabricsRouter(pool: Pool) {

  const router = Router();

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = req.body;

      if (!type || amount_meters == null) {
        res.status(400).json({ success: false, error: 'type and amount_meters are required.' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO fabrics (type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas]
      );

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) {
      next(err);
    }
  });

  return router;

}
