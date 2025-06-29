const { Client, GatewayIntentBits, SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js')
require('dotenv').config()
const TOKEN = process.env.DISCORD_TOKEN
const fs = require('fs').promises
const path = require('path')

const CONFIG = {
    SERVER_ID: '1341386154947117180',
    ALLOWED_ROLES: [
        '1341416696090460191',
        '1351830585726734357',
        '1372205298227478638',
        '1355481491668471979'
    ],
    VOICE_CHANNELS: {
        '1384816642026115133': 'ﾉ🟢กลุ่มที่ 1  (นิลปัทม์)',
        '1384816675269902367': 'ﾉ🔵กลุ่มที่ 2  (บุษกร)',
        '1384819360652202055': 'ﾉ🔴กลุ่มที่ 3  (จงกลนี)',
        '1384819517040885810': 'ﾉ🟡กลุ่มที่ 4  (ประทุมชาติ)'
    },
    STAGE_CHANNEL_ID: '1385205861252857856',
    DATA_FILE: path.join(__dirname, 'location.json'),
    UPDATE_INTERVAL: 2000,
    CONCURRENT_DM_LIMIT: 10
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
})

function hasPerm(member) {
    if (member.permissions.has(PermissionFlagsBits.Administrator)) return true
    return CONFIG.ALLOWED_ROLES.some(roleId => member.roles.cache.has(roleId))
}

async function saveData(data) {
    try {
        const json = JSON.stringify(data, null, 2)
        await fs.writeFile(CONFIG.DATA_FILE, json, 'utf8')
        console.log('User locations saved successfully')
    } catch (error) {
        console.error('Error saving user locations:', error)
        throw error
    }
}

async function loadData() {
    try {
        const data = await fs.readFile(CONFIG.DATA_FILE, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('No existing user locations file found')
            return {}
        }
        console.error('Error loading user locations:', error)
        throw error
    }
}

async function lockCh(guild, chId, locked) {
    try {
        const ch = guild.channels.cache.get(chId)
        if (!ch) {
            console.warn(`Channel ${chId} not found`)
            return
        }

        const perms = locked ? {
            ViewChannel: false
        } : {
            ViewChannel: true
        }

        await ch.permissionOverwrites.edit(guild.roles.everyone, perms)
        console.log(`Channel ${ch.name} ${locked ? 'hidden' : 'visible'}`)
    } catch (error) {
        console.error(`Error ${locked ? 'hiding' : 'showing'} channel ${chId}:`, error)
    }
}

class DMQueue {
    constructor(concurrentLimit = CONFIG.CONCURRENT_DM_LIMIT) {
        this.queue = []
        this.running = 0
        this.concurrentLimit = concurrentLimit
        this.stats = {
            total: 0,
            sent: 0,
            failed: 0
        }
    }

    async add(user, message, isMovingToStage = true) {
        return new Promise((resolve) => {
            this.queue.push({ user, message, isMovingToStage, resolve })
            this.stats.total++
            this.process()
        })
    }

    async process() {
        if (this.running >= this.concurrentLimit || this.queue.length === 0) {
            return
        }

        this.running++
        const { user, message, isMovingToStage, resolve } = this.queue.shift()

        try {
            const embed = new EmbedBuilder()
                .setColor(isMovingToStage ? 0x00FF00 : 0x0099FF)
                .setTitle(isMovingToStage ? 'ย้ายไปช่อง ﾉ👋ห้องรอ' : 'ย้ายกลับเข้ากลุ่ม')
                .setDescription(message)
                .setTimestamp()
                .setFooter({ text: 'สภานักเรียน ท่าตะโกพิทยาคม' })

            await user.send({ embeds: [embed] })
            this.stats.sent++
            console.log(`DM sent to ${user.username} (${this.stats.sent}/${this.stats.total})`)
            resolve({ success: true })
        } catch (error) {
            this.stats.failed++
            console.error(`Failed to send DM to ${user.username}:`, error.message)
            resolve({ success: false, error: error.message })
        } finally {
            this.running--
            setTimeout(() => this.process(), 100)
        }
    }

    getStats() {
        return { ...this.stats }
    }

    reset() {
        this.stats = { total: 0, sent: 0, failed: 0 }
    }
}

class ProgressTracker {
    constructor(interaction, totalUsers) {
        this.interaction = interaction
        this.totalUsers = totalUsers
        this.processedUsers = 0
        this.dmsSent = 0
        this.dmsFailed = 0
        this.channelsMoved = 0
        this.channelsFailed = 0
        this.startTime = Date.now()
        this.lastUpdate = 0
    }

    async updateProgress(type, success = true) {
        if (type === 'user') {
            this.processedUsers++
            if (success) this.channelsMoved++
            else this.channelsFailed++
        } else if (type === 'dm') {
            if (success) this.dmsSent++
            else this.dmsFailed++
        }

        const now = Date.now()
        const isComplete = this.processedUsers >= this.totalUsers

        if (now - this.lastUpdate >= CONFIG.UPDATE_INTERVAL || isComplete) {
            await this.sendUpdate(isComplete)
            this.lastUpdate = now
        }
    }

    async sendUpdate(isComplete = false) {
        const elapsed = Date.now() - this.startTime
        const estimatedTotal = this.processedUsers > 0 ?
            (elapsed / this.processedUsers) * this.totalUsers : 0
        const remaining = Math.max(0, estimatedTotal - elapsed)

        const embed = new EmbedBuilder()
            .setColor(isComplete ? 0x00FF00 : 0xFFFF00)
            .setTitle(isComplete ? '✅ การดำเนินการเสร็จสมบูรณ์' : '⏳ กำลังประมวลผล...')
            .setDescription(isComplete ?
                'ผู้ใช้งานทั้งหมดได้รับการประมวลผลแล้ว!' :
                `กำลังประมวลผลผู้ใช้... ${this.processedUsers}/${this.totalUsers}`)
            .addFields(
                {
                    name: '📊 การย้ายช่อง',
                    value: `✅ ${this.channelsMoved} | ❌ ${this.channelsFailed}`,
                    inline: true
                },
                {
                    name: '💬 สถานะข้อความ',
                    value: `✅ ${this.dmsSent} | ❌ ${this.dmsFailed}`,
                    inline: true
                },
                {
                    name: '⏱️ เวลา',
                    value: isComplete ?
                        `เสร็จสิ้นใน ${Math.round(elapsed / 1000)} วินาที` :
                        `ซึ่งอีกประมาณ ${Math.round(remaining / 1000)} วินาที`,
                    inline: true
                }
            )
            .setTimestamp()

        if (!isComplete) {
            const progressBar = this.progressbar(this.processedUsers, this.totalUsers)
            embed.addFields({ name: '📈 ความคืบหน้า', value: progressBar, inline: false })
        }

        await this.interaction.editReply({ embeds: [embed] })
    }

    progressbar(current, total, length = 20) {
        const percentage = Math.round((current / total) * 100)
        const filled = Math.round((current / total) * length)
        const empty = length - filled

        const bar = '█'.repeat(filled) + '░'.repeat(empty)
        return `\`${bar}\` ${percentage}% (${current}/${total})`
    }
}

async function proParallel(members, proFun, proTrack) {
    const promises = members.map(async (memberData, index) => {
        try {
            await new Promise(resolve => setTimeout(resolve, index * 50))

            await proFun(memberData)
            await proTrack.updateProgress('user', true)
            return { success: true, memberData }
        } catch (error) {
            await proTrack.updateProgress('user', false)
            console.error(`Error processing ${memberData.member.user.username}:`, error)
            return { success: false, memberData, error }
        }
    })

    return await Promise.all(promises)
}

async function onStage(inter) {
    const guild = inter.guild
    const userLocs = {}
    let allMembers = []
    const dmQueue = new DMQueue()

    try {
        const embed = new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle('🔍 สแกนช่อง...')
            .setDescription('รวบรวมผู้ใช้จากทุกช่องทางเสียง...')
            .setTimestamp()
        await inter.editReply({ embeds: [embed] })

        const stage = guild.channels.cache.get(CONFIG.STAGE_CHANNEL_ID)
        if (!stage) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ ไม่พบช่อง?')
                .setDescription('ไม่พบช่องเวที!')
                .setTimestamp()
            return await inter.editReply({ embeds: [errorEmbed] })
        }

        const channelPro = Object.entries(CONFIG.VOICE_CHANNELS).map(async ([chId, chName]) => {
            const vc = guild.channels.cache.get(chId)
            if (!vc) {
                console.warn(`Voice channel ${chId} (${chName}) not found`)
                return { chId, chName, members: [] }
            }

            const members = Array.from(vc.members.values())
            console.log(`Found ${members.length} members in ${chName}`)
            return { chId, chName, members }
        })

        const channelRes = await Promise.all(channelPro)

        for (const { chId, chName, members } of channelRes) {
            if (members.length > 0) {
                for (const member of members) {
                    userLocs[member.id] = {
                        channelId: chId,
                        channelName: chName,
                        username: member.user.username
                    }
                    allMembers.push({ member, originalChannel: chName })
                }
            }
            await lockCh(guild, chId, true)
        }

        if (allMembers.length === 0) {
            const noUsersEmbed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('⚠️ ไม่พบผู้ใช้')
                .setDescription('ไม่พบผู้ใช้ในช่องเสียงที่จะย้าย')
                .setTimestamp()
            return await inter.editReply({ embeds: [noUsersEmbed] })
        }

        const pgTrack = new ProgressTracker(inter, allMembers.length)
        await pgTrack.sendUpdate()

        const results = await proParallel(
            allMembers,
            async ({ member, originalChannel }) => {
                await member.voice.setChannel(stage)
                console.log(`Moved ${member.user.username} to stage channel`)

                await new Promise(resolve => setTimeout(resolve, 200))

                try {
                    await member.voice.setSuppressed(true)
                    console.log(`Suppressed ${member.user.username} in stage channel`)
                } catch (suppressError) {
                    console.warn(`Could not suppress ${member.user.username}:`, suppressError.message)
                }

                dmQueue.add(
                    member.user,
                    `เราได้ย้ายคุณจากช่องเสียง **${originalChannel}** ไปยัง **ﾉ👋ห้องรอ** โปรดรอฟังคำแนะนำจากผู้ดำเนินรายการ และคุณจะถูกย้ายกลับไปที่ช่องเดิม!`,
                    true
                ).then(result => {
                    pgTrack.updateProgress('dm', result.success)
                })
            },
            pgTrack
        )

        await saveData(userLocs)

        setTimeout(async () => {
            await pgTrack.sendUpdate(true)
        }, 3000)
    } catch (error) {
        console.error('Error in onStage:', error)
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ เกิดข้อผิดพลาด')
            .setDescription('เกิดข้อผิดพลาดขณะย้ายผู้ใช้ไปยังเวที')
            .setTimestamp()
        await inter.editReply({ embeds: [errorEmbed] })
    }
}

async function back(inter) {
    const guild = inter.guild
    let allMembers = []
    const dmQueue = new DMQueue()

    try {
        const embed = new EmbedBuilder()
            .setColor(0xFFFF00)
            .setTitle('🔍 กำลังโหลดข้อมูลที่บันทึกไว้...')
            .setDescription('กำลังเตรียมย้ายผู้ใช้กลับไปยังช่องทางเดิมของพวกเขา...')
            .setTimestamp()
        await inter.editReply({ embeds: [embed] })

        const userLocs = await loadData()

        if (Object.keys(userLocs).length === 0) {
            const noDataEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ ไม่มีตำแหน่งที่บันทึกไว้')
                .setDescription('ไม่พบตำแหน่งผู้ใช้ที่บันทึกไว้!')
                .setTimestamp()
            return await inter.editReply({ embeds: [noDataEmbed] })
        }

        const stage = guild.channels.cache.get(CONFIG.STAGE_CHANNEL_ID)
        if (!stage) {
            const noStageEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ ไม่พบช่อง')
                .setDescription('ไม่พบช่องเวที!')
                .setTimestamp()
            return await inter.editReply({ embeds: [noStageEmbed] })
        }

        const stageMembers = Array.from(stage.members.values())
        console.log(`Found ${stageMembers.length} members in stage channel`)

        for (const member of stageMembers) {
            const userLoc = userLocs[member.id]
            if (userLoc) {
                const targetCh = guild.channels.cache.get(userLoc.channelId)
                if (targetCh) {
                    allMembers.push({ member, userLoc, targetCh })
                } else {
                    console.warn(`Target channel ${userLoc.channelId} not found for ${member.user.username}`)
                }
            } else {
                console.log(`Ignoring ${member.user.username} (not in saved locations - likely admin/speaker)`)
            }
        }

        if (allMembers.length === 0) {
            const noUsersEmbed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('⚠️ ไม่มีผู้ใช้ที่จะย้าย')
                .setDescription('ไม่พบผู้ใช้รายใดที่จะย้ายกลับไปยังช่องทางเดิมของตน')
                .setTimestamp()
            return await inter.editReply({ embeds: [noUsersEmbed] })
        }

        const pgTrack = new ProgressTracker(inter, allMembers.length)
        await pgTrack.sendUpdate()

        const results = await proParallel(
            allMembers,
            async ({ member, userLoc, targetCh }) => {
                await member.voice.setChannel(targetCh)
                console.log(`Moved ${member.user.username} back to ${userLoc.channelName}`)

                dmQueue.add(
                    member.user,
                    `เราได้ย้ายคุณกลับไปยังกลุ่มเดิมของคุณแล้ว **${userLoc.channelName}** ขอบคุณสำหรับความร่วมมือ!`,
                    false
                ).then(result => {
                    pgTrack.updateProgress('dm', result.success)
                })
            },
            pgTrack
        )

        const channelPromises = Object.keys(CONFIG.VOICE_CHANNELS).map(chId => lockCh(guild, chId, false))
        await Promise.all(channelPromises)

        await saveData({})

        setTimeout(async () => { await pgTrack.sendUpdate(true) }, 3000)
    } catch (error) {
        console.error('Error in back:', error)
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ เกิดข้อผิดพลาด')
            .setDescription('เกิดข้อผิดพลาดขณะย้ายผู้ใช้กลับไปยังช่องของพวกเขา')
            .setTimestamp()
        await inter.editReply({ embeds: [errorEmbed] })
    }
}

async function list(inter) {
    try {
        const data = await loadData()

        if (Object.keys(data).length === 0) {
            const embed = new EmbedBuilder()
                .setColor(0xFFFF00)
                .setTitle('📋 ข้อมูลที่บันทึกไว้')
                .setDescription('ไม่พบข้อมูลที่บันทึกไว้เลย')
                .setTimestamp()
            return await inter.editReply({ embeds: [embed] })
        }

        let desc = ''
        let count = 0

        for (const [userId, userLoc] of Object.entries(data)) {
            count++
            desc += `**${userLoc.username}**\n└ ${userLoc.channelName}\n\n`

            if (desc.length > 3500) {
                desc += '... และอีกมากมาย'
                break
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📋 ข้อมูลที่บันทึกไว้')
            .setDescription(desc)
            .addFields(
                { name: 'จำนวนผู้ใช้', value: Object.keys(data).length.toString(), inline: true },
                { name: 'เปิดเผยช่อง', value: count.toString(), inline: true }
            )
            .setTimestamp()

        await inter.editReply({ embeds: [embed] })
    } catch (error) {
        console.error('Error in list:', error)
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ เกิดข้อผิดพลาด')
            .setDescription('เกิดข้อผิดพลาดขณะโหลดตำแหน่งที่บันทึกไว้')
            .setTimestamp()
        await inter.editReply({ embeds: [embed] })
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)

    const guild = client.guilds.cache.get(CONFIG.SERVER_ID)
    if (!guild) {
        console.error('Guild not found!')
        return
    }

    client.user.setActivity('สภานักเรียน ท่าตะโกพิทยาคม', { type: 3 })
    const cmd = new SlashCommandBuilder()
        .setName('move')
        .setDescription('ย้ายผู้ใช้ระหว่างช่องเสียงและช่องเวที')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action to perform')
                .setRequired(true)
                .addChoices(
                    { name: 'on-stage', value: 'on-stage' },
                    { name: 'back', value: 'back' },
                    { name: 'list', value: 'list' }
                )
        )

    try {
        await guild.commands.create(cmd)
        console.log('Slash command registered successfully!')
    } catch (error) {
        console.error('Error registering slash command:', error)
    }
})

client.on('interactionCreate', async inter => {
    if (!inter.isChatInputCommand()) return
    if (inter.commandName !== 'move') return

    if (inter.guildId !== CONFIG.SERVER_ID) {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ เซิร์ฟเวอร์ผิดพลาด')
            .setDescription('คำสั่งนี้สามารถใช้ได้เฉพาะในเซิร์ฟเวอร์ที่ระบุเท่านั้น')
            .setTimestamp()
        return await inter.reply({ embeds: [embed], ephemeral: true })
    }

    if (!hasPerm(inter.member)) {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ ไม่ได้รับอนุญาต')
            .setDescription('คุณไม่มีสิทธิใช้คำสั่งนี้')
            .setTimestamp()
        return await inter.reply({ embeds: [embed], ephemeral: true })
    }

    const action = inter.options.getString('action')
    await inter.deferReply()

    try {
        if (action === 'on-stage') {
            await onStage(inter)
        } else if (action === 'back') {
            await back(inter)
        } else if (action === 'list') {
            await list(inter)
        }
    } catch (error) {
        console.error('Error handling command:', error)
        if (!inter.replied) {
            const embed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ ข้อผิดพลาดที่ไม่คาดคิด')
                .setDescription('An unexpected error occurred')
                .setTimestamp()
            await inter.editReply({ embeds: [embed], ephemeral: true })
        }
    }
})

client.on('error', error => { console.error('Discord client error:', error) })

client.login(TOKEN)
    .then(() => console.log('Bot logged in successfully!'))
    .catch(error => console.error('Error logging in:', error))

module.exports = { client, CONFIG }