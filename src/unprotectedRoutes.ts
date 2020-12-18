import Router from '@koa/router';
import { auth, general } from './controller';

const unprotectedRouter = new Router({
	prefix: '/api'
});

unprotectedRouter.post('/auth', auth.auth);
unprotectedRouter.put('/register', auth.register);
unprotectedRouter.get('/online', general.getOnlineUsers);

export { unprotectedRouter };
