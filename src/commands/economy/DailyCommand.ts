import { Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { PrismaClient } from "@prisma/client";

import { EmbedBuilder } from "../../lib";
import { Embed, InteractionResponse, Message, User, range } from "discord.js";

@ApplyOptions<Command.Options>({
    name: "daily",
    description: "Claim your daily rewards.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class DailyCommand extends Command {
    /**
     * @description prisma client instance
     */
    private prisma: PrismaClient = new PrismaClient();

    public override async messageRun(message: Message): Promise<Message> {
        return;
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return;
    }

    private async daily(ctx: Message | Command.ChatInputCommandInteraction, user: User): Promise<Message | InteractionResponse> {
        const db = await this.prisma.user.findUnique({ where: { userId: user.id } });

        if (!db) {
            return await ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Not_Registered")).isErrorEmbed()],
            });
        }

        const rewards: number = this.randint(50, 200);

        try {
            await this.prisma.user.update({ where: { userId: user.id }, data: { balance: { increment: rewards } } });

            return await ctx.reply({
                embeds: [
                    new EmbedBuilder().setDescription(
                        await resolveKey(ctx, "Commands:Daily:Success", { rewards: rewards.toLocaleString("us") })
                    ),
                ],
            });
        } catch (e) {
            void console.log(e);

            return await ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Database_Error")).isErrorEmbed()],
            });
        }
    }

    private randint(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
