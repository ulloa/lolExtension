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
});

$.ajax({
    url: "http://localhost:8000/Test"
}).done(function (data) {
    if (data != null) {
        for (var i = 0; i < data.participants.length; i++) {
            if (i % 2 == 0) {
                $("#menuBody").append($('<tr id="' + i + 'player">'));
                $("#menuBody tr:last").append($('<td><img src="' + data.participants[i].profileIconImage + '" /></td>'));
                $("#menuBody tr:last").append($('<td>' + data.participants[i].summonerName + '</td></tr>'));
                $("#menuBody tr:last").append($('<td><img src="' + data.participants[i].championImage + '"/></td>'));
                $("#menuBody tr:last").append($('<td><img src="' + data.participants[i].spell1Image + '"/></td>'));
                $("#menuBody tr:last").append($('<td><img src="' + data.participants[i].spell2Image + '"/></td>'));
                $("#menuBody tr:last").append($('<td><button>Masteries</button></td>'));
                $("#menuBody tr:last").append($('<td><button>Runes</button></td>'));
                $("#menuBody tr:last").append($('<td/>'));
                $("#menuBody tr:last").append($('<td/>'));
            }
            else {
                $("#" + (i - 1) + "player").append($('<td><img src="' + data.participants[i].profileIconImage + '" /></td>'));
                $("#" + (i - 1) + "player").append($('<td>' + data.participants[i].summonerName + '</td></tr>'));
                $("#" + (i - 1) + "player").append($('<td><img src="' + data.participants[i].championImage + '"/></td>'));
                $("#" + (i - 1) + "player").append($('<td><img src="' + data.participants[i].spell1Image + '"/></td>'));
                $("#" + (i - 1) + "player").append($('<td><img src="' + data.participants[i].spell2Image + '"/></td>'));
                $("#" + (i - 1) + "player").append($('<td><button>Masteries</button></td>'));
                $("#" + (i - 1) + "player").append($('<td><button>Runes</button></td>'));
            }
        }
    }
}).fail(function (jqXHR, textStatus, errorThrown) {
    console.log(textStatus);
});