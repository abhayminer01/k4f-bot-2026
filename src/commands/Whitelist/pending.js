const { 
  ApplicationCommandOptionType, 
  PermissionFlagsBits, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  /** @type {import('commandkit').CommandData} */
  data: {
    name: 'wl-pending',
    description: 'Add user to whitelist pending',
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

        const ROLE_ID = process.env.WL_PENDING_ROLE_ID;
        const CHANNEL_ID = process.env.WL_PENDING_LOG_CHANNEL_ID;

        const role = interaction.guild.roles.cache.get(ROLE_ID);
        const logChannel = interaction.guild.channels.cache.get(CHANNEL_ID);

        if (!role) {
        return interaction.reply({ content: '❌ Role not found. Check WL_PENDING_ROLE_ID', ephemeral: true });
        }

        if (!logChannel || !logChannel.isTextBased()) {
        return interaction.reply({ content: '❌ Log channel not found or not a text channel.', ephemeral: true });
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

        // 1️⃣ Add role
        await member.roles.add(role);

        // 2️⃣ DM the user
        try {
        await user.send(
            `Hey! 👋\nYou’ve been moved to **Whitelist Pending** in **${interaction.guild.name}**.\nPlease wait for your interview.`
        );
        } catch {
        console.log('DM closed by user.');
        }

        // 3️⃣ Reply to staff
        await interaction.reply({
        content: `✅ **${user.tag}** added to **Whitelist Pending**.`,
        ephemeral: true,
        });

        // 4️⃣ Send embed in server log channel
        const embed = new EmbedBuilder()
        .setTitle('Whitelist Application Pending!')
        .setColor(0x2fc4fa)
        .setDescription("Join waiting room between 07.00 pm to 08:00 pm for interview and get whitelisted.")
        .addFields({
            name: "Instructions",
            value: "- Read rules before joining for interview session",
            inline: false
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setImage('https://cdn.discordapp.com/attachments/1471188802830729378/1471379612654374964/K4F_WL_Hold.jpg?ex=698eb88c&is=698d670c&hm=bb7f5306215def09e2137389c94a6c723706a264a915a31c8ed34ec12847ac4b&')
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
        if (!interaction.replied) {
        await interaction.reply({
            content: '❌ Failed to add role. Make sure my role is above the target role.',
            ephemeral: true,
        });
        }
    }
    }
};
