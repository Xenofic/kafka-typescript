import { Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Guild, InteractionResponse, Message, SlashCommandBuilder, User, bold } from "discord.js";

import { DeveloperIds } from "../../lib/Constant";

@ApplyOptions<Command.Options>({
    name: "about",
    description: "Get information about the bot.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class AboutCommand extends Command {
    public override registerApplicationCommands(registry: Command.Registry): void {
        const command: SlashCommandBuilder = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    public override async messageRun(message: Message): Promise<Message> {
        return message.reply({ embeds: await this.response() });
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return interaction.reply({ embeds: await this.response() });
    }

    private async response(): Promise<EmbedBuilder[]> {
        const { user } = this.container.client;
        const guild: Guild = await this.container.client.guilds.fetch("1006143962714755122");

        const devs: string[] = [
            `> [${bold((await this.getUser(DeveloperIds[0])).tag)}](https://instagram.com/ravenxyzer)`,
            `> [${bold((await this.getUser(DeveloperIds[1])).tag)}](https://github.com/aeviterna)`,
        ];

        const networkServers: string[] = [
            `> [${bold("Genshin Impact ID")}](https://discord.gg/giid)`,
            `> [${bold("Nolep Gang's")}](https://discord.gg/BPQBmwTemY)`,
            `> [${bold("Simps Waifu Community")}](https://discord.gg/simpswaifu)`,
        ];

        const embed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 1024 }) })
            .setDescription(
                `All-multi purpose Discord bot & Honkai: Star Rail related from [${bold(
                    guild.name
                )}](https://bit.ly/stellaris-indo). Join us and enhance the experience of playing Honkai: Star Rail and strengthen friendships in the wider game community.`
            )
            .addFields([
                { name: "⊰・Developers・⊱", value: devs.join("\n") },
                { name: "⊰・Network Servers・⊱", value: networkServers.join("\n") },
            ])
            .setColor("#960078");

        return [embed];
    }

    private async getUser(id: string): Promise<User> {
        return await this.container.client.users.fetch(id);
    }
}
