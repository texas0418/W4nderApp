// Incoming deep links (w4nder:// scheme, later universal links). Only
// whitelisted paths route; anything else lands on home so stale or
// malformed links can't open arbitrary screens.
const DEEP_LINKABLE = ['receive-date', 'plan-date'];

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  for (const route of DEEP_LINKABLE) {
    const match = path.match(new RegExp(`(?:^|/)${route}(\\?[^#]*)?`));
    if (match) return `/${route}${match[1] ?? ''}`;
  }
  return '/';
}
