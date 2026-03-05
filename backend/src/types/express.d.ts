import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    user?: { uid: string; email: string };
    viewer?: { ownerId: string };
    readOnly?: boolean;
  }
}
