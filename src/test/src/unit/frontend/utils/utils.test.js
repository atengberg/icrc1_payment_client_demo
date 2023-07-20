import { describe, expect, it } from 'vitest';
import * as utils from '@/utils/utils.js';
import { statusEnum } from '@/utils/enums.js';

describe('Test Methods of Utils', () => {

  const equivalent = {
    nanosecondsBigInt: 1689645354807565360n,
    millisecondsBigInt: 1689645354807n,
    milliseconds: 1689645354807,
    date: new Date(1689645354807)
  };

  const payments = {
    pending: {
      raw: {
        id: `cn5-ci4c8266f8-9086-4004-8a72-7451dd077232`,
        status: { Pending: {} },
        clientPaymentId: '4c8266f8-9086-4004-8a72-7451dd077232',
        createdAtNs: equivalent.nanosecondsBigInt,
        description: ["Lorem Ipsum Shakra Facto"],
        number: 5n,
        recipientAddress: `be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d`,
        amount:  100000n,
        sourceAddress: `be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a`
      },
      parsed: {
        id: `cn5-ci4c8266f8-9086-4004-8a72-7451dd077232`,
        status: { type: 'PENDING' },
        description: "Lorem Ipsum Shakra Facto",
        clientPaymentId: `4c8266f8-9086-4004-8a72-7451dd077232`,
        creationTimestamp: equivalent.date,
        number: '5',
        recipientAddress: `be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d`,
        sourceAddress: `be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a`,
        amountBaseUnits: 100000n
      }
    },
    completed: {
      raw: {
        id: `cn6-ci4c8266f8-9086-4004-8a72-7451dd077232`,
        status: { Completed: { timestampNs: equivalent.nanosecondsBigInt } },
        clientPaymentId: '4c8266f8-9086-4004-8a72-7451dd077232',
        createdAtNs: equivalent.nanosecondsBigInt,
        description: [],
        number: 6n,
        recipientAddress: `be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d`,
        amount:  100000n,
        sourceAddress: `be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a`
      },
      parsed: {
        id: `cn6-ci4c8266f8-9086-4004-8a72-7451dd077232`,
        status: { type: 'CONFIRMED', timestamp: equivalent.date },
        description: null,
        clientPaymentId: `4c8266f8-9086-4004-8a72-7451dd077232`,
        creationTimestamp: equivalent.date,
        number: '6',
        recipientAddress: `be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d`,
        sourceAddress: `be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a`,
        amountBaseUnits: 100000n
      }
    }
  };

  function isUUID(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
  };

  describe('nsToJsDate', () => {
    it('should convert nanosecond big int to correct Javascript date', () => {
      expect(utils.nsToJsDate(equivalent.nanosecondsBigInt).getTime()).toBe(equivalent.milliseconds);
    });
  });

  describe('toBaseUnits', () => {
    it('should convert 1 (int) icp to 10^8 e8s', () => {
      expect(utils.toBaseUnits(1, 8)).toBe("100000000");
    });
    it('should convert 1 (string) icp to 10^8 e8s', () => {
      expect(utils.toBaseUnits('1', 8)).toBe("100000000");
    });
    it('should convert 1 (float) icp to 10^8 e8s', () => {
      expect(utils.toBaseUnits('1.0', 8)).toBe("100000000.0");
    });
    it('should convert 1 normal unit (int) with 16 decimal places to 10^16 base units', () => {
      expect(utils.toBaseUnits(1, 16)).toBe("10000000000000000");
    });
    it('should convert one hundred million thousandths of a normal unit (0.00000000001 float) with 11 decimal places to 1 base unit (int)', () => {
      expect(parseInt(utils.toBaseUnits(0.00000000001, 11))).toEqual(1);
    });
    it('should convert one thousandth of a normal unit (0.0001 string) with 8 decimal places to 10,000 base units (int)', () => {
      expect(parseInt(utils.toBaseUnits('0.0001', 8))).toEqual(10000);
    });
    it('should convert 2 normal unit (big int) of ethereum (with 18 decimal places) to 10^18 wei', () => {
      expect(utils.toBaseUnits(2n, 18)).toEqual("2000000000000000000");
    });
    it('should convert 1.25 normal units (float) of ethereum (with 18 decimal places) to 1250000000000000000 wei', () => {
      expect(BigInt(utils.toBaseUnits(1.25, 18).split('.')[0])).toEqual(1250000000000000000n);
    });
  });

  describe('fromBaseUnits', () => {
    it('should convert 10^8 e8s (big int) to 1 icp', () => {
      expect(utils.fromBaseUnits(100000000n, 8)).toEqual("1")
    });

    it('should convert 10 base units (int) of a currency with 8 decimal places to 1E-7 normal units', () => {
      expect(utils.fromBaseUnits(10, 8)).toEqual("1E-7");
    });

    it('should convert 4 base units (big int) of a currency with 22 decimal places (big int) to 4E-22 normal units', () => {
      expect(utils.fromBaseUnits(4n, 22n)).toEqual("4E-22");
    });

    it('should convert .1 base unit (float) of a currency with 18 decimal places to 1E-19 normal units', () => {
      expect(utils.fromBaseUnits(0.1, 18)).toEqual("1E-19");
    });

    it('should convert 12345678 satoshi (string) to 0.12345678 bitcoin', () => {
      expect(utils.fromBaseUnits("12345678", 8)).toEqual("0.12345678");
    });
  
    it('should convert 10 sats to 1E-7 btc', () => {
      expect(utils.fromBaseUnits(10, 8n)).toEqual("1E-7");
    })
  });

  describe("convertExponetialIntoStringWithAllPlaceholderZeros", () => {
    it('should convert 1E-7 into .0000001', () => {
      expect(utils.convertExponetialIntoStringWithAllPlaceholderZeros("1E-7")).toEqual("0.0000001");
    });

    it('should convert 125E-3 into .00125', () => {
      expect(utils.convertExponetialIntoStringWithAllPlaceholderZeros("125E-3")).toEqual("0.00125");
    });

    it('should convert 1E-26 into 0.00000000000000000000000001', () => {
      expect(utils.convertExponetialIntoStringWithAllPlaceholderZeros("1E-26")).toEqual("0.00000000000000000000000001");
    });

    it('should return the same value if value passed is not a string', () => {
      expect(utils.convertExponetialIntoStringWithAllPlaceholderZeros(1)).toEqual(1);
    });
  });

  describe('prepareSendPaymentArgs', () => {

    const createdCount = 0n;
    const sourceAddress = 'be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a';
    const recipientAddress = 'be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d';

    const expectedArgs = {
      // Note UUID is tested separately (see below).
      clientPaymentId: '',//cie3d9ee03-10d0-4601-a23e-ea2d04e3728c',
      recipientAddress,
      description: [],
      amount: 100000000n
    };

    const expectedClientPayment = {
      // Note UUID is tested separately (see below).
      id: 'cn1-ci',//cie3d9ee03-10d0-4601-a23e-ea2d04e3728c',
      clientPaymentId: '',//cie3d9ee03-10d0-4601-a23e-ea2d04e3728c',
      status: { type: 'PENDING' },
      description: null,
      creationTimestamp: null,
      number: '1',
      recipientAddress,
      sourceAddress,
      amountBaseUnits: 100000000n
    };


    it('should create send_payments args and client payment viewmodel when there is trivial description input & amount input is in base units', () => {
      const inputs = {
        amountInput: '100000000',
        descriptionInput: "",
        recipientAddressInput: recipientAddress
      };
      const {
        payment: clientPayment,
        args
      } = utils.prepareSendPaymentArgs({
        inputs,
        decimals: 8n,
        sourceAddress,
        createdCount
      });
      // Test the created client payment id is valid UUID in the created args:
      const createdClientPaymentId_fromArgs = args.clientPaymentId;
      expect(isUUID(createdClientPaymentId_fromArgs)).toEqual(true);

      // Test the args and payment view model have the same UUID:
      expect(args.clientPaymentId).toEqual(clientPayment.clientPaymentId);

      // And args, less already proven valid clientPaymentId, are otherwise as expected: 
      args.clientPaymentId = args.clientPaymentId.replace(createdClientPaymentId_fromArgs, '');
      expect(args).toEqual(expectedArgs);

      // Ditto for payment view model, need to similarly adjust id and clientPaymentId:
      clientPayment.id = clientPayment.id.replace(createdClientPaymentId_fromArgs, '');
      clientPayment.clientPaymentId = clientPayment.clientPaymentId.replace(createdClientPaymentId_fromArgs, '');
      // Also verify there is a date instance for creation timestamp:
      expect(clientPayment.creationTimestamp).toBeInstanceOf(Date);
      clientPayment.creationTimestamp = null;
      // Less those already proven, test expected equality:
      expect(clientPayment).toStrictEqual(expectedClientPayment);
    });

    // Note this test is identical to the one above except amountInput/amount. 
    it('should create send_payments args and client payment viewmodel when there is trivial description input & amount input is in normal units', () => {
      const inputs = {
        amountInput: "1.5",
        descriptionInput: "",
        recipientAddressInput: recipientAddress
      };
      const {
        payment: clientPayment,
        args
      } = utils.prepareSendPaymentArgs({
        inputs,
        decimals: 8n,
        sourceAddress,
        createdCount
      });

      const expectedArgsNormal = expectedArgs;
      expectedArgsNormal.amount = 150000000n;

      const expectedClientPaymentNormal =  expectedClientPayment;
      expectedClientPaymentNormal.amountBaseUnits = 150000000n;

      // Test the created client payment id is valid UUID in the created args:
      const createdClientPaymentId_fromArgs = args.clientPaymentId;
      expect(isUUID(createdClientPaymentId_fromArgs)).toEqual(true);

      // Test the args and payment view model have the same UUID:
      expect(args.clientPaymentId).toEqual(clientPayment.clientPaymentId);

      // And args, less already proven valid clientPaymentId, are otherwise as expected: 
      args.clientPaymentId = args.clientPaymentId.replace(createdClientPaymentId_fromArgs, '');
      expect(args).toEqual(expectedArgs);

      // Ditto for payment view model, need to similarly adjust id and clientPaymentId:
      clientPayment.id = clientPayment.id.replace(createdClientPaymentId_fromArgs, '');
      clientPayment.clientPaymentId = clientPayment.clientPaymentId.replace(createdClientPaymentId_fromArgs, '');
      // Also verify there is a date instance for creation timestamp:
      expect(clientPayment.creationTimestamp).toBeInstanceOf(Date);
      clientPayment.creationTimestamp = null;
      // Less those already proven, test expected equality:
      expect(clientPayment).toStrictEqual(expectedClientPayment);
    });
  });

  describe('parseAccountsBalanceResponse', () => {
    it('should create account balance viewmodel from the ok result canister response', () => {
      const response = {
        ok: {
          currentBalance: 10000000000n,
          timestampNs: equivalent.nanosecondsBigInt,
          accountAddress: 'be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a'
        }
      };
      const parsed = {
        ok: {
          timestamp: equivalent.date,
          accountAddress: 'be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a',
          currentBalanceBaseUnits: 10000000000n,
        }
      }
      expect(utils.parseAccountBalanceResponse(response)).toEqual(parsed);
    });

    it('should return err msg account balance viewmodel from the err result canister response', () => {
      const response = {
        err: {
          msg: 'Intercanister balance query caught error: Canister bkyz2-fmaaa-aaaaa-qaaaq-cai is stopped'
        }
      };
      const parsed = {
        err: 'Intercanister balance query caught error: Canister bkyz2-fmaaa-aaaaa-qaaaq-cai is stopped'
      };
      expect(utils.parseAccountBalanceResponse(response)).toEqual(parsed);
    });
  });

  describe('parseAccountPaymentsResponse', () => {
    it('should create account payments viewmodel when there are no payments to parse yet', () => {
      const response = {
        payments: [],
        createdCount: 0n,
        timestampNs: equivalent.nanosecondsBigInt
      };
      const parsed = {
        ok: {
          timestamp: equivalent.date,
          payments: [],
          createdCount: 0n
        }
      }
      expect(utils.parseAccountPaymentsResponse(response)).toEqual(parsed);
    });

    it('should create account payments viewmodel when there are payments to parse', () => {
      const response = {
        payments: [
          payments.pending.raw,
          payments.completed.raw,
        ],
        createdCount: 2n,
        timestampNs: equivalent.nanosecondsBigInt
      };
      const parsed = {
        ok: {
          timestamp: equivalent.date,
          payments: [ payments.pending.parsed, payments.completed.parsed ],
          createdCount: 2n
        }
      }
      expect(utils.parseAccountPaymentsResponse(response)).toEqual(parsed);
    });
  });

  describe('parseTokenCanisterMetadataResponse', () => {
    it('should create the token canister metadata view model from the ok canister response (ie with decimals)', () => {
      const response = {
        ok: {
          metadata: [
            [
              'icrc1:logo', {
                Text: 'data:image/svg+xml;base64,alotofbase64encodedtext='
              }
            ],
            [ 'icrc1:decimals', { Nat: 8n } ],
            [ 'icrc1:fee', { Nat: 10n } ],
            [ 'icrc1:max_memo_length', { Nat: 32n } ],
            [ 'icrc1:name', { Text: 'CVC ICRC1 Mock Token' } ],
            [ 'icrc1:symbol', { Text: 'CVCMICRC1' } ],
          ],
          canisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai'
        }
      };
      const parsed = {
        ok: {
          canisterMetadata: {
            canisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai',
            logo: 'data:image/svg+xml;base64,alotofbase64encodedtext=',
            decimals: 8n,
            name: 'CVC ICRC1 Mock Token',
            symbol: 'CVCMICRC1',
            fee: 10n,
            max_memo_length: 32n
          }
        }
      }
      expect(utils.parseTokenCanisterMetadataResponse(response)).toEqual(parsed);
    });

    it('should return err msg of the token canister metadata view model when metadata exists but without decimals key value', () => {
      const response = {
        ok: {
          metadata: [
            [
               'icrc1:logo', {
                Text: 'data:image/svg+xml;base64,alotofbase64encodedtext='
              }
            ],
            [ 'icrc1:fee', { Nat: 10n } ],
            [ 'icrc1:max_memo_length', { Nat: 32n } ],
            [ 'icrc1:name', { Text: 'CVC ICRC1 Mock Token' } ],
            [ 'icrc1:symbol', { Text: 'CVCMICRC1' } ],
          ],
          canisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai'
        }
      };
      const parsed = {
        err: "ICRC1 token canister metadata call response did not contain a decimals key and value."
      }
      expect(utils.parseTokenCanisterMetadataResponse(response)).toEqual(parsed);
    });


    it('should return err msg of the token canister metadata view model when the ok response lacks a canister id', () => {
      const response = {
        ok: {
          metadata: [
            [ 'icrc1:decimals', { Nat: 8n } ],
            [ 'icrc1:name', { Text: 'CVC ICRC1 Mock Token' } ],
            [ 'icrc1:symbol', { Text: 'CVCMICRC1' } ],
          ]
        }
      };
      const error = "ICRC1 token canister metadata call response did not contain token canister id.";
      expect(utils.parseTokenCanisterMetadataResponse(response).err).toEqual(error);
    });

    it('should return err msg of the token canister metadata view model when the ok response is not in normal form (throws)', () => {
      const response = {
        ok: {
          metadata: "error prone form",
          canisterId: 'bkyz2-fmaaa-aaaaa-qaaaq-cai'
        }
      };
      const error = 'Could not transform call result into ICRC1 token canister metadata view model.';
      expect(utils.parseTokenCanisterMetadataResponse(response).err).toEqual(error);
    });
  });

  describe('parsePayment', () => {
    it('should parse a pending payment with a description', () => {
      expect(utils.parsePayment(payments.pending.raw)).toEqual(payments.pending.parsed);
    });

    it('should parse a completed payment with no description', () => {
      expect(utils.parsePayment(payments.completed.raw)).toEqual(payments.completed.parsed);
    });
  });

  describe('parseStatus', () => {
    it('should parse a pending status', () => {
      expect(utils.parseStatus({ Pending: {} })).toEqual({ type: statusEnum.PENDING })
    });

    it('should parse a complete status with timestamp', () => {
      const status = { Completed: { timestampNs: equivalent.nanosecondsBigInt } };
      expect(utils.parseStatus(status)).toEqual({ type: statusEnum.CONFIRMED, timestamp: new Date(equivalent.milliseconds) })
    });

    it('should parse a failed InvalidRecipientAddress status with timestamp', () => {
      const status = { Failed: { timestampNs: equivalent.nanosecondsBigInt, kind: { InvalidRecipientAddress: {} } } };
      expect(utils.parseStatus(status)).toEqual({ type: statusEnum.FAILED_INVALID_ADDRESS, timestamp: new Date(equivalent.milliseconds) })
    });

    it('should parse a failed ICRC1TokenCanisterTransferErr status with timestamp and transfer error literal as extra', () => {
      const status = { 
        Failed: { 
          timestampNs: equivalent.nanosecondsBigInt, 
          kind: { 
            ICRC1TokenCanisterTransferErr: { 
              InsufficientFunds: { 
                balance: 0n 
              } 
            } 
          } 
        } 
      };
      expect(utils.parseStatus(status)).toEqual({
        type: statusEnum.FAILED_TRANSFER_ERR, 
        timestamp: new Date(equivalent.milliseconds),
        extra: '{"InsufficientFunds":{"balance":"0"}}'
      });
    });

    it('should parse a failed InterCanisterCallCaughtError status with timestamp and transfer error literal as extra', () => {
      const status = { 
        Failed: { 
          timestampNs: equivalent.nanosecondsBigInt, 
          kind: { 
            InterCanisterCallCaughtError: 'Canister bkyz2-fmaaa-aaaaa-qaaaq-cai is stopped'
          } 
        } 
      }
      expect(utils.parseStatus(status)).toEqual({
        type: statusEnum.FAILED_INTERCANISTER_CALL, 
        timestamp: new Date(equivalent.milliseconds),
        extra: 'Canister bkyz2-fmaaa-aaaaa-qaaaq-cai is stopped'
      });
    });
  });
 
  describe('getTextStatusColor', () => {
    it('should get pending status color', () => {
      expect(utils.getTextStatusColor(statusEnum.PENDING)).toEqual('text-e8-sea-buckthorn');
    });
    it('should get confirmed status color when override is true', () => {
      expect(utils.getTextStatusColor(statusEnum.CONFIRMED, true)).toEqual('text-u-green-success');
    });
    it('should get confirmed status color when override is false', () => {
      expect(utils.getTextStatusColor(statusEnum.CONFIRMED)).toEqual('text-inherit');
    });
    it('should get error status color when status type is failed', () => {
      expect(utils.getTextStatusColor(statusEnum.FAILED_INVALID_ADDRESS)).toEqual('text-e8-razzmatazz');
      expect(utils.getTextStatusColor(statusEnum.FAILED_INTERCANISTER_CALL)).toEqual('text-e8-razzmatazz');
      expect(utils.getTextStatusColor(statusEnum.FAILED_TRANSFER_ERR)).toEqual('text-e8-razzmatazz');
    });
  });

  describe('getStatusMessage', () => {
    it('should get message text from pending sent payment status', () => {
      const status = { type: statusEnum.PENDING };
      expect(utils.getStatusMessage(status)).toEqual('Payment is in process');
    });
    it('should get message text from confirmed sent payment status', () => {
      const status = { type: statusEnum.CONFIRMED, timestamp: new Date(equivalent.milliseconds) };
      // Date will get formatted to system locale:
      expect(utils.getStatusMessage(status).includes(`Payment confirmed received at`)).toBe(true);
    });
    it('should get message text from failed sent payment status due to invalid recipient address address', () => {
      const status = { type: statusEnum.FAILED_INVALID_ADDRESS, timestamp: new Date(equivalent.milliseconds) };
      expect(utils.getStatusMessage(status)).toEqual(`Failed due recipient address being invalid as ICRC1 account address text`);
    });
    it('should get message text from failed sent payment status due to token canister transfer call returning err result', () => {
      const status = {
        type: statusEnum.FAILED_TRANSFER_ERR, 
        timestamp: new Date(equivalent.milliseconds),
        extra: '{"InsufficientFunds":{"balance":"0"}}'
      }
      const msg = utils.getStatusMessage(status);
      // Date will get formatted to system locale:
      expect(msg.includes(`Failed due to ICRC1 token canister transfer call returned error at`)).toBe(true);
      expect(msg.includes(`with error details: {"InsufficientFunds":{"balance":"0"}}`)).toBe(true);
    });
    it('should get message text from failed sent payment status due to failed intercanister call', () => {
      const status = {
        type: statusEnum.FAILED_INTERCANISTER_CALL, 
        timestamp: new Date(equivalent.milliseconds),
        extra: 'Canister bkyz2-fmaaa-aaaaa-qaaaq-cai is stopped'
      }
      const msg = utils.getStatusMessage(status);
      // Date will get formatted to system locale:
      expect(msg.includes(`Failed due to intercanister call error at`)).toBe(true);
      expect(msg.includes(`with error details: Canister bkyz2-fmaaa-aaaaa-qaaaq-cai is stopped`)).toBe(true);
    });
  });

  describe('getDisplayDateStrings', () => {
    it('should return a defined string type for both hour-minute and day-month-year', () => {
      const { dayMonthYear = null, hourMinute = null } = utils.getDisplayDateStrings(equivalent.date);
      expect(dayMonthYear).toBeTypeOf('string');
      expect(hourMinute).toBeTypeOf('string');
    });
  });
});

