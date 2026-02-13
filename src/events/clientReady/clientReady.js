/** * @param {import('discord.js').Client} client */
module.exports = (client) => {
    console.log(`${client.user.tag} is online!`);

    client.user.setPresence({
        status: 'online', // online | idle | dnd | invisible
        activities: [
            {
                name: 'K4F 2026 ⚖️',
                type: 3, // 0 = Playing, 1 = Streaming, 2 = Listening, 3 = Watching, 5 = Competing
            },
        ],
    });
}