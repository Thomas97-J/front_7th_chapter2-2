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

  // Step 2: 요소에 이벤트 리스너 등록
  element.addEventListener(normalizedType, handler);
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

  // Step 2: 이벤트 리스너 제거
  element.removeEventListener(normalizedType, handler);
}

/**
 * 루트 요소에 이벤트 위임(Event Delegation) 설정
 * 모든 자식 요소의 이벤트를 루트에서 처리
 */
export function setupEventListeners() {
  // 이벤트 위임 설정은 필요시 추가
  // 예: 전역 이벤트 핸들러 등록
}
