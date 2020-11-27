import Router from '@koa/router';
import { auth } from './controller';

const unprotectedRouter = new Router({
	prefix: '/api'
});

unprotectedRouter.post('/auth', auth.auth);
unprotectedRouter.put('/register', auth.register);
unprotectedRouter.get('/auth', auth.getAuth);

export { unprotectedRouter };
