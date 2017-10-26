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
const key = "&api_key=RGAPI-32f8cf24-f780-4175-b09a-1d01d4580acb";
const tagKey = "&tags=keys&dataById=false";
const riotUrl = ".api.riotgames.com";
const hostname = 'localhost';
const port = 8000;
const regions = ["BR1", "EUN1", "EUW1", "JP1", "KR", "LA1", "LA2", "NA1", "OC1", "TR1", "RU", "PBE1"];

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
        mongoClient.connect(dbUrl, options, function (err, db) {
            db.collection("champions").findOne({}, function (err, result) {
                if (result == undefined || body.version != result.version) {
                    updateChampions();
                    updateRunes();
                    updateMasteries();
                    updateSummonerSpells();
                }

                db.close();
            });
        });
    });
}

updateDB();

async function updateChampions(db) {
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
                        if (count == regions.length) {
                            console.log(`Finshed champions update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function getChampionById(db, id, region) {
    db.collection("champions").find({ region: region }).toArray(function (err, result) {
        if (err) {
            throw err;
        }

    });
}

async function updateRunes(db) {
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
                        if (count == regions.length) {
                            console.log(`Finshed runes update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function setRunes(db, participant, region) {
    db.collection("runes").find({ region: region }).toArray(function (err, result) {
        if (err) {
            throw err;
        }

    });
}

async function updateMasteries(db) {
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
                        if (count == regions.length) {
                            console.log(`Finshed masteries update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function setMasteries(db, participant, region) {
    db.collection("masteries").find({ region: region }).toArray(function (err, result) {
        if (err) {
            throw err;
        }
    });
}

async function updateSummonerSpells(db) {
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
                        if (count == regions.length) {
                            console.log(`Finshed summonerspells update.`);
                            db.close();
                        }
                    });
                });
            });
        });
    });
}

function getSummonerSpellById(db, id, region) {
    db.collection("summonerspells").find({ region: region, id: id }).toArray(function (err, result) {
        if (err) {
            throw err;
        }

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
        _request(`https://na1${riotUrl}/lol/spectator/v3/featured-games${locale + key}`, { json: true }, (err, response, body) => {
            _request(`https://na1${riotUrl}/lol/summoner/v3/summoners/by-name/${body.gameList[0].participants[0].summonerName + locale + key}`, { json: true }, (err, response, body) => {
                userInfo = new UserInfo("na1", body.id);

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

var loadMatchData = function (matchData, userInfo, res) {
    if (matchData != undefined && matchData.participants != undefined) {
        mongoClient.connect(dbUrl, async function (err, db) {
            if (err) {
                throw err;
            }

            matchData.participants.forEach(function (participant) {
                var champion = getChampionById(db, participant.championId, userInfo.ServerLocation);
                //setMasteries(db, participant, userInfo.ServerLocation);
                //setRunes(db, participant, userInfo.ServerLocation);
                var spell1 = getSummonerSpellById(db, participant.spell1Id, userInfo.ServerLocation);
                var spell2 = getSummonerSpellById(db, participant.spell2Id, userInfo.ServerLocation);

                participant["profileIconImage"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${participant.profileIconId}.png`;
                participant["championImage"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champion}.png`;

                participant["spell1Image"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell1}.png`;
                participant["spell2Image"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spell2}.png`;
            });

            db.close();
        });

        console.log("got match data");
        res.send(matchData);
    }
}

class UserInfo {
    constructor(ServerLocation, SummonerId) {
        this.SummonerId = SummonerId;
        this.ServerLocation = ServerLocation;
    }
}