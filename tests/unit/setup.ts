import '@testing-library/jest-dom/vitest';

// jsdom has no Web Animations API; Svelte transitions call element.animate().
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
	Element.prototype.animate = function () {
		const anim = {
			finished: Promise.resolve(),
			cancel() {},
			finish() {},
			play() {},
			pause() {},
			currentTime: 0,
			onfinish: null as null | (() => void)
		};
		queueMicrotask(() => anim.onfinish?.());
		return anim as unknown as Animation;
	};
}
