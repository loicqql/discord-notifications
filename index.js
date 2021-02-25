import Discord from 'discord.js';
import fetch from 'node-fetch';

const client = new Discord.Client();

const PREFIX = "!git";

const URL = "https://gitlab.univ-lr.fr/api/v4/projects/?/repository/commits"

const repo = {
  perso: {
    'token' : process.env.TOKEN_PERSO,
  },
  front: {
    'token': process.env.TOKEN_FRONT,
    'id': '3904'
  },
  back: {
    'token': process.env.TOKEN_BACK,
    'id': '3939'
  }
}

client.login(process.env.TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity("Gitlab", { type: 'LISTENING' });
});

client.on('message', message => {

  if (message.content.startsWith(PREFIX)) {
    message.react("👋");

    switch (message.content) {
      case PREFIX:
        req(message.channel, repo.front.id, repo.front.token);
        req(message.channel, repo.back.id, repo.back.token);
        break
      case PREFIX+' front':
        req(message.channel, repo.front.id, repo.front.token);
        break
      case PREFIX+' back':
        req(message.channel, repo.back.id, repo.back.token);
        break
      case PREFIX+' all':
        req(message.channel, repo.front.id, repo.front.token);
        req(message.channel, repo.back.id, repo.back.token);
        break
    }
  }

});

function send(channel, nom,  message, auteur, lien, date, now, avatar) {

  const embed = new Discord.MessageEmbed()
    .setColor(Math.floor((Math.abs(Math.sin(now) * 16777215)) % 16777215).toString(16))
    .setTitle(`Push: ${nom}`)
    .addFields(
      { name: 'Message', value: `[${message}](${lien})` },
      { name: 'Date', value: date }
    )
    .setAuthor(auteur, avatar, 'https://piixl.co')
    channel.send(embed);
}

function req(channel, id, token) {

  let nom;

  fetch(`https://gitlab.univ-lr.fr/api/v4/projects/${id}`, { method: 'GET', headers: {'PRIVATE-TOKEN': token} })
  .then(res => res.json())
  .then(json => {
    nom = json.path_with_namespace;

    fetch(`https://gitlab.univ-lr.fr/api/v4/projects/${id}/repository/commits?all=true`, { method: 'GET', headers: {'PRIVATE-TOKEN': token} })
    .then(res => res.json())
    .then(json => {

      fetch(`https://gitlab.univ-lr.fr/api/v4/avatar?email=${json[json.length-1].committer_email}`,  { method: 'GET', headers: {'PRIVATE-TOKEN': repo.perso.token}})
      .then(res => res.json())
      .then(url => {

        let date = new Date(json[json.length-1].committed_date);
        send(channel, nom, json[json.length-1].message, json[json.length-1].author_name, json[json.length-1].web_url, formatDate(date), date.getTime(), url.avatar_url);
      });
    });
  });

}

function formatDate(date) {
  return date.getHours() + 'h' + date.getMinutes() + ' - ' + date.getDate() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear();
}

//!git front / back / all

//Remplacer image du bot en fonction du projet