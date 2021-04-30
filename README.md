A script using nightmareJs to crawl immoscout and send new search results to telegram using a telegram bot.

Usage
First you need some mandatory prerequisites (update corresponding const variables within index.js)
1) Create a telegram bot (see https://core.telegram.org/bots#3-how-do-i-create-a-bot ) and get bot token (fill into const botToken in index.js)
2) Create a new chat, add the bot to the chat and get chatId (fill into const chatId in index.js)
3) Using https://www.immobilienscout24.de create a search according to your needs and copy the search url with all your filters into const searchUrl in index.js (might be something like `https://www.immobilienscout24.de/Suche/radius/haus-kaufen?centerofsearchaddress=.....`)

4) install dependencies `npm install`
5) run script `npm run start`

Next steps: Automate the run script part using some kind of cronjob.