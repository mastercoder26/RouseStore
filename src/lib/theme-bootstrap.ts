// StorageDriver serializes strings as JSON. Resolve the saved theme before
// first paint so reloads never briefly fall back to the light palette.
export const THEME_BOOTSTRAP = `(function(){
  var theme = 'heritage';
  try {
    var saved = localStorage.getItem('raider_theme');
    try { saved = JSON.parse(saved); } catch(e) {}
    if(['heritage', 'obsidian', 'studio', 'gold'].indexOf(saved) !== -1) theme = saved;
  } catch(e) {}
  document.documentElement.setAttribute('data-theme', theme);
})();`;
