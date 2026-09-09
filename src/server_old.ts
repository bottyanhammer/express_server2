import http, {type IncomingMessage, type ServerResponse} from 'node:http';
import type { ResultSetHeader } from 'mysql2';
import { pool } from './db.js';
import type { UserRow, CreateUserBody } from './types.js';

const PORT = process.env.PORT ?? 3000;

function sendJson(res: ServerResponse, statusCode: number, payload: unknown): void{
    res.writeHead(statusCode, {'Content-Type':'application/json'});
    res.end(JSON.stringify(payload));
}

function readBody(req: IncomingMessage): Promise<CreateUserBody> {
    return new Promise((resolve, reject)=> {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            if (!data) return resolve({});
            try {
                resolve(JSON.parse(data) as CreateUserBody);
            } catch (error) {
                reject(error)
            }
        });
        req.on('error', reject);
    })
}

const server = http.createServer(async(req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const { pathname } = url;

    try {
        // GET /users
        if (req.method === 'GET' && pathname === '/users') {
            const [rows] = await pool.query<UserRow[]>(
                'SELECT id, name, email, created_at FROM users'
            );
            return sendJson(res, 200, rows);
        }

        // GET /users/:id
        const userUrl = pathname.match(/^\/users\/(\d+)$/)
        if (req.method === 'GET' && userUrl) {
            const id = Number(userUrl?.[1])
            const [ rows ] = await pool.query<UserRow[]>(
                'SELECT id, name, email, created_at FROM users WHERE id = ?', [id]
            );
            if (rows.length === 0) {
                return sendJson(res, 404, {message: `Nincs ilyen felhasználó: ${id}`});
            }
            return sendJson(res, 200, rows[0]);
        }

       // POST /users
       if (req.method === 'POST' && pathname === '/users'){
        const body = await readBody(req);
        const {name, email, password} = body;
        if (!name || !email || !password) {
            return sendJson(res, 400, {message: 'Adatok megadása kötelező!'});
        }
        // Adatbázisba felvitel:
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (name, email, password) VALUES (?,?,?)', [name, email, password]
        );
        return sendJson(res, 201, {id:result.insertId, name, password})
       } 
       return sendJson(res, 404, {message: "Nincs ilyen végpont."});

    } catch (error) {
        return sendJson(res, 500, {message: "Szerverhiba", error: error as Error}.message);
    }
});

server.listen(PORT, () => console.log(`Sever is running at http://localhost:${PORT}`));