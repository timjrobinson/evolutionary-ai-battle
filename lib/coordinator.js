"use strict";

var _bot = require("./bot");

var _bot2 = _interopRequireDefault(_bot);

var _battleground = require("./battleground");

var _battleground2 = _interopRequireDefault(_battleground);

var _trainer = require("./trainer");

var _trainer2 = _interopRequireDefault(_trainer);

var _genome = require("./genome");

var _genome2 = _interopRequireDefault(_genome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuid = require("uuid");
var cluster = require('cluster');
var async = require("async");
var fs = require("fs");

// if (cluster.isMaster) {
//     trainerProcess();
// } else {
//     battleProcess();
// }
if (cluster.isMaster) {
    // masterProcess();
    trainerProcess();
} else {
    // childProcess();
    battleProcess();
}

function trainerProcess() {
    var runId = uuid.v1().toString().slice(0, 8);
    console.log("Run ID: " + runId);
    var workers = [];

    var trainer = new _trainer2.default();
    trainer.initializeSpecies();

    startBattle(runId, trainer);
}

function startBattle(runId, trainer) {
    var _this = this;

    var roundsRemaining = trainer.getTotalRoundsRemaining();
    async.timesSeries(roundsRemaining, function (i, next) {
        console.log("Starting round " + i + "...");
        trainer.getRandomAvailableGenome(function (genome1) {
            genome1.totalRounds++;
            var genome2 = trainer.getRandomGenome();
            startRound(genome1, genome2, function (results) {
                roundsRemaining--;
                console.log(roundsRemaining + " rounds remaining");
                if (roundsRemaining <= 0) {
                    console.log("Saving current generation of species to disk");
                    var serializedSpecies = JSON.stringify(trainer.species.map(function (species) {
                        return species.serialize();
                    }));
                    fs.writeFile(runId + "-generation-" + trainer.totalGenerations + "-species.json", serializedSpecies, function (err, result) {
                        console.log("Creating new generation");
                        trainer.newGeneration();
                        setTimeout(startBattle.bind(_this, runId, trainer));
                    });
                }
            });
            next();
        });
    }, function (err, result) {
        console.log("Finished starting rounds");
    });
}

function startRound(genome1, genome2, callback) {
    var worker = cluster.fork();
    worker.on('message', function (msg) {
        console.log("Got message", msg);
        if (msg.type == 'results') {
            handleResults(msg.data);
        }
    });
    worker.send({
        genomes: [genome1.serialize(), genome2.serialize()]
    });

    function handleResults(results) {
        console.log("Battle results: ", results);

        var botFitness = Math.min(60, Math.floor(results.totalTime)) + (5 - results.bot2.lives) * 20;
        if (results.winner == 1) {
            botFitness += results.bot1.lives * 10;
            botFitness += 150;
        }
        console.log("Bot fitness is: ", botFitness);
        genome1.addFitness(botFitness);
        return callback(results);
    }
}

function battleProcess() {
    process.on('message', function (msg) {
        var bot1 = new _bot2.default(1);
        var genome1 = _genome2.default.loadFromJSON(msg.genomes[0]);
        bot1.loadGenome(genome1);

        // Bot 2 just does random stuff
        var bot2 = new _bot2.default(2);
        var genome2 = _genome2.default.loadFromJSON(msg.genomes[1]);
        bot2.loadGenome(genome2);
        bot2.selectAIMethod();

        var battleground = new _battleground2.default();
        battleground.addBots(bot1, bot2);
        battleground.start(function (results) {
            process.send({
                type: 'results',
                data: results
            });

            // let botFitness = Math.min(60, Math.floor(results.totalTime)) + ((5 - bot2.lives) * 20)
            // if (results.winner == 1) {
            //     botFitness += bot1.lives * 10;
            //     botFitness += 150;
            // }
            // console.log("Bot fitness is: ", botFitness);
            // bot1.genome.addFitness(botFitness);
            // bot1.genome.totalRounds++;

            // const roundsRemaining = trainer.getTotalRoundsRemaining() 
            // console.log("Round Complete, " + roundsRemaining + " rounds remaining");
            // if (roundsRemaining <= 0) {
            //     trainer.newGeneration();
            // }

            // setTimeout(battle);
        });
    });
}

function masterProcess() {
    var workers = [];
    console.log("Master " + process.pid + " is running");

    // Fork workers

    var _loop = function _loop(i) {
        console.log("Forking process number " + i + "...");

        var worker = cluster.fork();
        workers.push(worker);

        // Listen for messages from worker
        worker.on('message', function (message) {
            console.log("Master " + process.pid + " recevies message '" + JSON.stringify(message) + "' from worker " + worker.process.pid);
        });
    };

    for (var i = 0; i < 10; i++) {
        _loop(i);
    }

    // Send message to the workers
    workers.forEach(function (worker) {
        console.log("Master " + process.pid + " sends message to worker " + worker.process.pid + "...");
        worker.send({ msg: "Message from master " + process.pid });
    }, this);
}

function childProcess() {
    console.log("Worker " + process.pid + " started");

    process.on('message', function (message) {
        console.log("Worker " + process.pid + " recevies message '" + JSON.stringify(message) + "'");
    });

    console.log("Worker " + process.pid + " sends message to master...");
    process.send({ msg: "Message from worker " + process.pid });

    console.log("Worker " + process.pid + " finished");
    process.send("heya!");
}