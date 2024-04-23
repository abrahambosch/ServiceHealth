import dotenv from "dotenv";
import { join } from 'path'
dotenv.config();

export const PORT = process.env.PORT || 3001
export const secretKey = process.env.SECRET_KEY || 'supersecretkey12345'

export const userFile = process.env.USER_FILE || join(__dirname, "../users.json")
export const configFile = process.env.CONFIG_FILE || join(__dirname, "../config.json")

