export const INTRO_REVEAL_EVENT = "rouse:intro-reveal";
export const INTRO_REQUEST_EVENT = "rouse:intro-request";

// Opt in before the first paint so the storefront never flashes behind the
// opening. Without JS the dialog stays hidden and the store remains available.
// A failed/slow hydration must also release the page without React's help.
export const INTRO_BOOTSTRAP = `(function(){
  try {
    if(location.pathname !== '/' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var root = document.documentElement;
    root.setAttribute('data-rouse-intro', 'pending');
    function release(){
      try {
        document.removeEventListener('visibilitychange', arm);
        window.removeEventListener('error', release);
        root.removeAttribute('data-rouse-intro');
        var intro = document.getElementById('rouse-intro');
        if(intro && intro.open) intro.close();
      } catch(e) {}
    }
    var timer;
    function arm(){
      clearTimeout(timer);
      if(!document.hidden) timer = setTimeout(release, 6000);
    }
    document.addEventListener('visibilitychange', arm);
    window.addEventListener('error', release);
    arm();
  } catch(e) {
    try {
      document.documentElement.removeAttribute('data-rouse-intro');
    } catch(_) {}
  }
})();`;

export const INTRO_STYLE = `
html[data-rouse-intro] {
  overflow: hidden !important;
}
html[data-rouse-intro="pending"],
html[data-rouse-intro="loading"],
html[data-rouse-intro="playing"] {
  background: #000 !important;
}
html[data-rouse-intro="pending"] body,
html[data-rouse-intro="loading"] body,
html[data-rouse-intro="playing"] body {
  background: #000 !important;
}
html[data-rouse-intro="pending"] [data-intro-content],
html[data-rouse-intro="loading"] [data-intro-content],
html[data-rouse-intro="playing"] [data-intro-content],
html[data-rouse-intro="pending"] footer,
html[data-rouse-intro="loading"] footer,
html[data-rouse-intro="playing"] footer,
html[data-rouse-intro="pending"] .skip-link,
html[data-rouse-intro="loading"] .skip-link,
html[data-rouse-intro="playing"] .skip-link {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
html[data-rouse-intro] #rouse-intro {
  display: block !important;
  position: fixed !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  outline: none !important;
  background: transparent !important;
  z-index: 1000 !important;
}
html[data-rouse-intro="revealing"] #rouse-intro {
  pointer-events: none !important;
}
html[data-rouse-intro] #rouse-intro [data-intro-stage] {
  position: absolute !important;
  inset: 0 !important;
  background: #000 !important;
  -webkit-backface-visibility: hidden !important;
  backface-visibility: hidden !important;
}
@media (prefers-reduced-motion: reduce) {
  html[data-rouse-intro] {
    background: var(--paper) !important;
    overflow: visible !important;
  }
  html[data-rouse-intro] body {
    background: var(--paper) !important;
  }
  html[data-rouse-intro] #rouse-intro {
    display: none !important;
  }
  html[data-rouse-intro] [data-intro-content],
  html[data-rouse-intro] footer,
  html[data-rouse-intro] .skip-link {
    visibility: visible !important;
    opacity: 1 !important;
    pointer-events: auto !important;
  }
}
`.trim();

