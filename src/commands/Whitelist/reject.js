const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  /** @type {import('commandkit').CommandData} */
  data: {
    name: 'wl-reject',
    description: 'Reject a whitelist application',
    options: [
      {
        name: 'user',
        description: 'Select the user',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for rejection',
        type: ApplicationCommandOptionType.String,
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
    // ✅ ACK immediately to avoid "Unknown interaction"
    await interaction.deferReply({ ephemeral: true });

    try {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');

      const CHANNEL_ID = process.env.WL_REJECT_LOG_CHANNEL_ID;
      const logChannel = interaction.guild.channels.cache.get(CHANNEL_ID);

      if (!logChannel || !logChannel.isTextBased()) {
        return interaction.editReply({ 
          content: '❌ Reject log channel not found or not a text channel.' 
        });
      }

      // 🔐 ROLE-BASED ACCESS CONTROL
      const allowedRoleIds = process.env.WL_ALLOWED_ROLE_IDS?.split(',') || [];
      const executor = await interaction.guild.members.fetch(interaction.user.id);

      const hasAllowedRole = executor.roles.cache.some(r => 
        allowedRoleIds.includes(r.id)
      );

      if (!hasAllowedRole) {
        return interaction.editReply({
          content: '❌ You are not allowed to use this command.',
        });
      }

      // 1️⃣ DM the user (best effort)
      try {
        await user.send(
          `Hey 👋\n\nYour whitelist application in **${interaction.guild.name}** was **rejected**.\n\n**Reason:** ${reason}\n\nYou can reapply later if applicable.`
        );
      } catch {
        console.log('DM closed by user.');
      }

      // 2️⃣ Reply to staff (edit deferred reply)
      await interaction.editReply({
        content: `❌ **${user.tag}** has been rejected.\n📄 Reason: ${reason}`,
      });

      // 3️⃣ Send embed in reject log channel
      const embed = new EmbedBuilder()
        .setTitle('❌ Whitelist Application Rejected')
        .setColor(0xe74c3c)
        .setDescription('The whitelist application has been rejected.')
        .addFields(
          { name: '📄 Reason', value: reason, inline: false }
        )
        .setImage('https://cdn.discordapp.com/attachments/1471188802830729378/1471379530605137920/K4F_WL_Rejected.jpg?ex=698eb879&is=698d66f9&hm=56669e68358595b3dddff6821f60a8da021b9c53dec57186e9f92ad045c48ce7&')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ 
          text: `K4F Management Team`, 
          iconURL: 'https://cdn.discordapp.com/attachments/1459917451864182888/1470266779505791037/K4F_Short_Logo.png?ex=698ea0a4&is=698d4f24&hm=9813fe96e7b11be40eafd003b33056646bc5fa24241d80c63f10638d5aabd218&' 
        })
        .setTimestamp();

      await logChannel.send({
        content: `Hey ${user}`,
        embeds: [embed],
      });

    } catch (err) {
      console.error(err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ Something went wrong while rejecting the user.',
        });
      } else {
        await interaction.reply({
          content: '❌ Something went wrong while rejecting the user.',
          ephemeral: true,
        });
      }
    }
  },
};
