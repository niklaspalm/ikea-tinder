/**
 * Colour theme preference. "system" follows the OS; "light"/"dark" pin it via
 * <html data-theme>, which flips `color-scheme` and with it every light-dark() token
 * in layout.css. The choice is per device, so localStorage is enough. app.html
 * applies it before first paint so a pinned theme never flashes the other one.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** Keep in sync with the inline script in src/app.html. */
const STORAGE_KEY = 'ikea-tinder:theme';

const isPinned = (value: unknown): value is 'light' | 'dark' => value === 'light' || value === 'dark';

export const readThemePreference = (): ThemePreference => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return isPinned(stored) ? stored : 'system';
	} catch {
		// Private mode or blocked storage: fall back to the OS setting.
		return 'system';
	}
};

export const applyThemePreference = (preference: ThemePreference): void => {
	const root = document.documentElement;
	if (isPinned(preference)) root.dataset.theme = preference;
	else delete root.dataset.theme;

	try {
		if (isPinned(preference)) localStorage.setItem(STORAGE_KEY, preference);
		else localStorage.removeItem(STORAGE_KEY);
	} catch {
		// The theme still applies for this page view; it just won't be remembered.
	}
};
