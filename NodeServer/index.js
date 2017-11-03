const _request = require("request");
const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;
const dbUrl = "mongodb://ran_DOM:S58FRHXthnQgAd3nNlEs@cluster0-shard-00-00-jkwcv.mongodb.net:27017,cluster0-shard-00-01-jkwcv.mongodb.net:27017,cluster0-shard-00-02-jkwcv.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
const app = express();
app.use(cors());
const morgan = require('morgan');
const path = require('path');
const _async = require('async');
const jwt = require("jsonwebtoken");

const twitchSecret = process.env.twitchAPISecret || "temporarysecret";
const locale = "?locale=en_US";
const key = process.env.riotApiKey || "&api_key=RGAPI-ed031133-315e-4600-a5b8-aa67e7398b35";
const tagKey = "&tags=keys&dataById=false";
const tagImage = "&tags=image";
const riotUrl = ".api.riotgames.com";
const port = process.env.PORT || 8000;
const regions = ["BR1", "EUN1", "EUW1", "JP1", "KR", "LA1", "LA2", "NA1", "OC1", "TR1", "RU", "PBE1"];
const spells = ["SummonerBoost", "SummonerExhaust", "SummonerExhaust", "SummonerFlash", "SummonerFlash", "SummonerHaste", "SummonerHeal", "SummonerHeal", "SummonerHeal", "SummonerHeal",
    "SummonerSmite", "SummonerTeleport", "SummonerMana", "SummonerDot", "SummonerSmite", "SummonerTeleport", "SummonerMana", "SummonerDot",
    "SummonerSmite", "SummonerTeleport", "SummonerBarrier", "SummonerTeleport", "SummonerBarrier", "SummonerTeleport", "SummonerBarrier", "SummonerTeleport",
    "SummonerBarrier", "SummonerTeleport", "SummonerBarrier", "SummonerPoroRecall", "SummonerPoroThrow", "SummonerSnowball", "SummonerSiegeChampSelect1",
    "SummonerSiegeChampSelect2", "SummonerDarkStarChampSelect1", "SummonerDarkStarChampSelect2"];
const keyMasteries = [6161, 6162, 6164,
    6361, 6362, 6363,
    6261, 6262, 6263];

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});

function updateDB() {
    var options = {
        reconnectTries: 30,
        reconnectInterval: 5000,
        keepAlive: 1,
        connectTimeoutMS: 30000
    };

    _request(`https://${regions[0] + riotUrl}/lol/static-data/v3/champions${locale + tagKey + key}`, { json: true }, (err, response, body) => {
        if (!err && body) {
            mongoClient.connect(dbUrl, options, function (err, db) {
                db.collection("champions").findOne({}, function (err, result) {
                    if (!result || body.version !== result.version) {
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

async function getChampionUrlById(participant, id, region, url, callback) {
    mongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            throw err;
        }

        var championId = id;
        db.collection("champions").findOne({ region: region }, function (err, result) {
            if (err) {
                throw err;
            }

            var resultObj = result;
            db.close();

            participant["championImage"] = url + resultObj.keys[championId] + ".png";
            callback(null, 1);
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
                _request(`https://${region + riotUrl}/lol/static-data/v3/runes${locale + tagImage + key}`, { json: true }, (err, response, body) => {
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

async function setRunes(participant, region, url, callback) {
    mongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            throw err;
        }

        db.collection("runes").findOne({ region: region }, function (err, result) {
            if (err) {
                throw err;
            }

            participant.runes.forEach(function (rune) {
                rune["runeData"] = result.data[rune.runeId];
                rune["runeData"].image.full = url + rune["runeData"].image.full;
            });

            db.close();
            callback(null, 2);
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
                _request(`https://${region + riotUrl}/lol/static-data/v3/masteries${locale + tagImage + key}`, { json: true }, (err, response, body) => {
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

async function setMasteries(participant, region, url, callback) {
    mongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            throw err;
        }

        db.collection("masteries").findOne({ region: region }, function (err, result) {
            if (err) {
                throw err;
            }

            participant.masteries.forEach(function (mastery) {
                mastery["masteryData"] = result.data[mastery.masteryId];
                mastery["masteryData"].image.full = url + mastery["masteryData"].image.full;

                if (keyMasteries.includes(mastery.masteryId)) {
                    participant["keyStone"] = mastery["masteryData"].image.full;
                }
            });

            db.close();
            callback(null, 3);
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

async function getSummonerSpellById(participant, id1, id2, region, url, callback) {
    mongoClient.connect(dbUrl, function (err, db) {
        if (err) {
            throw err;
        }

        var spellId1 = parseInt(id1);
        var spellId2 = parseInt(id2);

        db.collection("summonerspells").findOne({ region: region }, function (err, result) {
            if (err) {
                throw err;
            }

            var resultObj1 = result.data[spells[spellId1 - 1]];
            var resultObj2 = result.data[spells[spellId2 - 1]];
            db.close();

            resultObj1["image"] = url + resultObj1["key"] + ".png";
            participant[`spell1`] = resultObj1;

            resultObj2["image"] = url + resultObj2["key"] + ".png";
            participant[`spell2`] = resultObj2;

            callback(null, 4);
        });
    });
}

//JWT Example
//{
//    "exp": 1484242525,
//        "opaque_user_id": "UG12X345T6J78",
//            "channel_id": "test_channel",
//                "role": "broadcaster",
//                    "pubsub_perms": {
//        listen: ["broadcast", "whisper-UG12X345T6J78"],
//            send: ["*"]
//    }
//}
//req.params.ServerLocation
//req.params.SummonerName
app.get("/SetUser", (req, res) => {

    var tokenString = req.get("loltwitchextension-jwt");
    var serverLocation = req.params.ServerLocation;
    var summonerName = req.params.SummonerName;
    var twitchId;

    jwt.verify(tokenString, twitchSecret, function (err, token) {
        if (err || token.role !== "broadcaster") {
            res.send("Error");
        }
        else {
            twitchId = token.channel_id;

            request(`https://${req.query.ServerLocation + riotUrl}/lol/summoner/v3/summoners/by-name/${summonerName + locale + key}`, { json: true }, (err, response, body) => {
                var userInfo = new UserInfo(serverLocation, body.id, twitchId);

                mongoClient.connect(dbUrl, function (err, db) {
                    db.collection("users").findOne({ TwitchId: userInfo.TwitchId }, function (err, result) {
                        //Update User
                        if (result) {
                            db.collection("users").updateOne({ TwitchId: userInfo.TwitchId }, userInfo, function (err, res) {
                                if (err) {
                                    res.send("Error");
                                }
                                else {
                                    res.setHeader("Authorization", jwt.sign(token, twitchSecret));
                                    res.send("Success");
                                }
                            });
                        }
                        //Create User
                        else {
                            db.collection("users").insertOne(userInfo, function (err, result) {
                                if (err) {
                                    res.send("Error");
                                }
                                else {
                                    req.headers["Authorization"] = jwt.sign(token, twitchSecret);
                                    res.send("Success");
                                }
                            });
                        }
                    });
                });
            });
        }
    });
});

app.get("/Test", (req, res) => {
    var userInfo;
    var matchData;
    var summonerName;
    console.log(`Test function is executing`);

    _request(`https://${regions[7] + riotUrl}/lol/spectator/v3/featured-games${locale + key}`, { json: true }, (err, response, body) => {
        if (!body || err || !body.gameList) {
            res.send("An Error Has Occured");
        }
        summonerName = encodeURI(body.gameList[0].participants[0].summonerName);

        _request(`https://${regions[7] + riotUrl}/lol/summoner/v3/summoners/by-name/${summonerName + locale + key}`, { json: true }, (err, response, body) => {
            if (!body || err || !body.id) {
                res.send("An Error Has Occured");
            }

            userInfo = new UserInfo(regions[7], body.id);

            _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/active-games/by-summoner/${userInfo.SummonerId + locale + key}`, { json: true }, (err, response, body) => {
                if (!body || err) {
                    res.send("An Error Has Occured");
                }

                matchData = body;
                loadMatchData(matchData, userInfo, res);
            });
        });
    });
});

app.get("/RetrieveGameData", (req, res) => {
    var matchData;
    var userInfo;
    var summonerName;

    console.log(`RetrieveGameData function is executing`);

    //TODO: replace with Db.Retrieve
    //userInfo = Db.Retrieve(req.params.TwitchId);
    summonerName = encodeURI(req.query.Summonername);
    _request(`https://${req.query.ServerLocation + riotUrl}/lol/summoner/v3/summoners/by-name/${summonerName + locale + key}`, { json: true }, (err, response, body) => {
        if (!body || err || !body.id) {
            res.send("An Error Has Occured");
        }

        userInfo = new UserInfo(req.query.ServerLocation, body.id);

        _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/active-games/by-summoner/${userInfo.SummonerId + locale + key}`, { json: true }, (err, response, body) => {
            if (!body || err) {
                res.send("An Error Has Occured");
            }

            matchData = body;
            loadMatchData(matchData, userInfo, res);
        });
    });
});

function loadMatchData(matchData, userInfo, res) {
    if (matchData !== undefined && matchData.participants !== undefined) {
        mongoClient.connect(dbUrl, function (err, db) {
            db.collection("champions").findOne({ region: userInfo.ServerLocation }, function (err, result) {
                var version = result.version;
                _async.each(matchData.participants, function (participant, callback) {
                    participant["profileIconImage"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${participant.profileIconId}.png`;
                    _async.parallel([
                        function (callback) {
                            getChampionUrlById(participant, participant.championId, userInfo.ServerLocation, `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/`, callback);
                        },
                        function (callback) {
                            getSummonerSpellById(participant, participant.spell1Id, participant.spell2Id, userInfo.ServerLocation, `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/`, callback);
                        },
                        function (callback) {
                            setRunes(participant, userInfo.ServerLocation, `http://ddragon.leagueoflegends.com/cdn/${version}/img/rune/`, callback);
                        },
                        function (callback) {
                            setMasteries(participant, userInfo.ServerLocation, `http://ddragon.leagueoflegends.com/cdn/${version}/img/mastery/`, callback);
                        }
                    ], function (err, results) {
                        callback();
                    });

                }, function (err) {
                    res.send(matchData);
                });
            });
        });
    }
}

class UserInfo {
    constructor(ServerLocation, SummonerId, TwitchId) {
        this.SummonerId = SummonerId;
        this.ServerLocation = ServerLocation;
        this.TwitchId = TwitchId;
    }
}