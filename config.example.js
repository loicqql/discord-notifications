module.exports = {
  // Discord related parameters
  discord: {
    // Discord token
    token: 'discord_token',

    // Bot command prefix
    prefix: '!git',

    // Channel ID (optional, "auto" or null will pick the channel of the call message)
    channel: 'auto',

    //Name of emoji use for react (optional, dot not use :)
    emoji: 'emojiName',
  },

  // Repositories you want to get
  repositories: {
    front: {
      token: 'authorization_token',
      id: 'repository_repo',
      secret: 'secret_repo',
      slug: '/slug_webhook'
    },
    back: {
      token: 'authorization_token',
      id: 'repository_repo',
      secret: 'secret_repo',
      slug: '/slug_webhook'
    }
  },

  // Authentication token
  auth: {
    token: 'authorization_token'
  },

  // Gitlab instance url
  url: 'https://gitlab.com/',

  // Server port
  port: '8080',

  // Set Local Time
  time: {
    locales: 'fr-FR', //https://www.w3schools.com/jsref/jsref_tolocalestring.asp
    timezone: 'Europe/Paris' //https://stackoverflow.com/questions/439630/create-a-date-with-a-set-timezone-without-using-a-string-representation#answer-54453990
  }
}