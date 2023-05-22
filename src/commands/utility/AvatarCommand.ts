import { Command, Args, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { InteractionResponse, SlashCommandBuilder, User, Message, GuildMember } from "discord.js";

import { EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "avatar",
    aliases: ["av"],
    description: "Display user avatar(s).",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class AvatarCommand extends Command {
    /**
     * @description register the application commands
     * @param registry application command registry
     * @returns {void}
     */
    public override registerApplicationCommands(registry: Command.Registry): void {
        const command: SlashCommandBuilder = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    /**
     * @description message command executor
     * @param message message interaction
     * @returns {Message}
     */
    public override async messageRun(message: Message): Promise<Message> {
        return (await this.showAvatar(message, message.author)) as Message;
    }

    /**
     * @description slash command executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return (await this.showAvatar(interaction, interaction.user)) as InteractionResponse;
    }

    private async showAvatar(ctx: Message | Command.ChatInputCommandInteraction, user: User): Promise<Message | InteractionResponse> {
        const userInGuild: GuildMember = await ctx.guild.members.fetch(user.id);

        const avatars: EmbedBuilder[] =
            user.displayAvatarURL() !== userInGuild.displayAvatarURL()
                ? [
                      new EmbedBuilder()
                          .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 512 }) })
                          .setDescription(`Link: [**Global Avatar URL**](${user.avatarURL({ size: 4096 })})`)
                          .setImage(user.displayAvatarURL({ size: 4096 })),
                      new EmbedBuilder()
                          .setImage(userInGuild.displayAvatarURL({ size: 4096 }))
                          .setDescription(`Link: [**Server Avatar URL**](${userInGuild.avatarURL({ size: 4096 })})`),
                  ]
                : [
                      new EmbedBuilder()
                          .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 512 }) })
                          .setDescription(`Link: [**Global Avatar URL**](${user.avatarURL({ size: 4096 })})`)
                          .setImage(user.displayAvatarURL({ size: 4096 })),
                  ];

        return ctx.reply({ embeds: [...avatars] });
    }
}
