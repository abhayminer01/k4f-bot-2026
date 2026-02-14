const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  /** @type {import('commandkit').CommandData} */
  data: {
    name: 'wl-message',
    description: 'Post the whitelist info message with apply button',
    permissionsRequired: [
      PermissionFlagsBits.ManageChannels, 
      PermissionFlagsBits.ManageRoles
    ],
    botPermissions: [PermissionFlagsBits.SendMessages],
  },

  /**
   * @param {import('commandkit').SlashCommandProps} param0
   */
  run: async ({ client, interaction }) => {
    // ✅ ACK immediately
    await interaction.deferReply({ ephemeral: true });

    try {
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

      // 🧱 Build embed
      const embed = new EmbedBuilder()
        .setTitle('📝 Whitelist Applications Open!')
        .setColor(0x2fc4fa)
        .setDescription(
          'Want to join **KeMiCS For Fans 2026**?\n\n' +
          '**⪼ Read the rules**\n' +
          '**⪼ Apply for whitelist using the button below**\n\n'
        )
        .setImage('https://cdn.discordapp.com/attachments/1471188802830729378/1472058666063499276/Untitled_design.png?ex=699130f7&is=698fdf77&hm=3ff6768df8eaef7ce505a810f77e0bf2447331a0016527b9a8830b7bdecab4e0&')
        .setFooter({ 
          text: 'K4F Management Team',
          iconURL: 'https://cdn.discordapp.com/attachments/1459917451864182888/1470266779505791037/K4F_Short_Logo.png'
        })
        .setTimestamp();

      // 🔘 Button
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Apply Now!')
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.WL_APPLY_URL)
      );

      // 📢 Send to the same channel where command was used
      await interaction.channel.send({
        embeds: [embed],
        components: [row],
      });

      // ✅ Staff feedback
      await interaction.editReply({
        content: '✅ Whitelist message posted successfully in this channel.',
      });

    } catch (err) {
      console.error(err);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ Failed to send whitelist message.',
        });
      } else {
        await interaction.reply({
          content: '❌ Failed to send whitelist message.',
          ephemeral: true,
        });
      }
    }
  },
};
