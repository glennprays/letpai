// Realistic values for previews and test sends, keyed by template variable.
export const SAMPLE_VALUES: Record<string, string> = {
	ParticipantName: 'Alya',
	SessionName: 'Friday dinner at Sate Khas Senayan',
	MakerName: 'Raka',
	Total: '1.250.000',
	Share: '125.000',
	URL: 'https://letpai.xyz/payment/7f3k2',
	Code: '482913',
	ExpiresMinutes: '5'
};

export function samplesFor(variables: string[]): Record<string, string> {
	return Object.fromEntries(variables.map((v) => [v, SAMPLE_VALUES[v] ?? v]));
}

/** WhatsApp's *bold* markup as text/bold runs, so previews never need {@html}. */
export function whatsappRuns(text: string): Array<{ text: string; bold: boolean }> {
	const runs: Array<{ text: string; bold: boolean }> = [];
	let last = 0;
	for (const m of text.matchAll(/\*([^*\n]+)\*/g)) {
		if (m.index > last) runs.push({ text: text.slice(last, m.index), bold: false });
		runs.push({ text: m[1], bold: true });
		last = m.index + m[0].length;
	}
	if (last < text.length) runs.push({ text: text.slice(last), bold: false });
	return runs;
}
