const _request = require("request");
const express = require('express');
const cors = require('cors')
const app = express();
app.use(cors());
const morgan = require('morgan');
const path = require('path');
const locale = "?locale=en_US";
const key = "&api_key=RGAPI-e0542456-35b8-4953-98e1-610e8ba2bb4a";
const tagKey = "&tags=keys&dataById=false";
const riotUrl = ".api.riotgames.com";
const hostname = 'localhost';
const port = 8000;

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

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
    var count = 0;

    if (matchData != undefined && matchData.participants != undefined) {
        _request(`https://${userInfo.ServerLocation + riotUrl}/lol/static-data/v3/champions${locale + tagKey + key}`, { json: true }, (err, response, body) => {
            var champions = body.keys;
            var version = body.version;

            _request(`https://${userInfo.ServerLocation + riotUrl}/lol/static-data/v3/masteries${locale + key}`, { json: true }, (err, response, body) => {
                var masteries = body.data;

                _request(`https://${userInfo.ServerLocation + riotUrl}/lol/static-data/v3/runes${locale + key}`, { json: true }, (err, response, body) => {
                    var runes = body.data;

                    _request(`https://${userInfo.ServerLocation + riotUrl}/lol/static-data/v3/summoner-spells${locale + key}`, { json: true }, (err, response, body) => {
                        var spells = body.data;

                        matchData.participants.forEach(function (participant) {
                            participant["profileIconImage"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${participant.profileIconId}.png`;
                            participant["championImage"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champions[participant.championId]}.png`;

                            for (var i = 0; i < spells.length; i++) {
                                if (spells[i].id == participant.spell1Id) {
                                    participant["spell1Image"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spells[i].key}.png`;
                                }

                                if (spells[i].id == participant.spell2Id) {
                                    participant["spell2Image"] = `http://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${spells[i].key}.png`;
                                }

                                if (participant["spell1Image"] != undefined && participant["spell2Image"] != undefined) {
                                    break;
                                }
                            }
                        });

                        console.log("got match data");
                        res.send(matchData);
                    });
                });
            });
        });
    }
}

class UserInfo {
    constructor(ServerLocation, SummonerId) {
        this.SummonerId = SummonerId;
        this.ServerLocation = ServerLocation;
    }
}