import { Args, Command, RegisterBehavior } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { resolveKey } from "@sapphire/plugin-i18next";
import { InteractionResponse, Message, User, SlashCommandBuilder } from "discord.js";
import { PrismaClient } from "@prisma/client";

import { EmbedBuilder } from "../../lib";

@ApplyOptions<Command.Options>({
    name: "give",
    description: "Give your balance to other user.",
    requiredClientPermissions: ["SendMessages"],
    requiredUserPermissions: ["SendMessages"],
})
export class GiveCommand extends Command {
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
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption((option) => option.setName("user").setDescription("Provide a target user").setRequired(true))
            .addNumberOption((option) =>
                option.setName("balance").setDescription("How much balance do you want to give.").setRequired(true).setMinValue(1)
            );

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
    public override async messageRun(message: Message, args: Args): Promise<Message> {
        const target: User = await args.pick("user");
        const balance: number = await args.pick("number");
        return (await this.give(message, message.author, target, balance)) as Message;
    }

    /**
     * @description slash command executor
     * @param interaction slash command interaction
     * @returns {InteractionResponse}
     */
    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<InteractionResponse> {
        const target: User = interaction.options.getUser("user");
        const balance: number = interaction.options.getNumber("balance");
        return (await this.give(interaction, interaction.user, target, balance)) as InteractionResponse;
    }

    /**
     * @description give your balance to other user
     * @param ctx interaction context
     * @param user interaction user
     * @returns {Message | InteractionResponse}
     */
    private async give(
        ctx: Message | Command.ChatInputCommandInteraction,
        user: User,
        target: User,
        balance: number
    ): Promise<Message | InteractionResponse> {
        const userDb = await this.prisma.user.findUnique({ where: { userId: user.id } });
        const targetDb = await this.prisma.user.findUnique({ where: { userId: target.id } });

        if (!userDb) {
            return ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Not_Registered")).isErrorEmbed()],
            });
        }

        if (!targetDb) {
            return ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:User_Not_Registered")).isErrorEmbed()],
            });
        }

        try {
            await this.prisma.user.update({ where: { userId: user.id }, data: { balance: { decrement: balance } } });
            await this.prisma.user.update({ where: { userId: target.id }, data: { balance: { increment: balance } } });

            return ctx.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(await resolveKey(ctx, "Commands:Give:Success", { balance, target: `<@${target.id}>` }))
                        .isSuccessEmbed(),
                ],
            });
        } catch (e) {
            void console.log(e);

            return await ctx.reply({
                embeds: [new EmbedBuilder().setDescription(await resolveKey(ctx, "Commands:Denied:Database_Error")).isErrorEmbed()],
            });
        }
    }
}
