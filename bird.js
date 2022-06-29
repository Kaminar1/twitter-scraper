import { exit } from "process"
import { TwitterApi } from "twitter-api-v2"
import { auth, tweetFilter } from "./config.js"
import { writeToJsonFile } from "./utils/fileHandler.js"

const twitterClient = new TwitterApi(auth.accessToken).readOnly.v2

const user = await twitterClient.userByUsername("sagisawaria")

const timeline = await twitterClient.userTimeline(user.data.id, {
  exclude: ["retweets"],
  "tweet.fields": [
    "attachments",
    "author_id",
    "conversation_id",
    "created_at",
    "entities",
    "geo",
    "id",
    "lang",
    "possibly_sensitive",
    "referenced_tweets",
    "source",
    "text",
    "withheld",
  ],
  "media.fields": [
    "type",
    "height",
    "width",
    "media_key",
    "preview_image_url",
    "url",
    "duration_ms",
  ],
  expansions: ["attachments.media_keys"],
  max_results: 100,
})

const passedBirbs = []
for await (const tweet of timeline) {
  // has at least one of the hastags
  const hashtags = tweet?.entities?.hashtags?.map((tag) => tag.tag)
  if (
    !hashtags ||
    !hashtags.some(
      (e) => tweetFilter.atLeastOneMatch.hasHashtagsSome.indexOf(e) > -1
    )
  )
    continue

  // manually filter out replies, to increase max allowed tweet count
  if (tweet?.referenced_tweets?.[0]?.type == "replied_to") continue

  /** @type {import("twitter-api-v2").MediaObjectV2} */
  let image = {}
  // skip if no image
  if (
    !tweet?.attachments?.media_keys?.some((key) => {
      // check if this key is of type "photo"
      return timeline.includes.media.some((m) => {
        if (key === m.media_key && m?.type === "photo") {
          image = m
          return true
        }
        return false
      })
        ? true
        : false
    })
  )
    continue

  //   console.log(tweet.id, " => ", tweet.text, "\n", image)

  const birb = {
    ...tweet,
  }
  birb.entities.media = [image]

  passedBirbs.push(birb)
}

await writeToJsonFile(passedBirbs)
