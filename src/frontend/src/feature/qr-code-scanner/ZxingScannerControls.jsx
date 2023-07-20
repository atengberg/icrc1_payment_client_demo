import { RiLightbulbFlashLine, RiLightbulbLine, RiCloseCircleLine } from "../../components/Icons";

const QrScannerControls = ({ 
  isTorchAvailable = false,
  isTorchOn, 
  torchOff,
  torchOn,
  close 
}) => {
  return (
    <div className="absolute top-0 z-[60] mt-1 flex w-full text-[2em]">
      {isTorchAvailable ? 
        <button
          role="switch"
          aria-pressed={isTorchOn}
          aria-label="use device light"
          className={`${isTorchOn ? "text-slate-400" : "text-yellow-200"} z-50 p-2`}
          onClick={() => isTorchOn ? torchOff() : torchOn() }
          disabled={!isTorchAvailable} 
          >
            {isTorchOn 
              ? <RiLightbulbLine className="h-8 w-8" aria-hidden="true"/> 
              : <RiLightbulbFlashLine className="h-8 w-8" aria-hidden="true"/>
            } 
        </button> 
        : null
      }
      <div className="grow"></div>
      <button 
        aria-label="close"
        className="z-50 rounded-lg p-2 text-red-400 opacity-70"
        onClick={close}
        >
          <RiCloseCircleLine className="mr-1 h-8 w-8" aria-hidden="true"/>
      </button>
  </div>
  )
};

export default QrScannerControls;