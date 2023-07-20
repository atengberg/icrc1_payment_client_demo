import { useState } from "react";
import ZxingScanner from "./ZxingScanner";
import { RiQrCodeLine } from '../../components/Icons';
import clsx from "clsx";

const QrCodeScanner = ({ 
  onQrCodeScanned,
  disabled = false
}) => {
  // Note: paused ~= !visible.
  const [paused, setPaused] = useState(true);
  const onQrResult = (result) => {
    if (onQrCodeScanned) {
      onQrCodeScanned(result.getText());
    }
    setPaused(true);
  };
  return (
    <div className={clsx('mx-auto flex flex-col', {'mt-4' : paused }, { "mt-8": !paused })}>
      {paused 
        ? <div className="w-full">
            <button 
              disabled={disabled}
              aria-pressed={!paused}
              id="use-scan-qr-code-button"
              className={clsx("stylish-button", "bg-e8-meteorite dark:bg-e8-picton-blue mx-auto flex flex-nowrap items-center disabled:opacity-30" )}
              onClick={() => setPaused(false)}
            >
              <RiQrCodeLine className="h-10 w-10" aria-hidden="true"/>
              <span className="ml-2">scan qr code</span>
            </button>
          </div>
        : <ZxingScanner 
            paused={paused}
            close={() => setPaused(true)}
            onQrResult={onQrResult}
          />
      }
    </div>
  )
};

export default QrCodeScanner;