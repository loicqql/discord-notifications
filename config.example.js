export default {
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
  url: 'https://gitlab.com/'
}