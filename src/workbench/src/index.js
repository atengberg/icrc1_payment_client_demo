// Load the environmental variables:
import initialize from "./utils/init.js";
initialize();

// Identity utils:
import {
  actorEd25,
  actorSec256,
  anonymousActor,
  anonymousPrincipal,
  getRandomActor,
  getActorByIdentity,
  getRandomIdentity,
} from "./utils/identity.js";

import chalk from 'chalk';
import * as utils from "./utils/utils.js";
import { generateIncrementedLengthICRC1EncodedAddresses } from './utils/extra.js';
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum();

generateIncrementedLengthICRC1EncodedAddresses().forEach((a, i) => console.log(`subaccount length ${i} | ${a}`))

