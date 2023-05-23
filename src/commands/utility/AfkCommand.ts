import { Command, Args, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { PrismaClient } from "@prisma/client";
import { resolveKey } from "@sapphire/plugin-i18next";
import { InteractionResponse, Message, User, SlashCommandBuilder, GuildMember } from "discord.js";

import { EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "afk",
    description: "Set your afk status.",
    requiredClientPermissions: ["SendMessages", "ManageNicknames"],
    requiredUserPermissions: ["SendMessages"],
})
export class AfkCommand extends Command {
    private prisma: PrismaClient = new PrismaClient();

    /**
     * @description register the application commands
     * @param registry application command registry
     * @returns {void}
     */
    public override registerApplicationCommands(registry: Command.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption((option) => option.setName("reason").setDescription("A reason why you afk.").setRequired(false));

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    /**
     * @description message command executor
     * @param message message interaction
     * @param args message arguments
     * @returns {Message}
     */
    public override async messageRun(message: Message, args: Args): Promise<Message> {
        const user: User = message.author;
        const reason: string = args.finished ? "AFK" : await args.rest("string");
        return (await this.setAfk(message, user, reason)) as Message;
    }

    /**
     * @description slash command executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const user: User = interaction.user;
        const reason: string = interaction.options.getString("reason") ?? "AFK";
        return (await this.setAfk(interaction, user, reason)) as InteractionResponse;
    }

    /**
     *
     * @param ctx interaction context
     * @param user interaction user || message author
     * @param reason afk reason
     * @returns
     */
    private async setAfk(
        ctx: Message | Command.ChatInputCommandInteraction,
        user: User,
        reason: string
    ): Promise<Message | InteractionResponse> {
        const db = await this.prisma.afk.findFirst({ where: { guildId: ctx.guild.id, userId: user.id } });

        const member: GuildMember = await ctx.guild.members.fetch(user.id);
        const currentNickname: string = member.nickname || user.username;

        await member.setNickname(`[AFK] ${currentNickname}`).catch(() => {});

        if (!db) {
            try {
                await this.prisma.afk.create({
                    data: {
                        userId: user.id,
                        guildId: ctx.guild.id,
                        afkReason: reason,
                        afkTimestamp: new Date(),
                        lastNickname: currentNickname,
                    },
                });

                return await ctx.reply({
                    content: await resolveKey(ctx, "Commands:Afk:Success", { reason }),
                });
            } catch (e) {
                console.error(e);
                return await ctx.reply({
                    embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Database_Error")).isErrorEmbed()],
                });
            }
        }
    }
}
