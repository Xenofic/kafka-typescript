import { PreconditionOptions, AllFlowsPrecondition, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";

import { DeveloperIds } from "../lib/utils/Constant";

@ApplyOptions<PreconditionOptions>({
    name: "DeveloperOnly",
})
export class DeveloperOnlyPrecondition extends AllFlowsPrecondition {
    public override async messageRun(message: Message) {
        return DeveloperIds.includes(message.author.id)
            ? this.ok()
            : this.error({
                  identifier: "preconditionOwnerOnly",
              });
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return DeveloperIds.includes(interaction.user.id)
            ? this.ok()
            : this.error({
                  identifier: "preconditionOwnerOnly",
              });
    }

    public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        return DeveloperIds.includes(interaction.user.id)
            ? this.ok()
            : this.error({
                  identifier: "preconditionOwnerOnly",
              });
    }
}
