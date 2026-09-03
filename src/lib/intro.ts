export const INTRO_REVEAL_EVENT = "rouse:intro-reveal";

// Opt in before the first paint so the storefront never flashes behind the
// opening. Without JS the dialog stays hidden and the store remains available.
// A failed/slow hydration must also release the page without React's help.
export const INTRO_BOOTSTRAP = `(function(){
  if(location.pathname !== '/' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.setAttribute('data-rouse-intro', 'pending');
  function release(){
    document.removeEventListener('visibilitychange', arm);
    if(root.getAttribute('data-rouse-intro') !== 'pending') return;
    root.removeAttribute('data-rouse-intro');
    var intro = document.getElementById('rouse-intro');
    if(intro && intro.open) intro.close();
  }
  var timer;
  function arm(){
    clearTimeout(timer);
    if(!document.hidden) timer = setTimeout(release, 6000);
  }
  document.addEventListener('visibilitychange', arm);
  arm();
})();`;
