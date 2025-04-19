function componentStaticRender(componentUrl, props = {}, targetElement = null) {
    const scriptElement = document.currentScript;
    let componentInstance = {};
    
    // ID 우선순위: 1) targetElement의 ID, 2) props의 ID, 3) 새로 생성된 ID
    let componentId;
    if (targetElement && targetElement.id) {
        componentId = targetElement.id;
    } else {
        componentId = props.id || `component-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 가상 DOM 노드 비교 및 업데이트 함수들
    const virtualDOM = {
        // 노드 타입 비교 (요소, 텍스트 등)
        isSameNodeType: function(node1, node2) {
            if (node1.nodeType !== node2.nodeType) return false;
            if (node1.nodeType === Node.TEXT_NODE) return true;
            return node1.nodeName === node2.nodeName;
        },
        
        // 노드 속성 비교
        diffAttributes: function(oldNode, newNode) {
            const oldAttrs = oldNode.attributes || [];
            const newAttrs = newNode.attributes || [];
            const diffPatch = [];
            
            // 변경된 또는 새로운 속성 확인
            for (let i = 0; i < newAttrs.length; i++) {
                const attr = newAttrs[i];
                const oldAttrValue = oldNode.getAttribute(attr.name);
                if (oldAttrValue !== attr.value) {
                    diffPatch.push({ 
                        type: 'ATTR',
                        name: attr.name,
                        value: attr.value
                    });
                }
            }
            
            // 제거된 속성 확인
            for (let i = 0; i < oldAttrs.length; i++) {
                const attr = oldAttrs[i];
                if (!newNode.hasAttribute(attr.name)) {
                    diffPatch.push({ 
                        type: 'ATTR',
                        name: attr.name,
                        value: null
                    });
                }
            }
            
            return diffPatch;
        },
        
        // 텍스트 노드 비교
        diffTextNodes: function(oldNode, newNode) {
            if (oldNode.textContent !== newNode.textContent) {
                return [{ 
                    type: 'TEXT',
                    value: newNode.textContent
                }];
            }
            return [];
        },
        
        // 자식 노드 비교
        diffChildren: function(oldNode, newNode) {
            const diffPatch = [];
            const maxLength = Math.max(oldNode.childNodes.length, newNode.childNodes.length);
            
            for (let i = 0; i < maxLength; i++) {
                const childPatches = this.diffNode(oldNode.childNodes[i], newNode.childNodes[i]);
                if (childPatches.length > 0) {
                    diffPatch.push({
                        type: 'CHILD',
                        index: i,
                        patches: childPatches
                    });
                }
            }
            
            // 추가된 노드 처리
            for (let i = oldNode.childNodes.length; i < newNode.childNodes.length; i++) {
                diffPatch.push({
                    type: 'APPEND',
                    newNode: newNode.childNodes[i]
                });
            }
            
            // 제거된 노드 처리
            for (let i = newNode.childNodes.length; i < oldNode.childNodes.length; i++) {
                diffPatch.push({
                    type: 'REMOVE',
                    index: i
                });
            }
            
            return diffPatch;
        },
        
        // 노드 전체 비교 (재귀적)
        diffNode: function(oldNode, newNode) {
            if (!oldNode) {
                return [{ type: 'CREATE', newNode }];
            }
            
            if (!newNode) {
                return [{ type: 'REMOVE' }];
            }
            
            if (!this.isSameNodeType(oldNode, newNode)) {
                return [{ type: 'REPLACE', newNode }];
            }
            
            if (oldNode.nodeType === Node.TEXT_NODE) {
                return this.diffTextNodes(oldNode, newNode);
            }
            
            // 요소 노드 비교 (속성과 자식 노드)
            const diffPatch = [];
            const attrDiff = this.diffAttributes(oldNode, newNode);
            if (attrDiff.length > 0) {
                diffPatch.push(...attrDiff);
            }
            
            const childrenDiff = this.diffChildren(oldNode, newNode);
            if (childrenDiff.length > 0) {
                diffPatch.push(...childrenDiff);
            }
            
            return diffPatch;
        },
        
        // DOM 패치 적용
        applyPatch: function(node, patches) {
            for (const patch of patches) {
                switch (patch.type) {
                    case 'CREATE':
                        return patch.newNode.cloneNode(true);
                    
                    case 'REMOVE':
                        if (node.parentNode) {
                            node.parentNode.removeChild(node);
                        }
                        return null;
                    
                    case 'REPLACE':
                        if (node.parentNode) {
                            node.parentNode.replaceChild(patch.newNode.cloneNode(true), node);
                            return patch.newNode.cloneNode(true);
                        }
                        return patch.newNode.cloneNode(true);
                    
                    case 'TEXT':
                        node.textContent = patch.value;
                        break;
                    
                    case 'ATTR':
                        if (patch.value === null) {
                            node.removeAttribute(patch.name);
                        } else {
                            node.setAttribute(patch.name, patch.value);
                        }
                        break;
                    
                    case 'APPEND':
                        node.appendChild(patch.newNode.cloneNode(true));
                        break;
                    
                    case 'CHILD':
                        if (node.childNodes[patch.index]) {
                            this.applyPatch(node.childNodes[patch.index], patch.patches);
                        }
                        break;
                }
            }
            return node;
        }
    };
    
    function loadSync(url) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        return xhr.responseText;
    }
    
    function createVirtualElement(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
        return doc.body.firstChild;
    }
    
    function processComponent(scriptCode, targetEl = null) {
        try {
            const module = new Function('props', scriptCode);
            const html = module(props);
            
            // 가상 DOM 생성
            const virtualElement = createVirtualElement(html);
            
            // div 요소 찾기 (첫 번째 div나 적절한 컨테이너 요소)
            let mainElement = virtualElement.querySelector('div');
            if (!mainElement) {
                mainElement = virtualElement.firstElementChild;
            }
            
            // 항상 componentId를 사용하여 ID 일관성 유지
            if (mainElement) {
                mainElement.id = componentId;
            }
            
            // 현재 DOM과 가상 DOM 비교/패치
            if (targetEl) {
                // 기존 요소가 있는 경우 가상 DOM 차이 계산 및 적용
                const patches = virtualDOM.diffNode(targetEl, virtualElement);
                if (patches.length > 0) {
                    virtualDOM.applyPatch(targetEl, patches);
                }
            } else if (scriptElement) {
                // 초기 렌더링 (스크립트 태그 위치에 삽입)
                scriptElement.insertAdjacentHTML('beforebegin', virtualElement.innerHTML);
            } else {
                // document.write 사용 (초기 렌더링)
                document.write(virtualElement.innerHTML);
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
            
            // 업데이트된 요소 참조 가져오기
            const updatedElement = document.getElementById(componentId);
            
            // 인스턴스 메서드 설정
            componentInstance = {
                id: componentId,
                element: updatedElement,
                // 누적된 props 저장
                _currentProps: {...props},
                update: function(newProps) {
                    // 업데이트 전 현재 요소 확인
                    const currentElement = document.getElementById(this.id);
                    if (!currentElement) {
                        console.warn(`Element with ID ${this.id} not found. Update failed.`);
                        return null;
                    }
                    
                    // 누적된 props에 새 props 병합
                    this._currentProps = {...this._currentProps, ...newProps, id: this.id};
                    
                    // 누적된 props로 컴포넌트 업데이트
                    const result = componentStaticRender(componentUrl, this._currentProps, currentElement);
                    
                    // 업데이트된 인스턴스에서 누적 props 가져오기
                    if (result) {
                        this._currentProps = result._currentProps;
                    }
                    
                    return result;
                },
                // 가상 DOM 상태 저장
                _virtualDOM: virtualElement
            };
            
            // 이벤트 콜백 실행
            if (props.callback) {
                props.callback(componentInstance);
            }
            
            return componentInstance;
        } catch (err) {
            console.error('Component loading failed:', err);
            return null;
        }
    }
    
    // 컴포넌트 로드 및 처리
    const scriptCode = loadSync(componentUrl);
    return processComponent(scriptCode, targetElement);
}