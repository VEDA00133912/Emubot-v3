const cooldowns = new Map();

module.exports = (commandName, interaction, cooldownTime = 5000) => { 
    const userId = interaction.user.id;

    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    const cooldownAmount = cooldownTime;

    if (timestamps.has(userId)) {
        const expirationTime = timestamps.get(userId) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
            return interaction.reply({ content: `\`${commandName}\` はクールダウン中です。あと ${timeLeft} 秒後に実行できます。`, ephemeral: true });
        }
    }

    timestamps.set(userId, now);

    setTimeout(() => timestamps.delete(userId), cooldownAmount);

    return null; 
};
