// The main file that will import the battleground and bot and play bots against each other

import Bot from './bot'
import Battleground from './battleground'

const bot1 = new Bot(1);
const bot2 = new Bot(2);

const inputs = {
    xPos: 5,
    yPos: 5,
    rotation: 0,
    otherPlayer: {
        xPos: 50,
        yPos: 5,
        rotation: 0
    }
}

// const commands = bot.update(inputs);

const battleground = new Battleground()
battleground.addBots(bot1, bot2);
battleground.start();

// const codespace = Object.assign({}, commands);
