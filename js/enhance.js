/* enhance.js — 疊加層（一定要喺 app.js 之後載入）
 * 1) 📮 意見回報：Scout Admin 統一回報 v1（線上 widget ＋離線後備卡）
 * 2) ⏯ 繼續上次：由本機進度（localStorage）砌「上次帶到第幾段」卡
 * 3) 所有頁面擴充一律經 App.wrap 登記，唔好自己覆寫 App.pages.*
 * 私隱：只收「問題／意見」本身；唔收姓名、班別、地址或相片，亦唔會寫入本機。
 */
(function(){
  'use strict';

  /* ── 📮 意見回報 ─────────────────────────────────────────── */
  App.FEEDBACK = {
    app: '深資童軍集會',
    source: 'https://scout-admin-blue.vercel.app/widget.js',
    page: 'https://scout-admin-blue.vercel.app/report.html?app=' + encodeURIComponent('深資童軍集會')
  };

  App.feedbackTemplate = function(){
    return '【' + App.FEEDBACK.app + '｜問題／意見】\n'
      + '類別：（問題回報／意見回饋）\n'
      + '邊一頁：（例：#plan／#plan/c04／#book/apply／#uniform/badge）\n'
      + '發生咩事：（一句講清楚，例如「撳列印冇反應」）\n'
      + '裝置同瀏覽器：（例：iPad Safari）\n'
      + '（可留聯絡方法；唔好填團員姓名、班別、地址或相片）';
  };

  App.feedbackCard = function(){
    return '<section class="card feedback-card"><h2>📮 意見回報</h2>'
      + '<p class="mut">見到錯處、想加內容、帶會時卡住，直接講；可以匿名，唔使帳戶。</p>'
      + '<div class="quick"><button class="btn gr" onclick="App.feedback()">💬 開回報表單</button>'
      + '<a class="btn ghost" href="' + App.FEEDBACK.page + '" target="_blank" rel="noopener">🌐 網頁版表單</a></div>'
      + '<p class="mut">離線都用得：撳「開回報表單」會出好文字，複製之後貼去 WhatsApp／電郵。</p>'
      + '<p class="safe">私隱：唔好填團員姓名、班別、地址或相片；只講遇到咩問題。</p>'
      + '<p class="mut">回報會送去 Scout Admin 的統一看板（來源：' + App.FEEDBACK.app + '），同其他童軍系統同一格式。</p></section>';
  };

  App.modalOpen = function(html){
    try{
      var host = document.getElementById('modal');
      if(!host) return false;
      host.innerHTML = '<div class="sheet" role="dialog" aria-modal="true" aria-label="意見回報">'
        + '<div class="sheet-head"><b>📮 意見回報</b><button class="x" aria-label="關閉" onclick="App.modalClose()">✕</button></div>'
        + '<div class="sheet-body">' + html + '</div></div>';
      if(document.body && document.body.classList) document.body.classList.add('modal-open');
      host.onclick = function(e){ if(e && e.target === host) App.modalClose(); };
      return true;
    }catch(e){ return false; }
  };
  App.modalClose = function(){
    try{
      var host = document.getElementById('modal');
      if(host) host.innerHTML = '';
      if(document.body && document.body.classList) document.body.classList.remove('modal-open');
    }catch(e){}
    return true;
  };

  /* 線上：撳官方 widget 浮動掣；離線／腳本被封：開後備模態（可複製文字＋網頁版表單） */
  App.feedback = function(){
    var fab = document.getElementById('scoutw-fab');
    if(fab && typeof fab.click === 'function'){ fab.click(); return true; }
    App.modalOpen('<p class="mut">回報表單未載入（多數係離線，或者網絡擋住外部腳本）。可以先抄低文字，貼去 WhatsApp／電郵畀管理員。</p>'
      + '<textarea id="fb-ta" class="fb-copy" rows="7" readonly onclick="this.select()">' + App.feedbackTemplate() + '</textarea>'
      + '<div class="quick"><button class="btn gr" onclick="App.copyFeedback()">📋 複製回報文字</button>'
      + '<a class="btn" href="' + App.FEEDBACK.page + '" target="_blank" rel="noopener">🌐 網頁版表單</a></div>'
      + '<p class="mut">恢復上網之後，右下角會再有「🐛💬 回報 · 意見」掣，用法一樣。</p>'
      + '<p class="safe">私隱：唔好填團員姓名、班別、地址或相片；講問題本身就得。</p>');
    return false;
  };

  App.copyFeedback = function(){
    var ta = document.getElementById('fb-ta');
    var text = ta ? ta.value : App.feedbackTemplate();
    function done(){ if(App.toast) App.toast('已複製回報文字'); }
    function fallback(){
      if(!ta) return;
      try{ ta.focus(); ta.select(); document.execCommand('copy'); done(); }catch(e){}
    }
    try{
      if(typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done, fallback);
      } else fallback();
    }catch(e){ fallback(); }
    return true;
  };

  /* ── ⏯ 繼續上次（集會目錄最頂）───────────────────────────── */
  App.continueCard = function(){
    var last = App.lastMeeting ? App.lastMeeting() : null;
    var sum = App.progressSummary ? App.progressSummary() : { done:0, total:16 };
    var box = App.h('div','card continue-card');
    if(last && last.tid){
      var m = (typeof DATA !== 'undefined' && DATA.meetings || []).filter(function(x){ return x.tid===last.tid; })[0];
      var name = m ? (m.tid + ' ' + m.n) : last.tid;
      var seg = last.seg ? ('第 ' + (last.segLabel || last.seg) + ' 段') : '';
      box.innerHTML = '<h2>⏯ 繼續上次</h2>'
        + '<p><b>' + name + '</b>' + (seg ? '<br><small class="mut">上次帶到：' + seg + '</small>' : '') + '</p>'
        + '<div class="quick"><a class="btn gr" href="#plan/' + last.tid + '">▶ 開返上次</a>'
        + '<a class="btn ghost" href="#plan">📅 集會目錄</a></div>'
        + '<p class="mut">全團已帶 ' + sum.done + '／' + sum.total + ' 場（只記喺呢部裝置）。</p>';
    } else {
      box.innerHTML = '<h2>🚀 由 c01 開始</h2>'
        + '<p>第一次帶？跟 c01 破冰＋童軍運動目的；每場入去照「教材＋帶流程」做就得。</p>'
        + '<div class="quick"><a class="btn gr" href="#plan/c01">▶ 開 c01</a>'
        + '<a class="btn ghost" href="#plan">📅 全部 16 場</a></div>'
        + '<p class="mut">帶完一場撳「☑️ 標記為已帶」，目錄可以篩「未帶／已帶」。</p>';
    }
    return box;
  };

  /* 登記：集會目錄（插「繼續上次」卡） */
  App.wrapOn(App.pages, 'plan', function(prev){
    return function(){
      var wrap = prev.apply(App, arguments);       try{
        var card = App.continueCard();
        var h1 = wrap.querySelector ? wrap.querySelector('h1') : null;
        if(h1 && h1.parentNode === wrap && wrap.insertBefore) wrap.insertBefore(card, h1.nextSibling || null);
        else wrap.appendChild(card);
      }catch(e){}
      return wrap;
    };
  }, 'pages');

  /* 登記：手冊（喺「參考資料」尾加回報卡，離線都開得） */
  App.wrapOn(App.pages, 'book', function(prev){
    return function(sub){
      var wrap = prev.apply(App, arguments);       try{
        if((sub || 'promise') === 'refs'){
          var holder = App.h('div','feedback-holder');
          holder.innerHTML = App.feedbackCard();
          wrap.appendChild(holder);
        }
      }catch(e){}
      return wrap;
    };
  }, 'pages');
})();
