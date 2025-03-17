// props.async에 따라 동기/비동기 방식 자동 전환
// 기본값은 동기(false)로 설정
// 비동기(true)로 설정하면 fetch를 사용하여 페이지 로딩 속도 개선

function componentStaticInit(componentUrl, props = {}, callback = null) {
    const scriptElement = document.currentScript;
    const isAsync = props.async === true; // 기본값 false (동기)

    function loadSync(url) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, false); // 🚨 동기 요청
        xhr.send(null);
        return xhr.responseText;
    }

    function loadAsync(url, callback) {
        fetch(url)
            .then(response => response.text())
            .then(script => callback(script))
            .catch(error => console.error(`Error loading ${url}:`, error));
    }

    function processComponent(scriptCode, isAsyncMode) {
        try {
            const module = new Function("props", scriptCode);
            const html = module(props);

            if (isAsyncMode) {
                // ✅ 비동기 모드: 안전한 방식으로 삽입
                scriptElement.insertAdjacentHTML("beforebegin", html);
            } else {
                // ✅ 동기 모드: 기존 방식 유지
                document.write(html);
            }

            // ✅ scriptElement 삭제 (이중 실행 방지)
            scriptElement.remove();

            if (callback) callback();
        } catch (err) {
            console.error("Component loading failed:", err);
        }
    }

    if (isAsync) {
        loadAsync(componentUrl, (scriptCode) => processComponent(scriptCode, true));
    } else {
        processComponent(loadSync(componentUrl), false);
    }
}

