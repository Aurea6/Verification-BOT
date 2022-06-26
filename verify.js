const {
  Client,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  MessageAttachment,
} = require("discord.js");
const config = require("./config");
const { Captcha } = require("captcha-canvas");
const captcha = new Captcha();

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
  // code
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
      if (interaction.commandName == "ping") {
        interaction.reply({
          content: `My latency - ${client.ws.ping}`,
          ephemeral: true,
        });
      } else if (interaction.commandName == "setup") {
        if (!interaction.member.permissions.has("MANAGE_ROLES")) {
          return interaction.reply({
            content: `you don't have perms to run command`,
            ephemeral: true,
          });
        }

        let verifyChannel = interaction.guild.channels.cache.get(
          config.verifyChannel
        );
        let verifyRole = interaction.guild.roles.cache.get(config.verifyRole);

        if (!verifyChannel || !verifyRole) {
          return interaction.reply({
            content: `verifyChannel and VerifyRole is not found`,
            ephemeral: true,
          });
        } else {
          let embed = new MessageEmbed()
            .setColor("BLURPLE")
            .setTitle(`Verification System of ${interaction.guild.name}`);

          let btnrow = new MessageActionRow().addComponents([
            new MessageButton()
              .setCustomId(`v_ping`)
              .setLabel("Ping me !!")
              .setStyle("PRIMARY")
              .setEmoji("📶"),
            new MessageButton()
              .setCustomId(`v_verify`)
              .setLabel("Verify")
              .setStyle("SUCCESS")
              .setEmoji("📑"),
          ]);

          await verifyChannel.send({
            embeds: [embed],
            components: [btnrow],
          });

          // changing permissions
          let role = interaction.guild.roles.everyone;
          interaction.guild.channels.cache
            .filter((ch) => ch.id !== verifyChannel.id)
            .forEach(async (ch) => {
              // changing perms of every role
              await ch.permissionOverwrites.edit(role, {
                SEND_MESSAGES: false,
                VIEW_CHANNEL: false,
                READ_MESSAGE_HISTORY: false,
                CONNECT: false,
              });

              // giving perms to client;
              await ch.permissionOverwrites.edit(client.user.id, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
                CONNECT: true,
                MANAGE_CHANNELS: true,
                MANAGE_ROLES: true,
              });
              // adding perms for verify role
              await ch.permissionOverwrites.edit(verifyRole, {
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true,
                READ_MESSAGE_HISTORY: true,
                CONNECT: true,
              });
            });
          interaction.reply({
            content: `Verification System Setup in ${verifyChannel} and Verify Role is ${verifyRole}`,
            ephemeral: true,
          });
        }
      } else {
        interaction.reply({
          content: `${interaction.commandName} is not valid`,
          ephemeral: true,
        });
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId == "v_ping") {
        return interaction.reply({
          content: `i am working fine`,
          ephemeral: true,
        });
      } else if (interaction.customId == "v_verify") {
        // code
        let verifyRole = interaction.guild.roles.cache.get(config.verifyRole);
        if (!verifyRole) return;

        if (interaction.member.roles.cache.has(verifyRole.id)) {
          return interaction.reply({
            content: `you are already verified`,
            ephemeral: true,
          });
        } else {
          if (!interaction.guild.me.permissions.has("MANAGE_ROLES")) {
            return interaction.reply({
              content: `i don't have perms`,
              ephemeral: true,
            });
          }

          // creatings captcha
          captcha.async = true;
          captcha.addDecoy();
          captcha.drawTrace();
          captcha.drawCaptcha();

          const captchaImage = new MessageAttachment(
            await captcha.png,
            "captcha.png"
          );

          let cmsg = await interaction.user.send({
            embeds: [
              new MessageEmbed()
                .setColor("BLUE")
                .setTitle(`Captcha Verification`)
                .setImage(`attachment://captcha.png`),
            ],
            files: [captchaImage],
          });

          interaction.reply({
            content: `Hey! Please check you'r dm's i have sent you the captcha to verify yourself in this server!`,
            ephemeral: true,
          });

          await cmsg.channel
            .awaitMessages({
              filter: (m) => m.author.id == interaction.user.id,
              max: 1,
              time: 1000 * 60,
              errors: ["time"],
            })
            .then(async (value) => {
              let isValid = value.first().content == captcha.text;
              if (isValid) {
                await interaction.member.roles.add(verifyRole).catch((e) => {});
                interaction.user.send({
                  content: `🎉 You have verified! Now you have got access of this server!`,
                  ephemeral: true,
                });
              } else {
                await interaction.user.send(
                  `💀 You're kicked from ${intercation.guild.name}! Because you did not completed the captcha :/`
                );
                interaction.member.kick().catch((e) => {});
              }
            })
            .catch(async (e) => {
              await interaction.user.send(
                `💀 You're kicked from ${intercation.guild.name}! Because you did not completed the captcha :/`
              );
              interaction.member.kick().catch((e) => {});
            });
        }
      }
    }
  });
};
/**
 * @INFO
 * Bot Coded by iRed#1330 | https://github.com/iRed-Github/Verification-BOT
 * @INFO
 * Join iDK Development | https://dsc.gg/idk-development
 * @INFO
 * Please mention Her / iDK Development, when using this Code!
 * @INFO
 */