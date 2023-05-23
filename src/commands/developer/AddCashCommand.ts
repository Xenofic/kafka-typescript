import { Args, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { PrismaClient } from "@prisma/client";
import { Message, User } from "discord.js";

import { EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "addCash",
    description: "Add user cash.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
    preconditions: ["DeveloperOnly"],
})
export class AddCashCommand extends Command {
    /**
     * @description prisma client instance
     */
    private prisma: PrismaClient = new PrismaClient();

    /**
     * @description message command executor
     * @param message message interaction
     * @returns {Message}
     */
    public override async messageRun(message: Message, args: Args): Promise<Message> {
        const target: User = await args.pick("user");
        const balance: number = await args.pick("number");

        const targetDb = await this.prisma.user.findUnique({ where: { userId: target.id } });

        if (!targetDb) {
            return await message.reply({
                embeds: [
                    new EmbedBuilder().setDescription(await resolveKey(message, "Commands:Denied:User_Not_Registered")).isErrorEmbed(),
                ],
            });
        }

        try {
            await this.prisma.user.update({ where: { userId: target.id }, data: { balance: { increment: balance } } });

            return await message.reply({ content: `Success add $${balance.toLocaleString("us")} balance to <@${target.id}>` });
        } catch (e) {
            void console.log(e);

            return await message.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(message, "Commands:Denied:Database_Error")).isErrorEmbed()],
            });
        }
    }
}
