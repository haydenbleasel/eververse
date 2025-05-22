(() => {
  const id = window.EververseWidgetId;
  const apiUrl = window.EververseApiUrl ?? 'https://api.eververse.ai';
  const darkMode = window.EververseWidgetDarkMode ?? false;

  if (!id) {
    throw new Error('Eververse Widget ID is required');
  }

  const triggerUrl = new URL('/trigger', apiUrl);
  triggerUrl.searchParams.append('darkMode', darkMode ? 'true' : 'false');

  const panelUrl = new URL('/panel', apiUrl);
  panelUrl.searchParams.append('id', id);
  panelUrl.searchParams.append('darkMode', darkMode ? 'true' : 'false');

  const trigger = document.createElement('iframe');
  trigger.style.zIndex = '2147483000';
  trigger.style.position = 'fixed';
  trigger.style.bottom = '1rem';
  trigger.style.right = '1rem';
  trigger.style.width = '48px';
  trigger.style.height = '48px';
  trigger.style.borderRadius = '50%';
  trigger.style.colorScheme = 'none';
  trigger.style.background = 'none';
  trigger.style.filter =
    'drop-shadow(rgba(0, 0, 0, 0.06) 0px 1px 6px) drop-shadow(rgba(0, 0, 0, 0.16) 0px 2px 32px)';
  trigger.src = triggerUrl.toString();
  trigger.style.cursor = 'pointer';

  const panel = document.createElement('iframe');
  panel.style.zIndex = '2147483000';
  panel.style.position = 'fixed';
  panel.style.bottom = '80px';
  panel.style.right = '1rem';
  panel.style.transformOrigin = 'right bottom';
  panel.style.height = '0';
  panel.style.minHeight = '100px';
  panel.style.width = '0%';
  panel.style.maxWidth = '384px';
  panel.style.maxHeight = '70dvh';
  panel.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 5px 40px';
  panel.style.borderRadius = '16px';
  panel.style.overflow = 'hidden';
  panel.style.opacity = '0';
  panel.style.transition =
    'transform 300ms cubic-bezier(0, 1.2, 1, 1) 0s, opacity 83ms ease-out 0s';
  panel.style.pointerEvents = 'none';
  panel.style.userSelect = 'none';
  panel.src = panelUrl.toString();

  // Create overlay div to capture click events
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.bottom = '1rem';
  overlay.style.right = '1rem';
  overlay.style.width = '48px';
  overlay.style.height = '48px';
  overlay.style.zIndex = '2147483001';
  overlay.style.cursor = 'pointer';

  overlay.addEventListener('click', () => {
    const isVisible = panel.style.opacity === '1';
    panel.style.opacity = isVisible ? '0' : '1';
    panel.style.pointerEvents = isVisible ? 'none' : 'all';
    panel.style.userSelect = isVisible ? 'none' : 'all';
    panel.style.width = isVisible ? '0%' : '90%';
    panel.style.height = isVisible ? '0' : '100%';
  });

  document.body.append(trigger);
  document.body.append(panel);
  document.body.append(overlay);
})();
