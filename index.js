const Discord = require('discord.js');
const fetch = require('node-fetch');
const path = require('path');

const config = require('./config.js');

const http = require('http');
const createHandler = require('node-gitlab-webhook');

let routes = [];

for (const repo of Object.values(config.repositories)) {
  routes.push({
    path: repo.slug, secret: repo.secret
  })
}

var handler = createHandler(routes);

const client = new Discord.Client();

client.login(config.discord.token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(config.url.substring(0, config.url.length - 1).replace('https://', '').replace('http://', ''), { type: 'LISTENING' });

  let choices = [];

  for (const [key, repo] of Object.entries(config.repositories)) {
    choices.push({
      "name": key,
      "value": key
    })
  }

  client.api.applications(client.user.id).guilds(config.discord.guild).commands.post({
    data: {
        name: "git",
        description: "Get the lastest push",
        options: [{
          "name": "repo",
          "description" : "name of the repo",
          "type": 3,
          "required": true,
          "choices": choices
        }]
    }
  });

  client.ws.on('INTERACTION_CREATE', async (interaction) => {

    const command = interaction.data.options[0].value;
    
    for (const [key, repo] of Object.entries(config.repositories)) {
      if (command === key) {
        req(client.channels.cache.get(interaction.channel_id), repo.id, repo.token, async (req) => {

          const embed = new Discord.MessageEmbed()
          .setColor(Math.floor((Math.abs(Math.sin(req.now) * 16777215)) % 16777215).toString(16))
          .setTitle(`Push: ${req.name}`)
          .addFields(
            { name: 'Message', value: `[${req.message}](${req.link})` },
            { name: 'Date', value: req.date }
          )
          .setAuthor(req.author, req.avatar);

          const createApiMessage = async (interaction, content) => {
            const {data, files} = await Discord.APIMessage.create(
              client.channels.resolve(interaction.channel_id), 
              content
            )
            .resolveData()
            .resolveFiles()

            return{...data, files}
          }

          let data = await createApiMessage(interaction, embed);

          client.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
              type: 4,
              data: data
            }
          });
        });
      }
    }
  })

});

client.on('message', message => {

  if(message.content === "!channel") {
    message.channel.send(message.channel.id);
  }

  if (message.content.startsWith(config.discord.prefix)) {
    if(config.discord.emoji) {
      let emoji = client.emojis.cache.find(emoji => emoji.name === config.discord.emoji);
      message.react(emoji ? emoji.id : "👋");
    }else {
      message.react("👋");
    }
    //const channel = !config.discord.channel || config.discord.channel === 'auto' ? message.channel : config.discord.channel;

    const channel = message.channel;

    if (message.content === config.discord.prefix + ' all' || message.content === config.discord.prefix) {
      for (const repo of Object.values(config.repositories))
        req(channel, repo.id, repo.token);
    }
    else {
      for (const [key, repo] of Object.entries(config.repositories)) {
        if (message.content.startsWith(config.discord.prefix + " ") && message.content.includes(key)) {
          req(channel, repo.id, repo.token);
        }
      }
    }
  }

});

function send(channel, name,  message, author, link, date, now, avatar) {
  const embed = new Discord.MessageEmbed()
    .setColor(Math.floor((Math.abs(Math.sin(now) * 16777215)) % 16777215).toString(16))
    .setTitle(`Push: ${name}`)
    .addFields(
      { name: 'Message', value: `[${message}](${link})` },
      { name: 'Date', value: date }
    )
    .setAuthor(author, avatar);
    channel.send(embed);
}

function req(channel, id, token, slash) {
  fetch(`${config.url}api/v4/projects/${id}`, { method: 'GET', headers: {'PRIVATE-TOKEN': token} })
  .then(res => res.json())
  .then(json => {
    // Get author name
    const name = json.path_with_namespace;
    fetch(`${config.url}api/v4/projects/${id}/repository/commits?all=true`, { method: 'GET', headers: {'PRIVATE-TOKEN': token} })
    .then(res => res.json())
    .then(json => {
      if (config?.auth?.token) {
        fetch(`${config.url}api/v4/avatar?email=${json[json.length - 1].committer_email}`,  { method: 'GET', headers: {'PRIVATE-TOKEN': config.auth.token}})
        .then(res => res.json())
        .then(url => {
          // Get commit date
          const date = new Date(json[json.length - 1].committed_date).toLocaleString(config.time.locales, {timeZone: config.time.timezone});
          const color = new Date(json[json.length - 1].committed_date).getTime();

          if(slash) {
            // Reply to slash command
            slash({channel: channel, name: name, message: json[json.length - 1].message, author: json[json.length - 1].author_name, link: json[json.length - 1].web_url, date: date, now: color, avatar: url.avatar_url});
          }else {
            // Send commit message to channel
            send(channel, name, json[json.length - 1].message, json[json.length - 1].author_name, json[json.length - 1].web_url, date, color, url.avatar_url);
          }
        });
      }
      else {
        // Get commit date
        const date = new Date(json[json.length - 1].committed_date).toLocaleString(config.time.locales, {timeZone: config.time.timezone});
        const color = new Date(json[json.length - 1].committed_date).getTime();

        if(slash) {
          // Reply to slash command
          slash({channel: channel, name: name, message: json[json.length - 1].message, author: json[json.length - 1].author_name, link: json[json.length - 1].web_url, date: date, now: color, avatar: path.resolve('./assets/img/default_avatar.png')})
        }else {
          // Send commit message to channel
          send(channel, name, json[json.length - 1].message, json[json.length - 1].author_name, json[json.length - 1].web_url, date, color, path.resolve('./assets/img/default_avatar.png'));
        }

      }
    });
  });
}

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  })
}).listen(config.port);

handler.on('error', function (err) {
  console.error('Error:', err.message);
})
 
handler.on('push', function (event) {
  for (const repo of Object.values(config.repositories)) {
    if(repo.slug === event.path) {
      req(client.channels.cache.get(config.discord.channel), repo.id, repo.token);
    }
  }
})