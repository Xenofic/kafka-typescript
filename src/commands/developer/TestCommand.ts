import { Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";

@ApplyOptions<Command.Options>({
    name: "test",
    description: "Testing command.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
    preconditions: ["DeveloperOnly"],
})
export class TestCommand extends Command {
    /**
     * @description message command executor
     * @param message message interaction
     * @returns {Message}
     */
    public async messageRun(message: Message): Promise<Message> {
        return await message.reply({ content: "Test!" });
    }
}
