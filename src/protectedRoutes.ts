import { SwaggerRouter } from 'koa-swagger-decorator';
import { user, chat } from './controller';

const protectedRouter = new SwaggerRouter({
	prefix: '/api',
});

// USER ROUTES
protectedRouter.get('/users', user.getUsers);
protectedRouter.get('/users/:id', user.getUser);
protectedRouter.post('/users', user.createUser);
protectedRouter.put('/users/:id', user.updateUser);
protectedRouter.delete('/users/:id', user.deleteUser);
protectedRouter.delete('/testusers', user.deleteTestUsers);

protectedRouter.get('/chat', chat.getChats);

// Swagger endpoint
protectedRouter.swagger({
    title: 'mm-server',
    description: 'API REST using NodeJS and KOA framework, typescript. TypeORM for SQL with class-validators. Middlewares JWT, CORS, Winston Logger.',
    version: '1.5.0'
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
protectedRouter.mapDir(__dirname);

export { protectedRouter };
