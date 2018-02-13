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

const twitchSecret = process.env.twitchAPISecret || "FbfkDVjGF6j06gUQcELFv+i4wRujwXhWWw04ojdgknE=";
const updatePeriod = process.env.MatchUpdatePeriod || 3;
const locale = "?locale=en_US";
const key = process.env.riotApiKey || "&api_key=RGAPI-e7f70747-84cf-4d21-9c9e-97864de87518";
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
        if (!err && body !== undefined && body && body.version !== undefined) {
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
//req.query.ServerLocation
//req.query.SummonerName
app.get("/SetUser", (req, res) => {
    var tokenString = req.get("loltwitchextension-jwt");
    var serverLocation = req.query.ServerLocation;
    var summonerName = req.query.SummonerName;
    var twitchId;

    jwt.verify(tokenString, Buffer.from(twitchSecret, 'base64'), function (err, token) {
        if (err || token.role !== "broadcaster") {
            res.send("Error");
        }
        else {
            twitchId = token.channel_id;

            _request(`https://${serverLocation + riotUrl}/lol/summoner/v3/summoners/by-name/${summonerName + locale + key}`, { json: true }, (err, response, body) => {
                var userInfo = new UserInfo(serverLocation, body.id, twitchId);

                mongoClient.connect(dbUrl, function (err, db) {
                    db.collection("users").updateOne({ TwitchId: userInfo.TwitchId }, userInfo, { upsert: true }, function (err, result) {
                        if (err) {
                            res.send("Error");
                        }
                        else {
                            res.setHeader("Authorization", jwt.sign(token, twitchSecret));
                            res.send("Success");
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
    var tokenString = req.get("loltwitchextension-jwt");
    console.log(`Test function is executing`);

    jwt.verify(tokenString, Buffer.from(twitchSecret, 'base64'), function (err, token) {
        if (err) {
            res.send("Error");
        }
        else {
            mongoClient.connect(dbUrl, function (err, db) {
                db.collection("users").findOne({ TwitchId: token.channel_id }, function (err, result) {
                    if (!result) {
                        res.send("Error");
                    }
                    else {
                        userInfo = result;
                        db.collection("userData").findOne({ TwitchId: token.channel_id }, function (err, result) {
                            if (result && result.NextUpdate > new Date()) {
                                res.send(result.MatchData);
                            }
                            else {
                                _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/featured-games${locale + key}`, { json: true }, (err, response, body) => {
                                    if (!body || err || !body.gameList) {
                                        res.send("Error");
                                    }
                                    else {
                                        summonerName = encodeURI(body.gameList[0].participants[0].summonerName);

                                        _request(`https://${userInfo.ServerLocation + riotUrl}/lol/summoner/v3/summoners/by-name/${summonerName + locale + key}`, { json: true }, (err, response, body) => {
                                            if (!body || err || !body.id) {
                                                res.send("Error");
                                            }
                                            else {
                                                userInfo = new UserInfo(regions[7], body.id, token.channel_id);

                                                _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/active-games/by-summoner/${userInfo.SummonerId + locale + key}`, { json: true }, (err, response, body) => {
                                                    if (!body || err) {
                                                        res.send("Error");
                                                    }

                                                    matchData = body;
                                                    loadMatchData(matchData, userInfo, res);
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
});

app.get("/RetrieveGameData", (req, res) => {
    var matchData;
    var userInfo;
    var tokenString = req.get("loltwitchextension-jwt");
    console.log(`RetrieveGameData function is executing`);

    jwt.verify(tokenString, Buffer.from(twitchSecret, 'base64'), function (err, token) {
        if (err) {
            res.send("Error");
        }
        else {
            mongoClient.connect(dbUrl, function (err, db) {
                db.collection("users").findOne({ TwitchId: token.channel_id }, function (err, result) {
                    if (!result) {
                        res.send("Error");
                    }
                    else {
                        userInfo = result;

                        db.collection("userData").findOne({ TwitchId: token.channel_id }, function (err, result) {
                            if (result && result.NextUpdate > new Date()) {
                                res.send(result.MatchData);
                            }
                            else {
                                _request(`https://${userInfo.ServerLocation + riotUrl}/lol/spectator/v3/active-games/by-summoner/${userInfo.SummonerId + locale + key}`, { json: true }, (err, response, body) => {
                                    if (!body || err || body.status !== undefined) {
                                        var userData = {};
                                        userData.TwitchId = userInfo.TwitchId;
                                        userData.NextUpdate = new Date(new Date().getTime() + updatePeriod * 60000);
                                        userData.MatchData = matchData;

                                        db.collection("userData").updateOne({ TwitchId: userInfo.TwitchId }, userData, { upsert: true }, function (err, result) {
                                            res.send(matchData);
                                        });
                                    }
                                    else {
                                        matchData = body;
                                        loadMatchData(matchData, userInfo, res);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
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
                    var userData = {};
                    userData.TwitchId = userInfo.TwitchId;
                    userData.NextUpdate = new Date(new Date().getTime() + updatePeriod * 60000);
                    userData.MatchData = matchData;

                    db.collection("userData").updateOne({ TwitchId: userInfo.TwitchId }, userData, { upsert: true }, function (err, result) {
                        res.send(matchData);
                    });
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