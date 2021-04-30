const Nightmare = require('nightmare')
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const nightmare = Nightmare({ show: false })

const searchUrl = undefined // TODO fill it
const botToken = undefined // TODO fill it
const chatId = undefined // TODO fill it

const TEN_MINUTES = 10 * 60 * 1000;

const bot = new TelegramBot(botToken);

let rawKnownHouses = fs.readFileSync('knownHouses.json');
let knownHouses = JSON.parse(rawKnownHouses)

function parseSearchResult() {
    let searchResultHtmlElements = document.querySelectorAll('article');
    let parsedHouses = []
    searchResultHtmlElements.forEach(searchResult => {
        let parsedHouse = {
            'title': searchResult.querySelector('h5').innerText,
            'link': searchResult.querySelector('a').href,
            'address': searchResult.querySelector('div[class="result-list-entry__address"]').innerText,
            'crawlTimestamp': new Date()
        }
        let mainInformations = searchResult.querySelectorAll('dl');
        mainInformations.forEach(info => {
            let value = info.querySelector('dd').innerText;
            let description = info.querySelector('dt').innerText;
            parsedHouse[description] = value;
        })
        parsedHouses.push(parsedHouse);
    });
    return parsedHouses;
}

function updateKnownHousesFile(knownHouses) {
    let data = JSON.stringify(knownHouses);
    fs.writeFile('knownHouses.json', data, (err) => {
        if (err) {
            throw err;
        }
    });
}

function updateKnownHouses() {
    nightmare
        .goto(searchUrl)
        .wait('#searchHead')
        .evaluate(parseSearchResult)
        .end()
        .then(houses => {
            let knownHouseLinks = knownHouses.map(house => house.link)
            let newHouses = houses.filter(house => !knownHouseLinks.includes(house.link))
            knownHouses.push(...newHouses);

            updateKnownHousesFile(knownHouses);
            sendTelegramMessage();
        })
        .catch(error => {
            console.error('Failed:', error)
        })

}

function sendTelegramMessage() {
    let now = new Date();
    let newHousesCrawledWithinLastTenMinutes = knownHouses.filter(house => (now - new Date(house.crawlTimestamp)) < TEN_MINUTES);
    let message = newHousesCrawledWithinLastTenMinutes.map(house => `<a href="${house.link}">${house.title} - ${house.address} - ${house.Kaufpreis}</a>`).join('\n\n');
    if (message) {
        bot.sendMessage(chatId, message, { parse_mode: "HTML", disable_web_page_preview: false });
    }
}

updateKnownHouses();