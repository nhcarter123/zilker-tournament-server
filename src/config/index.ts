import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

// Database Settings
export const MONGO_URI = process.env.MONGO || 'mongodb://localhost/myserver';

export const jwtSecret = process.env.SECRET || 'awesome_secret';
export const PORT = process.env.PORT || 4000; // todo fix
