function componentStaticInit(scriptElement, componentUrl, props = {}, callback = null) {
    function loadScript(url, callback) {
        fetch(url)
            .then(response => response.text())
            .then(moduleCode => {
                const module = new Function("props", moduleCode); // 동적으로 JS 실행
                const html = module(props);
                scriptElement.insertAdjacentHTML("beforebegin", html);
                scriptElement.remove();

                // 렌더링 완료 후 콜백 실행
                if (callback) {
                    callback();
                }
            });
    }
    loadScript(componentUrl, callback);
}