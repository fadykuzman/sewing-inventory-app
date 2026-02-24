import { Pool } from 'pg';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/fabrics/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

export default function fabricsRouter(pool: Pool) {

  const router = Router();

  router.post('/', upload.array('images'), async (req: Request, res: Response, next: NextFunction) => {
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

      const fabric = result.rows[0];
      const files = (req.files as Express.Multer.File[]) ?? [];

      let images: object[] = [];
      let imageWarning: string | undefined;

      if (files.length > 0) {
        try {
          images = await Promise.all(
            files.map((file, index) =>
              pool.query(
                `INSERT INTO fabric_images (fabric_id, file_path, "order") VALUES ($1, $2, $3) RETURNING *`,
                [fabric.id, file.path, index]
              ).then(r => r.rows[0])
            )
          );
        } catch (imageErr) {
          console.error(`[POST /fabrics] Image upload failed for fabric ${fabric.id}:`, imageErr);
          imageWarning = 'Fabric saved, but some images failed to upload. You can retry uploading them.';
        }
      }

      res.status(201).json({
        success: true,
        data: { ...fabric, images },
        ...(imageWarning && { warning: imageWarning }),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;

}
