import Discord from 'discord.js';
import fetch from 'node-fetch';
import path from 'path';
import config from './config.js';

import http from 'http';
import createHandler from 'node-gitlab-webhook';

var handler = createHandler([ // multiple handlers
  { path: '/front', secret: config.repositories.front.secret},
  { path: '/back', secret: config.repositories.back.secret }
]);

const client = new Discord.Client();

client.login(config.discord.token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(config.url, { type: 'LISTENING' });
});

client.on('message', message => {

  if (message.content.startsWith(config.discord.prefix)) {
    message.react("👋");
    const channel = !config.discord.channel || config.discord.channel === 'auto' ? message.channel : config.discord.channel;

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

function req(channel, id, token) {
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
          const date = new Date(json[json.length - 1].committed_date);
          // Send commit message to channel
          send(channel, name, json[json.length - 1].message, json[json.length - 1].author_name, json[json.length - 1].web_url, formatDate(date), date.getTime(), url.avatar_url);
        });
      }
      else {
        // Get commit date
        const date = new Date(json[json.length - 1].committed_date);
        // Send commit message to channel
        send(channel, name, json[json.length - 1].message, json[json.length - 1].author_name, json[json.length - 1].web_url, formatDate(date), date.getTime(), path.resolve('./assets/img/default_avatar.png'));
      }
    });
  });
}

function formatDate(date) {
  return date.getHours() + 'h' + date.getMinutes() + ' - ' + date.getDate() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
}

http.createServer(function (req, res) {
  console.log('server');

  console.log(req);

  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  })
}).listen(process.env.PORT);

handler.on('error', function (err) {
  console.error('Error:', err.message);
})
 
handler.on('push', function (event) {
  console.log(
    'Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref
  )
  switch (event.path) {
    case '/front':
      console.log('front');
      break
    case '/back':
      console.log('back');
      break
    default:
      console.log('def');
      break
  }
})