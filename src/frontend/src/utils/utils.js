
import { v4 as uuidv4 } from 'uuid';
import bigdecimal from "bigdecimal";
import { statusEnum } from './enums.js';

/** Returns a psuedorandom boolean. */
function flip() {
  return Math.random() >= .5;
}

/** Returns a random integer between given `min` and `max` values; defaults to [0-9).  */
function randomZeta(min = 0, max = 10) {
  return Math.floor((Math.random() * (max - min)) + min);
}

/** Converts a nanoseconds timestamp into its equivalent Javascript Date type. */
function nsToJsDate(nanoseconds) {
  return new Date(Number(BigInt(nanoseconds) / 1000000n)); 
}

/** Uses bigdecimal library to convert amount into base units equivlent amount using the given number of decimals. 
 * Note this will return as a string type (of the converted amount). */
function toBaseUnits(amount, decimals) {
  const bd_factor = new bigdecimal.BigDecimal(`${10n ** BigInt(decimals)}`);
  const bd_amount = new bigdecimal.BigDecimal(`${amount}`)
  return `${bd_amount.multiply(bd_factor)}`;
}

/** Uses bigdecimal library to convert amount into base units equivlent amount using the given number of decimals. 
 * Note this will return as a string type (of the converted amount) and can be used with `convertExponetialIntoStringWithAllPlaceholderZeros`
 * below in the event the converted amount is of a very infinitesimalish magnitude (0.00000008 is unfortunately more user friendly than 1E-8). */
function fromBaseUnits(amount, decimals) {
  const bd_factor = new bigdecimal.BigDecimal(`${10n ** BigInt(decimals)}`);
  const bd_amount = new bigdecimal.BigDecimal(`${amount}`)
  return `${bd_amount.divide(bd_factor)}`;
}

/** For a given `value` passed if the value is a literal and it contains scientific notation `E` it 
 * convert the value into a numberish type preserving non-significant zero digits: ie `1E-8` will 
 * return 0.00000008 (similarly for postive exponentials); otherwise it will return given value as is. */ 
function convertExponetialIntoStringWithAllPlaceholderZeros(value) {
  if (typeof(value) !== 'string') return value;
  if (value.includes("E")) {
    const [coefficient, literalExponent] = value.split(/E/i); 
    const exponent = parseInt(literalExponent)
    if (exponent < 0) {
      const zeros = "0".repeat(Math.abs(exponent) - 1); 
      return "0." + zeros + coefficient.replace(".", ""); 
    } else {
      const zeros = "0".repeat(exponent); 
      return coefficient + zeros; 
    }
  } else {
    return value;
  };
};

function containsDecimalPoint(amount) { return /[.]/.test(`${amount}`); };

function isNonTrivialString(text) { return (text && typeof(text) === 'string' && text.length > 0); };

/** Used by `prepareSendPaymentsArgs` to convert the amount given as input to the base units type the canister expects. 
 * Note if a float type (literal) is passed and the conversion to base units results in less than one base unit, that 
 * amount will be discarded (as opposed to throwing an error or rounding). */
function prepareAmount_(amountInput, decimals) {
  if (!amountInput || typeof(amountInput) !== 'string') {
    throw new Error('prepareAmount called without a valid amount input literal');
  };
  let baseUnitsAmount;
  if (containsDecimalPoint(amountInput)) {
    baseUnitsAmount = toBaseUnits(parseFloat(amountInput), decimals).split('.')[0];
  } else {
    if (!Number.isInteger(parseInt(amountInput))) {
      throw new Error(`Invalid amountInput ${amountInput} passed!`);
    }
    baseUnitsAmount = amountInput;
  }
  return BigInt(baseUnitsAmount);
}

/** Used by `prepareSendPaymentArgs` to create the payment viewmodel the client uses until `send_payment` completes. 
 * Note `sourceAddress` refers to the sender's ICRC1 account address and is included in case more functionality is 
 * added such as letting the user define their own (sub)subaccounts to use. */
function clientCreatePayment_({ 
  amount,
  clientPaymentId,
  description,
  recipientAddress,
  sourceAddress,
  number,
  creationTimestamp,
}) {
  return {
    id: `cn${number}-ci${clientPaymentId}`,
    status: { type: statusEnum.PENDING },
    description: isNonTrivialString(description) ? description : null,
    clientPaymentId,
    creationTimestamp,
    number: `${number}`,
    recipientAddress,
    sourceAddress,
    amountBaseUnits: amount,
  }
}

/** Converts the inputs of the UI for sending a payment (`{ input: { addressInput, amountInput, descriptionInput? } }`) and
 * metadata about the caller's current account address (`sourceAddress`) and ICRC1 token canister (`decimals`) into the args 
 * for calling `send_payment` and the payment viewmodel the client uses until `send_payment` completes (as all the canister 
 * calls are routed through a web worker which handles processing in a different thread). These are returned destructurable 
 * as `{ args, payment }`.  
 * Note if the amount passed as `amountInput` evaluates to a float type, it will be converted to base units for the args.
 * Also note `clientPaymentId` is used by the UI to determine which payment is which (when `send_payment` returns and
 * the list of payments is to be updated replacing the payment viewmodel this method returns as `payment` with the 
 * actual transfer call result.) */
function prepareSendPaymentArgs({ 
  inputs, 
  decimals, 
  createdCount, 
  sourceAddress, 
}) {
  const {
    amountInput,
    descriptionInput: description,
    recipientAddressInput: recipientAddress
  } = inputs;
  // Create the send_payment args:
  const args = {
    clientPaymentId: uuidv4(),
    recipientAddress,
    description: description ? [description] : [],
    amount: prepareAmount_(amountInput, decimals)
  };
  const { 
    clientPaymentId, 
    amount
  } = args;
  // Create initial payment as it'll appear in the client,
  // before the send_payment canister call finishes and the
  // payments list is updated with the call's result:
  const payment = clientCreatePayment_({
    amount,
    description,
    recipientAddress,
    clientPaymentId,
    // Note: This will be replaced by the canister's creation date for this payment.
    creationTimestamp: new Date(),
    sourceAddress,
    number: BigInt(createdCount) + 1n,
  });
  return {
    args,
    payment
  }
};


/** Converts the `get_account_balance` canister call response to the result type expected by the UI. 
 * Note the ICRC1 account address is also included in the payment processing canister's call response. */
function parseAccountBalanceResponse(response) {
  if (response?.ok) {
    const { ok: { timestampNs, accountAddress, currentBalance } } = response;
    const timestamp = nsToJsDate(timestampNs);
    return {
      ok: {
        timestamp,
        accountAddress,
        currentBalanceBaseUnits: currentBalance
      }
    }
  } else {
    return {
      err: response.err.msg 
    }
  }
};

/** Converts the `get_account_payments` canister call response to the result type expected by the UI. */
function parseAccountPaymentsResponse(response) {
  const { timestampNs, payments: ps, createdCount } = response;
  return {
    ok: {
      timestamp: nsToJsDate(timestampNs),
      payments: ps.map(p => parsePayment(p)),
      createdCount
    }
  }
};

/** Converts the `get_icrc1_token_canister_metadata` canister call response to to the result type expected by the client UI; 
 * note that it also adds the ICRC1 token canister's id to the resulting returned type: the returned type is (instead of list) 
 * an object whose properties are the original list's keys spread (less the 'icrc1:` prefix of each key and each value type). */
function parseTokenCanisterMetadataResponse(response) {
  if (response?.ok) {
    const { ok: { canisterId, metadata = [] } } = response;
    try {
      const canisterMetadata = metadata.reduce((acc, [k, v]) => ({ 
        ...acc,
        [k.replace('icrc1:', '')]: (Object.values(v)[0])
      }), 
       { canisterId }
      );
      if (!canisterMetadata.decimals) {
        return {
          err: "ICRC1 token canister metadata call response did not contain a decimals key and value."
        }
      } else if (!canisterId) {
        return {
          err: "ICRC1 token canister metadata call response did not contain token canister id."
        }
      } else {
        return {
          ok: { 
            canisterMetadata  
          }
        }
      }
    } catch (e) {
      return {
        err: 'Could not transform call result into ICRC1 token canister metadata view model.'
      }
    }
  } else {
    return {
      err: response.err.msg
    }
  }
};

/** Converts a payment as it is returned by a canister call (data transfer model) to the type expected by the client UI (view model). */
function parsePayment(payment) {
  const {
    id,
    status,
    clientPaymentId,
    createdAtNs,
    description,
    number,
    recipientAddress,
    amount,
    sourceAddress
  } = payment;
  return {
    id,
    status: parseStatus(status),
    description: (payment.description.length !== 0) ? description[0] : null,
    clientPaymentId,
    creationTimestamp: nsToJsDate(createdAtNs),
    number: `${number}`,
    recipientAddress,
    sourceAddress,
    amountBaseUnits: amount,
  };
};

/** Converts a status as it is returned by a canister call (data transfer model) to the type expected by the client UI (view model).  
 * The returned type is not directly displayed to user, but is again passed to `getTextStatusColor` and `getStatusMessage` 
 * (see below) to get the actual present view model (as well some other methods such as to differentiate which icon).  */
function parseStatus(s) {
  if (s?.Pending) {
    return {
      type: statusEnum.PENDING
    }
  } else {
    if (s?.Completed) {
      const { Completed: { timestampNs, txIndex } } = s;
      return {
        type: statusEnum.CONFIRMED,
        timestamp: nsToJsDate(timestampNs),
        extra: { txIndex }
      };
    } else {
      if (s?.Failed) {
        const { Failed } = s;
        const { Failed: { timestampNs } } = s;
        const timestamp = nsToJsDate(timestampNs);
        if (Failed.kind?.InvalidRecipientAddress) {
          return {
            type: statusEnum.FAILED_INVALID_ADDRESS,
            timestamp
          };
        }
        if (Failed.kind?.InterCanisterCallCaughtError) {
          return {
            type: statusEnum.FAILED_INTERCANISTER_CALL,
            extra: Failed.kind.InterCanisterCallCaughtError,
            timestamp
          }
        }
        if (Failed.kind?.ICRC1TokenCanisterTransferErr) {
          return {
            type: statusEnum.FAILED_TRANSFER_ERR,
            extra: JSON.stringify(Failed.kind.ICRC1TokenCanisterTransferErr),
            timestamp
          }
        }
      }
    }
  }
  throw new Error(`Status could not be parsed from response returned status: ${JSON.stringify(s)}`)
};

/** Used to get the Tailwind text color css utility: note the second param is override (bool) 
 * used to differentiate when returning the status color for enhanced decoration (u-green-success) 
 * or (in the list of payments) the default text color (inherit).  */
function getTextStatusColor(type, override = false) {
  switch (type) {
    case statusEnum.PENDING: 
      return "text-e8-sea-buckthorn";
    case statusEnum.CONFIRMED: 
      return override ? "text-u-green-success" : "text-inherit";
    case statusEnum.FAILED_INVALID_ADDRESS: 
    case statusEnum.FAILED_INTERCANISTER_CALL: 
    case statusEnum.FAILED_TRANSFER_ERR: 
      return "text-e8-razzmatazz";
    default: 
      throw new Error('Did not pass statusenum type when getting default status message');
  };
};

/** Returns the literal displayed in the Payment Details content 'Status' field. */
function getStatusMessage(status) {
  const { type, timestamp = null, extra = null } = status;
  const { dayMonthYear = null, hourMinute = null } = getDisplayDateStrings(timestamp);
  const date = timestamp ? `${dayMonthYear} ${hourMinute}` : null;
  switch (type) {
    case statusEnum.PENDING: 
      return 'Payment is in process';
    case statusEnum.CONFIRMED: 
      return `Payment confirmed received ${date ? `at ${date}` : ""} at ICRC1 token canister's transaction index ${extra.txIndex}`;
    case statusEnum.FAILED_INVALID_ADDRESS: 
      return "Failed due recipient address being invalid as ICRC1 account address text";
    case statusEnum.FAILED_INTERCANISTER_CALL: 
      return `Failed due to intercanister call error ${date ? `at ${date}` : ""} ${extra ? ` with error details: ${extra}` : ""}`;
    case statusEnum.FAILED_TRANSFER_ERR: 
      return `Failed due to ICRC1 token canister transfer call returned error ${date ? `at ${date}` : ""} ${extra ? ` with error details: ${extra}` : ""}`;
    default: 
      throw new Error('Did not pass statusenum type when getting default status message');
  };
};

/**
 * @param {Date} date - Date to parse present.
 * @returns {Object} - Destructures into parsed `{ dayMonthYear, hourMinute }` localized (default) strings.  
 */
function getDisplayDateStrings(d) {
  const date = new Date(d)
  let hours = date.getHours();
  const yearNumerals = `${date.getFullYear()}`.slice(-2);
  const amOrPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12; 
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return { 
    dayMonthYear: date.toLocaleDateString().replace(date.getFullYear(), yearNumerals), 
    hourMinute: `${hours}:${minutes} ${amOrPm}`
  }
};

export {
  flip,
  randomZeta,
  nsToJsDate,
  toBaseUnits,
  fromBaseUnits,
  convertExponetialIntoStringWithAllPlaceholderZeros,
  containsDecimalPoint,
  isNonTrivialString,
  prepareSendPaymentArgs,
  parseAccountBalanceResponse,
  parseAccountPaymentsResponse,
  parseTokenCanisterMetadataResponse,
  parsePayment,
  parseStatus,
  getTextStatusColor,
  getStatusMessage,
  getDisplayDateStrings,
};