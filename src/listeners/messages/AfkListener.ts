import { Events, Listener } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { PrismaClient } from "@prisma/client";
import { Message, User } from "discord.js";

import { EmbedBuilder } from "../../lib";

const prisma: PrismaClient = new PrismaClient();
const embed: EmbedBuilder = new EmbedBuilder();

@ApplyOptions<Listener.Options>({
    name: "Afk",
    once: false,
    event: Events.MessageCreate,
})
export class AfkListener extends Listener {
    /**
     * @description message listener executor
     * @param message message interaction
     * @returns {Message}
     */
    public async run(message: Message): Promise<Message | void> {
        if (message.author.bot) return;

        const db = await prisma.afk.findFirst({ where: { guildId: message.guild.id, userId: message.author.id } });

        if (db) {
            const nickname: string = message.member.nickname == db.lastNickname ? null : db.lastNickname;
            await message.member.setNickname(nickname).catch(() => {});

            await prisma.afk
                .deleteMany({ where: { AND: [{ guildId: message.guild.id }, { userId: message.author.id }] } })
                .catch(async (e) => {
                    console.error(e);
                    return await message.reply({
                        embeds: [embed.setDescription(await resolveKey(message, "Commands:Denied:Database_Error")).isErrorEmbed()],
                    });
                });

            return message.reply({ content: await resolveKey(message, "Commands:Afk:No_Longer_Afk", { user: `<@${db.userId}>` }) });
        }

        if (message.mentions.members.first()) {
            const db = await prisma.afk.findFirst({ where: { guildId: message.guild.id, userId: message.author.id } });

            if (db) {
                return await message.reply({ content: await resolveKey(message, "Commands:Afk:In_Afk", { user: `<@${db.userId}>` }) });
            }
        }
    }
}
