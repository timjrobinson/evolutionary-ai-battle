const Koa = require("koa");
const json = require("koa-json");
const Router = require("koa-router");
const static = require("koa-static");
const fs = require("fs").promises;
const p = require("path");

const app = new Koa();
const router = new Router();
const PORT = 1337;

app.use(static('dist'))
app.use(json({pretty: false}));
const speciesFolder = p.join(__dirname, 'species');

router
  .get('/species', async (ctx) => {
    const folders = await fs.readdir(speciesFolder);
    const result = folders.map(async (folder) => { 
      const folderStats = await fs.stat(p.join(speciesFolder, folder)); 
      return {
        id: folder,
        lastUpdate: folderStats.mtime
      }
    });
    return Promise.all(result).then((foldersWithDates) => {
      ctx.body = foldersWithDates
    }).catch((err) => {
      console.error(err);
    });
  })
  .get('/species/:speciesId/latest', async (ctx) => {
    const { speciesId } = ctx.params;
    console.log(`Species id: ${speciesId}`)
    const files = await fs.readdir(p.join(speciesFolder, speciesId));
    console.log("Total Files: ", files.length)
    const genNumMatch = new RegExp(/generation-([0-9]+)-species/);
    const latestGeneration = files.reduce((prev, curr) => {
      const prevMatch = prev.match(genNumMatch);
      const prevGenerationNumber = prevMatch[1];
      const currMatch = curr.match(genNumMatch);
      const currGenerationNumber = currMatch[1];
      if (parseInt(prevGenerationNumber) > parseInt(currGenerationNumber)) {
        return prev;
      }
      return curr;
    });
    console.log("Latest generation is: ", latestGeneration)
    const latestGenerationSpeciesJSON = await fs.readFile(p.join(speciesFolder, speciesId, latestGeneration));
    ctx.body = JSON.parse(latestGenerationSpeciesJSON);
    console.log("Response is: ", ctx.response)
  })

app.use(router.routes());
app.listen(PORT);