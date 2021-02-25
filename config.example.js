export default {
  // Discord related parameters
  discord: {
    // Discord token
    token: 'discord_token',

    // Bot command prefix
    prefix: '!git',

    // Channel ID (optional, "auto" or null will pick the channel of the call message)
    channel: 'auto',
  },

  // Repositories you want to get
  repositories: {
    front: {
      token: 'authorization_token',
      id: 'repository_repo'
    },
    back: {
      token: 'authorization_token',
      id: 'repository_repo'
    }
  },

  // Authentication token
  auth: {
    token: 'authorization_token'
  },

  // Gitlab instance url
  url: 'https://gitlab.com/',
}