/**
 * 커스텀 숫자 키패드 렌더링 함수
 * @param {Object} props - 키패드 구성 옵션
 * @returns {Object} - 키패드 API 객체
 */
const renderKeypad = (props) => {
    // 기본 설정값 정의
    const defaults = {
        selector: '.number-input',
        commaFormat: true
    };
    
    // props와 기본값 병합
    const options = { ...defaults, ...props };
    
    // HTML 템플릿 생성
    const keypadHtml = `
        <div class="custom-keypad" id="customKeypad">
            <div class="keypad-row amount-buttons">
                <div class="key amount-btn">+1,000</div>
                <div class="key amount-btn">+5,000</div>
                <div class="key amount-btn">+10,000</div>
            </div>
            <div class="keypad-row">
                <div class="key">1</div>
                <div class="key">2</div>
                <div class="key">3</div>
            </div>
            <div class="keypad-row">
                <div class="key">4</div>
                <div class="key">5</div>
                <div class="key">6</div>
            </div>
            <div class="keypad-row">
                <div class="key">7</div>
                <div class="key">8</div>
                <div class="key">9</div>
            </div>
            <div class="keypad-row">
                <div class="key">.</div>
                <div class="key">0</div>
                <div class="key delete">⌫</div>
            </div>
            <div class="keypad-row">
                <div class="key done">완료</div>
            </div>
        </div>
    `;
    
    // 키패드 CSS 스타일
    const keypadStyle = `
        <style>
            .custom-keypad {
                display: none;
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                background-color: #f0f0f0;
                padding: 10px;
                box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .keypad-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .key {
                width: 30%;
                padding: 15px 0;
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 20px;
                text-align: center;
                user-select: none;
                cursor: pointer;
            }
            .key:active {
                background-color: #e6e6e6;
            }
            .key.delete {
                background-color: #ff6b6b;
                color: white;
            }
            .key.done {
                background-color: #4cd964;
                color: white;
            }
            .amount-buttons {
                margin-bottom: 15px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
            }
            .amount-btn {
                background-color: #eaf4ff;
                border-color: #a9d0f5;
                color: #0066cc;
            }
        </style>
    `;
    
    // DOM에 키패드 및 스타일 추가
    document.body.insertAdjacentHTML('beforeend', keypadStyle + keypadHtml);
    
    // 필요한 엘리먼트 참조
    let activeInput = null;
    const customKeypad = document.getElementById('customKeypad');
    const keys = document.querySelectorAll('.key');
    const amountBtns = document.querySelectorAll('.amount-btn');
    
    /**
     * 1000단위 콤마 포맷팅 함수
     * @param {HTMLInputElement} input - 포맷팅할 입력 필드
     */
    function formatNumberWithComma(input) {
        // 현재 커서 위치 저장
        const cursorPos = input.selectionStart;
        
        // 모든 콤마 제거 및 숫자만 추출
        const value = input.value.replace(/,/g, '');
        
        // 소수점 부분과 정수 부분 분리
        const parts = value.split('.');
        
        // 정수 부분에 콤마 추가
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        // 다시 조합
        const formattedValue = parts.join('.');
        
        // 입력 필드에 포맷팅된 값 설정
        input.value = formattedValue;
    }
    
    /**
     * 숫자 입력 필드 초기화
     */
    function initNumberInputs() {
        const numberInputs = document.querySelectorAll(options.selector);
        
        numberInputs.forEach(input => {
            // 기본적으로 inputmode='none' 설정
            input.setAttribute('inputmode', 'none');
            
            // 포커스 이벤트
            input.addEventListener('focus', (e) => {
                e.preventDefault();
                activeInput = input;
                customKeypad.style.display = 'block';
                // 모바일 키보드 방지
                input.blur();
                input.readOnly = true;
            });
            
            // 직접 클릭을 통한 포커스 감지
            input.addEventListener('click', () => {
                activeInput = input;
                customKeypad.style.display = 'block';
                input.readOnly = true;
            });
        });
    }
    
    /**
     * 키패드 키 이벤트 초기화
     */
    function initKeypadKeys() {
        keys.forEach(key => {
            key.addEventListener('click', () => {
                if (!activeInput) return;
                
                const keyText = key.textContent;
                
                if (key.classList.contains('delete')) {
                    // 삭제 키 처리
                    activeInput.value = activeInput.value.slice(0, -1);
                    
                    // 콤마 포맷팅 적용
                    if (options.commaFormat || activeInput.dataset.format === 'comma') {
                        formatNumberWithComma(activeInput);
                    }
                } else if (key.classList.contains('done')) {
                    // 완료 키 처리
                    customKeypad.style.display = 'none';
                    activeInput.readOnly = false;
                    activeInput.blur();
                    activeInput = null;
                } else if (!key.classList.contains('amount-btn')) {
                    // 숫자 및 소수점 처리
                    // 소수점 중복 입력 방지
                    if (keyText === '.' && activeInput.value.includes('.')) return;
                    activeInput.value += keyText;
                    
                    // 콤마 포맷팅 적용
                    if (options.commaFormat || activeInput.dataset.format === 'comma') {
                        formatNumberWithComma(activeInput);
                    }
                }
            });
        });
    }
    
    /**
     * 금액 버튼 이벤트 초기화
     */
    function initAmountButtons() {
        amountBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!activeInput) return;
                
                // 버튼 텍스트에서 금액 추출 (예: "+1,000" -> 1000)
                const amountText = btn.textContent;
                const amount = parseInt(amountText.replace(/[^0-9]/g, ''));
                
                // 현재 입력값 가져오기 (콤마 제거)
                let currentValue = activeInput.value.replace(/,/g, '');
                
                // 현재 값이 비어있거나 유효하지 않은 경우 0으로 처리
                if (!currentValue || isNaN(parseFloat(currentValue))) {
                    currentValue = '0';
                }
                
                // 금액 추가
                const newValue = parseFloat(currentValue) + amount;
                
                // 새 값 설정
                activeInput.value = newValue.toString();
                
                // 콤마 포맷팅 적용
                if (options.commaFormat || activeInput.dataset.format === 'comma') {
                    formatNumberWithComma(activeInput);
                }
            });
        });
    }
    
    /**
     * 다른 영역 클릭 시 키패드 닫기
     */
    function initOutsideClickHandler() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-keypad') && 
                !e.target.closest(options.selector)) {
                customKeypad.style.display = 'none';
                if (activeInput) {
                    activeInput.readOnly = false;
                    activeInput = null;
                }
            }
        });
    }
    
    /**
     * 모든 초기화 함수 실행
     */
    function init() {
        initNumberInputs();
        initKeypadKeys();
        initAmountButtons();
        initOutsideClickHandler();
    }
    
    // 초기화 실행
    init();
    
    // API 노출 - 외부에서 사용할 수 있는 메서드 제공
    return {
        /**
         * 키패드 열기
         * @param {HTMLInputElement} inputElement - 키패드와 연결할 입력 필드
         */
        open: function(inputElement) {
            if (inputElement) {
                activeInput = inputElement;
                inputElement.readOnly = true;
                customKeypad.style.display = 'block';
            }
        },
        
        /**
         * 키패드 닫기
         */
        close: function() {
            customKeypad.style.display = 'none';
            if (activeInput) {
                activeInput.readOnly = false;
                activeInput = null;
            }
        },
        
        /**
         * 입력값 포맷팅
         * @param {HTMLInputElement} inputElement - 포맷팅할 입력 필드
         */
        formatValue: function(inputElement) {
            if (inputElement) {
                formatNumberWithComma(inputElement);
            }
        }
    };
};

// 키패드 초기화 및 API 저장 (외부에서 접근 가능하도록)
const keypadAPI = renderKeypad(props);
window.keypadAPI = keypadAPI;

// 컴포넌트에서는 빈 문자열 반환 (HTML 출력 방지)
return "";