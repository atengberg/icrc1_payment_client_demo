import { useLayoutEffect, useState, useMemo, useRef } from "react";

const useFocused = (elementId) => {
  const [focused, setFocused] = useState(false);
  const elementRef = useRef(null);
  useLayoutEffect(() => {
    const e = document.getElementById(elementId);
    if (!e) {
      throw new Error("The hook useFocused must be passed a valid element id!");
    }
    elementRef.current = e;
    const onFocus = () => setFocused(() => true);
    const onBlur = () => setFocused(() => false);
    e.addEventListener('focus', onFocus);
    e.addEventListener('blur', onBlur);
    return () => { 
      e.removeEventListener('focus', onFocus); 
      e.removeEventListener('blur', onBlur);
      elementRef.current = null
    };
  }, [elementId]);
  return useMemo(() => {
    return { 
      elementRef,
      focused 
    }
  }, [focused])
};

export default useFocused;