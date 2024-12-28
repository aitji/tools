# PR-Thatako Role Updater 🛠️

Discord bot that helps server administrators quickly upgrade roles for eligible members. With the `/upgrade` command, admins can upgrade users in a series of classrooms based on their current roles.

## Features ✨

- **Role Upgrade**: Admins can upgrade users from one classroom to the next based on their current role.
- **Admin-Only Command**: The `/upgrade` command is only accessible to users with an admin role.
- **Progress Tracking**: Provides real-time progress updates while upgrading members.
- **Error Handling**: Includes robust error handling to log and notify the admin if something goes wrong during the upgrade process.

## Table of Contents 📚

- [PR-Thatako Role Updater 🛠️](#pr-thatako-role-updater-️)
  - [Features ✨](#features-)
  - [Table of Contents 📚](#table-of-contents-)
  - [Installation ⚙️](#installation-️)
  - [Usage 🔧](#usage-)
    - [`/upgrade` Command](#upgrade-command)
  - [How It Works ⚡](#how-it-works-)
  - [Commands 📝](#commands-)
    - [`/upgrade`](#upgrade)
  - [Environment Variables 🌍](#environment-variables-)

## Installation ⚙️

To get started with PR-Thatako, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/aitji/tools
    cd tools/pr-thatako
    ```

2. **Install dependencies**:
    This bot uses `discord.js` to interact with the Discord API. You can install it using npm:
    ```bash
    npm install discord.js
    ```

3. **Set up environment variables**:
    You need to configure your environment to use the bot. Create a `.env` file in the root directory and add your bot's Discord token like this:
    ```ini
    DISCORD_TOKEN=your-discord-bot-token
    ```

4. **Run the bot**:
    After setting up the environment, start the bot by running:
    ```bash
    node upgrade.js
    ```

## Usage 🔧

Once the bot is running, you can use the `/upgrade` command within your Discord server.

### `/upgrade` Command

- **Description**: Upgrades eligible members from one classroom to the next in a sequential order.
- **Usage**: Only accessible to users with the **admin** role.
  
When you invoke the command, the bot will upgrade eligible members by checking their current roles and moving them to the next role in the `classroom` list.

## How It Works ⚡

1. **Admin Role Validation**: 
    Only users with the admin role (specified by the `admin` variable) can execute the `/upgrade` command.

2. **Role Management**: 
    The bot checks all the members in the server and verifies if they have a role corresponding to one of the "classrooms." The classrooms are defined as:
    - Classroom 1: `1276808239207546900`
    - Classroom 2: `1276808281192661022`
    - Classroom 3: `1276808319796772905`
    - Classroom 4: `1276808371433111654`
    - Classroom 5: `1276808394178826250`
    - Classroom 6: `1276808414693031937`
    - Alumni: `1243565742364823623`

    Eligible members will be upgraded from one classroom to the next in the sequence.

3. **Progress Tracking**: 
    During the upgrade process, the bot will send periodic updates in the channel, showing the number of members upgraded and skipped.

4. **Error Handling**: 
    If an error occurs while upgrading a member (e.g., missing roles or issues with permissions), the bot will log the error and continue upgrading the next members.

## Commands 📝

### `/upgrade`
- **Description**: Upgrades eligible members from one classroom to the next based on their current role.
- **Usage**: Only available to users with the admin role.

## Environment Variables 🌍

You must set up the following environment variable to run the bot:

- `DISCORD_TOKEN`: The Discord bot token you obtain from the Discord Developer Portal.