// 1. localStorage 확인	localStorage.getItem(componentUrl)을 확인
// 2. 캐시가 있으면 즉시 사용	document.write()로 HTML 렌더링
// 3. 캐시가 없으면 XHR 동기 로드	컴포넌트 파일을 가져와 실행
// 4. 로컬 스토리지가 활성화되면 저장	localStorage.setItem(componentUrl, fetchedCode)
// 5. 이후 방문 시 캐싱된 데이터 사용	동일한 컴포넌트 요청 시 XHR 없이 바로 실행

function componentStaticInit(componentUrl, props = {}, callback = null) {
    const scriptElement = document.currentScript;

    function loadSync(url) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false); // 🚨 동기 요청 (렌더링 블로킹 발생 가능)
        xhr.send(null);
        return xhr.responseText;
    }

    function loadComponent(url) {
        try {
            if (localStorage) {
                const cachedScript = localStorage.getItem(url);
                if (cachedScript) {
                    return cachedScript; // 캐시된 데이터 사용
                }
            }
        } catch (e) {
            console.warn("LocalStorage unavailable. Falling back to sync XHR.");
        }

        // 🚀 캐시가 없거나 로컬 스토리지가 없으면 즉시 XHR 요청 수행
        const fetchedCode = loadSync(url);

        // ✅ 로컬 스토리지가 사용 가능하면 새로 로드된 데이터를 저장
        try {
            if (localStorage) {
                localStorage.setItem(url, fetchedCode);
                console.log(`[Cache Stored] ${url} has been saved to localStorage.`);
            }
        } catch (e) {
            console.warn("Failed to save to LocalStorage.");
        }

        return fetchedCode;
    }

    try {
        const moduleCode = loadComponent(componentUrl);
        const module = new Function("props", moduleCode);
        const html = module(props);

        // 🔹 HTML 문서가 로드되는 중에 즉시 렌더링
        document.write(html);

        // ✅ scriptElement 삭제 (이중 실행 방지)
        scriptElement.remove();

        if (callback) callback();
    } catch (err) {
        console.error("Component loading failed:", err);
    }
}



