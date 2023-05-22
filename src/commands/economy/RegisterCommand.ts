import { Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { InteractionResponse, Message, User, SlashCommandBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";

import { EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "register",
    description: "Register your bank account.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class RegisterCommand extends Command {
    /**
     * @description prisma client instance
     */
    private prisma: PrismaClient = new PrismaClient();

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
        return (await this.registerAccount(message, message.author)) as Message;
    }

    /**
     * @description slash command executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return (await this.registerAccount(interaction, interaction.user)) as InteractionResponse;
    }

    /**
     * @description register your bank account.
     * @param ctx interaction context
     * @param user interaction user
     * @returns {Message | InteractionResponse}
     */
    private async registerAccount(ctx: Message | Command.ChatInputCommandInteraction, user: User): Promise<Message | InteractionResponse> {
        const db = await this.prisma.user.findUnique({ where: { userId: user.id } });

        if (db) {
            return ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Already_Registered")).isErrorEmbed()],
            });
        }

        try {
            await this.prisma.user.create({ data: { userId: user.id, balance: 1000 } });

            return ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Register:Success")).isSuccessEmbed()],
            });
        } catch (e) {
            void console.error(e);

            return await ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Database_Error")).isErrorEmbed()],
            });
        }
    }
}
