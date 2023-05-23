import { Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { InteractionResponse, Message, User, SlashCommandBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";

import { EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "wallet",
    aliases: ["cash"],
    description: "Display your wallet.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class WalletCommand extends Command {
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
        return (await this.showWallet(message, message.author)) as Message;
    }

    /**
     * @description slash command executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return (await this.showWallet(interaction, interaction.user)) as InteractionResponse;
    }

    /**
     * @description show user wallet.
     * @param ctx interaction context
     * @param user interaction user
     * @returns {Message | InteractionResponse}
     */
    private async showWallet(ctx: Message | Command.ChatInputCommandInteraction, user: User): Promise<Message | InteractionResponse> {
        const db = await this.prisma.user.findUnique({ where: { userId: user.id } });

        if (!db) {
            return await ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Not_Registered")).isErrorEmbed()],
            });
        }

        return await ctx.reply({
            embeds: [
                new EmbedBuilder().setDescription(
                    await resolveKey(ctx, "Commands:Wallet:Description", { balance: db.balance.toLocaleString("us") })
                ),
            ],
        });
    }
}
