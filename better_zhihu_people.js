/**
 * Created by never on 2017/5/26.
 */
var step = 2000;

chrome.storage.sync.get(['zici_better_zhihu', 'better_zhihu_step'], function (item) {
        if (item.zici_better_zhihu === "1") {
            if (item.better_zhihu_step) {
                step = item.better_zhihu_step * 1000;
            }
            var followButtons = $(".Button.FollowButton.Button--primary.Button--blue");
            for (var i = 0; i < followButtons.length; i++) {
                if ($(followButtons[i]).text() === "关注他" || $(followButtons[i]).text() === "关注她") {
                    if ($(followButtons[i]).parent().hasClass("MemberButtonGroup") && $(followButtons[i]).parent().hasClass("ProfileButtonGroup") && $(followButtons[i]).parent().hasClass("ProfileHeader-buttons")) {
                        $("<button id='yaowan' class='Button FollowButton Button--primary Button--blue'>💊药丸</button>").insertBefore(followButtons[i]);
                    }
                }
            }
            $(document).on("click", "#yaowan", function () {
                if (window.confirm('你确定要拉黑他们吗?')) {
                    var card = JSON.parse($("#ProfileHeader").attr("data-za-module-info"));
                    var token = card.card.content.token;
                    var followersUrl = "https://www.zhihu.com/api/v4/members/" + token + "/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=";
                    fetchAllFollowers(followersUrl, 0, [], block_all_followers);
                }
            });
        } else {
            alert("你没有兹磁Better Zhihu的用户协议，所以无法使用Better Zhihu")
        }
    }
);
function block_all_followers(followers) {
    alert("获取用户列表完毕，大概需要" + (followers.length * step) / 1000 + "秒" + "，请不要关闭此页面");
    for (var i = 0; i < followers.length; i++) {
        if ((i + 1) === followers.length) {
            setTimeout(block_follower(followers[i], function () {
                alert("拉黑完毕")
            }), i * step);
        }
        setTimeout(block_follower(followers[i]), i * step);
    }
}

function block_follower(follower, callback) {
    return function () {
        $.ajax({
            type: "POST",
            url: "https://www.zhihu.com/api/v4/members/" + follower + "/actions/block",
            complete: function () {
                if (callback) {
                    callback();
                }
            }
        })
    }
}

function fetchAllFollowers(url, offset, followers, callback) {
    $.ajax({
        url: url + offset + "&limit=20",
        success: function (data) {
            if (data.paging.is_end === true) {
                for (var i = 0; i < data.data.length; i++) {
                    followers.push(data.data[i].url_token)
                }
                callback(followers);
            } else {
                for (var i = 0; i < data.data.length; i++) {
                    followers.push(data.data[i].url_token)
                }
                fetchAllFollowers(url, offset + 20, followers, callback);
            }
        }
    })
}