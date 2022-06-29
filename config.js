// config for twitter API, only the bearer token is required
export const auth = {
  accessToken: "",
}

export const tweetFilter = {
  username: "sagisawaria",
  hasImage: true,
  atLeastOneMatch: {
    hasHashtagsSome: ["chimeRIA", "ENVtuber", "VTuberEN", "chimeRIO"],
    hasWordsSome: ["stream", "strim", "starting"],
    hasLinktoTwitch: true, // either in text, media(?) or replies
  },
}
