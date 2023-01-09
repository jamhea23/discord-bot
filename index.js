const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
  console.log("Ready!");
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.login(token);
// ----------------------------------------------------------------------------------SCHEDULER------------------------------------------------------------------------------------
// Set the time that the greeting message should be sent
const greetingTime = "07:00";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Get the current time
  const currentTime = new Date();
  // Set the hours and minutes for the greeting time
  const greetingHours = parseInt(greetingTime.split(":")[0]);
  const greetingMinutes = parseInt(greetingTime.split(":")[1]);

  // If the current hours and minutes match the greeting time, send the greeting message
  if (
    currentTime.getHours() === greetingHours &&
    currentTime.getMinutes() === greetingMinutes
  ) {
    sendGreetingMessage();
  } else {
    // Calculate the time until the next greeting time
    const timeUntilGreeting = calculateTimeUntilGreeting(
      currentTime,
      greetingHours,
      greetingMinutes
    );
    // Set a timer to send the greeting message at the next greeting time
    setTimeout(sendGreetingMessage, timeUntilGreeting);
  }
});

function sendGreetingMessage() {
  // Replace CHANNEL_ID_HERE with the ID of the channel you want to send the message to
  const channel = client.channels.cache.get("1048173545584336919");
  channel.send("Good morning!");

  // Set a timer to send the greeting message every day at the specified greeting time
  setInterval(() => {
    channel.send("Good morning!");
  }, 1000 * 60 * 60 * 24);
}

function calculateTimeUntilGreeting(
  currentTime,
  greetingHours,
  greetingMinutes
) {
  // Calculate the time until the next greeting time in milliseconds
  let timeUntilGreeting = 0;
  if (
    currentTime.getHours() < greetingHours ||
    (currentTime.getHours() === greetingHours &&
      currentTime.getMinutes() < greetingMinutes)
  ) {
    // The greeting time is today
    timeUntilGreeting = greetingHours - currentTime.getHours();
    60 * 60 * 1000; // Hours to milliseconds
    timeUntilGreeting +=
      (greetingMinutes - currentTime.getMinutes()) * 60 * 1000; // Minutes to milliseconds
  } else {
    // The greeting time is tomorrow
    timeUntilGreeting =
      (24 - currentTime.getHours() + greetingHours) * 60 * 60 * 1000; // Hours to milliseconds
    timeUntilGreeting +=
      (greetingMinutes - currentTime.getMinutes()) * 60 * 1000; // Minutes to milliseconds
    timeUntilGreeting += (24 - currentTime.getHours()) * 60 * 60 * 1000; // Add a day in milliseconds
  }
  return timeUntilGreeting;
}
