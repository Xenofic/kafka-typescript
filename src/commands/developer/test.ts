import { Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";

@ApplyOptions<Command.Options>({
    name: "test",
    description: "Testing command.",
})
export class TestCommand extends Command {
    public async messageRun(message: Message) {}
}
