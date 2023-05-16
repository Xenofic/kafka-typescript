import "dotenv/config";
import "@sapphire/plugin-i18next/register";

import { Client } from "./lib";

void new Client().login(process.env.TOKEN);
