import { RegisterBehavior } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { TFunction, fetchT } from "@sapphire/plugin-i18next";
import { PrismaClient } from "@prisma/client";
import { InteractionResponse, Message, SlashCommandBuilder } from "discord.js";

import { Languages, LanguagesType, EmbedBuilder } from "../../lib";

const prisma: PrismaClient = new PrismaClient();
const embed: EmbedBuilder = new EmbedBuilder();

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
            .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List of available language for Kafka."));

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
        const { denied } = (await this.getTranslatedResponses(message)).commands;

        await message.reply({ embeds: [embed.isErrorEmbed().setDescription(denied.slashOnly)] });
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
        const { language, denied } = (await this.getTranslatedResponses(ctx, langKey)).commands;
        const db = await prisma.guild.findUnique({ where: { guildId: ctx.guild.id } });

        if (!db) {
            await prisma.guild.create({ data: { guildId: ctx.guild.id, language: langKey } }).catch(async (e) => {
                console.error(e);
                return await ctx.reply({
                    embeds: [embed.setDescription(denied.databaseError).isErrorEmbed()],
                });
            });

            return await ctx.reply({
                embeds: [embed.setDescription(language.set.success).isSuccessEmbed()],
            });
        }

        if (db.language == langKey) return ctx.reply({ embeds: [embed.setDescription(language.set.failed).isErrorEmbed()] });

        await prisma.guild.update({ where: { guildId: ctx.guild.id }, data: { language: langKey } }).catch(async (e) => {
            console.error(e);
            return ctx.reply({ embeds: [embed.setDescription(denied.databaseError).isErrorEmbed()] });
        });

        return await ctx.reply({
            embeds: [embed.setDescription(language.set.success).isSuccessEmbed()],
        });
    }

    /**
     * @description Show available languages for Kafka
     * @param ctx interaction context
     * @returns {Message | InteractionResponse}
     */
    private async showList(ctx: Message | Subcommand.ChatInputCommandInteraction): Promise<Message | InteractionResponse> {
        const { user } = this.container.client;
        const { language } = (await this.getTranslatedResponses(ctx)).commands;

        return await ctx.reply({
            embeds: [
                embed
                    .setAuthor({ name: language.list.author, iconURL: user.displayAvatarURL({ size: 1024 }) })
                    .setDescription(language.list.description)
                    .addFields([{ name: language.list.field.name, value: language.list.field.value }]),
            ],
        });
    }

    /**
     * @description get translated responses
     * @param ctx interaction context
     * @param langKey? internation language code
     * @returns {TranslatedResponsesType}
     */
    private async getTranslatedResponses(
        ctx: Message | Subcommand.ChatInputCommandInteraction,
        langKey?: LanguagesType
    ): Promise<TranslatedResponsesType> {
        const tFunction: TFunction = await fetchT(ctx);

        const languages = {
            "id-ID": "Bahasa Indonesia",
            "en-US": "English US",
        };

        return {
            commands: {
                denied: {
                    slashOnly: tFunction("Commands:Denied:Slash_Only"),
                    databaseError: tFunction("Commands:Denied:Database_Error"),
                },
                language: {
                    set: {
                        success: tFunction("Commands:Language:Set:Success", { language: languages[langKey] }),
                        failed: tFunction("Commands:Language:Set:Failed"),
                    },
                    list: {
                        author: tFunction("Commands:Language:List:Author", { authorName: this.container.client.user.username }),
                        description: tFunction("Commands:Language:List:Description", { guildName: ctx.guild.name }),
                        field: {
                            name: tFunction("Commands:Language:List:Fields:Name"),
                            value: Languages.join("\n"),
                        },
                    },
                },
            },
        };
    }
}

interface TranslatedResponsesType {
    commands: {
        denied: {
            slashOnly: string;
            databaseError: string;
        };
        language: {
            set: {
                success: string;
                failed: string;
            };
            list: {
                author: string;
                description: string;
                field: {
                    name: string;
                    value: string;
                };
            };
        };
    };
}
