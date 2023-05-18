import { Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { TFunction, fetchT } from "@sapphire/plugin-i18next";
import { APIEmbedField, Guild, InteractionResponse, Message, SlashCommandBuilder, User, bold } from "discord.js";

import { DeveloperIds, EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "about",
    description: "Get information about the bot.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class AboutCommand extends Command {
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
        return (await this.response(message)) as Message;
    }

    /**
     * @description slash command executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        return (await this.response(interaction)) as InteractionResponse;
    }

    /**
     * @description command response
     * @param ctx interaction context
     * @returns {Message | InteractionResponse}
     */
    private async response(ctx: Message | Command.ChatInputCommandInteraction): Promise<Message | InteractionResponse> {
        const { user } = this.container.client;
        const { about } = (await this.getTranslatedResponses(ctx)).commands;
        const getFieldResponses: APIEmbedField[] = await this.getFieldResponses(ctx);

        return await ctx.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL({ size: 1024 }) })
                    .setDescription(about.description)
                    .addFields([...getFieldResponses]),
            ],
        });
    }

    /**
     * @description get embed field responses
     * @returns {APIEmbedField[]}
     */
    private async getFieldResponses(ctx: Message | Command.ChatInputCommandInteraction): Promise<APIEmbedField[]> {
        const { about } = (await this.getTranslatedResponses(ctx)).commands;
        const { devs, networkServers, socialMedia } = await this.getDetails();

        return [
            { name: about.field.name.developers, value: devs.join("\n") },
            { name: about.field.name.networkServers, value: networkServers.join("\n") },
            { name: about.field.name.socialMedia, value: socialMedia.join("\n") },
        ] as APIEmbedField[];
    }

    /**
     * @description get details about developers, network servers, and social media
     * @returns {DetailsType}
     */
    private async getDetails(): Promise<DetailsType> {
        return {
            devs: [
                `> [${bold((await this.getUser(DeveloperIds[0])).tag)}](https://instagram.com/ravenxyzer)`,
                `> [${bold((await this.getUser(DeveloperIds[1])).tag)}](https://github.com/aeviterna)`,
            ],
            networkServers: [
                `> [${bold("Genshin Impact ID")}](https://discord.gg/giid)`,
                `> [${bold("Nolep Gang's")}](https://discord.gg/BPQBmwTemY)`,
                `> [${bold("Simps Waifu Community")}](https://discord.gg/simpswaifu)`,
            ],
            socialMedia: [`> [${bold("@honkaistar.indo")}](https://instagram.com/honkaistar.indo)`],
        };
    }

    /**
     * @description get translated responses
     * @param ctx interaction context
     * @returns {TranslatedResponsesType}
     */
    private async getTranslatedResponses(ctx: Message | Command.ChatInputCommandInteraction): Promise<TranslatedResponsesType> {
        const tFunction: TFunction = await fetchT(ctx);
        const guild: Guild = await this.container.client.guilds.fetch("1006143962714755122");

        return {
            commands: {
                about: {
                    description: tFunction("Commands:About:Description", { server: bold(guild.name) }),
                    field: {
                        name: {
                            developers: tFunction("Commands:About:Fields:Name:Developers"),
                            networkServers: tFunction("Commands:About:Fields:Name:Network_Servers"),
                            socialMedia: tFunction("Commands:About:Fields:Name:Social_Media"),
                        },
                    },
                },
            },
        };
    }

    /**
     * @description fetch user
     * @param id Discord userId
     * @returns {User}
     */
    private async getUser(id: string): Promise<User> {
        return await this.container.client.users.fetch(id);
    }
}

interface TranslatedResponsesType {
    commands: {
        about: {
            description: string;
            field: {
                name: {
                    developers: string;
                    networkServers: string;
                    socialMedia: string;
                };
            };
        };
    };
}

interface DetailsType {
    devs: string[];
    networkServers: string[];
    socialMedia: string[];
}
