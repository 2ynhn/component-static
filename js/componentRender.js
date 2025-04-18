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

  
  // ComponentRoot 프로토타입 메서드
  ComponentRoot.prototype.render = function(props) {
    this.props = props || {};
    
    try {
      // 컴포넌트의 render 함수를 사용하여 렌더링
      var htmlContent = this.component.render(this.props);
      this.container.innerHTML = htmlContent;
      
      // 이벤트 핸들러 등의 초기화 함수가 있다면 실행
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
    // 기존 props와 새 props 병합
    for (var key in newProps) {
      if (newProps.hasOwnProperty(key)) {
        this.props[key] = newProps[key];
      }
    }
    
    // 다시 렌더링
    return this.render(this.props);
  };
  
  ComponentRoot.prototype.destroy = function() {
    // 이벤트 핸들러 등의 정리 함수가 있다면 실행
    if (this.component.beforeDestroy) {
      this.component.beforeDestroy(this.container, this.props);
    }
    
    this.container.innerHTML = '';
    this.props = {};
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