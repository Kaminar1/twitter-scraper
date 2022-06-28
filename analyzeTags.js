import { TweetUserTimelineV2Paginator, TwitterApi } from "twitter-api-v2"
import { auth, tweet } from "./config.js"

const twitterClient = new TwitterApi(auth.accessToken).readOnly.v2

const user = await twitterClient.userByUsername("sagisawaria")

console.log(user)
const user_id = user.data.id

/** function to figure out most common words used from at set og hashtags
 * @param  {string[]} tags - list of twitter tags
 */
const countCommonWordsWithTags = async (tags) => {
  let hasNextToken = true
  let nextToken = null
  const options = {
    exclude: ["replies", "retweets"],
    max_results: 100,
    "tweet.fields": ["text", "entities"],
  }

  /** @type {Map<string, number>} */
  const wordCount = new Map()

  while (hasNextToken) {
    /** @type {TweetUserTimelineV2Paginator} */
    let page = await getPage(options, nextToken)

    if (page?.meta?.result_count && page?.meta?.result_count > 0) {
      //? put data into another array, and then do the processing at the end?

      for await (const tweet of page) {
        const hashtags = tweet?.entities?.hashtags?.map((tag) => tag.tag)
        if (!hashtags) continue

        // check if tweet has at least one required tag
        if (!hashtags.some((e) => tags.indexOf(e) > -1)) continue

        let words = tweet.text
          .replaceAll(/\n/gi, " ")
          .trim()
          .toLowerCase()
          .split(" ")

        for (const word of words) {
          addToMap(wordCount, word)
        }
      }

      console.log(page.meta)
      if (page.meta.next_token) nextToken = page.meta.next_token
      else {
        hasNextToken = false
      }
    } else {
      hasNextToken = false
    }
  }

  // turn map into array for sorting
  const sortedArray = [...wordCount].sort(
    ([key1, value1], [key2, value2]) => value1 - value2
  )
  const sortedMap = new Map(sortedArray)
  //   console.log(sortedMap)
}

const getPage = async (params, _nextToken) => {
  if (_nextToken) {
    params.pagination_token = _nextToken
  }
  return twitterClient.userTimeline(user_id, params)
}

/**
 * @param  {Map<string, number>} wordCount
 * @param  {string} word
 */
const addToMap = (wordCount, word) => {
  if (wordCount.has(word)) wordCount.set(word, wordCount.get(word) + 1)
  else wordCount.set(word, 1)
}

await countCommonWordsWithTags(tweet.atLeastOneMatch.hasHashtagsSome)
