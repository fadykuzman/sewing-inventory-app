import { Router } from 'express';

const router = Router();

router.get('/.well-known/assetlinks.json', (_req, res) => {
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.vanillaandcaramel.sewing',
        sha256_cert_fingerprints: [
          'E7:A9:71:41:55:CA:B5:99:61:AA:7B:F4:99:60:8C:DA:1D:07:F9:66:E1:9C:01:A9:10:D6:C3:C3:54:CF:15:9B',
        ],
      },
    },
  ]);
});

router.get('/invite', (req, res) => {
  const token = req.query.token as string | undefined;

  if (!token) {
    res.status(400).send('Missing token');
    return;
  }

  const appUrl = `bunni-fabrics://open?token=${encodeURIComponent(token)}`;

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bunni Fabrics - Invitation</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px 20px; }
    a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #6750A4; color: white; text-decoration: none; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Bunni Fabrics</h1>
  <p>You've been invited to view a fabric collection.</p>
  <a href="${appUrl}">Open in App</a>
  <script>window.location.href = "${appUrl}";</script>
</body>
</html>`);
});

export default router;
