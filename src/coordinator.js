/**
 * Coordinator
 * 
 * The coordinator is for running multiple battles in parallel in NodeJS. It uses the cluster module to spawn new 
 * threads to be able to do this. 
 * 
 * The main thread runs the trainer which keeps track of all the rounds, the AI's versing each other, and the results of
 * their battles. This main trainer thread then creates workers by forking the process. Each worker then runs a battle 
 * between two bots. 
 * 
 * The number of workers that are spawned is either the total battles happening in a round, or config.max_workers
 * 
 */
const uuid = require("uuid");
const cluster = require('cluster');
const async = require("async");
const fs = require("fs");
const log = require("winston");

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import Genome from './genome'


/** 
 * On first run of this file cluster.isMaster is true. There is only one master process. 
 * When a worker calls fork inside that fork cluster.isMaster will be false so the battle process begins
 */
if (cluster.isMaster) {
    trainerProcess();
} else {
    battleProcess();
}


/**
 * Initializes the trainer and species that will be evolved today. Then begins the battle.  
 */
function trainerProcess() {
    const runId = uuid.v1().toString().slice(0, 8);
    log.info("Run ID: " + runId);
    const workers = [];

    const trainer = new Trainer();
    trainer.initializeSpecies();
    startBattle(runId, trainer);
}

function startBattle(runId, trainer) {
    let roundsRemaining = trainer.getTotalRoundsRemaining();
    async.timesSeries(roundsRemaining, (i, next) => {
        log.info(`Starting round ${i}...`);
        trainer.getRandomAvailableGenome((genome1) => {
            genome1.totalRounds++;
            const genome2 = trainer.getRandomGenome();
            startRound(trainer.totalGenerations, genome1, genome2, (results) => {
                roundsRemaining--;
                log.info(`${roundsRemaining} rounds remaining`);
                if (roundsRemaining <= 0) {
                    log.info("Saving current generation of species to disk");
                    const serializedSpecies = JSON.stringify(trainer.species.map((species) => species.serialize()));
                    fs.writeFile(`${runId}-generation-${trainer.totalGenerations}-species.json`, serializedSpecies, (err, result) => {
                        log.info("Creating new generation")
                        trainer.newGeneration();
                        setTimeout(startBattle.bind(this, runId, trainer));
                    });
                }
            });
            next();
        });
    }, (err, result) => {
        log.info("Finished starting rounds");
    });

}

function startRound(totalGenerations, genome1, genome2, callback) {
    const worker = cluster.fork();
    worker.on('message', (msg) => {
        if (msg.type == 'results') {
            handleResults(msg.data);
        }
    });
    worker.send({
        totalGenerations,
        genomes: [
            genome1.serialize(),
            genome2.serialize()
        ]
    });

    function handleResults(results) {
        let botFitness = Math.min(60, Math.floor(results.totalTime)) + ((5 - results.bot2.lives) * 20)
        if (results.winner == 1) {
            botFitness += results.bot1.lives * 10;
            botFitness += 150;
        }
        log.debug("Bot fitness is: ", botFitness);
        genome1.addFitness(botFitness);
        worker.kill();
        return callback(results);
    }
}

function battleProcess() {
    process.on('message', (msg) => {
        const bot1 = new Bot(1);
        const genome1 = Genome.loadFromJSON(msg.genomes[0]);
        bot1.loadGenome(genome1);

        // Bot 2 just does random stuff
        const bot2 = new Bot(2);
        const genome2 = Genome.loadFromJSON(msg.genomes[1]);
        bot2.loadGenome(genome2);
        bot2.selectAIMethod(msg.totalGenerations);

        const battleground = new Battleground()
        battleground.addBots(bot1, bot2);
        battleground.start((results) => {
            process.send({
                type: 'results',
                data: results
            });
        });
    });
}

