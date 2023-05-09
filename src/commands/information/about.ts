import { Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Guild, InteractionResponse, Message, SlashCommandBuilder, bold } from "discord.js";

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

        const embed: EmbedBuilder = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 1024 }) })
            .setDescription(
                `All-multi purpose Discord bot & Honkai: Star Rail related that developed by ${bold("Zarr")} from [${bold(
                    guild.name
                )}](https://bit.ly/stellaris-indo). Join us and enhance the experience of playing Honkai: Star Rail and strengthen friendships in the wider game community.`
            )
            .addFields([
                { name: "⊰・Developer", value: "" },
                { name: "⊰・Network Server", value: "" },
                { name: "⊰・Network Bot", value: "" },
            ])
            .setColor("#960078");

        return [embed];
    }
}
