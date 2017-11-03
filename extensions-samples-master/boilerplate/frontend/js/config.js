var twitchJwt;

if (window.Twitch.ext) {
    window.Twitch.ext.onAuthorized(function (auth) {
        twitchJwt = auth.token;
        $("#userSubmit").prop('disabled', false);
    });
}

$("#userSubmit").click(function () {
    if (twitchJwt) {
        var parm = "?SummonerName=" + $("#summonerName").val() + "&ServerLocation=" + $("#serverLocation").val();
        //"http://localhost:8000/SetUser"
        //"https://leaguetwitch.herokuapp.com/SetUser"
        $.ajax({
            url: "https://79cc9a6f.ngrok.io/SetUser" + parm,
            headers: {
                'loltwitchextension-jwt': twitchJwt
            }
        }).done(function (data) {
            if (data === "Success") {
                $("#SuccessBox").show();
            }
            else {
                $("#ErrorBox").show();
            }
        });
    }
});