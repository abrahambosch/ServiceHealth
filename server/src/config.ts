import { join } from 'path'
// import dotenv from "dotenv";
// dotenv.config({path: join(__dirname, "..", ".env")});

export const PORT = process.env.PORT || 3001
export const secretKey = process.env.SECRET_KEY || 'supersecretkey12345'

export const userFile = process.env.USER_FILE || join(__dirname, "data/users.json")
export const configFile = process.env.CONFIG_FILE || join(__dirname, "data/config.json")

console.log("process.env: ", process.env);

console.log("config file:", {
    userFile,
    configFile
});