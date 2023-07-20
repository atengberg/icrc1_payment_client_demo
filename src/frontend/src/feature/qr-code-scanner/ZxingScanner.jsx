import { useState, useLayoutEffect } from 'react';
import { useZxing } from 'react-zxing';
import ZxingScannerControls from './ZxingScannerControls';
import { RiCameraFill } from '../../components/Icons';

// TBD, doesn't catch when permission is failed to be granted. 
// Either patch dependency, PR or rewrite from scratch.
const ZxingScanner = ({
  paused,
  close,
  onQrResult
}) => {
  /* To show the camera icon while the qr scanner and video stream loads. */
  const [ready, setReady] = useState(false);
  const {
    ref,
    torch: {
      on: torchOn,
      off: torchOff,
      isOn: isTorchOn,
      isAvailable: isTorchAvailable,
    },
  } = useZxing({
    paused,
    onResult: onQrResult,
    onError: (e) => onError(e)
  });
  const onError = (e) => {
    // FYI scanner constantly emits error "No Multiformat readers were able to detect the code." while scanning.
    // console.error(`got error ${e}`)
  };
  useLayoutEffect(() => {
    const loadedListener = (e) => setReady(true);
    let rc;
    if (ref.current) {
      rc = ref.current;
      rc.addEventListener('loadeddata', loadedListener);
    };
    return () => rc.removeEventListener('loadeddata', loadedListener);
  }, [ref, paused]);
  return (
    <div className="flex flex-col">
     <div className="relative mx-auto max-w-[300px]">
        {ready ?
          <ZxingScannerControls 
            isTorchOn={isTorchOn} 
            isTorchAvailable={isTorchAvailable} 
            torchOff={torchOff} 
            torchOn={torchOn} 
            close={close} 
          />
          :
          <div className="absolute top-0 w-full">
            <RiCameraFill className="inset-x-0 mx-auto mt-10 h-20 w-20 text-slate-600 opacity-50"/>
          </div> }
        <video ref={ref} />
      </div>
    </div>
  )
};

export default ZxingScanner;