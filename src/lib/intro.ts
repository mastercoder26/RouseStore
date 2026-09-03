export const INTRO_SESSION_KEY = "rouse-store-intro-v2-seen";
export const INTRO_REVEAL_EVENT = "rouse:intro-reveal";

// Opt in before the first paint so the storefront never flashes behind the
// opening. Without JS the dialog stays hidden and the store remains available.
// A failed/slow hydration must also release the page without React's help.
export const INTRO_BOOTSTRAP = `(function(){
  if(location.pathname !== '/' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if(sessionStorage.getItem('${INTRO_SESSION_KEY}') === '1') return; } catch(e) {}
  var root = document.documentElement;
  root.setAttribute('data-rouse-intro', 'pending');
  setTimeout(function(){
    if(root.getAttribute('data-rouse-intro') !== 'pending') return;
    root.removeAttribute('data-rouse-intro');
    var intro = document.getElementById('rouse-intro');
    if(intro && intro.open) intro.close();
  }, 6000);
})();`;
