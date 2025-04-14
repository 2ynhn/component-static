function componentStaticInit(componentUrl, props = {}, callback = null) {
    const scriptElement = document.currentScript;
    function loadScript(url, callback) {
        fetch(url)
            .then(response => response.text())
            .then(moduleCode => {
                const module = new Function("props", moduleCode); // 동적으로 JS 실행
                const html = module(props);
                scriptElement.insertAdjacentHTML("beforebegin", html);
                scriptElement.remove();

            // ✅ scriptElement 삭제 (이중 실행 방지)
            // scriptElement.remove();

            if (callback) callback();
        } catch (err) {
            console.error("Component loading failed:", err);
        }
    }
    loadScript(componentUrl, callback);
}