import { useMemo } from 'react';
import useFocused from '../../../hooks/useFocused';
import InfoPlaceholder from "../InfoPlaceholder";
import FormLabel from "../FormLabel";
import { RiFileEditFill } from '../../../components/Icons';

const DescriptionInput = ({ 
  inputValue,
  onInputValueChanged, 
  disabled,
}) => {
  const { focused } = useFocused('descriptionInput');
  return useMemo(() => (
    <div className="form-input-wrapper">
      <FormLabel 
        htmlFor="description-input" 
        labelText="description" 
        icon={<RiFileEditFill className="stylish-label-icon-size" />} 
      />
        <div className="input-content">
          <InfoPlaceholder 
            idName="description-input-hint" 
            descriptionText={`Description may be up to 256 characters...`}
            hasInput={inputValue && inputValue.length > 0}
            hasFocus={focused}
            isError={false}
            />
          <input
            className="text-e8-black dark:text-u-snow w-full p-1 disabled:opacity-30"
            id="descriptionInput" name="descriptionInput"
            type="text"
            inputMode="text"
            autoComplete="on"
            minLength="0"
            maxLength="256"
            aria-describedby="description-input-hint"
            placeholder="Enter an optional description..."
            enterKeyHint="Next"
            disabled={disabled} 
            onChange={onInputValueChanged}
            value={inputValue}
            />
        </div>
    </div>
  ), [
    disabled, 
    focused, 
    inputValue, 
    onInputValueChanged
  ]);
};

export default DescriptionInput;