import "dotenv/config";
import { Client } from "./client";

const TOKEN: string = process.env.TOKEN == undefined ? "" : process.env.TOKEN;

new Client().login(TOKEN);
