// Resolves dark/light across all three viewer states: an explicit
// data-theme stamp on the root element wins in either direction; with no
// stamp, the OS-level prefers-color-scheme setting decides.
export function computeIsDark(): boolean {
  const stamp = document.documentElement.getAttribute('data-theme');
  if (stamp === 'dark') return true;
  if (stamp === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyThemeClass(): void {
  document.documentElement.classList.toggle('dark', computeIsDark());
}

export function watchTheme(onChange: () => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = () => onChange();
  mq.addEventListener('change', listener);

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return () => {
    mq.removeEventListener('change', listener);
    observer.disconnect();
  };
}
