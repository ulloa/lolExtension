/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/*

  Set Javascript specific to the extension viewer view in this file.

*/

var globalVars = { unloaded: false };
$(window).bind('beforeunload', function () {
    globalVars.unloaded = true;
});

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
    url: "http://localhost:8000/Test"
}).done(function (data) {
    if (data != null) {
        for (var i = 0; i < data.participants.length; i++) {
            if (i % 2 == 0) {
                $("#table1").append($('<div class="row" id="' + i + 'player">'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].profileIconImage + '" /></div>'));
                $("#table1 .row:last").append($('<div class="cell">' + data.participants[i].summonerName + '</div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].championImage + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell1Image + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell2Image + '"/></div>'));
                $("#table1 .row:last").append($('<div class="cell"><button><img src="' + data.participants[i].masteryImage + '"/></button></div>'));
                $("#table1 .row:last").append($('<div class="cell"><button><img src="css/Rune.png"/></button></div>'));
            }
            else {
                $("#table2").append($('<div class="row" id="' + i + 'player">'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].profileIconImage + '" /></div>'));
                $("#table2 .row:last").append($('<div class="cell">' + data.participants[i].summonerName + '</div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].championImage + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell1Image + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><img src="' + data.participants[i].spell2Image + '"/></div>'));
                $("#table2 .row:last").append($('<div class="cell"><button><img src="' + data.participants[i].masteryImage + '"/></button></div>'));
                $("#table2 .row:last").append($('<div class="cell"><button><img src="css/Rune.png"/></button></div>'));
            }
        }
    }
}).fail(function (jqXHR, textStatus, errorThrown) {
    console.log(textStatus);
});