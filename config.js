export default {
  // Discord related parameters
  discord: {
    // Discord token
    token: process.env.TOKEN_DISCORD,

    // Bot command prefix
    prefix: process.env.PREFIX,

    // Channel ID (optional, "auto" or null will pick the channel of the call message)
    channel: process.env.CHANNEL,
  },

  // Repositories you want to get
  repositories: {
    front: {
      token: process.env.TOKEN_FRONT,
      id: process.env.ID_FRONT,
      secret: process.env.SECRET_FRONT,
    },
    back: {
      token: process.env.TOKEN_BACK,
      id: process.env.ID_BACK,
      secret: process.env.TOKEN_BACK,
    }
  },

  // Authentication token
  auth: {
    token: process.env.TOKEN_USER
  },

  // Gitlab instance url
  url: process.env.URL
}