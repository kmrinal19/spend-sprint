export interface SwipeState {
	startX: number;
	startY: number;
	currentX: number;
	deltaX: number;
	swiping: boolean;
}

export function createSwipeHandler(opts: {
	threshold?: number;
	velocityThreshold?: number;
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
}) {
	const threshold = opts.threshold ?? 80;
	const velocityThreshold = opts.velocityThreshold ?? 0.5;
	let startX = 0;
	let startY = 0;
	let startTime = 0;
	let deltaX = 0;
	let locked = false;

	return {
		get deltaX() {
			return deltaX;
		},
		handleTouchStart(e: TouchEvent) {
			const touch = e.touches[0];
			if (!touch) return;
			startX = touch.clientX;
			startY = touch.clientY;
			startTime = Date.now();
			deltaX = 0;
			locked = false;
		},
		handleTouchMove(e: TouchEvent) {
			const touch = e.touches[0];
			if (!touch) return;

			const dx = touch.clientX - startX;
			const dy = touch.clientY - startY;

			// Lock to horizontal if more horizontal than vertical
			if (!locked) {
				if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
					locked = true;
					if (Math.abs(dy) > Math.abs(dx)) return; // Vertical scroll
				}
			}

			deltaX = dx;
		},
		handleTouchEnd() {
			const elapsed = Date.now() - startTime;
			const velocity = Math.abs(deltaX) / elapsed;

			if (Math.abs(deltaX) > threshold || velocity > velocityThreshold) {
				if (deltaX < 0) opts.onSwipeLeft?.();
				else opts.onSwipeRight?.();
			}

			deltaX = 0;
		}
	};
}
