function componentStaticInit(componentUrl, props = {}, callback = null) {
	const scriptElement = document.currentScript;
	const isAsync = props.async === true; // 기본값 false (동기)

	function loadSync(url) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		return xhr.responseText;
	}

	function loadAsync(url, callback) {
		fetch(url)
			.then((response) => response.text())
			.then((script) => callback(script))
			.catch((error) => console.error(`Error loading ${url}:`, error));
	}

	function processComponent(scriptCode, isAsyncMode) {
		try {
			const module = new Function('props', scriptCode);
			const html = module(props);

			if (isAsyncMode) {
				scriptElement.insertAdjacentHTML('beforebegin', html);
			} else {
				document.write(html);
			}
			scriptElement.remove();
			if (callback) callback();
		} catch (err) {
			console.error('Component loading failed:', err);
		}
	}

	if (isAsync) {
		loadAsync(componentUrl, (scriptCode) => processComponent(scriptCode, true));
	} else {
		processComponent(loadSync(componentUrl), false);
	}
}