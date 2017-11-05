var twitchJwt;

if (window.Twitch.ext) {
    window.Twitch.ext.onAuthorized(function (auth) {
        twitchJwt = auth.token;
    });
}

$("#summonerName").change(function () {
    if (formComplete()) {
        $("#userSubmit").prop('disabled', false);
    }
    else {
        $("#userSubmit").prop('disabled', true);
    }
});

$("#serverLocation").change(function () {
    if (formComplete()) {
        $("#userSubmit").prop('disabled', false);
    }
    else {
        $("#userSubmit").prop('disabled', true);
    }
});

function formComplete() {
    return ($("#summonerName").val() !== "" && $("#summonerName").val() !== undefined
        && $("#serverLocation").val() !== "" && $("#serverLocation").val() !== undefined);
}

function closePopup() {
    $("#successBox").hide();
    $("#errorBox").hide();
}

$("#userSubmit").click(function () {
    if (!formComplete) {
        $("#userSubmit").prop('disabled', true);
    }
    else if (twitchJwt) {
        var parm = "?SummonerName=" + $("#summonerName").val() + "&ServerLocation=" + $("#serverLocation").val();
        //"http://localhost:8000/SetUser"
        //"https://leaguetwitch.herokuapp.com/SetUser"
        $.ajax({
            url: "https://0c2da9f4.ngrok.io/SetUser" + parm,
            headers: {
                'loltwitchextension-jwt': twitchJwt
            }
        }).done(function (data) {
            if (data === "Success") {
                $("#successBox").show();
            }
            else {
                $("#errorBox").show();
            }

            $("#summonerName").val("");
            $("#serverLocation").val("");
        }).error(function () {
            $("#errorBox").show();

            $("#summonerName").val("");
            $("#serverLocation").val("");
        });
    }
});