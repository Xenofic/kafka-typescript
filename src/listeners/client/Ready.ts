import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Time } from "@sapphire/time-utilities";
import { ActivityType } from "discord.js";

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
                    name: "Interstellaris Indonesia",
                    type: ActivityType.Watching,
                },
            ],
            status: "online",
        });
    }
}
