import { useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react'
import ellipsizeICRC1Address from '../utils/ellipsize-ICRC1-address';
import clsx from 'clsx';

/****Ellipsizes and presents styled text passed in according to the orignal text, text style and ellipsis function given**  
 * @component  
 * @param {string} originalText - Original text to display and ellipsize.  
 * @param {string} textClz - Tailwind utility classes to apply as the displayed text's style.  
 * @param {string} containerClz - Tailwind utility classes to apply to div containing the displayed text.   
 * @param {function} [ellipsizeFunction = ellipsizeICRC1Address] - The function that determines and returns the ellipsized text (defaults to `ellipsizeICRC1Address`).  
 * @returns {React.JSX.Element} - Memoized react component displaying the text, ellipsized if calculated to be.  
 */
const AutoEllipsizingTextSpan = ({
  originalText = "no text given",
  containerClz = "inherit",
  textClz = "inherit",
  ellipsizeFunction
}) => {
  const ellipsisFunction = ellipsizeFunction ?? ellipsizeICRC1Address;
  const textMeasureRef = useRef(null);
  const [displayedText, setDisplayedText] = useState("");

  // Since function as prop may not be memoized, explicitly do it here for the sake of usingMemo at return.
  const ellispsisFcn = useCallback(() => ellipsisFunction(originalText), [ellipsisFunction, originalText]);
  useLayoutEffect(() => {
    const onResize = () => {
      const { current = null } = textMeasureRef;
      // Check if the total spanning ("scrollable") width of the text is greater than available visible width:
      const shouldEllipsize = (current?.clientWidth < current?.scrollWidth);
      setDisplayedText(() => shouldEllipsize ? ellispsisFcn() : originalText);
    };
    // Must be called initially, each time component mounts to check.
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [
    containerClz, 
    originalText, 
    textClz, 
    ellispsisFcn
  ]);

  return useMemo(() => (
    <div className={clsx(containerClz, "overflow-hidden whitespace-nowrap")}>
      <div className={textClz}><span className={textClz}>{displayedText}</span></div>
      {/* Necessary to measure the original text's width when actively resizing otherwise flickers, can end up not ellipsizing 
          when the ellipsized text's width is measured... this could be removed if delivering just for mobile fixed viewports. 
          Note this could also be done using off-screen canvas, etc. */}
      <div ref={textMeasureRef} className={clsx("sr-hidden invisible h-0 w-full", textClz)}>{originalText}</div>
    </div>
  ), [
    containerClz,
    displayedText,
    originalText, 
    textClz,
  ]);
};

export default AutoEllipsizingTextSpan;