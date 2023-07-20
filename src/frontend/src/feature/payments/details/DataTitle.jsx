const DataTitle = ({ 
  ariaId, 
  titleText, 
  icon,
}) => {
  return (
    <dt aria-labelledby={ariaId} className="stylish-label-height relative w-full snap-start">
      <div className="stylish-label-bg absolute left-0 top-0 h-full w-full"></div>
      <div className="stylish-label-content">
        <div className="stylish-label-icon-container">
          {icon ? icon : null}
        </div>
        <span className="uppercase">{titleText}</span>
      </div>
    </dt>
  )
};

export default DataTitle;