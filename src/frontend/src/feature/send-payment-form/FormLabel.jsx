import { useMemo } from "react";

// This is the title bar that appears above each input content section. 
const FormLabel = ({ htmlFor, labelText, icon }) => {
  return useMemo(() => (
    <>
    <div className="stylish-label-height relative">
      <div className="stylish-label-bg absolute left-0 top-0 h-full w-full"></div>
      <div className="stylish-label-content">
        <div className="stylish-label-icon-container">
          {icon ? icon : null}
        </div>
        <label htmlFor={htmlFor} className="uppercase">{labelText}</label>
      </div>

    </div>
    </>
  ), [htmlFor, labelText, icon] );
};

export default FormLabel;
