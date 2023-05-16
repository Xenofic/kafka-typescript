import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActivityType } from "discord.js";

import { Presences } from "../../lib/utils/Constant";

@ApplyOptions<Listener.Options>({
    name: "Ready",
    once: false,
    event: Events.ClientReady,
})
export class ReadyListener extends Listener {
    public async run(): Promise<void> {
        const { logger, client } = this.container;

        logger.info(`Logged in as ${client.user.tag}`);

        client.user.setPresence({
            activities: [
                {
                    name: Presences[0],
                    type: ActivityType.Watching,
                },
            ],
            status: "online",
        });
    }
}
