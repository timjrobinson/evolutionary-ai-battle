'use strict';

var _bot = require('./bot');

var _bot2 = _interopRequireDefault(_bot);

var _battleground = require('./battleground');

var _battleground2 = _interopRequireDefault(_battleground);

var _trainer = require('./trainer');

var _trainer2 = _interopRequireDefault(_trainer);

var _speciesNew = require('../species-new-1.json');

var _speciesNew2 = _interopRequireDefault(_speciesNew);

var _species = require('../species-2.json');

var _species2 = _interopRequireDefault(_species);

var _species3 = require('../species-3.json');

var _species4 = _interopRequireDefault(_species3);

var _species5 = require('../species-4.json');

var _species6 = _interopRequireDefault(_species5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var trainer = new _trainer2.default();
// trainer.initializeSpecies();
// trainer.loadSpeciesFromJSON({genomes: species1});
// trainer.loadSpeciesFromJSON({genomes: species2});
// trainer.loadSpeciesFromJSON({genomes: species3});
// trainer.loadSpeciesFromJSON({genomes: species4});
// The main file that will import the battleground and bot and play bots against each other

_speciesNew2.default.forEach(function (species) {
    trainer.loadSpeciesFromJSON({ genomes: species });
});
battle();

function battle() {
    // Bot 1 is the one we're training
    var bot1 = new _bot2.default(1);
    bot1.loadGenome(trainer.getRandomGenome());

    // Bot 2 just does random stuff
    var bot2 = new _bot2.default(2);
    bot2.loadGenome(trainer.getRandomGenome());
    bot2.selectAIMethod();

    // const commands = bot.update(inputs);

    var battleground = new _battleground2.default();
    battleground.addBots(bot1, bot2);
    battleground.start(function (results) {
        console.log("Battle results: ", results);

        var botFitness = Math.min(60, Math.floor(results.totalTime)) + (5 - bot2.lives) * 20;
        if (results.winner == 1) {
            botFitness += bot1.lives * 10;
            botFitness += 150;
        }
        console.log("Bot fitness is: ", botFitness);
        bot1.genome.addFitness(botFitness);
        bot1.genome.totalRounds++;

        var roundsRemaining = trainer.getTotalRoundsRemaining();
        console.log("Round Complete, " + roundsRemaining + " rounds remaining");
        if (roundsRemaining <= 0) {
            trainer.newGeneration();
        }

        setTimeout(battle);
    });
}