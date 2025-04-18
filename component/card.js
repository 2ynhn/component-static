// card.js - 함수 버전

// Card 컴포넌트 정의
function CardComponent(props) {
    var title = props.title || '';
    var content = props.content || '';
    var footer = props.footer || '';
    var imageUrl = props.imageUrl || '';
    var buttonText = props.buttonText || '자세히 보기';
    
    return `
      <div class="card-header">
        ${title ? `<h2 class="card-title">${title}</h2>` : ''}
      </div>
      <div class="card-body">
        ${imageUrl ? `<img src="${imageUrl}" alt="${title || '카드 이미지'}" class="card-image">` : ''}
        ${content ? `<p class="card-content">${content}</p>` : ''}
        ${buttonText ? `<button class="card-button">${buttonText}</button>` : ''}
      </div>
      ${footer ? `<div class="card-footer">${footer}</div>` : ''}
    `;
  }
  
  // 컴포넌트가 렌더링된 후 실행될 함수 (이벤트 핸들러 등록)
  function CardAfterRender(container, props) {
    var button = container.querySelector('.card-button');
    if (button && props.onClick) {
      // 기존에 등록된 이벤트 제거를 위해 명명된 함수 사용
      button._clickHandler = function() {
        props.onClick(props);
      };
      button.addEventListener('click', button._clickHandler);
    }
  }
  
  // 컴포넌트가 제거되기 전에 실행될 함수 (이벤트 핸들러 제거 등)
  function CardBeforeDestroy(container, props) {
    var button = container.querySelector('.card-button');
    if (button && button._clickHandler) {
      button.removeEventListener('click', button._clickHandler);
      delete button._clickHandler;
    }
  }
  
  // 컴포넌트 등록
  ComponentRender.registry.register('Card', CardComponent, {
    afterRender: CardAfterRender,
    beforeDestroy: CardBeforeDestroy
  });