var twitchJwt;

if (window.Twitch.ext) {
    window.Twitch.ext.onAuthorized(function (auth) {
        twitchJwt = auth.token;
    });
}

$("#userSubmit").click(function () {
    if (twitchJwt) {
        var parm = "$SummonerName=" + $("#summonerName").val() + "&ServerLocation=" + $("#serverLocation").val();
        //"http://localhost:8000/Test"
        $.ajax({
            url: "https://leaguetwitch.herokuapp.com/Test" + parm,
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