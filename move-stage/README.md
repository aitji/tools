# Student Council Voice Manager 🎤

> [!NOTE]
> ai generate readme.md file btw, im just public code
> not have time to typing it out sorry!

Discord bot designed for the Tha Tako Phittayakom Student Council server that manages voice channel operations during meetings and events. The bot can move members between voice channels and a stage channel, track their original locations, and restore them after events.

## Features ✨

- **Voice Channel Management**: Move all members from designated group channels to a stage channel for meetings
- **Location Tracking**: Automatically saves and restores members' original voice channel locations
- **Channel Locking**: Temporarily hides group channels during stage events to prevent confusion
- **Progress Tracking**: Real-time progress updates with visual progress bars during operations
- **Bulk DM Notifications**: Sends informative direct messages to moved members with rate limiting
- **Stage Channel Suppression**: Automatically suppresses members when moved to stage channel
- **Permission-Based Access**: Restricted to authorized student council roles only

## Table of Contents 📚

- [Student Council Voice Manager 🎤](#student-council-voice-manager-)
  - [Features ✨](#features-)
  - [Table of Contents 📚](#table-of-contents-)
  - [Installation ⚙️](#installation-️)
  - [Configuration 🔧](#configuration-)
  - [Usage 🚀](#usage-)
    - [`/move on-stage` Command](#move-on-stage-command)
    - [`/move back` Command](#move-back-command)
    - [`/move list` Command](#move-list-command)
  - [How It Works ⚡](#how-it-works-)
  - [Commands 📝](#commands-)
    - [`/move on-stage`](#move-on-stage)
    - [`/move back`](#move-back)
    - [`/move list`](#move-list)
  - [Environment Variables 🌍](#environment-variables-)
  - [Technical Details 🔧](#technical-details-)
    - [Rate Limiting \& Performance](#rate-limiting--performance)
    - [Data Persistence](#data-persistence)
    - [Error Handling](#error-handling)
    - [Bot Permissions Required](#bot-permissions-required)

## Installation ⚙️

To set up the Student Council Voice Manager bot, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/aitji/tools
    cd tools/move-stage
    ```

2. **Install dependencies**:
    This bot uses `discord.js` and `dotenv` for Discord API interaction and environment management:
    ```bash
    npm install discord.js dotenv
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add your bot's Discord token:
    ```ini
    DISCORD_TOKEN=your-discord-bot-token
    ```

4. **Configure the bot**:
    Update the `CONFIG` object in the code with your server's specific IDs (see [Configuration](#configuration-) section).

5. **Run the bot**:
    Start the bot by running:
    ```bash
    node bot.js
    ```

## Configuration 🔧

Before running the bot, you need to configure the following settings in the `CONFIG` object:

```javascript
const CONFIG = {
    SERVER_ID: 'your-server-id',
    ALLOWED_ROLES: [
        'role-id-1',
        'role-id-2',
        'role-id-3',
        'role-id-4'
    ],
    VOICE_CHANNELS: {
        'channel-id-1': 'ﾉ🟢กลุ่มที่ 1  (นิลปัทม์)',
        'channel-id-2': 'ﾉ🔵กลุ่มที่ 2  (บุษกร)',
        'channel-id-3': 'ﾉ🔴กลุ่มที่ 3  (จงกลนี)',
        'channel-id-4': 'ﾉ🟡กลุ่มที่ 4  (ประทุมชาติ)'
    },
    STAGE_CHANNEL_ID: 'stage-channel-id'
}
```

## Usage 🚀

Once the bot is running and properly configured, student council members with appropriate roles can use the `/move` command with different actions.

### `/move on-stage` Command

- **Purpose**: Move all members from group voice channels to the stage channel for meetings
- **Process**: 
  1. Scans all configured voice channels
  2. Saves each member's original location
  3. Moves everyone to the stage channel
  4. Suppresses members in stage channel
  5. Hides original voice channels
  6. Sends DM notifications to moved members

### `/move back` Command

- **Purpose**: Return all members to their original voice channels after the meeting
- **Process**:
  1. Loads saved location data
  2. Moves members back to their original channels
  3. Unhides all voice channels
  4. Sends confirmation DMs
  5. Clears saved location data

### `/move list` Command

- **Purpose**: View currently saved member locations
- **Shows**: Username, original channel name, and total count

## How It Works ⚡

1. **Permission Validation**: 
    Only users with specified student council roles or server administrators can execute commands.

2. **Voice Channel Scanning**: 
    The bot scans all configured group voice channels to identify members that need to be moved.

3. **Location Persistence**: 
    Member locations are saved to a JSON file (`location.json`) to ensure data persists between bot restarts.

4. **Progressive Operations**: 
    Large operations are processed with progress tracking and rate limiting to prevent Discord API rate limits.

5. **DM Queue System**: 
    Direct messages are sent through a queue system with concurrent limits to avoid spam restrictions.

6. **Channel Management**: 
    Voice channels are temporarily hidden during stage events to prevent confusion and unauthorized access.

## Commands 📝

### `/move on-stage`
- **Description**: Moves all members from group voice channels to the stage channel
- **Usage**: `/move on-stage`
- **Permissions**: Student council roles only
- **Effects**: 
  - Moves members to stage channel
  - Suppresses members in stage
  - Hides original channels
  - Sends notification DMs
  - Saves location data

### `/move back`
- **Description**: Returns members to their original voice channels
- **Usage**: `/move back`
- **Permissions**: Student council roles only
- **Requirements**: Must have saved location data from previous `/move on-stage`
- **Effects**:
  - Restores members to original channels
  - Unhides voice channels
  - Sends confirmation DMs
  - Clears location data

### `/move list`
- **Description**: Shows currently saved member locations
- **Usage**: `/move list`
- **Permissions**: Student council roles only
- **Output**: List of usernames and their saved channel locations

## Environment Variables 🌍

The following environment variable is required:

- `DISCORD_TOKEN`: Your Discord bot token obtained from the Discord Developer Portal

## Technical Details 🔧

### Rate Limiting & Performance
- **Concurrent DM Limit**: 10 simultaneous direct messages
- **Processing Delay**: 50ms between member operations
- **Progress Updates**: Every 2 seconds during operations
- **Queue Processing**: 100ms delay between DM attempts

### Data Persistence
- **Storage**: JSON file (`location.json`)
- **Structure**: User ID → Channel ID, Channel Name, Username
- **Backup**: Automatic file creation and error handling

### Error Handling
- **Network Errors**: Automatic retry mechanisms
- **Missing Channels**: Graceful degradation with warnings
- **Permission Errors**: Detailed logging and user feedback
- **Data Corruption**: Fallback to empty state with notifications

### Bot Permissions Required
- **Voice State Management**: Move members between channels
- **Channel Management**: Modify channel permissions
- **Send Messages**: Reply to commands and send DMs
- **Embed Links**: Send rich embed messages
- **View Channels**: Access voice and text channels
- **Manage Roles**: Check member permissions