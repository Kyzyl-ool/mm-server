import Router from '@koa/router';
import { auth } from './controller';

const unprotectedRouter = new Router();

unprotectedRouter.post('/auth', auth.auth);
unprotectedRouter.put('/register', auth.register);

export { unprotectedRouter };
