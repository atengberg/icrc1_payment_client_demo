import { useMemo, useCallback } from "react";
import useFocused from "../../../hooks/useFocused";
import QrCodeScanner from "../../qr-code-scanner/QrCodeScanner";
import FormLabel from "../FormLabel";
import InfoPlaceholder from "../InfoPlaceholder";
import { RiWallet3Fill } from "../../../components/Icons";

const RecipientAddressInput = ({ 
  inputValue,
  onInputValueChanged, 
  onQrCodeScanned,
  disabled,
  error,
  formikBlur
}) => {

  const { focused } = useFocused("recipientAddressInput");
  const onInputChanged = useCallback((e) => {
    const newInput = e.currentTarget.value.trim();
    let isValid = true;
    if (newInput.length > 1) {
      // Prevent many invalid inputs (only lower case alpha, 0-9, dashes and period neither consecutively repeating):
      isValid = /^(?!.*--)(?!.*\.\.)(?!.*\.-)(?!.*-\.)(?!.*\.0)[0-9a-z-.]+$/.test(newInput);
    }
    if (isValid) {
      onInputValueChanged(e);
    }
  }, [onInputValueChanged]);

  return useMemo(() => (
    <div className="form-input-wrapper">
      <FormLabel   
        htmlFor="address-input" 
        labelText="recipient address" 
        icon={<RiWallet3Fill className="stylish-label-icon-size" />} 
      />

      <div className="input-content">
        <div className="h-3"></div>
        <QrCodeScanner 
          disabled={disabled}
          onQrCodeScanned={onQrCodeScanned}
        />

        <InfoPlaceholder 
          idName="address-input-hint" 
          descriptionText="Enter or scan the recipient's ICRC1 text address..."
          hasInput={inputValue && inputValue.length > 0}
          hasFocus={focused}
          error={error}
        />
        <textarea 
          className="w-full resize-none disabled:opacity-30" 
          id="recipientAddressInput" name="recipientAddressInput"   
          inputMode="text"
          autoComplete="on"
          rows="3" 
          maxLength="512"
          enterKeyHint="Next"
          spellCheck={false}
          disabled={disabled}
          onBlur={formikBlur}
          aria-describedby="address-input-hint"
          placeholder="Enter the recipient address..." 
          value={inputValue}
          onChange={onInputChanged}
        />
      </div>
    </div>
  ), [
    error,
    formikBlur,
    disabled, 
    focused, 
    inputValue, 
    onInputChanged, 
    onQrCodeScanned
  ]);
};

export default RecipientAddressInput;