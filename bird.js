import { Console } from "console"
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

let request = {
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
  "media.fields": ["type", "height", "width", "media_key", "preview_image_url", "url", "duration_ms"],
  expansions: ["attachments.media_keys"],
  max_results: 100,
}
/** @type {Array<import("twitter-api-v2").TweetUserTimelineV2Paginator>} */
const pages = []
let tl = await twitterClient.userTimeline(user.data.id, request)
pages.push(tl)

// pagnate the results?
while (tl?.meta?.next_token) {
  request.pagination_token = tl?.meta?.next_token

  console.debug(
    request.pagination_token,
    pages.reduce((partial, a) => partial + a.data.data.length, 0)
  )

  tl = await twitterClient.userTimeline(user.data.id, request)

  pages.push(tl)
}

const passedBirbs = []

/** @type {Map<string, SubTweet[]>} */
const references = new Map()

for await (const timeline of pages) {
  for await (const tweet of timeline) {
    // put replies and quotes into reference Map, since these come before the original tweet.
    const ref = tweet?.referenced_tweets?.[0]
    if (ref?.type === "replied_to" || ref?.type === "quoted") {
      if (!references.has(ref.id)) references.set(ref.id, new Array())
      const storedReferences = references.get(ref.id)

      const subTweet = new SubTweet(ref, tweet)
      storedReferences.push(subTweet)
      references.set(ref.id, storedReferences)

      continue
    }

    let commonStartingPattern =
      /^.*starting.*\s(early|now|soon|later|before|after|in|at|an|today|tomorrow|tonight|yesterday).*$/gim

    // has at least one of the hastags
    const hashtags = tweet?.entities?.hashtags?.map((tag) => tag.tag)
    if (
      (!hashtags || !hashtags.some((e) => tweetFilter.hasHashtagsSome.indexOf(e) > -1)) &&
      !commonStartingPattern.test(tweet.text)
    )
      continue

    /** @type {import("twitter-api-v2").MediaObjectV2} */
    let image = {}
    let extraImageInfo = { imageCode: "", png: "", jpg: "", webp: "" }
    // skip if no image
    if (
      !tweet?.attachments?.media_keys?.some((key) => {
        // check if this key is of type "photo"
        return timeline.includes.media.some((m) => {
          if (key === m.media_key && m?.type === "photo") {
            image = m
            // this code should be e.g. FmOdc1CXgAA9ddJ from the link
            const imageCode = m.url.split("/").pop().split(".")[0]
            extraImageInfo.imageCode = imageCode
            extraImageInfo.png = `https://pbs.twimg.com/media/${imageCode}?format=png&name=large`
            extraImageInfo.jpg = `https://pbs.twimg.com/media/${imageCode}?format=jpg&name=large`
            extraImageInfo.webp = `https://pbs.twimg.com/media/${imageCode}?format=webp&name=large`

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
      subtweets: references.get(tweet.id), // find a way to optimize this... 95MB vs 4MB by including this.
      //? Maybe we don't need it to be a map, but just a list of quoted tweets? check if we can know the reference with just checking the Set of all...
      // - if we can do this, then just split the file into "data" and "references"
    }
    image.extra = extraImageInfo
    birb.entities.media = [image]

    passedBirbs.push(birb)
  }
}
await writeToJsonFile(passedBirbs)
