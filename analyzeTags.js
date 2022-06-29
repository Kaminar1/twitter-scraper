import { TweetUserTimelineV2Paginator, TwitterApi } from "twitter-api-v2"
import { auth, tweetFilter } from "./config.js"
import { writeToJsonFile } from "./utils/fileHandler.js"

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
    exclude: ["retweets"],
    max_results: 100,
    "tweet.fields": ["text", "entities", "referenced_tweets"],
  }

  /** @type {Map<string, number>} */
  const wordCount = new Map()
  /** @type {TweetV2[]} */
  const passedTweets = []

  while (hasNextToken) {
    /** @type {TweetUserTimelineV2Paginator} */
    let page = await getPage(options, nextToken)

    if (page?.meta?.result_count && page?.meta?.result_count > 0) {
      for await (const tweet of page) {
        const hashtags = tweet?.entities?.hashtags?.map((tag) => tag.tag)
        if (!hashtags) continue

        // check if tweet has at least one required tag
        if (!hashtags.some((e) => tags.indexOf(e) > -1)) continue

        // manually filter out replies, to increase max allowed tweet count
        if (tweet?.referenced_tweets?.[0]?.type == "replied_to") continue

        passedTweets.push(tweet)

        let words = tweet.text
          .replaceAll(/\n/gi, " ")
          .trim()
          .toLowerCase()
          .split(" ")

        for (const word of words) {
          addToMap(wordCount, word)
        }
      }

      if (page.meta.next_token) nextToken = page.meta.next_token
      else {
        hasNextToken = false
      }
    } else {
      hasNextToken = false
    }
    console.log(page.meta)
    console.log("passed tweets:", passedTweets.length)
  }

  // turn map into array for sorting
  const sortedArray = [...wordCount].sort(
    ([key1, value1], [key2, value2]) => value2 - value1
  )
  const sortedMap = new Map(sortedArray)
  //   console.log(sortedMap)

  await writeToJsonFile(mapToObj(sortedMap))
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
// convert map into object without altering order
const mapToObj = (inputMap) => {
  const obj = {}
  inputMap.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

countCommonWordsWithTags(tweetFilter.atLeastOneMatch.hasHashtagsSome)
