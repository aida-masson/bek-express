(function(){
  var ID = 112550678;                 /* номер счётчика; 0 = выключено */
  var VER = 'main';                  /* на сайте одна версия дизайна */
  window.BEK_VER = VER;

  function goal(name, extra){
    if (!ID || !window.ym) return;
    var p = {version: VER};
    if (extra) for (var k in extra) p[k] = extra[k];
    try { ym(ID, 'reachGoal', name, p); } catch(e){}
  }
  window.bekGoal = goal;

  if (ID) {
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    ym(ID,'init',{webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,
                  params:{version:VER}});
  }

  /* цели */
  function ready(fn){ if(document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded',fn); }
  ready(function(){
    if (location.pathname.indexOf('warehouses/') > -1) goal('warehouse');
    if (location.pathname.indexOf('/how') > -1) goal('how');

    document.addEventListener('click', function(e){
      var el = e.target && e.target.closest ? e.target.closest('a,button') : null;
      if (!el) return;
      var h = el.getAttribute('href') || '';
      if (h.indexOf('wa.me') > -1) goal('whatsapp');
      else if (h.indexOf('t.me') > -1) goal('telegram');
      else if (h.indexOf('instagram.com') > -1) goal('instagram');
      else if (h.indexOf('tel:') === 0) goal('call');
      if (el.id === 'c-go') goal('price');
      if (el.id === 'h-go' || el.id === 'o-go') goal('callback');
      if (el.getAttribute && el.getAttribute('data-copy')) goal('copy_address');
    }, true);

    var of = document.getElementById('oform');
    if (of) of.addEventListener('submit', function(){ goal('callback'); });
  });
})();
