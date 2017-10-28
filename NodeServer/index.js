const _request = require("request");
const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;
const dbUrl = "mongodb://ran_DOM:S58FRHXthnQgAd3nNlEs@cluster0-shard-00-00-jkwcv.mongodb.net:27017,cluster0-shard-00-01-jkwcv.mongodb.net:27017,cluster0-shard-00-02-jkwcv.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
const app = express();
app.use(cors());
const morgan = require('morgan');
const path = require('path');
const locale = "?locale=en_US";
const key = "&api_key=RGAPI-c4d9ed2c-d360-462d-8ac9-027018933d86";
const tagKey = "&tags=keys&dataById=false";
const riotUrl = ".api.riotgames.com";
const hostname = 'localhost';
const port = 8000;
const regions = ["BR1", "EUN1", "EUW1", "JP1", "KR", "LA1", "LA2", "NA1", "OC1", "TR1", "RU", "PBE1"];
const spells = ["SummonerBoost", "SummonerExhaust", "SummonerExhaust", "SummonerFlash", "SummonerFlash", "SummonerHaste", "SummonerHeal", "SummonerHeal", "SummonerHeal", "SummonerHeal",
    "SummonerSmite", "SummonerTeleport", "SummonerMana", "SummonerDot", "SummonerSmite", "SummonerTeleport", "SummonerMana", "SummonerDot",
    "SummonerSmite", "SummonerTeleport", "SummonerBarrier", "SummonerTeleport", "SummonerBarrier", "SummonerTeleport", "SummonerBarrier", "SummonerTeleport",
    "SummonerBarrier", "SummonerTeleport", "SummonerBarrier", "SummonerPoroRecall", "SummonerPoroThrow", "SummonerSnowball", "SummonerSiegeChampSelect1",
    "SummonerSiegeChampSelect2", "SummonerDarkStarChampSelect1", "SummonerDarkStarChampSelect2"];
var version = { version: "" };
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

function updateDB() {
    var options = {
        reconnectTries: 30,
        reconnectInterval: 5000,
        keepAlive: 1,
        connectTimeoutMS: 30000
    };

    _request(`https://${regions[0] + riotUrl}/lol/static-data/v3/champions${locale + tagKey + key}`, { json: true }, (err, response, body) => {
        if (err === null && body !== null) {
            mongoClient.connect(dbUrl, options, function (err, db) {
                db.collection("champions").findOne({}, function (err, result) {
                    if (result === null || body.version !== result.version) {
                        updateChampions();
                        updateRunes();
                        updateMasteries();
                        updateSummonerSpells();
                    }

                    db.close();
                });
            });
        }
    });
}

updateDB();

function updateChampions(db) {
    var champions;
    var count = 0;
    var options = {
        reconnectTries: 30,
        reconnectInterval: 5000,
        keepAlive: 1,
        connectTimeoutMS: 30000
    };

    mongoClient.connect(dbUrl, options, function (err, db) {
        db.collection("champions").drop(function (err, delOK) {
            regions.forEach(function (region) {
                _request(`https://${region + riotUrl}/lol/static-data/v3/champions${locale + tagKey + key}`, { json: true }, (err, response, body) => {
                    body["region"] = region;

                    db.collection("champions").insertOne(body, function (err, res) {
                        if (err) {
                            throw err;
                        }

                        console.log(`Updated champions for ${region}.`);
                        count++;
                        if (count === regions.length) {
                            console.log(`Finshed champions update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function getChampionUrlById(participant, id, region, url, callback) {
    mongoClient.connect(dbUrl, async function (err, db) {
        if (err) {
            throw err;
        }

        var championId = id;
        db.collection("champions").find({ region: region }).toArray(function (err, result) {
            if (err) {
                throw err;
            }

            var resultObj = result[0];
            db.close();

            participant["championImage"] = url + resultObj.keys[championId] + ".png";
            callback();
        });
    });
}

function updateRunes(db) {
    var runes;
    var count = 0;
    var options = {
        reconnectTries: 30,
        reconnectInterval: 5000,
        keepAlive: 1,
        connectTimeoutMS: 30000
    };

    mongoClient.connect(dbUrl, options, function (err, db) {
        db.collection("runes").drop(function (err, delOK) {
            regions.forEach(function (region) {
                _request(`https://${region + riotUrl}/lol/static-data/v3/runes${locale + key}`, { json: true }, (err, response, body) => {
                    body["region"] = region;

                    db.collection("runes").insertOne(body, function (err, res) {
                        if (err) {
                            throw err;
                        }

                        console.log(`Updated runes for ${region}.`);
                        count++;
                        if (count === regions.length) {
                            console.log(`Finshed runes update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function setRunes(participant, region) {
    mongoClient.connect(dbUrl, async function (err, db) {
        if (err) {
            throw err;
        }

        db.collection("runes").find({ region: region }).toArray(function (err, result) {
            if (err) {
                throw err;
            }

            db.close();
            return result;
        });
    });
}

function updateMasteries(db) {
    var masteries;
    var count = 0;
    var options = {
        reconnectTries: 30,
        reconnectInterval: 5000,
        keepAlive: 1,
        connectTimeoutMS: 30000
    };

    mongoClient.connect(dbUrl, options, function (err, db) {
        db.collection("masteries").drop(function (err, delOK) {
            regions.forEach(function (region) {
                _request(`https://${region + riotUrl}/lol/static-data/v3/masteries${locale + key}`, { json: true }, (err, response, body) => {
                    body["region"] = region;

                    db.collection("masteries").insertOne(body, function (err, res) {
                        if (err) {
                            throw err;
                        }

                        console.log(`Updated masteries for ${region}.`);
                        count++;
                        if (count === regions.length) {
                            console.log(`Finshed masteries update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function setMasteries(participant, region) {
    mongoClient.connect(dbUrl, async function (err, db) {
        if (err) {
            throw err;
        }

        db.collection("masteries").find({ region: region }).toArray(function (err, result) {
            if (err) {
                throw err;
            }

            db.close();
            return result;
        });
    });
}

function updateSummonerSpells(db) {
    var summonerspells;
    var count = 0;
    var options = {
        reconnectTries: 30,
        reconnectInterval: 5000,
        keepAlive: 1,
        connectTimeoutMS: 30000
    };

    mongoClient.connect(dbUrl, options, function (err, db) {
        db.collection("summonerspells").drop(function (err, delOK) {
            regions.forEach(function (region) {
                _request(`https://${region + riotUrl}/lol/static-data/v3/summoner-spells${locale + key}`, { json: true }, (err, response, body) => {
                    body["region"] = region;

                    db.collection("summonerspells").insertOne(body, function (err, res) {
                        if (err) {
                            throw err;
                        }

                        console.log(`Updated summonerspells for ${region}.`);
                        count++;
                        if (count === regions.length) {
                            console.log(`Finshed summonerspells update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function getSummonerSpellById(participant, id1, id2, region, url, callback) {
    mongoClient.connect(dbUrl, async function (err, db) {
        if (err) {
            throw err;
        }

        var spellId1 = parseInt(id1);
        var spellId2 = parseInt(id2);

        db.collection("summonerspells").find({ region: region }).toArray(function (err, result) {
            if (err) {
                throw err;
            }

            var resultObj1 = result[0].data[spells[spellId1 - 1]];
            var resultObj2 = result[0].data[spells[spellId2 - 1]];
            db.close();

            resultObj1["image"] = url + resultObj1["key"] + ".png";
            participant[`spell1`] = resultObj1;

            resultObj2["image"] = url + resultObj2["key"] + ".png";
            participant[`spell2`] = resultObj2;
            callback();
        });
    });
}

//req.params.TwitchId
//req.params.ServerLocation
//req.params.SummonerName
app.get("/SetUser", (req, res) => {
    var summonerId;
    console.log(req.query);
    request(`https://${req.query.ServerLocation + riotUrl}/lol/summoner/v3/summoners/by-name/${req.query.Summonername + locale + key}`, { json: true }, (err, response, body) => {
        console.log(body.id);
        summonerId = body.id;
    });

    //TODO Store data in database
    //Db.Store(req.params.TwitchId, req.params.ServerLocation, summonerId);

    res.send("Success");
});

app.get("/Test", (req, res) => {
    var userInfo;

    try {
        _request(`https://${regions[7] + riotUrl}/lol/spectator/v3/featured-games${locale + key}`, { json: true }, (err, response, body) => {
            _request(`https://${regions[7] + riotUrl}/lol/summoner/v3/summoners/by-name/${body.gameList[0].participants[0].summonerName + locale + key}`, { json: true }, (err, response, body) => {
                userInfo = new UserInfo(regions[7], body.id);

                _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/active-games/by-summoner/${userInfo.SummonerId + locale + key}`, { json: true }, (err, response, body) => {
                    var matchData = body;
                    loadMatchData(matchData, userInfo, res);
                });
            });
        });
    }
    catch (err) {
        console.log(err);
        res.send("An Error Has Occured");
    }
});

app.get("/RetrieveGameData", (req, res) => {
    var matchData;
    var userInfo;

    try {
        //TODO: replace with Db.Retrieve
        //userInfo = Db.Retrieve(req.params.TwitchId);
        _request(`https://${req.query.ServerLocation + riotUrl}/lol/summoner/v3/summoners/by-name/${req.query.Summonername + locale + key}`, { json: true }, (err, response, body) => {
            userInfo = new UserInfo(req.query.ServerLocation, body.id);

            _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/active-games/by-summoner/${userInfo.SummonerId + locale + key}`, { json: true }, (err, response, body) => {
                matchData = body;
                loadMatchData(matchData, userInfo, res);
            });
        });
    }
    catch (err) {
        console.log(err);
        res.send("An Error Has Occured");
    }
});

function loadMatchData (matchData, userInfo, res) {
    if (matchData !== undefined && matchData.participants !== undefined) {
        mongoClient.connect(dbUrl, function (err, db) {
            db.collection("champions").findOne({}, function (err, result) {
                updateParticipant(matchData, 0, userInfo, res, result.version);
            });
        });
    }
}

function updateParticipant(matchData, counter, userInfo, res, version) {
    if (counter === matchData.participants.length) {
        console.log("got match data");
        res.send(matchData);
    }
    else {
        matchData.participants[counter]["profileIconImage"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${matchData.participants[counter].profileIconId}.png`;

        try {
            getChampionUrlById(matchData.participants[counter], matchData.participants[counter].championId, userInfo.ServerLocation, `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/`, function () {
                getSummonerSpellById(matchData.participants[counter], matchData.participants[counter].spell1Id, matchData.participants[counter].spell2Id, userInfo.ServerLocation, `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/`, function () {
                    counter++;
                    updateParticipant(matchData, counter, userInfo, res, version);
                });
            });
        }
        catch (err) {
            console.log(err);
        }

        //setMasteries(db, matchData.participants[counter], userInfo.ServerLocation);
        //setRunes(db, matchData.participants[counter], userInfo.ServerLocation);
    }
}

class UserInfo {
    constructor(ServerLocation, SummonerId) {
        this.SummonerId = SummonerId;
        this.ServerLocation = ServerLocation;
    }
}