import Command from "../../../structures/Command";
import SubCommand from "../../../structures/SubCommand";
import CommandContext from "../../../structures/CommandContext";
import { CommandInteraction, Message, MessageActionRow, MessageSelectMenu, Snowflake, User } from "discord.js";
import { NonDigits } from "../../../utils/Regex";
import InfractionsManager from "../../../utils/managers/InfractionsManager";
import BulbBotClient from "../../../structures/BulbBotClient";
import ApplicationCommand from "../../../structures/ApplicationCommand";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

const infractionManager: InfractionsManager = new InfractionsManager();

export default class extends ApplicationCommand {
	constructor(client: BulbBotClient, name: string) {
		super(client, {
			name,
			description: "Search for infractions of a user.",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					description: "The user to search for.",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "page",
					description: "The page of infractions to show.",
					type: ApplicationCommandOptionType.Number,
					required: false,
				}
			]
		});
	}

	public async run(interaction: CommandInteraction) {
		return interaction.reply("Yes hi hello");
	}
}

export class lol extends SubCommand {
	constructor(client: BulbBotClient, parent: Command) {
		super(client, parent, {
			name: "search",
			clearance: 50,
			minArgs: 1,
			maxArgs: 2,
			argList: ["user:User", "page:Number"],
			usage: "<user> [page]",
			description: "Search for infractions of a user.",
		});
	}

	public async run(context: CommandContext, args: string[]): Promise<void | Message> {
		if (!context.guild) return;

		const targetID: Snowflake = args[0].replace(NonDigits, "");
		const user: User | undefined = await this.client.bulbfetch.getUser(targetID);
		let page = Number(args[1]);
		if (!page) page = 0;

		if (!user)
			return context.channel.send(
				await this.client.bulbutils.translate("global_not_found", context.guild.id, {
					type: await this.client.bulbutils.translate("global_not_found_types.user", context.guild.id, {}),
					arg_provided: args[0],
					arg_expected: "user:User",
					usage: this.usage,
				}),
			);

		const options: any[] = [];
		const infs = (await infractionManager.getAllUserInfractions({ guildId: context.guild.id, targetId: user.id, page })) || [];

		if (!infs.length) return await context.channel.send(await this.client.bulbutils.translate("infraction_search_not_found", context.guild.id, { target: user }));

		for (let i = 0; i < 25; i++) {
			if (infs[i] === undefined) continue;

			options.push({
				label: `${infs[i].action} (#${infs[i].id})`,
				description: await this.client.bulbutils.translate("infraction_interaction_description", context.guild.id, {}),
				value: `inf_${infs[i].id}`,
				emoji: this.client.bulbutils.formatAction(infs[i].action),
			});
		}

		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setPlaceholder(await this.client.bulbutils.translate("infraction_interaction_placeholder", context.guild.id, {}))
				.setCustomId("infraction")
				.addOptions(options),
		);

		return await context.channel.send({
			content: await this.client.bulbutils.translate("infraction_interaction_reply", context.guild.id, {
				target: user,
			}),
			components: [row],
		});
	}
}
