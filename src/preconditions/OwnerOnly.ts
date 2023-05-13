import { PreconditionOptions, AllFlowsPrecondition, Command } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import type { Message } from "discord.js";

import { DeveloperIds } from "../lib/utils/Constant";

@ApplyOptions<PreconditionOptions>({
    name: "OwnerOnly",
})
export class OwnerOnlyPrecondition extends AllFlowsPrecondition {
    public override async messageRun(message: Message) {
        return DeveloperIds[0].includes(message.author.id)
            ? this.ok()
            : this.error({
                  identifier: "preconditionOwnerOnly",
              });
    }

    public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return DeveloperIds[0].includes(interaction.user.id)
            ? this.ok()
            : this.error({
                  identifier: "preconditionOwnerOnly",
              });
    }

    public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        return DeveloperIds[0].includes(interaction.user.id)
            ? this.ok()
            : this.error({
                  identifier: "preconditionOwnerOnly",
              });
    }
}
