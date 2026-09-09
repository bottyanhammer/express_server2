import 'dotenv/config';
import express, {type Request, type Response, type NextFunction} from 'express';
import cors from 'cors';
import router from './router.js';

const PORT = process.env.PORT ?? 3000;

const server = express();

server.use(cors());
server.use(express.json());

server.use('/api', router);

server.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res
    .status(500)
    .json({error: 'Szerverhiba'});
})

server.listen(PORT, () => console.log(`Express-server is running at http://localhost:${PORT}`));