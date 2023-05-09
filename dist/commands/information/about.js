"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutCommand = void 0;
const framework_1 = require("@sapphire/framework");
const decorators_1 = require("@sapphire/decorators");
const discord_js_1 = require("discord.js");
let AboutCommand = class AboutCommand extends framework_1.Command {
    registerApplicationCommands(registry) {
        const command = new discord_js_1.SlashCommandBuilder().setName(this.name).setDescription(this.description);
        void registry.registerChatInputCommand(command, {
            behaviorWhenNotIdentical: framework_1.RegisterBehavior.Overwrite,
            guildIds: [],
            idHints: [],
        });
    }
    messageRun(message) {
        return __awaiter(this, void 0, void 0, function* () {
            return message.reply({ embeds: yield this.response() });
        });
    }
    chatInputRun(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return interaction.reply({ embeds: yield this.response() });
        });
    }
    response() {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = this.container.client;
            const guild = yield this.container.client.guilds.fetch("1006143962714755122");
            const embed = new discord_js_1.EmbedBuilder()
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 1024 }) })
                .setDescription(`All-multi purpose Discord bot & Honkai: Star Rail related that developed by ${(0, discord_js_1.bold)("Zarr")} from [${(0, discord_js_1.bold)(guild.name)}](https://bit.ly/stellaris-indo).`);
            return [embed];
        });
    }
};
AboutCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "about",
        description: "Get information about the bot.",
        requiredClientPermissions: ["SendMessages"],
        requiredUserPermissions: ["SendMessages"],
    })
], AboutCommand);
exports.AboutCommand = AboutCommand;
