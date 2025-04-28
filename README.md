# ComponentRender
ComponentRender는 간단한 가상 DOM(Virtual DOM)을 구현한 경량 JavaScript 컴포넌트 렌더링 라이브러리입니다. 이 라이브러리는 최소한의 종속성으로 재사용 가능한 UI 요소를 구축하기 위한 컴포넌트 기반 아키텍처를 제공합니다.

## 주요 기능
- 간단한 컴포넌트 기반 아키텍처
- 효율적인 DOM 업데이트를 위한 가상 DOM 구현
- 컴포넌트 라이프사이클 훅(afterRender, beforeDestroy)
- 컴포넌트 속성(props) 및 이벤트 처리 지원
- 쉬운 컴포넌트 등록 및 재사용성
- 여러 컨테이너에 동일한 컴포넌트 렌더링 지원

## 설치
HTML에 메인 스크립트를 포함하세요:
```
<script src="./componentRender.js"></script>
```

## 기본 사용법
### 1. 컴포넌트 정의
렌더 함수와 선택적 라이프사이클 훅을 사용하여 컴포넌트를 생성합니다:

기본 컴포넌트 정의
```
function MyComponent(props) {
  var title = props.title || '기본 제목';
  var content = props.content || '기본 내용';  
  return `
    <div class="my-component">
      <h2>${title}</h2>
      <p>${content}</p>
    </div>
  `;
}

// 컴포넌트 등록
ComponentRender.registry.register('MyComponent', MyComponent);
```

### 2. 컴포넌트 렌더링
컨테이너 요소 가져오기 및 렌더링, 업데이트
```
const container = document.querySelector('#my-container');

// 컴포넌트 루트 생성
const myRoot = ComponentRender.createRoot(container, 'MyComponent');

// 초기 속성으로 렌더링
myRoot.render({
  title: '안녕하세요',
  content: '이것은 제 첫 번째 컴포넌트입니다'
});

// 나중에 컴포넌트 업데이트
myRoot.update({
  title: '업데이트된 제목',
  content: '이 내용이 업데이트되었습니다'
});
```

### 3. 여러 컴포넌트 렌더링
여러 컨테이너에 다른 속성을 가진 동일한 컴포넌트 렌더링
```
const roots = ComponentRender.renderMultiple('.component-container', 'MyComponent', [
  { title: '첫 번째 컴포넌트', content: '첫 번째 컴포넌트의 내용' },
  { title: '두 번째 컴포넌트', content: '두 번째 컴포넌트의 내용' },
  { title: '세 번째 컴포넌트', content: '세 번째 컴포넌트의 내용' }
]);
```

card.js 컴포넌트 사용
```
const cardRoot = ComponentRender.createRoot(cardContainer, 'Card');
cardRoot.render({
  title: '카드 제목',
  content: '카드 내용이 여기에 표시됩니다',
  imageUrl: 'path/to/image.jpg',
  buttonText: '자세히 보기',
  onClick: (props) => {
    console.log('카드 버튼이 클릭되었습니다', props);
  }
});
```

## 작동 방식
- 컴포넌트 레지스트리: 렌더 함수와 라이프사이클 훅이 포함된 등록된 컴포넌트의 컬렉션을 유지합니다.
- 가상 DOM: 이전 가상 DOM 트리와 새 가상 DOM 트리를 비교하여 실제 DOM을 효율적으로 업데이트합니다.
- 컴포넌트 루트: 컴포넌트 인스턴스의 라이프사이클을 관리하고, 렌더링 및 업데이트를 처리합니다.
- 라이프사이클 훅: 렌더링 후 또는 컴포넌트 소멸 전에 코드를 실행하기 위한 훅을 제공합니다.
