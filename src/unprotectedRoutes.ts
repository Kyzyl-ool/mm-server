import Router from '@koa/router';
import { general, auth } from './controller';

const unprotectedRouter = new Router();

unprotectedRouter.get('/', general.helloWorld);
unprotectedRouter.post('/auth', auth.auth);

export { unprotectedRouter };
