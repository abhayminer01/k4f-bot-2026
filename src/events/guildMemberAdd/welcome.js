const { EmbedBuilder } = require('discord.js');

/**
 * @param {import('discord.js').Client} client
 */
module.exports = async (client) => { 
  try {
    const CHANNEL_ID = process.env.JOIN_LOG_CHANNEL_ID;
    const DEFAULT_ROLE_ID = process.env.JOIN_DEFAULT_ROLE_ID; // role to give on join

    const logChannel = client.guild.channels.cache.get(CHANNEL_ID);
    const role = client.guild.roles.cache.get(DEFAULT_ROLE_ID);

    // 1️⃣ Add role to the user when they join
    if (role) {
      await client.roles.add(role).catch(console.error);
    } else {
      console.log('JOIN_DEFAULT_ROLE_ID role not found');
    }

    if (!logChannel || !logChannel.isTextBased()) return;

    // 2️⃣ Build welcome embed
    const embed = new EmbedBuilder()
      .setTitle('Welcome to KeMiCS For Fans 2026')
      .setColor(0x2fc4fa)
      .setDescription(
        'Thanks for joining our KeMiCS community. We’re excited to have you with us. Enjoy your journey!\n\n' +
        '⪼ [**ANNOUNCEMENTS**](https://discord.com/channels/1459917449821552711/1460628447285219504)\n' +
        '⪼ [**DISCORD RULES**](https://discord.com/channels/1459917449821552711/1459917450299572260)\n' +
        '⪼ [**SMP RULES**](https://discord.com/channels/1459917449821552711/1459917450299572262)\n' +
        '⪼ [**APPLY WHITELIST**](https://discord.com/channels/1459917449821552711/1460457577287520268)'
      )
      .setImage('https://cdn.discordapp.com/attachments/1471188802830729378/1471410542412300389/K4F_Welcome_Image.jpg?ex=698ed55a&is=698d83da&hm=da84206dbbec188674d28aa8cb0f26a8a61235cd38ce7ba2daeb2cd653642512&')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: 'K4F Management Team',
        iconURL: 'https://cdn.discordapp.com/attachments/1459917451864182888/1470266779505791037/K4F_Short_Logo.png',
      })
      .setTimestamp();

    // 3️⃣ Send welcome embed to channel
    await logChannel.send({
      content: `Hey ${client.user}`,
      embeds: [embed],
    });

  } catch (err) {
    console.error('Join log error:', err);
  }
};
