import { Router } from "express";
// TODO imports

const router: Router = Router();

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/users', createUser);
router.delete('/users/:id', deleteUser);

export default router;