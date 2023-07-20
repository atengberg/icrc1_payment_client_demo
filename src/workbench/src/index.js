import chalk from 'chalk';
import * as utils from "./utils/utils.js";
import {
  actorEd25,
  actorSec256,
  anonymousActor,
  anonymousPrincipal,
  getRandomActor,
  getActorByIdentity,
  getRandomIdentity,
} from "./utils/identity.js";
import { LoremIpsum } from "lorem-ipsum";
const lorem = new LoremIpsum();

const {dayMonthYear, hourMinute} = utils.getDisplayDateStrings(new Date());
console.log(dayMonthYear)


/*
async function balances() {
  const edr = await actorEd25.get_account_balance();
  console.log(`ed balance ${JSON.stringify(edr)}`)
  console.log(`ed parsed balance ${parseAccountBalanceResponse(JSON.stringify(edr))}`)
  const secr = await actorSec256.get_account_balance();
  console.log(`sec balance ${JSON.stringify(secr)}`)
  console.log(`sec parsed balance ${parseAccountBalanceResponse(JSON.stringify(secr))}`)
}

async function addresses() {
  const { accountAddress: ed25Address } = await actorEd25.get_account_address();
  const { accountAddress: sec256Address } = await actorSec256.get_account_address();
  return {
    ed25Address,
    sec256Address
  }
}

const {
  ed25Address, sec256Address
} = await addresses();


console.log(ed25Address)

async function run() {
  const decimals = 8n;
  const createdCount = 0n;
  const accountAddress = ed25Address;
  
  const inputs = {
    amountInput: "1.0",
    descriptionInput: "",
    recipientAddressInput: sec256Address
  }
  
  const {
    payment: clientPayment,
    args
  } = prepareSendPaymentArgs({
    inputs,
    decimals,
    accountAddress,
    createdCount
  })
  
  const res = await actorEd25.send_payment(args);
  console.log(chalk.red("clientPaymentclientPaymentclientPayment"));
}

await run();



*/