chrome.storage.sync.get(['zici_better_zhihu', 'better_zhihu_step'], function(item) {
    // if (item.zici_better_zhihu !== "1") {
    //   alert("你没有兹磁Better Zhihu的用户协议，所以无法使用Better Zhihu")
    //   return;
    // }
    var step = 2000;
    if (item.better_zhihu_step) {
        step = item.better_zhihu_step * 1000;
    }

    var actionsContainer = $(document).find(".ContentItem-actions")[0];
    if (actionsContainer) {
        if ($(actionsContainer).find("#block_all_vote_up_button").length === 0) {
            $('<button id="block_all_vote_up_button" class="Button ContentItem-action Button--plain">💊屏赞</button>').insertBefore($(actionsContainer).children().last());
        }
    }

    $(document).on("click", "#block_all_vote_up_button", function() {
        if (window.confirm('你确定要拉黑他们吗?')) {
            const parts = document.URL.split('/');
            const postId = parts[parts.length - 1];
            let port = chrome.runtime.connect({
                name: "better_zhihu"
            });
            port.postMessage({
                articleVotersUrl: `https://www.zhihu.com/api/v4/articles/${postId}/likers?include=data%5B*%5D.answer_count%2Carticles_count%2Cfollower_count%2Cgender%2Cis_followed%2Cis_following%2Cbadge&offset=`,
                step: step
            });
            port.onMessage.addListener(function(msg) {
                console.log(msg.msg);
            });
        }
    });
});
