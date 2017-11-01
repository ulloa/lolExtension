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

function showMasteriesTab() {
    enableMastery();
}

function showRunesTab() {
    enableRunes();
}

function closeMasteryContainer() {
    $("#masteryContainer").hide();
}

function showMasteries(button) {
    var id = $(button).closest(".row").attr("id");

    fillRunesAndMaster(parseInt(id));
    enableMastery();
}

function showRunes(button) {
    var id = $(button).closest(".row").attr("id");

    fillRunesAndMaster(parseInt(id));
    enableRunes();
}

function fillRunesAndMaster(id) {
    $("#runesTab").html("");
    $("#masteryTab").html("");

    dataStore.participants[id].masteries.forEach(function (mastery) {
        var masteryT = $("#masteryTemplate").clone();
        masteryT.find(".description").text("Description: " + mastery.masteryData.description);
        masteryT.find(".image").attr("src", mastery.masteryData.image.full);
        masteryT.find(".amount").text("Points: " + mastery.rank);

        $("#masteryTab").append(masteryT);
    });

    dataStore.participants[id].runes.forEach(function (rune) {
        var runeT = $("#runeTemplate").clone();
        runeT.find(".description").text("Description: " + rune.runeData.description);
        runeT.find(".image").attr("src", rune.runeData.image.full);
        runeT.find(".amount").text("Amount: " + rune.count);

        $("#runesTab").append(runeT);
    });
}

function enableRunes() {
    $("#runesTab").show();
    $("#runeButton").removeClass("disabled");
    $("#masteryTab").hide();
    $("#masteryButton").addClass("disabled");
    $("#masteryContainer").show();
}

function enableMastery() {
    $("#masteryTab").show();
    $("#masteryButton").removeClass("disabled");
    $("#runesTab").hide();
    $("#runeButton").addClass("disabled");
    $("#masteryContainer").show();
}

var dataStore;

//"http://localhost:8000/Test"
$.ajax({
    url: "https://leaguetwitch.herokuapp.com/Test"  
}).done(function (data) {
    if (data !== null) {
        dataStore = data;
        for (var i = 0; i < data.participants.length; i++) {
            if (i % 2 === 0) {
                $("#table1").append($('<div class="row" id="' + i + '">'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].profileIconImage + '" /></div>'));
                $("#table1 .row:last").append($('<div class="cell">' + data.participants[i].summonerName + '</div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].championImage + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell1.image + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell2.image + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><button onclick="showMasteries(this)"><img tag="masteries" alt="masteries" src="' + data.participants[i].keyStone + '"/></button></div>'));
                $("#table1 .row:last").append($('<div class="cell"><button onclick="showRunes(this)"><img tag="runes" alt="runes" src="css/Rune.png"/></button></div>'));
            }
            else {
                $("#table2").append($('<div class="row" id="' + i + '">'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].profileIconImage + '" /></div>'));
                $("#table2 .row:last").append($('<div class="cell">' + data.participants[i].summonerName + '</div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].championImage + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell1.image + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell2.image + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><button onclick="showMasteries(this)"><img tag="masteries" alt="masteries" src="' + data.participants[i].keyStone + '"/></button></div>'));
                $("#table2 .row:last").append($('<div class="cell"><button onclick="showRunes(this)"><img tag="runes" alt="runes" src="css/Rune.png"/></button></div>'));
            }
        }

        $(".menuButtonContainer").show();
    }
});