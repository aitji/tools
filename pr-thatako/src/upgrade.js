const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js')
const TOKEN = process.env.DISCORD_TOKEN
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
})

const admin = '1243562913885720607'
const classroom = [
    '1276808239207546900', // 1
    '1276808281192661022', // 2
    '1276808319796772905', // 3
    '1276808371433111654', // 4
    '1276808394178826250', // 5
    '1276808414693031937', // 6
    '1243565742364823623'  // alumni
]

const upgradeCommand = new SlashCommandBuilder()
    .setName('upgrade')
    .setDescription('Upgrade all eligible users to the next classroom')

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`)
    await client.application.commands.create(upgradeCommand)
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() || interaction.commandName !== 'upgrade') return

    const member = interaction.member
    if (!member.roles.cache.has(admin)) {
        await interaction.reply({ content: 'You need admin role to use this command!', ephemeral: true })
        return
    }

    await interaction.deferReply()
    const progressMessage = await interaction.followUp('Starting role upgrades...')

    try {
        const guild = interaction.guild
        const members = await guild.members.fetch()
        let upgraded = 0
        let skipped = 0

        for (const [, guildMember] of members) {
            try {
                if (guildMember.user.bot) {
                    skipped++
                    continue
                }

                if (guildMember.roles.cache.has(classroom[6])) {
                    skipped++
                    continue
                }

                let currentLevel = -1
                for (let i = 0; i < 6; i++) {
                    if (guildMember.roles.cache.has(classroom[i])) {
                        currentLevel = i
                        break
                    }
                }

                if (currentLevel === -1 || currentLevel === 5) {
                    skipped++
                    continue
                }

                await new Promise(resolve => setTimeout(resolve, 1000))

                await guildMember.roles.remove(classroom[currentLevel])
                await guildMember.roles.add(classroom[currentLevel + 1])

                upgraded++

                if (upgraded % 5 === 0 || skipped % 5 === 0) await progressMessage.edit(`Progress: ${upgraded} members upgraded, ${skipped} members skipped...`)
            } catch (error) {
                console.error(`Error processing member ${guildMember.user.tag}:`, error)
                continue
            }
        }

        await progressMessage.edit(`✅ Upgrade complete! ${upgraded} members upgraded, ${skipped} members skipped.`)

    } catch (error) {
        console.error('Error during upgrade process:', error)
        await progressMessage.edit('❌ An error occurred during the upgrade process.\n-# check console for error message')
    }
})

client.login(TOKEN)