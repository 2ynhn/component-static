// money-motion.js
(() => {
    // ComponentRender 클래스 정의
    class ComponentRender {
      constructor(element, componentName) {
        this.element = element;
        this.componentName = componentName;
        this.state = {};
      }
  
      static createRoot(element, componentName) {
        return new ComponentRender(element, componentName);
      }
  
      render(state) {
        this.state = { ...state };
        this._renderComponent();
        return this;
      }
  
      update(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        if (this.componentName === 'MoneyMotion') {
          this._animateMoneyChange(oldState, this.state);
        }
        
        return this;
      }
  
      _renderComponent() {
        if (this.componentName === 'MoneyMotion') {
          this._renderMoneyMotion();
        }
      }
  
      _renderMoneyMotion() {
        const { digits, amount } = this.state;
        
        // 초기 HTML 구조 생성
        let digitsHTML = '';
        for (let i = 0; i < digits; i++) {
          digitsHTML += `
            <div class="item">
              <div class="digits-wrapper">
                ${this._generateDigitStrip()}
              </div>
            </div>
          `;
        }
  
        this.element.innerHTML = `
          <div class="money-motionWrap">
            <div class="amount-items">
              ${digitsHTML}
            </div>
            <div class="amount-unit">
              <div class="unit">원</div>
            </div>
          </div>
        `;
  
        // 초기 금액으로 바로 설정
        this._setInitialPosition(amount);
  
        // 스타일 추가
        this._addStyles();
      }
  
      _generateDigitStrip() {
        // 0부터 9까지 숫자 스트립 생성
        let strip = '';
        for (let i = 0; i <= 9; i++) {
          strip += `<span class="value">${i}</span>`;
        }
        return strip;
      }
  
      _setInitialPosition(amount) {
        const amountStr = String(amount).padStart(this.state.digits, '0');
        const items = this.element.querySelectorAll('.item');
        
        for (let i = 0; i < items.length; i++) {
          const digit = parseInt(amountStr[amountStr.length - items.length + i], 10);
          const wrapper = items[i].querySelector('.digits-wrapper');
          // translateY 값을 픽셀 단위로 설정 (각 숫자의 높이는 50px)
          gsap.set(wrapper, { y: -digit * 50 });
        }
      }
  
      _animateMoneyChange(oldState, newState) {
        const oldAmount = String(oldState.amount).padStart(this.state.digits, '0');
        const newAmount = String(newState.amount).padStart(this.state.digits, '0');
        const items = this.element.querySelectorAll('.item');
        
        // 개별 자릿수마다 애니메이션 적용
        for (let i = 0; i < items.length; i++) {
          const oldDigit = parseInt(oldAmount[oldAmount.length - items.length + i], 10);
          const newDigit = parseInt(newAmount[newAmount.length - items.length + i], 10);
          
          if (oldDigit !== newDigit) {
            const wrapper = items[i].querySelector('.digits-wrapper');
            
            gsap.to(wrapper, {
              y: -newDigit * 50, // 픽셀 단위로 변경
              duration: 0.5,
              ease: "power2.out",
              delay: i * 0.1 // 연속적인 효과를 위해 약간의 지연 추가
            });
          }
        }
      }
  
      _addStyles() {
        // 스타일이 중복 추가되지 않도록 체크
        if (!document.getElementById('money-motion-styles')) {
          const styleSheet = document.createElement('style');
          styleSheet.id = 'money-motion-styles';
          styleSheet.textContent = `
            .money-motionWrap {
              display: flex;
              align-items: center;
              font-family: sans-serif;
              gap: 5px;
            }
            
            .amount-items {
              display: flex;
              gap: 2px;
            }
            
            .item {
              width: 30px;
              height: 50px;
              background-color: #f5f5f5;
              border-radius: 5px;
              overflow: hidden;
              position: relative;
            }
            
            .digits-wrapper {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            
            .value {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 50px;
              width: 100%;
              font-size: 24px;
              font-weight: bold;
            }
            
            .amount-unit {
              font-size: 20px;
              font-weight: bold;
            }
          `;
          document.head.appendChild(styleSheet);
        }
      }
    }
  
    // GSAP가 로드되지 않았다면 로드
    if (typeof gsap === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.4/gsap.min.js';
      document.head.appendChild(script);
      
      script.onload = () => {
        console.log('GSAP 로드 완료');
      };
    }
  
    // 전역 객체에 ComponentRender 등록
    window.ComponentRender = ComponentRender;
  })();