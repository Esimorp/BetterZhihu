/**
 * Created by never on 2017/5/25.
 */

$(document).ready(function () {
    chrome.storage.sync.get(['zici_better_zhihu', 'better_zhihu_step'], function (item) {
        $("#zici").val(item.zici_better_zhihu);
        $('#step').val(item.better_zhihu_step);
    });
    $('#zici').on('change', function () {
        chrome.storage.sync.set({zici_better_zhihu: $(this).val()}, function () {
        });
    });

    $('#saveStep').on('click', function () {
        chrome.storage.sync.set({better_zhihu_step: $('#step').val()}, function () {
        });
    })
});