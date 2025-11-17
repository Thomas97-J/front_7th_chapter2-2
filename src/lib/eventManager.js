// 요소별 이벤트 핸들러를 저장하는 WeakMap
const eventHandlers = new WeakMap();

/**
 * 요소에 이벤트 핸들러 등록
 * @param {HTMLElement} element - 대상 요소
 * @param {string} eventType - 이벤트 타입 (click, change, input 등)
 * @param {Function} handler - 이벤트 핸들러 함수
 */
export function addEvent(element, eventType, handler) {
  // Step 1: 이벤트 타입 정규화 (click, onChange 등에서 앞의 'on' 제거)
  const normalizedType = eventType.startsWith("on")
    ? eventType.slice(2).toLowerCase()
    : eventType.toLowerCase();

  // Step 2: 요소의 핸들러 맵 생성 (없으면 생성)
  if (!eventHandlers.has(element)) {
    eventHandlers.set(element, {});
  }

  const handlers = eventHandlers.get(element);

  // Step 3: 해당 이벤트 타입의 핸들러 배열 생성 (없으면 생성)
  if (!handlers[normalizedType]) {
    handlers[normalizedType] = [];
  }

  // Step 4: 핸들러 추가
  handlers[normalizedType].push(handler);
}

/**
 * 요소에서 이벤트 핸들러 제거
 * @param {HTMLElement} element - 대상 요소
 * @param {string} eventType - 이벤트 타입
 * @param {Function} handler - 제거할 이벤트 핸들러
 */
export function removeEvent(element, eventType, handler) {
  // Step 1: 이벤트 타입 정규화
  const normalizedType = eventType.startsWith("on")
    ? eventType.slice(2).toLowerCase()
    : eventType.toLowerCase();

  // Step 2: 해당 요소의 핸들러 조회
  if (!eventHandlers.has(element)) {
    return;
  }

  const handlers = eventHandlers.get(element);
  if (!handlers[normalizedType]) {
    return;
  }

  // Step 3: 핸들러 배열에서 제거
  const index = handlers[normalizedType].indexOf(handler);
  if (index > -1) {
    handlers[normalizedType].splice(index, 1);
  }
}

/**
 * 루트 요소에 이벤트 위임(Event Delegation) 설정
 * container의 모든 자식 요소에서 발생하는 이벤트를 위임 방식으로 처리
 * @param {HTMLElement} root - 루트 요소
 */
export function setupEventListeners(root) {
  if (!root) return;

  // Step 1: 자주 사용되는 이벤트들에 대해 위임 리스너 등록
  const eventTypes = [
    "click",
    "change",
    "input",
    "mouseover",
    "focus",
    "keydown",
  ];

  eventTypes.forEach((eventType) => {
    // 이미 등록된 위임 리스너 확인 (중복 등록 방지)
    if (root._delegatedListeners && root._delegatedListeners[eventType]) {
      return;
    }

    // 위임 리스너 생성
    const delegatedListener = (event) => {
      let target = event.target;

      // Step 2: 이벤트 대상에서 root까지 순회하며 핸들러 찾기
      while (target && target !== root) {
        // target 요소에 등록된 핸들러 확인
        if (eventHandlers.has(target)) {
          const handlers = eventHandlers.get(target);
          if (handlers[eventType]) {
            // Step 3: 모든 핸들러 실행
            handlers[eventType].forEach((handler) => {
              handler(event);
            });
          }
        }

        target = target.parentNode;
      }
    };

    // Step 4: root에 위임 리스너 등록 (capture 단계는 아님, bubble 단계)
    root.addEventListener(eventType, delegatedListener, false);

    // Step 5: 위임 리스너 정보 저장 (추후 제거 시 사용)
    if (!root._delegatedListeners) {
      root._delegatedListeners = {};
    }
    root._delegatedListeners[eventType] = delegatedListener;
  });
}
