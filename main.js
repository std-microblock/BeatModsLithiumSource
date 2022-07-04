import { writeFileSync } from "fs";
import fetch from "node-fetch"

console.log("Fetching BeatMods Mods");

let data = await (await fetch("https://beatmods.com/api/v1/mod?search=&status=approved&sort=&sortDirection=1")).json()

let source = {
    "name": "BeatMods",
    "author": "vanZeben and contributors",
    "mods": []
}, mods = {};

console.log("Creating Lithium JSON");

for (let mod of data) {
    mods[mod.name] ||= [];
    mods[mod.name].push(mod);
}

function toOnlineURL(name) {
    return `https://xxx/${name}.lithium.mod.json`
}

for (let name of Object.keys(mods)) {
    mods[name] = mods[name].sort((a, b) => a.uploadDate - b.uploadDate)
    writeFileSync(`./BeatModsSource/mods/${name}.lithium.mod.json`, JSON.stringify(
        {
            name,
            author: mods[name][0].author.username,
            description: mods[name][0].description,
            versions: mods[name].map(v => {
                return {
                    version: v.version,
                    downloads: v.downloads.reduce((pre, cur) => {
                        pre[cur.type] = "https://beatmods.com/"+cur.url
                        return pre;
                    }, {}),
                    requiredGameVersion: "~" + v.gameVersion,
                    dependencies: v.dependencies.reduce((pre, cur) => {
                        pre[toOnlineURL(cur.name)] = "~" + cur.version
                        return pre;
                    },{})
                }
            })
        }
    ));

    source.mods.push({
        name,
        author: mods[name].author,
        detail: toOnlineURL(name)
    })
}


writeFileSync("./BeatModsSource/beatmods.lithium.source.json",JSON.stringify(source))