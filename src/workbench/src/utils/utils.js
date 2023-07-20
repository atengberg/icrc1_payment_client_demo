
import { v4 as uuidv4 } from 'uuid';
import bigdecimal from "bigdecimal";
import { statusEnum } from './enums.js';

function flip() {
  return Math.random() >= .5;
}

function randomNat(min, max) {
  return Math.floor((Math.random() * (max - min)) + min);
}

function nsToJsDate(nanoseconds) {
  return new Date(Number(BigInt(nanoseconds) / 1000000n)); 
}

function toBaseUnits(amount, decimals) {
  const bd_factor = new bigdecimal.BigDecimal(`${10n ** BigInt(decimals)}`);
  const bd_amount = new bigdecimal.BigDecimal(`${amount}`)
  return `${bd_amount.multiply(bd_factor)}`;
}

function fromBaseUnits(amount, decimals) {
  const bd_factor = new bigdecimal.BigDecimal(`${10n ** BigInt(decimals)}`);
  const bd_amount = new bigdecimal.BigDecimal(`${amount}`)
  return `${bd_amount.divide(bd_factor)}`;
}

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
  }
}

function containsDecimalPoint(amount) {
  return /[.]/.test(`${amount}`)
}

function isNonTrivialString(text) {
  return (text && typeof(text) === 'string' && text.length > 0)
};

function prepareAmount_(amountInput, decimals) {
  if (!amountInput || typeof(amountInput) !== 'string') {
    throw new Error('prepareAmount called without a valid amount input literal');
  };
  const amountLiteral = `${amountInput}`;
  let baseUnitsAmount;
  if (containsDecimalPoint(amountLiteral)) {
    const convert = `${toBaseUnits(parseFloat(amountLiteral), decimals)}`.split('.');
    if (convert[1] && parseFloat(convert[1])) {
      throw new Error("Given amount was less than one base unit.");
    }
    baseUnitsAmount = convert[0];
  } else {
    if (!Number.isInteger(parseInt(amountLiteral))) {
      throw new Error(`Invalid amountInput ${amountInput} passed!`);
    }
    baseUnitsAmount = amountInput;
  }
  return BigInt(baseUnitsAmount);
}

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
    creationTimestamp: new Date(),
    sourceAddress,
    number: BigInt(createdCount) + 1n,
  });
  return {
    args,
    payment
  }
};

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
  }
}

function parseStatus(s) {
  if (s?.Pending) {
    return {
      type: statusEnum.PENDING
    }
  } else {
    if (s?.Completed) {
      const { Completed: { timestampNs } } = s;
      return {
        type: statusEnum.CONFIRMED,
        timestamp: nsToJsDate(timestampNs)
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

function getStatusMessage(status) {
  const { type, timestamp = null, extra = null } = status;
  const { dayMonthYear = null, hourMinute = null } = getDisplayDateStrings(timestamp);
  const date = timestamp ? `${dayMonthYear} ${hourMinute}` : null;
  switch (type) {
    case statusEnum.PENDING: 
      return 'Payment is in process';
    case statusEnum.CONFIRMED: 
      return `Payment confirmed received ${date ? `at ${date}` : ""}`;
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
 * @returns {Object} - Destructures into parsed `{ dayMonthYear, hourMinute }` strings.  
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
  randomNat,
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