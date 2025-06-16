import express from 'express';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  Events,
  EmbedBuilder,
  GatewayIntentBits,
  REST,
  Routes
} from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import {
  handleMenu
} from './commands/random-food.js';
import {
  handleDessertMenu
} from './commands/random-dessert.js';
import {
  execute as executeEvents
} from './commands/event.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('Bot is Working!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Define the commands
const commands = [{
    name: 'menu',
    description: 'Random Food🍕',
  },
  {
    name: 'dessert-menu',
    description: 'Random Dessert🥞',
  },
  {
    name: 'calendar',
    description: 'ดูตารางกิจกรรมจาก Google Calendar📅',
  }
];

// Register commands using REST API
const rest = new REST({
  version: '10'
}).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // Register commands to the Discord API
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Initialize the client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// Client Ready Event
client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);

  readyClient.user.setActivity('รอรับคำสั่งจากปิงแวรค์ซ่าๆ', {
    type: 3
  });
});


// Interaction Create Event
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'menu') {
    await handleMenu(interaction, client);
  }

  if (interaction.commandName === 'dessert-menu') {
    await handleDessertMenu(interaction, client);
  }

  if (interaction.commandName === 'calendar') {
    client.user.setActivity('ดูกิจกรรมจาก Google Calendar', {
      type: 0
    });
    await executeEvents(interaction, client);
  }
});

// Login the bot
client.login(process.env.TOKEN);