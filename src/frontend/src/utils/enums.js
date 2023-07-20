const statusEnum = {};
statusEnum['PENDING'] = 'PENDING';
statusEnum['CONFIRMED'] = 'CONFIRMED';
statusEnum['FAILED_INVALID_ADDRESS'] = 'FAILED_INVALID_ADDRESS';
statusEnum['FAILED_INTERCANISTER_CALL'] = 'FAILED_INTERCANISTER_CALL';
statusEnum['FAILED_TRANSFER_ERR'] = 'FAILED_TRANSFER_ERR';
Object.freeze(statusEnum);

const stateKeys = {};
stateKeys['canisterMetadata'] = 'canisterMetadata';
stateKeys['accountStateSync'] = 'accountStateSync';
stateKeys['accountBalance'] = 'accountBalance';
stateKeys['accountPayments'] = 'accountPayments';
stateKeys['payment'] = 'payment';
Object.freeze(stateKeys);

const actionTypes = {};
actionTypes['QUERY'] = 'QUERY';
actionTypes['UPDATE'] = 'UPDATE';
actionTypes['ERROR'] = 'ERROR';
actionTypes['VALUE'] = 'VALUE';
actionTypes['INITIALIZED'] = 'INITIALIZED';
actionTypes['RESET'] = 'RESET';
Object.freeze(actionTypes);

const icrc1MDTypes = {};
icrc1MDTypes['fee'] = 'fee';
icrc1MDTypes['decimals'] = 'decimals';
icrc1MDTypes['symbol'] = 'symbol';
icrc1MDTypes['name'] = 'name';
icrc1MDTypes['logo'] = 'logo';
icrc1MDTypes['canisterid'] = 'canisterid';
Object.freeze(icrc1MDTypes);

const pagesEnum = {};
pagesEnum['LANDING'] = 'landing';
pagesEnum['HOME'] = 'home';
pagesEnum['PAYMENTS'] = 'payments';
pagesEnum['DETAILS'] = 'details';
pagesEnum['SEND'] = 'send';
Object.freeze(pagesEnum);

export { statusEnum, stateKeys, actionTypes, icrc1MDTypes, pagesEnum };