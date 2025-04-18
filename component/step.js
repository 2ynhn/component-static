// step.js - ComponentRender 호환 버전

// Step 컴포넌트 렌더링 함수
function StepComponent(props) {
    var css = props.css || '';
    var current = props.current || 0;
    var total = props.total || 0;
    
    return `
      ${css ? `<link rel="stylesheet" href="${css}">` : ''}
      <div class="step-comp">
        <p>Your Step is...</p>
        <div class="bar">
          <span class="current">${current}</span>
          <span class="total">${total}</span>
        </div>
      </div>
    `;
  }
  
  // 컴포넌트가 렌더링된 후 실행될 함수 (이벤트 핸들러 등록)
  function StepAfterRender(container, props) {
    // 이벤트 핸들러 등록
    var currentElement = container.querySelector('.current');
    
    if (currentElement) {
      // 이벤트 핸들러 함수 저장 (나중에 제거할 때 사용)
      currentElement._clickHandler = function(e) {
        console.log('Current step:', props.current);
      };
      
      // 이벤트 리스너 등록
      currentElement.addEventListener('click', currentElement._clickHandler);
    }
  }
  
  // 컴포넌트가 제거되기 전에 실행될 함수 (이벤트 핸들러 제거)
  function StepBeforeDestroy(container, props) {
    var currentElement = container.querySelector('.current');
    
    if (currentElement && currentElement._clickHandler) {
      // 등록된 이벤트 리스너 제거
      currentElement.removeEventListener('click', currentElement._clickHandler);
      delete currentElement._clickHandler;
    }
  }
  
  // 컴포넌트 등록
  ComponentRender.registry.register('Step', StepComponent, {
    afterRender: StepAfterRender,
    beforeDestroy: StepBeforeDestroy
  });