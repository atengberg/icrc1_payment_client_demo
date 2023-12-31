import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Sha256 "mo:sha2/Sha256";

import ICRC1_AccountConverter "./icrc1-account-converter";
import ICRC1 "./icrc1-types";
import Types "./types";

module Utils {

  type Account = Types.Account;

  /** Decodes an ICRC1 account from text if valid, otherwise returns #InvalidAddressText. */
  func icrc1AccountFromText(textAddress : Text) : Result.Result<Account, ()> {
    switch (ICRC1_AccountConverter.fromText(textAddress)) {
      case (#ok(account)) #ok(account);
      case (#err(_)) #err;
    };
  };

  /** Converts: an ICRC1 account to text; and text, if valid, to ok result of an ICRC1 account or else the unit error. */
  public let addressConverter : {
    toText : Account -> Text;
    fromText : Text -> Result.Result<Account, ()>;
  } = {
    toText = ICRC1_AccountConverter.toText;
    fromText = icrc1AccountFromText;
  };

  /** **Computes the constant subaccount of an end-user used to create the corresponding ICRC1 account and its textual address**.
    Deposits to the address of the account of the subaccount computed from the principal `p` passed will **credit** the
    caller's spending balance who has that same principal; while payments made by the caller with that same principal
    passed as the `p` param will **debit** the account of the address of the subaccount computed. */
  public func computeUserSubaccountAccount(p : Principal) : Blob {
    // Domain separator length - domain separator - user's principal.
    Sha256.fromArray(#sha256, Array.flatten([[0x04 : Nat8], Blob.toArray(Text.encodeUtf8("user")), Blob.toArray(Principal.toBlob(p))]));
  };

  public func getAccountUserSubaccount({
    canisterId : Principal;
    user : Principal;
  }) : Types.Account {
    { owner = canisterId; subaccount = ?(computeUserSubaccountAccount(user)) };
  };
};
