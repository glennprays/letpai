import { goto } from '$app/navigation';
import { logout } from '$lib/stores/auth';
import { toast } from '$lib/stores/toast';

/** Clear the session everywhere it lives and land on the public home page. */
export async function signOut() {
	logout();
	toast.success('Signed out.');
	await goto('/', { invalidateAll: true });
}
