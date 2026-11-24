// Every screen in the app, with the identity it is viewed as. `name` doubles
// as the screenshot file name. Shared by the smoke and accessibility specs.
export type Who = 'anon' | 'host' | 'empty' | 'admin';

export const ROUTES: Array<{ name: string; path: string; who: Who }> = [
	{ name: 'landing', path: '/', who: 'anon' },
	{ name: 'about', path: '/about', who: 'anon' },
	{ name: 'error-404', path: '/this-page-does-not-exist', who: 'anon' },
	{ name: 'login', path: '/login', who: 'anon' },
	{ name: 'register', path: '/register', who: 'anon' },
	{ name: 'forgot-password', path: '/forgot-password', who: 'anon' },
	{ name: 'dashboard', path: '/dashboard', who: 'host' },
	{ name: 'dashboard-empty', path: '/dashboard', who: 'empty' },
	{ name: 'sessions', path: '/sessions', who: 'host' },
	{ name: 'session-detail', path: '/sessions/s-dinner', who: 'host' },
	{ name: 'session-detail-small', path: '/sessions/s-bali', who: 'host' },
	{ name: 'participant-detail', path: '/sessions/s-dinner/participants/s-dinner-p2', who: 'host' },
	{ name: 'session-new', path: '/sessions/new', who: 'host' },
	{ name: 'contacts', path: '/contacts', who: 'host' },
	{ name: 'contacts-empty', path: '/contacts', who: 'empty' },
	{ name: 'profile', path: '/profile', who: 'host' },
	{ name: 'settings', path: '/settings', who: 'host' },
	{ name: 'pay-pending', path: '/payment/s-dinner-p3', who: 'anon' },
	{ name: 'pay-submitted', path: '/payment/s-dinner-p2', who: 'anon' },
	{ name: 'pay-paid', path: '/payment/s-dinner-p1', who: 'anon' },
	{ name: 'pay-rejected', path: '/payment/s-dinner-p4', who: 'anon' },
	{ name: 'pay-expired', path: '/payment/s-bali-p3', who: 'anon' },
	{ name: 'admin-login', path: '/admin/login', who: 'anon' },
	{ name: 'admin-overview', path: '/admin', who: 'admin' },
	{ name: 'admin-admins', path: '/admin/admins', who: 'admin' },
	{ name: 'admin-profile', path: '/admin/profile', who: 'admin' },
	{ name: 'admin-templates', path: '/admin/templates', who: 'admin' },
	{ name: 'admin-whatsapp', path: '/admin/whatsapp', who: 'admin' },
	{ name: 'styleguide', path: '/dev/styleguide', who: 'anon' }
];
