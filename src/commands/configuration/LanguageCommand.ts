import { RegisterBehavior } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { PrismaClient } from "@prisma/client";
import { InteractionResponse, Message, SlashCommandBuilder } from "discord.js";

import { Languages, LanguagesType, EmbedBuilder } from "../../lib";

@ApplyOptions<Subcommand.Options>({
    name: "language",
    description: "Server language configuration for Kafka.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages", "ManageGuild"],
    subcommands: [
        { name: "set", chatInputRun: "chatInputRunSet" },
        { name: "list", chatInputRun: "chatInputRunList" },
    ],
})
export class LanguageCommand extends Subcommand {
    /**
     * @description prisma client instance
     */
    private prisma: PrismaClient = new PrismaClient();

    /**
     * @description register the application commands
     * @param registry application command registry
     * @returns {void}
     */
    public override registerApplicationCommands(registry: Subcommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addSubcommand((subcommand) =>
                subcommand
                    .setName("set")
                    .setDescription("Set the server language for Kafka.")
                    .addStringOption((option) =>
                        option
                            .setName("language")
                            .setDescription("The language you want to be set.")
                            .addChoices({ name: "Bahasa Indonesia", value: "id-ID" }, { name: "English US", value: "en-US" })
                            .setRequired(true)
                    )
            )
            .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List of available languages for Kafka."));

        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }

    /**
     * @description message command executor
     * @param message message interaction
     * @returns {void}
     */
    public async messageRun(message: Message): Promise<void> {
        await message.reply({
            embeds: [new EmbedBuilder().isErrorEmbed().setDescription(await resolveKey(message, "Commands:Denied:Slash_Only"))],
        });
    }

    /**
     * @description slash subcommand executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public async chatInputRunSet(interaction: Subcommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const language: string = interaction.options.getString("language");

        return (await this.setLanguage(interaction, language as LanguagesType)) as InteractionResponse;
    }

    /**
     * @description slash subcommand executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public async chatInputRunList(interaction: Subcommand.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return (await this.showList(interaction)) as InteractionResponse;
    }

    /**
     * @description set server language for Kafka.
     * @param ctx interaction context
     * @param langKey international language code
     * @returns {Message | InteractionResponse}
     */
    private async setLanguage(ctx: Subcommand.ChatInputCommandInteraction, langKey: LanguagesType): Promise<Message | InteractionResponse> {
        const db = await this.prisma.guild.findUnique({ where: { guildId: ctx.guild.id } });

        if (!db) {
            try {
                await this.prisma.guild.create({ data: { guildId: ctx.guild.id, language: langKey } });

                return await ctx.reply({
                    embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Language:Set")).isSuccessEmbed()],
                });
            } catch (e) {
                void console.error(e);

                return await ctx.reply({
                    embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Database_Error")).isErrorEmbed()],
                });
            }
        }

        if (db.language == langKey) {
            return ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Language:Set:Failed")).isErrorEmbed()],
            });
        }

        try {
            await this.prisma.guild.update({ where: { guildId: ctx.guild.id }, data: { language: langKey } });

            return await ctx.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(await resolveKey(ctx, "Commands:Language:Set:Success", { languages: Languages.join("\n") }))
                        .isSuccessEmbed(),
                ],
            });
        } catch (e) {
            void console.error(e);

            return await ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Database_Error")).isErrorEmbed()],
            });
        }
    }

    /**
     * @description Show available languages for Kafka
     * @param ctx interaction context
     * @returns {Message | InteractionResponse}
     */
    private async showList(ctx: Message | Subcommand.ChatInputCommandInteraction): Promise<Message | InteractionResponse> {
        const { user } = this.container.client;

        return await ctx.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: await resolveKey(ctx, "Commands:Language:List:Author", { authorName: this.container.client.user.username }),
                        iconURL: user.displayAvatarURL({ size: 1024 }),
                    })
                    .setDescription(await resolveKey(ctx, "Commands:Language:List:Description", { guildName: ctx.guild.name }))
                    .addFields([
                        {
                            name: await resolveKey(ctx, "Commands:Language:List:Fields:Name"),
                            value: await resolveKey(ctx, "Commands:Language:List:Fields:Value"),
                        },
                    ]),
            ],
        });
    }
}
