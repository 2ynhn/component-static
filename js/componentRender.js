// componentRender.js - 함수 버전

// 컴포넌트 저장소
var ComponentRegistry = {
    components: {},
    
    // 컴포넌트 등록
    register: function(name, renderFn, hooks) {
      this.components[name] = {
        render: renderFn,
        afterRender: hooks && hooks.afterRender,
        beforeDestroy: hooks && hooks.beforeDestroy
      };
      return this.components[name];
    },
    
    // 컴포넌트 가져오기
    get: function(name) {
      return this.components[name];
    }
};
  
// ComponentRoot 생성자 함수
function ComponentRoot(container, componentName) {
    this.container = container;
    this.componentName = componentName;
    this.component = ComponentRegistry.get(componentName);
    this.props = {};

    if (!this.component) {
        console.error(`컴포넌트를 찾을 수 없음: ${componentName}`);
        throw new Error(`컴포넌트를 찾을 수 없음: ${componentName}`);
    }
}

// 간단한 가상 DOM 구현
var VirtualDOM = {
    // HTML 문자열을 DOM 요소로 변환
    createDOM: function(html) {
      var template = document.createElement('template');
      template.innerHTML = html.trim();
      return template.content.cloneNode(true);
    },
    
    // 두 노드 비교 후 변경점만 적용
    updateDOM: function(parentNode, newNode, oldNode) {
        // 노드가 없으면 새로운 노드 추가
        if (!oldNode) {
          parentNode.appendChild(newNode);
          return;
        }
        
        // 새 노드가 없으면 기존 노드 제거
        if (!newNode) {
          parentNode.removeChild(oldNode);
          return;
        }
        
        // 노드 타입이 다른 경우 교체
        if (newNode.nodeType !== oldNode.nodeType || 
            (newNode.nodeType === Node.ELEMENT_NODE && newNode.tagName !== oldNode.tagName)) {
          parentNode.replaceChild(newNode, oldNode);
          return;
        }
        
        // 텍스트 노드인 경우 텍스트만 업데이트
        if (newNode.nodeType === Node.TEXT_NODE) {
          if (newNode.textContent !== oldNode.textContent) {
            oldNode.textContent = newNode.textContent;
          }
          return;
        }
        
        // 속성 업데이트
        this.updateAttributes(oldNode, newNode);
        
        // 자식 노드들 업데이트 - 여기가 문제의 핵심
        var oldChildren = Array.from(oldNode.childNodes);
        var newChildren = Array.from(newNode.childNodes);
        
        // 불필요한 노드 제거
        for (var i = oldChildren.length - 1; i >= newChildren.length; i--) {
          oldNode.removeChild(oldChildren[i]);
        }
        
        // 기존 노드 업데이트 및 새 노드 추가
        for (var i = 0; i < newChildren.length; i++) {
          if (i < oldChildren.length) {
            // 기존 노드 업데이트
            this.updateDOM(oldNode, newChildren[i], oldChildren[i]);
          } else {
            // 새 노드 추가
            oldNode.appendChild(newChildren[i]);
          }
        }
      },
    
    // 요소의 속성 업데이트
    updateAttributes: function(oldNode, newNode) {
      // 새 속성 추가/업데이트
      var newAttrs = newNode.attributes || [];
      for (var i = 0; i < newAttrs.length; i++) {
        var attr = newAttrs[i];
        if (oldNode.getAttribute(attr.name) !== attr.value) {
          oldNode.setAttribute(attr.name, attr.value);
        }
      }
      
      // 삭제된 속성 제거
      var oldAttrs = oldNode.attributes || [];
      for (var i = 0; i < oldAttrs.length; i++) {
        var attr = oldAttrs[i];
        if (!newNode.hasAttribute(attr.name)) {
          oldNode.removeAttribute(attr.name);
        }
      }
    }
  };


// ComponentRoot에 가상 DOM 상태 추가
ComponentRoot.prototype._lastVirtualDOM = null;
  
// ComponentRoot 프로토타입 메서드
ComponentRoot.prototype.render = function(props) {
    this.props = props || {};
    
    try {
      // 컴포넌트의 render 함수로 HTML 생성
      var htmlContent = this.component.render(this.props);
      
      // 새 가상 DOM 생성
      var newVirtualDOM = VirtualDOM.createDOM(htmlContent);
      
      // 첫 렌더링이거나 강제 리렌더링인 경우
      if (!this._lastVirtualDOM) {
        // 컨테이너 비우고 새 콘텐츠 추가
        this.container.innerHTML = '';
        this.container.appendChild(newVirtualDOM);
      } else {
        // 변경된 부분만 업데이트
        VirtualDOM.updateDOM(this.container, newVirtualDOM.firstChild, this.container.firstChild);
      }
      
      // 현재 가상 DOM 저장
      this._lastVirtualDOM = newVirtualDOM;
      
      // 이벤트 핸들러 등의 초기화 함수 실행
      if (this.component.afterRender) {
        this.component.afterRender(this.container, this.props);
      }
      
      return this;
    } catch(error) {
      console.error('렌더링 실패:', error);
      throw new Error(`렌더링 실패: ${error.message}`);
    }
};
  
  ComponentRoot.prototype.update = function(newProps) {
    // 완전히 새로운 props 객체 생성
    var updatedProps = Object.assign({}, this.props, newProps);
    this.props = updatedProps;
    
    // 다시 렌더링
    return this.render(this.props);
  };
  
// destroy 메서드도 수정하여 가상 DOM 참조 제거
ComponentRoot.prototype.destroy = function() {
    // 이벤트 핸들러 등의 정리 함수가 있다면 실행
    if (this.component.beforeDestroy) {
      this.component.beforeDestroy(this.container, this.props);
    }
    
    this.container.innerHTML = '';
    this.props = {};
    this._lastVirtualDOM = null;
};
  
  // 메인 함수 - 컴포넌트 루트 생성
  function createRoot(container, componentName) {
    if (!container) {
      throw new Error('컨테이너 요소가 제공되지 않았습니다.');
    }
    
    return new ComponentRoot(container, componentName);
  }
  
  // 여러 컨테이너에 같은 컴포넌트 렌더링
  function renderMultiple(selector, componentName, propsArray) {
    var containers = document.querySelectorAll(selector);
    var roots = [];
    propsArray = propsArray || [];
    
    for (var i = 0; i < containers.length; i++) {
      var props = propsArray[i] || {};
      var root = createRoot(containers[i], componentName);
      root.render(props);
      roots.push(root);
    }
    
    return roots;
  }
  
  // 전역 객체로 내보내기
  window.ComponentRender = {
    registry: ComponentRegistry,
    createRoot: createRoot,
    renderMultiple: renderMultiple
  };