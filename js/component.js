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

function componentStaticRender(componentUrl, props = {}, targetElement = null) {
	const scriptElement = document.currentScript;
	const isAsync = props.async === true; // 기본값 false (동기)
	let componentInstance = {};
	// ID 우선순위: 1) targetElement의 ID, 2) props의 ID, 3) 새로 생성된 ID
	let componentId;
	if (targetElement && targetElement.id) {
		componentId = targetElement.id;
	} else {
		componentId = props.id || `component-${Math.random().toString(36).substr(2, 9)}`;
	}
	function loadSync(url) {
		const xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		return xhr.responseText;
	}
	function loadAsync(url, callback) {
		return fetch(url)
			.then((response) => response.text())
			.then((script) => callback(script))
			.catch((error) => {
				console.error(`Error loading ${url}:`, error);
				return null;
			});
	}
	function processComponent(scriptCode, isAsyncMode, targetEl = null) {
		try {
			const module = new Function('props', scriptCode);
			const html = module(props);
			// HTML 문자열을 파싱
			const parser = new DOMParser();
			const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
			const container = doc.body.firstChild;
			// div 요소 찾기 (첫 번째 div나 적절한 컨테이너 요소)
			let mainElement = container.querySelector('div');
			// 항상 componentId를 사용하여 ID 일관성 유지
			mainElement.id = componentId;
			// HTML 문자열 갱신
			const updatedHtml = container.innerHTML;
			if (targetEl) {
				// 기존 요소 갱신
				targetEl.parentNode.innerHTML = updatedHtml;
			} else if (isAsyncMode && scriptElement) {
				scriptElement.insertAdjacentHTML('beforebegin', updatedHtml);
				// if (scriptElement) scriptElement.remove();
			} else {
				document.write(updatedHtml);
				// if (scriptElement) scriptElement.remove();
			}
			// 내부 이벤트 및 스크립트 실행
			const scripts = new Function(
				'props',
				`
                ${scriptCode}                
                return null;
            `
			);
			scripts(props);
			// 인스턴스 메서드 설정
			// 요소 참조 업데이트 (대체 후 ID가 유지되므로 다시 가져옴)
			const updatedElement = document.getElementById(componentId);
			componentInstance = {
				id: componentId,
				element: updatedElement,
				update: function (newProps) {
					return componentStaticRender(componentUrl, { ...props, ...newProps }, document.getElementById(componentId));
				},
			};
			return componentInstance;
		} catch (err) {
			console.error('Component loading failed:', err);
			return null;
		}
	}
	// 이미 대상 요소가 있는 경우 (업데이트 시나리오)
	if (targetElement) {
		if (isAsync) {
			return loadAsync(componentUrl, (scriptCode) => processComponent(scriptCode, true, targetElement));
		} else {
			return processComponent(loadSync(componentUrl), false, targetElement);
		}
	} else {
		// 초기 렌더링
		if (isAsync) {
			loadAsync(componentUrl, (scriptCode) => {
				const instance = processComponent(scriptCode, true);
				if (props.callback) props.callback(instance);
			});
			return componentInstance; // 비동기 시에는 즉시 인스턴스 반환 (나중에 업데이트될 것임)
		} else {
			return processComponent(loadSync(componentUrl), false);
		}
	}
}