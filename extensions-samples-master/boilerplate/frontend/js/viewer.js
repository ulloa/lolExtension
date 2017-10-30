$("#menuButton").click(function () {
    $("#menuContainer").toggle();
    $("#menuButton").toggle();
    $("#menuButtonCollapse").toggle();
});

$("#menuButtonCollapse").click(function () {
    $("#menuContainer").toggle();
    $("#menuButton").toggle();
    $("#menuButtonCollapse").toggle();
});

$.ajax({
    url: "https://leaguetwitch.herokuapp.com/Test" //"https://localhost:1411"
}).done(function (data) {
    if (data !== null) {
        for (var i = 0; i < data.participants.length; i++) {
            if (i % 2 === 0) {
                $("#table1").append($('<div class="row" id="' + i + 'player">'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].profileIconImage + '" /></div>'));
                $("#table1 .row:last").append($('<div class="cell">' + data.participants[i].summonerName + '</div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].championImage + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell1.image + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell2.image + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><button><img alt="masteries" src="' + data.participants[i].masteryImage + '"/></button></div>'));
                $("#table1 .row:last").append($('<div class="cell"><button><img alt="runes" src="css/Rune.png"/></button></div>'));
            }
            else {
                $("#table2").append($('<div class="row" id="' + i + 'player">'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].profileIconImage + '" /></div>'));
                $("#table2 .row:last").append($('<div class="cell">' + data.participants[i].summonerName + '</div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].championImage + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell1.image + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell2.image + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><button><img alt="masteries" src="' + data.participants[i].masteryImage + '"/></button></div>'));
                $("#table2 .row:last").append($('<div class="cell"><button><img alt="runes" src="css/Rune.png"/></button></div>'));
            }
        }
    }
}).fail(function (jqXHR, textStatus, errorThrown) {
    console.log(textStatus);
});