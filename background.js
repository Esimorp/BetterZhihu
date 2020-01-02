// Background script for BetterZhihu.
//
// We need a background script mainly because we need to send CORS requests.
// For an article, the URL is https://zhuanlan.zhihu.com/p/${article_id},
// however the URL for zhihu API is always https://www.zhihu.com/api/...
// Therefore API requests sent from an article page are cross-site requests.
//
// Since version 73, Chrome no longer allows CORS from content page. The recommeded
// solution is to send such requests from extension background pages instead.
// See https://www.chromium.org/Home/chromium-security/extension-content-script-fetches.

// In Chrome 80 and later, cookies will default to SameSite=Lax.
// See https://chromestatus.com/features/5088147346030592.
//
// Setting SameSite=None ensures cross-site request to be sent successfully.
// See https://web.dev/samesite-cookies-explained/ for details.
chrome.cookies.set({
    "name": "SameSite",
    "url": "https://zhuanlan.zhihu.com/p/70590871",
    "value": "None"
}, function(cookie) {
  if (chrome.extension.lastError) {
    console.log(chrome.extension.lastError);
  }
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError);
  }
});

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "better_zhihu");
  port.onMessage.addListener(function(msg) {
    fetchAllVoter(msg.articleVotersUrl, msg.step, 0, [], block_all_voters, port);
  });
});

function fetchAllVoter(url, step, offset, voters, callback, port) {
  $.ajax({
    url: url + offset + "&limit=20",
    success: function(data) {
      if (data.paging.is_end === true) {
        for (var i = 0; i < data.data.length; i++) {
          voters.push(data.data[i].url_token);
        }
        callback(voters, step, port);
      } else {
        for (var i = 0; i < data.data.length; i++) {
          voters.push(data.data[i].url_token);
        }
        fetchAllVoter(url, step, offset + 20, voters, callback, port);
      }
    }
  })
}

function block_all_voters(voters, step, port) {
  alert("获取用户列表完毕，大概需要" + (voters.length * step) / 1000 + "秒" + "，请不要关闭此页面");
  for (var i = 0; i < voters.length; i++) {
    const voter = voters[i];
    if ((i + 1) === voters.length) {
      setTimeout(block_voter(voter, function() {
        alert("拉黑完毕")
      }), i * step);
    }
    setTimeout(block_voter(voter, () => {
      // Posts message to content script so that users can see logs in console.
      port.postMessage({msg: `已拉黑：${voter}(https://www.zhihu.com/people/${voter}) 🚫`});
    }), i * step);
  }
}

function block_voter(voter, callback) {
  return function() {
    $.ajax({
      type: "POST",
      url: `https://www.zhihu.com/api/v4/members/${voter}/actions/block`,
      complete: function() {
        if (callback) {
          callback();
        }
      }
    })
  }
}
