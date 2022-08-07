import { exit } from "process"
import { TwitterApi } from "twitter-api-v2"
import { auth, tweetFilter } from "./config.js"
import { writeToJsonFile } from "./utils/fileHandler.js"

/** Object with an extra field for reference
 * @param  {import("twitter-api-v2").ReferencedTweetV2} reference
 * @param  {import("twitter-api-v2").TweetV2} tweet
 */
class SubTweet {
  constructor(reference, tweet) {
    this.reference = reference

    tweet.referenced_tweets = undefined
    this.body = tweet
  }
}

const twitterClient = new TwitterApi(auth.accessToken).readOnly.v2

const user = await twitterClient.userByUsername("sagisawaria")

const timeline = await twitterClient.userTimeline(user.data.id, {
  exclude: ["retweets"],
  "tweet.fields": [
    "attachments",
    "author_id",
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

/** @type {Map<string, SubTweet[]>} */
const references = new Map()

for await (const tweet of timeline) {
  // put replies and quotes into reference Map, since these come before the original tweet.
  const ref = tweet?.referenced_tweets?.[0]
  if (ref?.type === "replied_to" || ref?.type === "quoted") {
    if (!references.has(ref.id)) references.set(ref.id, new Array())
    const storedReferences = references.get(ref.id)

    const subTweet = new SubTweet(ref, tweet)
    storedReferences.push(subTweet)

    continue
  }

  // has at least one of the hastags
  const hashtags = tweet?.entities?.hashtags?.map((tag) => tag.tag)
  if (
    !hashtags ||
    !hashtags.some((e) => tweetFilter.hasHashtagsSome.indexOf(e) > -1)
  )
    continue

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

  const birb = {
    ...tweet,
    subtweets: references.get(tweet.id),
  }
  birb.entities.media = [image]

  passedBirbs.push(birb)
}

await writeToJsonFile(passedBirbs)
