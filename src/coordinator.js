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

import Bot from './bot'
import Battleground from './battleground'
import Trainer from './trainer'
import Genome from './genome'
import log from './logger'

/**
 * If you'd like to resume training from an existing species file, uncomment this line
 */
// import existingSpecies from "../species/SPECIESID/SPECIESID-generation-GENERATION-species.json";

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
    log.info("Starting Training Run ID: " + runId);
    fs.mkdirSync(`species/${runId}/`, {recursive: true});
    const trainer = new Trainer();
    if (typeof existingSpecies !== "undefined") {
        trainer.loadSpeciesFromJSON(existingSpecies);
    } else {
        trainer.createInitialSpecies();
    }
    startGenerationBattles(runId, trainer);
}

/**
 * Start all the battles in a single generation. Running them in parallel.  
 * @param {string} runId 
 * @param {Trainer} trainer 
 */
function startGenerationBattles(runId, trainer) {
    let roundsRemaining = trainer.getTotalRoundsRemaining();
    log.info(`Starting Generation ${trainer.totalGenerations}`)
    async.timesSeries(roundsRemaining, (i, next) => {
        log.debug(`Starting round ${i}...`);
        trainer.getRandomAvailableGenome((genome1) => {
            genome1.totalRounds++;
            const genome2 = trainer.getRandomGenome();
            startRound(trainer.totalGenerations, genome1, genome2, (results) => {
                roundsRemaining--;
                log.debug(`${roundsRemaining} rounds remaining`);
                if (roundsRemaining <= 0) {
                    const speciesFilePath = `species/${runId}/${runId}-generation-${trainer.totalGenerations}-species.json`
                    log.info(`Generation Complete`)
                    log.debug(`Saving all species to file ${speciesFilePath}`);
                    const serializedSpecies = trainer.serializeSpecies();
                    fs.writeFile(`${speciesFilePath}`, serializedSpecies, (err, result) => {
                        log.debug("Creating new generation")
                        trainer.newGeneration();
                        setTimeout(startGenerationBattles.bind(this, runId, trainer));
                    });
                }
            });
            next();
        });
    }, (err, result) => {
        log.debug("Finished starting rounds");
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
        let botFitness = Trainer.calculateBotFitnessFromResults(results, totalGenerations);
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

