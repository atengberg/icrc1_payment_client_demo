import {  useEffect, useCallback } from "react";
import { useFormik } from 'formik';

import RecipientAddressInput from "./inputs/RecipientAddressInput";
import DescriptionInput from "./inputs/DescriptionInput";
import AmountInput from "./inputs/AmountInput";
import ReviewConfirmSubmit from "./review-confirm-submit/ReviewConfirmSubmit";

import { decodeIcrcAccount, decodePayment } from "@dfinity/ledger";

const SendPaymentForm = ({
  initialValues,
  onSendPaymentConfirmed,
  decimals,
  tokenSymbol,
}) => {
  const {
    amount = undefined,
    description = undefined,
    recipientAddress = undefined,
  } = initialValues;

  // Formik is the way to go for forms in react.
  const formik = useFormik({
    initialValues: {
      amountInput: amount ? `${amount}` : '',
      recipientAddressInput: recipientAddress || '',
      descriptionInput: description || '',
    },
    validate: ({amountInput, recipientAddressInput}) => {
      const errors = {};
      if (!amountInput || amountInput.trim() === '') {
        errors.amountInput = 'An amount must be specified to send a payment';
      } else {
        const floatAmount = parseFloat(amountInput);
        if (isNaN(floatAmount) || floatAmount <= 0) {
          errors.amountInput = 'A postive number value must be specified to send a payment';
        }
      }
      if (!recipientAddressInput) {
        errors.recipientAddressInput = 'A recipient address must be specified to make a payment';
      } else {
        try {
          decodeIcrcAccount(recipientAddressInput);
        } catch (e) {
          console.error(e)
          if (e?.message) {
            errors.recipientAddressInput = e.message;
          } else {
            errors.recipientAddressInput = 'The recipient address must be valid ICRC1 account encoded text.';
          }
        };
      }
      return errors;
    },
    onSubmit: (values) => onSendPaymentConfirmed(values)
  });

  const onQrCodeScanned = useCallback((result) => {
    try {
      const decoded = decodePayment(result);
      if (decoded?.token) {
        if (tokenSymbol && tokenSymbol !== decoded.token) {
          formik.setErrors({ 
            ...formik.errors,
            recipientAddressInput: 'Token symbol from QR code does not match token symbol from canister metadata'
          })
        }
      }
      if (decoded?.identifier) {
        formik.setFieldValue('recipientAddressInput', decoded.identifier);
      }
      if (decoded?.amount) {
        // Literalize as decoded payment will return 'number' type (conversion to base units handled on submit).
        formik.setFieldValue('amountInput', `${decoded.amount}`);
      }
      if (!decoded) {
        throw new Error("Nullish decoded, falling back to raw qr input result");
      }
    } catch (e) {
      if (result?.length > 0) {
        // If it isn't an encoded payment, set it as if it were just the intended address:
        formik.setFieldValue('recipientAddressInput', result);
      } else {
        formik.setErrors({ 
          ...formik.errors,
          recipientAddressInput: 'Could not resolve recipient address from the QR code scanned'
        })
      }
    }
  }, [
    tokenSymbol, 
    formik,
  ]);

  // Prevents QR code scanner from openning if 'SCAN QR CODE' doesn't have focus and enter is pressed.
  useEffect(() => {
    const useQrButton = document.getElementById("use-scan-qr-code-button");
    const submitButton = document.getElementById("confirm-send-payment-button");
    const enterKeyHandler = (event) => {
      const { target, keyCode } = event;
      if (keyCode === 13) {
        if (target !== (useQrButton || submitButton)) { event.preventDefault(); }
      }
    };
    document.addEventListener('keydown', enterKeyHandler);
    return () => document.removeEventListener('keydown', enterKeyHandler);
  }, []); // Todo add the needed explicit tab indexes.

  return  (
    <form 
      disabled={formik.isSubmitting}
      onSubmit={formik.handleSubmit}
      noValidate
      className="rounded-opaque container-content-width snap-y snap-proximity"
      aria-labelledby="payment-form-title"
    >    
      <RecipientAddressInput 
        disabled={formik.isSubmitting}
        error={formik.errors.recipientAddressInput}
        inputValue={formik.values.recipientAddressInput}
        formikBlur={formik.handleBlur}
        onInputValueChanged={formik.handleChange}
        onQrCodeScanned={onQrCodeScanned}
      />
      <AmountInput 
        disabled={formik.isSubmitting}
        error={formik.errors.amountInput}
        tokenSymbol={tokenSymbol}
        formikBlur={formik.handleBlur}
        inputValue={formik.values.amountInput}
        onInputValueChanged={formik.handleChange}
      />
      <DescriptionInput 
        disabled={formik.isSubmitting}
        inputValue={formik.values.descriptionInput}
        onInputValueChanged={formik.handleChange}
      />
      <ReviewConfirmSubmit
        amount={formik.values.amountInput} 
        description={formik.values.descriptionInput}
        address={formik.values.recipientAddressInput}
        decimals={decimals}
        tokenSymbol={tokenSymbol}
        hasError={(!!formik.errors.recipientAddressInput || !!formik.errors.amountInput)}
        disabled={formik.isSubmitting}
      />
    </form>
  )
};

export default SendPaymentForm;