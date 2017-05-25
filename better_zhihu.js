/**
 * Created by never on 2017/5/25.
 */

chrome.storage.sync.get(['zici_better_zhihu', 'better_zhihu_step'], function (item) {
    if (item.zici_better_zhihu === "1") {
        var step = 2000;
        if (item.better_zhihu_step) {
            step = item.better_zhihu_step * 1000;
        }
        console.log(step)

        var title = $(document);
        title.bind('DOMNodeInserted', function (e) {
            if (e.path.length === 18 || e.path.length === 16) {
                var answers = $('.ContentItem.AnswerItem');
                for (var i = 0; i < answers.length; i++) {
                    var actionsContainer = $(answers[i]).find(".ContentItem-actions")[0];
                    if (actionsContainer) {
                        if ($(actionsContainer).find("#block_all_vote_up_button").length === 0) {
                            $('<button id="block_all_vote_up_button" class="Button ContentItem-action Button--plain">💊屏赞</button>').insertBefore($(actionsContainer).children().last());
                        }
                    }
                }
            }
        });

        $(document).on("click", "#block_all_vote_up_button", function () {
            if (window.confirm('你确定要拉黑他们吗?')) {
                var contentItem = $(this).parents('.ContentItem.AnswerItem')[0];
                if (contentItem) {
                    var answerId = $(contentItem).attr("name");
                    var answerVotersUrl = "https://www.zhihu.com/api/v4/answers/" + answerId + "/voters?include=data%5B*%5D.answer_count%2Carticles_count%2Cfollower_count%2Cgender%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=";
                    fetchAllVoter(answerVotersUrl, 0, [], block_all_voters);
                }
            }
        });

        function block_all_voters(voters) {
            alert("获取用户列表完毕，大概需要" + (voters.length * step) / 1000 + "秒" + "，请不要关闭此页面");
            for (var i = 0; i < voters.length; i++) {
                if ((i + 1) === voters.length) {
                    setTimeout(block_voter(voters[i], function () {
                        alert("拉黑完毕")
                    }), i * step);
                }
                setTimeout(block_voter(voters[i]), i * step);
            }
        }

        function block_voter(voter, callback) {
            return function () {
                $.ajax({
                    type: "POST",
                    url: "https://www.zhihu.com/api/v4/members/" + voter + "/actions/block",
                    complete: function () {
                        if (callback) {
                            callback();
                        }
                    }
                })
            }
        }

        function fetchAllVoter(url, offset, voters, callback) {
            $.ajax({
                url: url + offset + "&limit=20",
                success: function (data) {
                    if (data.paging.is_end === true) {
                        for (var i = 0; i < data.data.length; i++) {
                            voters.push(data.data[i].url_token)
                        }
                        callback(voters);
                    } else {
                        for (var i = 0; i < data.data.length; i++) {
                            voters.push(data.data[i].url_token)
                        }
                        fetchAllVoter(url, offset + 20, voters, callback);
                    }
                }
            })
        }
    }
    else {
        alert("你没有兹磁Better Zhihu的用户协议，所以无法使用Better Zhihu")
    }
});
