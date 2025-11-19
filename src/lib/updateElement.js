import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

/**
 * DOM 요소의 속성을 업데이트
 * 새로운 props를 적용하고, 제거된 props는 삭제
 * @param {HTMLElement} target - 대상 DOM 요소
 * @param {Object} originNewProps - 새로운 props
 * @param {Object} originOldProps - 이전 props
 */
function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  // 이전 props에서 새로운 props에 없는 것들 제거
  Object.entries(oldProps).forEach(([key]) => {
    const oldValue = oldProps[key];

    if (key === "key" || key === "ref" || key === "children") {
      return;
    }

    if (!(key in newProps)) {
      // ✅ 이벤트 핸들러 제거
      if (key.startsWith("on")) {
        const eventType = key.slice(2).toLowerCase();
        removeEvent(target, eventType, oldValue); // ← oldValue 추가
        return;
      }

      // 일반 속성 제거
      if (key === "className") {
        target.removeAttribute("class");
      } else if (key === "style") {
        target.removeAttribute("style");
      } else if (key.startsWith("data-")) {
        target.removeAttribute(key);
      } else {
        target.removeAttribute(key);
      }
    }
  });

  // 새로운 props 적용
  Object.entries(newProps).forEach(([key, newValue]) => {
    const oldValue = oldProps[key];

    if (oldValue === newValue) {
      return;
    }

    if (key.startsWith("on")) {
      const eventType = key.slice(2).toLowerCase();
      console.log("eventType:", eventType, newValue);
      if (oldValue) {
        removeEvent(target, eventType, oldValue);
      }
      if (newValue) {
        addEvent(target, eventType, newValue);
      }
      return;
    }

    if (key === "key" || key === "ref" || key === "children") {
      return;
    }

    if (key === "className") {
      if (newValue) {
        target.setAttribute("class", newValue);
      } else {
        target.removeAttribute("class");
      }
      return;
    }

    if (key === "style") {
      if (typeof newValue === "object") {
        Object.entries(newValue).forEach(([cssKey, cssValue]) => {
          target.style[cssKey] = cssValue;
        });
      } else if (typeof newValue === "string") {
        target.setAttribute("style", newValue);
      } else {
        target.removeAttribute("style");
      }
      return;
    }

    if (key.startsWith("data-")) {
      if (newValue != null) {
        target.setAttribute(key, newValue);
      } else {
        target.removeAttribute(key);
      }
      return;
    }

    if (newValue != null && newValue !== false) {
      if (newValue === true) {
        target.setAttribute(key, "");
      } else {
        target.setAttribute(key, newValue);
      }
    } else {
      target.removeAttribute(key);
    }
  });
}

/**
 * 기존 DOM 요소를 새로운 VNode로 업데이트 또는 완전히 교체
 * @param {HTMLElement} parentElement - 부모 요소
 * @param {VNode} newNode - 새로운 VNode
 * @param {VNode} oldNode - 기존 VNode
 * @param {number} index - 자식 요소의 인덱스
 */
export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (newNode?.type === "input") {
    console.log("[updateElement] input - onKeyDown:", newNode.props?.onKeyDown);
  }

  if (!oldNode) {
    console.log("[updateElement] oldNode 없음 - 새로 생성"); // ✅ 로그 5
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (!newNode) {
    console.log("[updateElement] newNode 없음 - 제거"); // ✅ 로그 6
    const childNode = parentElement.childNodes[index];
    if (childNode) {
      parentElement.removeChild(childNode);
    }
    return;
  }

  if (typeof newNode === "string" && typeof oldNode === "string") {
    console.log("[updateElement] 텍스트 노드 업데이트"); // ✅ 로그 7
    if (newNode !== oldNode) {
      parentElement.childNodes[index].textContent = newNode;
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    console.log("[updateElement] type 변경 - 요소 교체"); // ✅ 로그 8
    const newElement = createElement(newNode);
    const oldElement = parentElement.childNodes[index];
    if (oldElement) {
      parentElement.replaceChild(newElement, oldElement);
    } else {
      parentElement.appendChild(newElement);
    }
    return;
  }

  const $element = parentElement.childNodes[index];
  if (!$element) {
    console.log("[updateElement] $element 없음"); // ✅ 로그 9
    parentElement.appendChild(createElement(newNode));
    return;
  }

  console.log(
    "[updateElement] updateAttributes 호출 전, newNode.props:",
    newNode.props,
  ); // ✅ 로그 10
  updateAttributes($element, newNode.props, oldNode.props);

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];

  // 새로운 자식들 업데이트
  for (let i = 0; i < newChildren.length; i++) {
    updateElement($element, newChildren[i], oldChildren[i], i);
  }

  // 초과된 기존 자식 요소 제거
  for (let i = newChildren.length; i < oldChildren.length; i++) {
    const childNode = $element.childNodes[newChildren.length];
    if (childNode) {
      $element.removeChild(childNode);
    }
  }
}
