// Page metadata. Kept as a pure function so it can be unit-tested; the
// Seo.svelte component only renders what this returns.

export type OgImage = 'default' | 'landing' | 'payment';

export interface SeoInput {
	/** Page name, e.g. "Sessions". Rendered as "Sessions · Letpai". */
	title?: string;
	description?: string;
	image?: OgImage;
	/** Keep private or per-person pages out of search results. */
	noindex?: boolean;
}

export const SITE = {
	name: 'Letpai',
	tagline: 'You paid. They pay you back.',
	description:
		'Split a bill and send each friend their exact share on WhatsApp. They pay from a link, upload the transfer, and you tick them off. No app for them.'
};

const IMAGE_ALT: Record<OgImage, string> = {
	default: 'Letpai: You paid. They pay you back.',
	landing: 'A torn receipt split between friends, with a Paid stamp.',
	payment: 'A bill is waiting for you on Letpai.'
};

export function buildSeo(input: SeoInput, origin: string, pathname: string) {
	const image = input.image ?? 'default';
	const title = input.title ? `${input.title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`;
	return {
		title,
		ogTitle: input.title ?? SITE.tagline,
		description: input.description ?? SITE.description,
		url: `${origin}${pathname}`,
		image: `${origin}/og/${image}.png`,
		imageAlt: IMAGE_ALT[image],
		noindex: input.noindex ?? false
	};
}

/**
 * Metadata for a public payment link. WhatsApp shows a preview card for the
 * link, so it must not reveal the amount, the person or the session name to
 * anyone who sees the chat preview.
 */
export const PAYMENT_SEO: SeoInput = {
	title: 'A bill is waiting for you',
	description: 'Open the link to see your share, where to transfer, and to upload your proof. No app needed.',
	image: 'payment',
	noindex: true
};
