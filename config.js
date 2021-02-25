export default {
  // Discord related parameters
  discord: {
    // Discord token
    token: process.env.TOKEN_DISCORD,

    // Bot command prefix
    prefix: process.env.PREFIX,

    // Channel ID (optional)
    channel: process.env.CHANNEL,
  },

  // Repositories you want to get
  repositories: {
    front: {
      token: process.env.TOKEN_FRONT,
      id: process.env.ID_FRONT
    },
    back: {
      token: process.env.TOKEN_BACK,
      id: process.env.ID_BACK
    }
  },

  // Authentication token
  auth: {
    token: process.env.TOKEN_USER
  },

  // Gitlab instance url
  url: process.env.URL
}