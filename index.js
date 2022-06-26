const { Client } = require("discord.js");
const { token, guildId } = require("./config");

const client = new Client({
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

client.on("ready", async () => {
  console.log(`${client.user.tag} is Online !!`);

  let guild = client.guilds.cache.get(guildId);
  if (guild) {
    guild.commands.set([
      {
        name: "ping",
        description: `check ping of bot`,
        type: "CHAT_INPUT",
      },
      {
        name: "setup",
        description: `setup the verification system`,
        type: "CHAT_INPUT",
      },
    ]);
  }
  // loading
  require("./verify")(client);
});

client.login(token);
/**
 * @INFO
 * Bot Coded by iRed#1330 | https://github.com/iRed-Github/Verification-BOT
 * @INFO
 * Join iDK Development | https://dsc.gg/idk-development
 * @INFO
 * Please mention Her / iDK Development, when using this Code!
 * @INFO
 */