import { useMemo } from "react";
import clsx from "clsx";

// This is the text that appears above the input (as placeholder hint or error of that input).
const InfoPlaceholder = ({
  idName,
  descriptionText, 
  error,
  hasFocus = false,
  hasInput = false,
}) => {
  const spanTextClz = clsx(
    { 'text-e8-razzmatazz': (!!error) },
    { 'text-e8-meteorite/80 dark:text-u-snow/80': (!error) },
  );
  return useMemo(() => (
    <div className="input-placeholder">
      {error 
        ? <span id={idName} name={idName} className={spanTextClz}>{error}</span> 
        : (hasFocus && hasInput) 
          ? <span id={idName} name={idName} className={spanTextClz}>{descriptionText}</span> 
          : null
      }
    </div>
  ), [
    hasFocus, 
    hasInput,
    error,
    idName, 
    descriptionText, 
    spanTextClz, 
  ]);
};

export default InfoPlaceholder;