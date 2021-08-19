import Command from "../../structures/Command";
import { Message } from "discord.js";
import fs from "fs";
import BulbBotClient from "../../structures/BulbBotClient";

export default class extends Command {
	constructor(client: BulbBotClient, name: string) {
		super(client, {
			name,
			description: "Upload the bot logs to the current channel ",
			category: "Admin",
			usage: "<daysAgo>",
			examples: ["logs 0", "logs 5"],
			minArgs: 1,
			maxArgs: -1,
			argList: ["daysAgo:number"],
			devOnly: true,
		});
	}

	async run(message: Message, args: string[]): Promise<void> {
		const dayBefore = new Date();
		dayBefore.setDate(dayBefore.getDate() - parseInt(args[0]));
		this.client.log.info(`[DEVELOPER] ${message.author.tag} (${message.author.id}) got the logs for ${dayBefore.toLocaleDateString()}`);

		if (fs.existsSync(`${__dirname}/../../../logs/${dayBefore.toLocaleDateString()}-combined.log`)) {
			message.channel.send({
				content: `Showing the logs for **${dayBefore.toLocaleDateString()}**.\n1: Combined, 2: Error, 3: Info, 4: Warn, 5: Client, 6: Database`,
				files: [
					`${__dirname}/../../../logs/${dayBefore.toLocaleDateString()}-combined.log`,
					`${__dirname}/../../../logs/error/${dayBefore.toLocaleDateString()}-error.log`,
					`${__dirname}/../../../logs/info/${dayBefore.toLocaleDateString()}-info.log`,
					`${__dirname}/../../../logs/warn/${dayBefore.toLocaleDateString()}-warn.log`,
					`${__dirname}/../../../logs/client/${dayBefore.toLocaleDateString()}-client.log`,
					`${__dirname}/../../../logs/database/${dayBefore.toLocaleDateString()}-database.log`,
				],
			});
		} else {
			message.channel.send(`Can't find any logs for **${dayBefore.toLocaleDateString()}**`);
		}
	}
}