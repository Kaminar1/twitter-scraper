# twitter-scraper

[ ] Go through all videos in the database  
[ ] Fetch tweets (for this time period?) on a 'timeline'  
[ ] Group tweets with videos that are posted in a set timeframe?  
[ ] filter out tweets based on filter config:

- has image
- has at least one from a set of hastags
- has at least one from a set of words/terms
- a "reply" has link to the twitch?
- has an exact matching phrase from a Set

As this might take a while to make 100% correct guesses linked to a `vod_id` in the database, make a backup solution in React to manually link with "best guesses".

## ![toodank](https://cdn.betterttv.net/emote/5ad22a7096065b6c6bddf7f3/1x) → ![dankies](https://cdn.betterttv.net/emote/5f92938a710f8302f0c8ee82/1x)

Split into two parts:

- Find tweets based on a filter, and save them to the database.
- Go through the database and find matches from vod coll and tweets coll

---

Example of 2 _tweet-objects_ where the first is the reply to the second, only containing link to twitch (in `text` field).

```json
 {
    "referenced_tweets": [
        {
            "type": "replied_to",
            "id": "1529542882897575939"
        }
    ],
    "text": "https://t.co/Qjcj7IoKeU",
    "created_at": "2022-05-25T19:20:22.000Z",
    "author_id": "1288894693527498754",
    "id": "1529542912761012224",
    "entities": {
        "urls": [
            {
                "start": 0,
                "end": 23,
                "url": "https://t.co/Qjcj7IoKeU",
                "expanded_url": "https://www.twitch.tv/sagisawaria",
                "display_url": "twitch.tv/sagisawaria"
            }
        ]
    },
    "conversation_id": "1529542882897575939",
    "lang": "und",
    "source": "Twitter Web App",
    "possibly_sensitive": false
},

```

```json
{
  "referenced_tweets": [
    {
      "type": "quoted",
      "id": "1529528152711634945"
    }
  ],
  "text": "yeyeyyy we chillin today! I just want to talk to you guys about whatever c: and play games? ☺️💕\n\nStarting in 10 mins at 3:30 pm edt! ⏲️\nLink to stream below! 👇\n\n#chimeRIA #ENVtuber #VTuberEN https://t.co/3Ltw8kVAPj https://t.co/Cwmgk3hjRc",
  "created_at": "2022-05-25T19:20:15.000Z",
  "author_id": "1288894693527498754",
  "id": "1529542882897575939",
  "entities": {
    "urls": [
      {
        "start": 191,
        "end": 214,
        "url": "https://t.co/3Ltw8kVAPj",
        "expanded_url": "https://twitter.com/sagisawaria/status/1529542882897575939/photo/1",
        "display_url": "pic.twitter.com/3Ltw8kVAPj",
        "media_key": "3_1529542845039886340"
      },
      {
        "start": 215,
        "end": 238,
        "url": "https://t.co/Cwmgk3hjRc",
        "expanded_url": "https://twitter.com/sagisawaria/status/1529528152711634945",
        "display_url": "twitter.com/sagisawaria/st…"
      }
    ],
    "hashtags": [
      {
        "start": 161,
        "end": 170,
        "tag": "chimeRIA"
      },
      {
        "start": 171,
        "end": 180,
        "tag": "ENVtuber"
      },
      {
        "start": 181,
        "end": 190,
        "tag": "VTuberEN"
      }
    ]
  },
  "conversation_id": "1529542882897575939",
  "lang": "en",
  "source": "Twitter Web App",
  "possibly_sensitive": false,
  "attachments": {
    "media_keys": ["3_1529542845039886340"]
  }
}
```
