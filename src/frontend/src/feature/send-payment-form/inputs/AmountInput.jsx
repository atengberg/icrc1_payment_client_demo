
import { useCallback, useMemo, useState } from 'react';
import useFocused from '../../../hooks/useFocused';
import FormLabel from "../FormLabel";
import InfoPlaceholder from '../InfoPlaceholder';
import { RiScales2Fill } from '../../../components/Icons';

const AmountInput = ({
  inputValue,
  onInputValueChanged, 
  disabled,
  error,
  tokenSymbol,
  formikBlur
}) => {

  const getPlaceholderHint = useCallback((amount, symbol) => {
    // Assuming user will figure out adding a . does change amount input type units (with the message).
    const unitsIsNormal = amount && amount.includes('.');
    const tokenSymbolLiteral = symbol ? `of ${symbol}` : '';
    return `Enter amount ${tokenSymbolLiteral} (${unitsIsNormal ? 'normal' : 'base'} units) to send...`;
  }, []);

  const [placeHolderHint, setPlaceHolderHint] = useState(getPlaceholderHint(inputValue, tokenSymbol));

  const updatePlaceholder = useCallback((newInput) => {
    setPlaceHolderHint(() => getPlaceholderHint(newInput, tokenSymbol));
  }, [getPlaceholderHint, tokenSymbol]);

  const onInputChanged = useCallback((e) => {
    // Delimits the input so only postive float or int values (technically literals of) are actually passed back. 
    const newInput = e.currentTarget.value.trim();
    if (newInput.length === 1) {
      if (newInput === '.') {
        // Always add a leading 0 if starting with a decimal char:
        e.currentTarget.value = '0.';
        onInputValueChanged(e);
        updatePlaceholder(newInput);
      } else {
        if (newInput.match(/[0-9]/)) { 
          onInputValueChanged(e);
          updatePlaceholder(newInput);
        }
      }
    } else {
      if (newInput.length > 0) {
        const matchMode = new RegExp(/^([0-9]+)((\.)([0-9]+)?)?$/, 'g');
        if (matchMode.test(newInput)) {
          onInputValueChanged(e);
          updatePlaceholder(newInput);
        }
      } else {
        onInputValueChanged(e);
        updatePlaceholder(newInput);
      }
    }
  }, [updatePlaceholder, onInputValueChanged]);
  
  const { focused } = useFocused("amountInput");

  return useMemo(() => (
    <div className="form-input-wrapper">
      <FormLabel 
        htmlFor="amount-input" 
        labelText="amount to send" 
        icon={<RiScales2Fill className="stylish-label-icon-size"/>} 
      />
      <div className="input-content">
        <InfoPlaceholder 
          idName="amount-input-hint" 
          descriptionText={placeHolderHint} 
          hasFocus={focused}
          hasInput={inputValue && `${inputValue}`.length > 0}
          error={error}
        />
          <input
            onBlur={formikBlur}
            className="p-1 disabled:opacity-30"
            id="amountInput" name="amountInput"
            type="text"
            inputMode="decimal"
            autoComplete="transaction-amount"
            aria-describedby="amount-input-hint"
            placeholder="Enter an amount to send..."
            enterKeyHint="Next"
            onChange={onInputChanged}
            value={inputValue}
            disabled={disabled} 
            required
          />

        </div>
    </div>
  ), [
    error,
    formikBlur,
    onInputChanged,
    inputValue, 
    disabled, 
    focused, 
    placeHolderHint
  ]);
};

export default AmountInput;