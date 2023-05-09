"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("./client");
const TOKEN = process.env.TOKEN == undefined ? "" : process.env.TOKEN;
new client_1.Client().login(TOKEN);
