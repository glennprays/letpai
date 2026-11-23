import { House, Receipt, Users, CircleUserRound } from 'lucide-svelte';

// One list for the desktop sidebar and the mobile tab bar.
export const APP_NAV = [
	{ href: '/dashboard', label: 'Home', icon: House },
	{ href: '/sessions', label: 'Sessions', icon: Receipt },
	{ href: '/contacts', label: 'Contacts', icon: Users },
	{ href: '/profile', label: 'Profile', icon: CircleUserRound }
] as const;

/** Active when on the page itself or anything below it (except /sessions/new). */
export function isActive(href: string, pathname: string): boolean {
	if (pathname === '/sessions/new') return false;
	if (href === '/profile') return pathname === '/profile' || pathname === '/settings';
	return pathname === href || pathname.startsWith(`${href}/`);
}
