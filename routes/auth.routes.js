import { Router} from 'express';
const authRouter = Router();

authRouter.post('/sign-up', (req, res) => { res.send({title: 'Sign-up endpoint is working!'});})
authRouter.post('/sign-in', (req, res) => { res.send( {title: 'Sign-in endpoint is working!'});})
authRouter.post('/sign-out', (req, res) => { res.send( {title: 'Sign-out endpoint is working!'});})

export default authRouter;