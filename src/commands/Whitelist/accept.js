const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  /** @type {import('commandkit').CommandData} */
  data: {
    name: 'wl-accept',
    description: 'Accept a whitelist application',
    options: [
      {
        name: 'user',
        description: 'Select the user',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
    permissionsRequired: [
      PermissionFlagsBits.ManageChannels, 
      PermissionFlagsBits.ManageRoles
    ],
    botPermissions: [PermissionFlagsBits.ManageRoles],
  },

  /**
   * @param {import('commandkit').SlashCommandProps} param0
   */
  run: async ({ client, interaction }) => {
    try {
      const user = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);

      const PENDING_ROLE_ID = process.env.WL_PENDING_ROLE_ID;
      const ACCEPT_ROLE_ID = process.env.WL_ACCEPT_ROLE_ID;
      const CHANNEL_ID = process.env.WL_ACCEPT_LOG_CHANNEL_ID;

      const pendingRole = interaction.guild.roles.cache.get(PENDING_ROLE_ID);
      const acceptRole = interaction.guild.roles.cache.get(ACCEPT_ROLE_ID);
      const logChannel = interaction.guild.channels.cache.get(CHANNEL_ID);

      if (!acceptRole) {
        return interaction.reply({ content: '❌ Accept role not found. Check WL_ACCEPT_ROLE_ID', ephemeral: true });
      }

      if (!logChannel || !logChannel.isTextBased()) {
        return interaction.reply({ content: '❌ Accept log channel not found or not a text channel.', ephemeral: true });
      }

      // 🔐 ROLE-BASED ACCESS CONTROL
      const allowedRoleIds = process.env.WL_ALLOWED_ROLE_IDS?.split(',') || [];
      const executor = await interaction.guild.members.fetch(interaction.user.id);

      const hasAllowedRole = executor.roles.cache.some(r => 
        allowedRoleIds.includes(r.id)
      );

      if (!hasAllowedRole) {
        return interaction.reply({
          content: '❌ You are not allowed to use this command.',
          ephemeral: true,
        });
      }

      // 1️⃣ Remove pending role if exists
      if (pendingRole && member.roles.cache.has(pendingRole.id)) {
        await member.roles.remove(pendingRole);
      }

      // 2️⃣ Add whitelisted role
      if (!member.roles.cache.has(acceptRole.id)) {
        await member.roles.add(acceptRole);
      }

      // 3️⃣ DM the user
      try {
        await user.send(
          `🎉 Congrats!\n\nYour whitelist application in **${interaction.guild.name}** has been **approved**!\nYou are now whitelisted. Welcome aboard! 🚀`
        );
      } catch {
        console.log('DM closed by user.');
      }

      // 4️⃣ Reply to staff
      await interaction.reply({
        content: `✅ **${user.tag}** has been **whitelisted** successfully.`,
        ephemeral: true,
      });

      // 5️⃣ Send embed in accept log channel
      const embed = new EmbedBuilder()
        .setTitle('✅ Whitelist Application Approved!')
        .setColor(0x2ecc71) // green
        .setDescription('Congrats, Your whitelist application has been approved. Welcome to KeMiCS for Fans 2026')
        .setImage('https://cdn.discordapp.com/attachments/1471188802830729378/1471379646116397207/K4F_WL_Accepted.jpg?ex=698eb894&is=698d6714&hm=2e0c1f3443a88753e519c2ea1bb08aa0fc21be4fa0bde785194a71ad74284c2c&')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ 
          text: `K4F Management Team`, 
          iconURL: 'https://cdn.discordapp.com/attachments/1459917451864182888/1470266779505791037/K4F_Short_Logo.png?ex=698ea0a4&is=698d4f24&hm=9813fe96e7b11be40eafd003b33056646bc5fa24241d80c63f10638d5aabd218&' 
        })
        .setTimestamp();

      await logChannel.send({
        content: `Hey ${user},`,
        embeds: [embed],
      });

    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Failed to approve whitelist. Make sure my role is above both target roles.',
          ephemeral: true,
        });
      }
    }
  },
};
