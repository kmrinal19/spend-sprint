export function initKeyboardHandler() {
	if (typeof window === 'undefined') return;

	const viewport = window.visualViewport;
	if (!viewport) return;

	function handleResize() {
		if (!viewport) return;
		const keyboardHeight = window.innerHeight - viewport.height;
		document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);

		if (keyboardHeight > 0) {
			document.documentElement.classList.add('keyboard-open');
		} else {
			document.documentElement.classList.remove('keyboard-open');
		}
	}

	viewport.addEventListener('resize', handleResize);
	return () => viewport.removeEventListener('resize', handleResize);
}
