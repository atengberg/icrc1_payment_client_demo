// @vitest-environment node

import { describe, expect, it } from 'vitest';
import reducer, { initReducerState } from '@/feature/canister-provider/canister-provider-reducer.js';
import { handleMessage, setUiCallback } from '@/worker/utils.js';
import { stateKeys, actionTypes, statusEnum } from '@/utils/enums.js';
import * as utils from '@/utils/utils.js';
import { Ed25519KeyIdentity } from '@dfinity/identity';

function fromHexString(hexString)  {
  return new Uint8Array((hexString.match(/.{1,2}/g) ?? []).map(byte => parseInt(byte, 16))).buffer;
}

const identity =  Ed25519KeyIdentity.fromKeyPair(
  fromHexString("52EF30BF9E412A693D644AEBE8E22DE574759291065DC392382D4E633AC0C2E9"),
  fromHexString("3771C1F078763EB5AA8561F642A82BD6F6D4F53DE06F5CE07410FC64E765427552EF30BF9E412A693D644AEBE8E22DE574759291065DC392382D4E633AC0C2E9")
);

const testIdentityAddress = "be2us-64aaa-aaaaa-qaabq-cai-mnnzrpq.4e9ece1d5903f7a012e4d6e98ec262de481149dfa156812985b6362b1795b69a";
const otherIdentityAddress = 'be2us-64aaa-aaaaa-qaabq-cai-dwuxpki.ad051cbaf8f18cdce6e4fae39791a0415182fdf25387f099f180228c08c9cb0d';

setUiCallback(args => args);

describe(`E2E Testing of the Backend Integrated with Web Woker and Reducer (same as of CanisterProviders) processing`, () => {

  // Initialization for icrc1 token canister metadata:
  it('should trigger the web worker message handler to call and parse and callback to the reducer for the icrc1 token canister metadata state', async () => {
    // To Confirm the same is being produced as integrated-frontend-backend.test.jsx
    const fr = await handleMessage({ type: actionTypes.QUERY, key: stateKeys.canisterMetadata, identity, args: { principal: 'test-principal-cache-keypart' }});
    const reducerState = reducer(initReducerState, fr[0]);
    expect(reducerState.canisterMetadata).toEqual({
      decimals: 8n,
      fee: 10n,
      name: 'CVC ICRC1 Mock Token',
      symbol: 'CVCMICRC1',
      max_memo_length: 32n,
      canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBmaWxsPSIjZjA4YzAwIiBkPSJNMTkuMDIzIDQuMDAyYTMuOTk0IDMuOTk0IDAgMCAwLS40My40NGE5LjM4OSA5LjM4OSAwIDAgMC0xLjMxLTEuNjMyYTEuODQ3IDEuODQ3IDAgMCAwLTIuNjE3IDBhOS4zOSA5LjM5IDAgMCAwLTEuMjkgMS41OTdhNC4wMDYgNC4wMDYgMCAwIDAtMy42OTYtMS4zNGE0LjAxIDQuMDEgMCAwIDAtMS42MDYuNjQ0QTEzLjgxMyAxMy44MTMgMCAwIDAgMiAxNS4xODRhMTQgMTQgMCAwIDAgMTMuMTg2IDEzLjk1M2ExLjg1MiAxLjg1MiAwIDAgMCAxLjU4My4wMDNBMTQgMTQgMCAwIDAgMzAgMTUuMTM3QTEzLjggMTMuOCAwIDAgMCAyMy44OTMgMy42OWEzLjk5MyAzLjk5MyAwIDAgMC00Ljg3LjMxM1ptNS45ODYgMjAuMzYzYS44NDcuODQ3IDAgMCAxLS43ODIuNTI2YTguNDUgOC40NSAwIDAgMS0uNzM3LS4wMzJhMi4yMjcgMi4yMjcgMCAwIDEtLjE0LS4wMTdhMy4wMDQgMy4wMDQgMCAwIDAtLjEwMy0uMDE0bC0uMS0uMDEyYTYuODM1IDYuODM1IDAgMCAxLS4zNzctLjA1YTMuMTA2IDMuMTA2IDAgMCAxLS4xNzItLjAzNmwtLjEwMi0uMDIzYTYuMDI2IDYuMDI2IDAgMCAxLS40MjctLjA5NGEyLjY5NCAyLjY5NCAwIDAgMS0uMTg5LS4wNTdhNC42NDYgNC42NDYgMCAwIDAtLjA5NS0uMDNMMjEuNyAyNC41YTYuMTY2IDYuMTY2IDAgMCAxLS4zMDctLjA5NmMtLjA2NC0uMDIzLS4xMjQtLjA0OC0uMTg0LS4wNzNsLS4xMDMtLjA0MmwtLjA4LS4wMzFjLS4wOTYtLjAzOC0uMTkyLS4wNzUtLjI4NS0uMTE3YTIuODQ1IDIuODQ1IDAgMCAxLS4xOTQtLjA5NWwtLjA4OC0uMDQ1bC0uMDk1LS4wNDdhMy43MzIgMy43MzIgMCAwIDEtLjQyOS0uMjM1bC0uMDk1LS4wNmwtLjA2My0uMDM3Yy0uMDgtLjA0OC0uMTctLjEwMi0uMjUxLS4xNTVhMy45NDQgMy45NDQgMCAwIDEtLjE3Ny0uMTI3bC0uMDg5LS4wNjVhOC40ODIgOC40ODIgMCAwIDEtMy4wMTktNC4wMDhhMy40OSAzLjQ5IDAgMCAwIDEuNTU0LS41MDFhOS40NTUgOS40NTUgMCAwIDAgNC40NDYgMS4xMDRjLjU1IDAgMS4xLS4wNDggMS42NDItLjE0MmwuMDEzLjAyMWwuMDM0LjA1NmMuMTYxLjI3OC4zMDcuNTY1LjQzNi44NTljLjAxOC4wNDIuMDMzLjA4Mi4wNS4xMjVsLjAxMS4wM2MuMTE1LjI3NS4yMTUuNTU2LjMuODQybC4wMi4wNjJsLjAyNy4wOWE4LjM3MyA4LjM3MyAwIDAgMSAuMjIyIDEuMTM1bC4wMDYuMDUzYy4wNDQuMzQyLjA2OC42ODcuMDcgMS4wMzJ2LjAwOGEuODUxLjg1MSAwIDAgMS0uMDYzLjMyM1ptLTkuMjk4LTUuMDk3YTguNDg2IDguNDg2IDAgMCAxLTMuMTA5IDQuMDc0Yy0uMDU4LjA0My0uMTE3LjA4Ny0uMTc4LjEyN2E2LjI4MyA2LjI4MyAwIDAgMS0uMzA4LjE5bC0uMDc2LjA0NmE1LjExMiA1LjExMiAwIDAgMS0uMjA4LjEyNWMtLjA3LjAzOS0uMTU0LjA4LS4yMzYuMTJsLS4wNDMuMDIxYTguMjEgOC4yMSAwIDAgMC0uMTUyLjA3N2E1Ljc3IDUuNzcgMCAwIDEtLjE5Mi4wOTVjLS4xMTYuMDUyLS4yMzUuMS0uMzU0LjE0M2wtLjA5LjAzNmE1LjIxIDUuMjEgMCAwIDEtLjIxLjA4M2MtLjA5My4wMzMtLjE4OC4wNi0uMjgyLjA4OWwtLjA5NS4wMjhsLS4xMTUuMDM2Yy0uMDYyLjAyLS4xMjMuMDQtLjE4NS4wNTZhNi42OTkgNi42OTkgMCAwIDEtLjQuMDg4bC0uMTEuMDI0Yy0uMDYzLjAxNC0uMTI2LjAyOC0uMTkuMDRjLS4xMjQuMDIxLS4yNS4wMzYtLjM3OC4wNWwtLjA5Ny4wMTJhMy4yMjQgMy4yMjQgMCAwIDAtLjEwMi4wMTNhMi40OTIgMi40OTIgMCAwIDEtLjE0Mi4wMThhOC41NDQgOC41NDQgMCAwIDEtLjczNy4wMzJhLjg1My44NTMgMCAwIDEtLjg1MS0uODVhOC40NDggOC40NDggMCAwIDEgLjAzOS0uODFjLjAwNS0uMDU3LjAxMy0uMTEzLjAyMS0uMTdsLjAxMi0uMDg0YTYuMjU4IDYuMjU4IDAgMCAxIC4xMjUtLjc0bC4wMTgtLjA4MWE4LjQ2OSA4LjQ2OSAwIDAgMSAuMzk2LTEuMjY3bC4wMTctLjA0NmMuMDIzLS4wNTkuMDQ2LS4xMTkuMDcxLS4xNzZhOC41MzggOC41MzggMCAwIDEgLjI5Mi0uNjA1YTcuOTIxIDcuOTIxIDAgMCAxIC40MzQtLjcyOWMuMDI0LS4wMzYuMDUtLjA3MS4wNzYtLjEwNmwuMDU1LS4wNzZhOC40NiA4LjQ2IDAgMCAxIDQuMDY4LTMuMDk2YTMuNDkxIDMuNDkxIDAgMCAwIDMuMjE2IDMuMjEzWm0tMi4zODYtNS43NTNhMy41IDMuNSAwIDAgMC0uNzQxIDEuNDQ2YTkuNDA4IDkuNDA4IDAgMCAwLTMuOTQzIDIuMzdhOS43MyA5LjczIDAgMCAwLTEuMDQxIDEuMjZhOC40MiA4LjQyIDAgMCAxLTMuODk1LTIuMjAxdi0uMDAzYS44NDguODQ4IDAgMCAxLS4wMDQtMS4xOTVhOC40MzQgOC40MzQgMCAwIDEgNC44Ny0yLjQwNUE4LjU4NCA4LjU4NCAwIDAgMSA5LjcgMTIuN2MxLjI2IDAgMi40OTguMjgyIDMuNjI1LjgxNVptNS4zMDEgNC41NDRhMy40OSAzLjQ5IDAgMCAwIC43NjEtMS41M2E5LjQ2NSA5LjQ2NSAwIDAgMCA0Ljg3NS0zLjU3N2E4LjQyOCA4LjQyOCAwIDAgMSAzLjk4NSAyLjIzOGEuODUuODUgMCAwIDEgLjE2OC45NjFhLjg0Ni44NDYgMCAwIDEtLjE2Ny4yMzdhOC40ODYgOC40ODYgMCAwIDEtOS42MjIgMS42NzFabS44MjYtMi41OTlhMy40OTEgMy40OTEgMCAwIDAtMy4yOS0zLjE2YTguNDg2IDguNDg2IDAgMCAxIDMuMTU5LTQuMTI5YTUuMDcgNS4wNyAwIDAgMSAuMTg1LS4xM2MuMDc3LS4wNDkuMTc1LS4xMDguMjY4LS4xNjNsLjA0NS0uMDI3bC4wODYtLjA1MmEzLjU5IDMuNTkgMCAwIDEgLjE4OS0uMTExYTUuMTY2IDUuMTY2IDAgMCAxIC4zMzQtLjE2N2wuMDgxLS4wNDJjLjA2Ny0uMDM1LjEzNC0uMDcuMjAzLS4wOTdjLjExNy0uMDUzLjIzNy0uMS4zNTctLjE0NGE0LjM4IDQuMzggMCAwIDAgLjEzOC0uMDU1Yy4wNS0uMDIuMDk4LS4wNC4xNDktLjA1OGE2LjUzIDYuNTMgMCAwIDEgLjMxLS4wOTVsLjA3OC0uMDIzbC4xLS4wMzFjLjA2LS4wMi4xMi0uMDM5LjE4Mi0uMDU0YTUuNjUgNS42NSAwIDAgMSAuMzQ0LS4wNzZsLjA3MS0uMDE0bC4wODgtLjAyYy4wNjMtLjAxNC4xMjUtLjAyOC4xODktLjA0Yy4xMjQtLjAyLjI0OS0uMDM1LjM3NC0uMDQ5bC4wOTItLjAxYTMuOTkgMy45OSAwIDAgMCAuMDk0LS4wMTNjLjA1LS4wMDcuMS0uMDE1LjE1Mi0uMDJjLjI0LS4wMi40ODMtLjAzLjcyOC0uMDNhLjg1Ljg1IDAgMCAxIC44NDguODQ3YTguNDIzIDguNDIzIDAgMCAxLS4wMzkuODEyYy0uMDA1LjA1Ni0uMDEzLjExMi0uMDIxLjE2OGE4LjUwOSA4LjUwOSAwIDAgMS0uMDk0LjYyMWMtLjAxMi4wNy0uMDI3LjEzNS0uMDQyLjIwMmwtLjAyLjA4OGE4LjY1OCA4LjY1OCAwIDAgMS0uMjEyLjc2NmE3LjQ5IDcuNDkgMCAwIDEtLjE3Mi40NjlsLS4wNDYuMTJhOS4wMjggOS4wMjggMCAwIDEtLjA1NC4xMzhhOC41MTUgOC41MTUgMCAwIDEtLjI0Ni41MDlsLS4wMzYuMDcyYTIuMDA0IDIuMDA0IDAgMCAxLS4wNTUuMTA5YTguNDEyIDguNDEyIDAgMCAxLS4zOTUuNjVhMS44NjQgMS44NjQgMCAwIDEtLjA4MS4xMWwtLjAxOS4wMjRhOC40NjcgOC40NjcgMCAwIDEtNC4wMjIgMy4xMDVabS0zLjc0NS0zLjE1NGEzLjQ5MyAzLjQ5MyAwIDAgMC0xLjU2LjUwN2E5LjQ4MiA5LjQ4MiAwIDAgMC02LjA4OC0uOTZsLS4wNDgtLjA4YTguNDAxIDguNDAxIDAgMCAxLS40NjktLjk0M2wtLjAyOC0uMDdhOC41MTQgOC41MTQgMCAwIDEtLjMxNC0uOTA0YTguNDAyIDguNDAyIDAgMCAxLS4yNDktMS4yMjRsLS4wMDYtLjA1M2E4LjQ2OCA4LjQ2OCAwIDAgMS0uMDcxLTEuMDM4YS44NDcuODQ3IDAgMCAxIC4yNDctLjYwMmEuODQ3Ljg0NyAwIDAgMSAuNjAyLS4yNDhjLjE3NiAwIC4zNTIuMDA1LjUyNi4wMTVjLjIxOC4wMTUuNDM1LjAzOC42NTEuMDdjLjAzNC4wMDUuMDY5LjAwOC4xMDMuMDEybC4wNi4wMDdhOC40NjMgOC40NjMgMCAwIDEgLjI1OS4wNDhsLjA4NC4wMTlsLjAzMy4wMDZhOC4zMDMgOC4zMDMgMCAwIDEgLjQwNS4wOWwuMDE3LjAwNGwuMDY4LjAyYS41ODIuNTgyIDAgMCAwIC4wNjguMDJsLjA1LjAxNWMuMTY0LjA0Ni4zMjcuMDkyLjQ4Ny4xNWwuMDM1LjAxNGwuMDIzLjAxYy4yLjA3Mi40LjE0OS41OS4yMzVjLjAzNi4wMTYuMDcyLjAzNS4xMDguMDU0bC4wOTIuMDQ2bC4wNzQuMDM2Yy4xMTkuMDU2LjIzNy4xMTMuMzUxLjE3NmMuMDQ4LjAyNy4wOTUuMDU2LjE0Mi4wODVsLjA4MS4wNWwuMDkzLjA1NGEzLjgyNiAzLjgyNiAwIDAgMSAuNDc1LjMxYTguNDkgOC40OSAwIDAgMSAzLjExIDQuMDY5Wm0tOS4yNDYgOC40OGE5LjY1MiA5LjY1MiAwIDAgMC0uMTk3LjU5MmE4LjUwNyA4LjUwNyAwIDAgMS0uMjIzLS4wODdhMS43MzggMS43MzggMCAwIDEtLjk1LTIuMjU4YTYuOTMgNi45MyAwIDAgMSAuMTItLjI4Yy41NzcuMzEgMS4xODcuNTYxIDEuODIuNzQ3YzAgLjAwNy0uMDA1LjAxNS0uMDEuMDIzbC0uMDAzLjAwNmE5LjIyNiA5LjIyNiAwIDAgMC0uNDU3Ljk3YTMuNTIgMy41MiAwIDAgMC0uMDcuMTk2bC0uMDMuMDlabS0xLjQwNS04LjEzYTEuNzM4IDEuNzM4IDAgMCAxIC45MjUtMi4yNjhjLjEtLjA0My4yMDItLjA4My4zMDQtLjEyMWMuMDg4LjMuMTkxLjU5Ny4zMS44ODhjLjAzOS4wOTUuMDg0LjE4NS4xMy4yNzhsLjAyNC4wNWwuMDc3LjE3MWMuMDY0LjE0My4xMjguMjg2LjIwNC40MjlhOS4zOCA5LjM4IDAgMCAwLTEuODg0Ljc4MWE4LjI4MyA4LjI4MyAwIDAgMS0uMDktLjIwN1ptMjAuMzk3LTEuOTk0Yy4wNTQtLjE1Mi4xMTMtLjMyNC4xNjUtLjQ5NGMuMDk0LjAzNS4xODguMDcxLjI4MS4xMDlhMS43MyAxLjczIDAgMCAxIC45NiAyLjI2MmMtLjA0LjA5Ny0uMDguMTkyLS4xMjMuMjg3YTkuNTEgOS41MSAwIDAgMC0xLjg5Ni0uNzY3Yy4wMTMtLjAyNC4wMjMtLjA0OC4wMzQtLjA3MmEuOTAyLjkwMiAwIDAgMSAuMDM2LS4wNzVhOS44NjMgOS44NjMgMCAwIDAgLjU0My0xLjI1Wm0xLjQ1MiA4LjI1NmExLjczMiAxLjczMiAwIDAgMS0uOTI1IDIuMjdjLS4xMDQuMDQ0LS4yMS4wODUtLjMxNS4xMjVhOS4yOTcgOS4yOTcgMCAwIDAtLjMxMi0uODk0YTMuNzczIDMuNzczIDAgMCAwLS4xMzUtLjI4OGwtLjAxOS0uMDRsLS4wNzctLjE3YTcuMjUyIDcuMjUyIDAgMCAwLS4yMDQtLjQzYTkuMzgzIDkuMzgzIDAgMCAwIDEuODk1LS43ODVjLjAzMS4wNy4wNjIuMTQuMDkyLjIxMlpNMjEuMyA1Ljc4M2MuMDQuMDk0LjA3OC4xOS4xMTUuMjg1YTkuMjEyIDkuMjEyIDAgMCAwLS44NDIuMjg5Yy0uMTEyLjA0Ni0uMjIuMDk4LS4zMjkuMTVsLS4xMTkuMDU4bC0uMTY4LjA3NWMtLjEuMDQ0LS4yMDIuMDg5LS4yOTguMTRhOS4zODYgOS4zODYgMCAwIDAtLjc4MS0xLjg1OGwuMTQ5LS4wNjVjLjIxMy0uMDkuNDQyLS4xMzUuNjczLS4xMzVhMS43MjggMS43MjggMCAwIDEgMS42IDEuMDZabS05LjAzNCAxLjA2MmMtLjEzNC0uMDc0LS4yNzMtLjEzNi0uNDEyLS4xOThsLS4xNzktLjA4MWwtLjE0LS4wNjdjLS4wNjktLjAzMy0uMTM3LS4wNjctLjIwOC0uMDk2YTguODkzIDguODkzIDAgMCAwLS44ODYtLjNhMi40MDggMi40MDggMCAwIDEtLjA2NS0uMDIxYy4wMjktLjA3Ni4wNTgtLjE1Mi4wODktLjIyN2ExLjcyNiAxLjcyNiAwIDAgMSAxLjYtMS4wODJsLjAwNS0uMDAyYy4yMjUgMCAuNDQ3LjA0My42NTUuMTI5Yy4wOTYuMDQuMTkyLjA4MS4yODcuMTI0YTkuMzg4IDkuMzg4IDAgMCAwLS43NDYgMS44MlptNy40MTcgMTcuODk4Yy4wNjUuMDM3LjEzNi4wNjguMjA2LjA5OWEzLjkgMy45IDAgMCAxIC4xMTMuMDVsLjA2NS4wMzNjLjE5Mi4wOTYuMzg0LjE5Mi41ODUuMjc0Yy4xNjEuMDY3LjMzLjEyMS40OTkuMTc1YTE5LjM5IDE5LjM5IDAgMCAxIC40MTIuMTM4bC0uMDc4LjE5OGExLjcyNyAxLjcyNyAwIDAgMS0yLjI2Mi45NTlhOC4xMyA4LjEzIDAgMCAxLS4yNzgtLjEyYTkuMzg3IDkuMzg3IDAgMCAwIC43MzgtMS44MDZabS02LjgzOSAxLjk1NmExLjczNSAxLjczNSAwIDAgMS0yLjI3Mi0uOTI0YTguNDEyIDguNDEyIDAgMCAxLS4xMTQtLjI4N2wuMDY3LS4wMjJsLjE2My0uMDU1bC4xNDMtLjA0N2MuMTYtLjA1Mi4zMi0uMTA0LjQ3NS0uMTY4Yy4xODYtLjA3NS4zNjUtLjE2NC41NDQtLjI1M2wuMTA3LS4wNTNjLjA0NC0uMDIyLjA5LS4wNDIuMTM1LS4wNjJjLjA2Mi0uMDI3LjEyMy0uMDU1LjE4My0uMDg3Yy4xOS42NTIuNDUgMS4yNzguNzcyIDEuODdjLS4wNjcuMDMtLjEzNS4wNi0uMjAzLjA4OFptMi41MjktMjMuMTgyYS44NDkuODQ5IDAgMCAxIDEuMiAwYTguNDEgOC40MSAwIDAgMSAyLjE4NSAzLjgzMmE5LjQzIDkuNDMgMCAwIDAtMi44MzQgMy4wNmE5LjQ3NCA5LjQ3NCAwIDAgMC0yLjc1OC0yLjk4MmE4LjQxIDguNDEgMCAwIDEgMi4yMDctMy45MVptMS4yMDMgMjQuNTRhLjg1Ljg1IDAgMCAxLTEuMiAwYTguNDI3IDguNDI3IDAgMCAxLTIuMi0zLjlhOS40MDcgOS40MDcgMCAwIDAgMi44LTMuMDU3YTkuNCA5LjQgMCAwIDAgMi44IDMuMDYyYTguNDE4IDguNDE4IDAgMCAxLTIuMiAzLjg5NloiLz48L3N2Zz4='
    });
    // Also confirm the rest of the state is not yet initialized (ie null):
    expect(reducerState.payments).toBeNull();
    expect(reducerState.createdCount).toBeNull();
    expect(reducerState.accountAddress).toBeNull();
    expect(reducerState.currentBalanceBaseUnits).toBeNull();
  });

  // Initialization for account state:
  it('should have the worker util handle message trigger the call and parse its response and update the reducer state for the initial account state', async () => {
    // Simulate what the CanisterProvider does when initializing the account state:
    const fr = await handleMessage({ type: actionTypes.QUERY, key: stateKeys.accountStateSync, identity, args: { principal: 'test-principal-cache-keypart' }});
    let containsAccountBalance = false, containsAccountPayments = false;
    let data1, data2;
    const inspect = ([{ type, key, payload }]) => {
      expect(type).toBe(actionTypes.VALUE);
      if (key === stateKeys.accountBalance) {
        containsAccountBalance = true;
        const { timestamp, accountAddress, currentBalanceBaseUnits } = payload;
        expect(timestamp).toBeInstanceOf(Date);
        expect(accountAddress).toBe(testIdentityAddress);
        expect(currentBalanceBaseUnits).toBe(10000000000n);
        data1 = { type, key, payload };
      } else if (key === stateKeys.accountPayments) {
        containsAccountPayments = true;
        const { timestamp, payments, createdCount } = payload;
        expect(timestamp).toBeInstanceOf(Date);
        expect(payments).toStrictEqual([]);
        expect(createdCount).toBe(0n);
        data2 = { type, key, payload };
      }  
    };
    inspect(fr[0]);
    inspect(fr[1]);
    expect(containsAccountBalance && containsAccountPayments).toBe(true);
    // Now simulate the web worker passing the parsed canister call response back to the UI (ie the CanisterProvider's useReducer):
    let reducerState = reducer(initReducerState, data1);
    reducerState = reducer(reducerState, data2);
    expect(reducerState.accountAddress).toBe(testIdentityAddress);
    expect(reducerState.currentBalanceBaseUnits).toBe(10000000000n);
    expect(reducerState.payments).toStrictEqual([]);
    expect(reducerState.createdCount).toBe(0n);
  }, 10000);

  
  // Sending a payment:
  it('should trigger the handleMessage worker util to initiate send_payment, parse the response and update the reducer state', async () => {
    // Simulate when the SendPaymentForm successfully calls back to the SendPayment page to the CanisterProvider when a new payment is to be sent.

    // First the canisterMetadata must be set (for decimals value, though this is the first thing automatically done by the frontend app):
    const fr = await handleMessage({ type: actionTypes.QUERY, key: stateKeys.canisterMetadata, identity, args: { principal: 'test-principal-cache-keypart' }});
    let reducerState = reducer(initReducerState, fr[0]);
    // Verify the decimals have been set:
    expect(reducerState.canisterMetadata.decimals).toBe(8n);

    // Also means createdCount, accountAddress and payments must be set (so set them):
    const sr = await handleMessage({ type: actionTypes.QUERY, key: stateKeys.accountStateSync, identity, args: { principal: 'test-principal-cache-keypart' }});
    const [[args1], [args2]] = sr;
    reducerState = reducer(reducerState, args1);
    reducerState = reducer(reducerState, args2);
    // Verify its updated accordingly: 
    expect(reducerState.accountAddress).toBe(testIdentityAddress);
    expect(reducerState.payments).toStrictEqual([]);
    expect(reducerState.createdCount).toBe(0n);

    // This was already tested in unit testing. 
    const {
      payment: clientPayment,
      args
    } = utils.prepareSendPaymentArgs({
      inputs: {
        amountInput: "1.5", // A decimal place means this'll be interpretated as normal units.
        descriptionInput: "This is a payment sent for testing purposes!",
        recipientAddressInput: otherIdentityAddress
      },
      decimals: reducerState.canisterMetadata.decimals,
      sourceAddress: reducerState.accountAddress,
      createdCount: reducerState.createdCount
    });

    // Might as well test the frontend state update from clientPayment (when UI is updated while send_payment call completes):
    reducerState = reducer(reducerState, {
      type: actionTypes.UPDATE, 
      key: stateKeys.payment, 
      payload: { 
        payment: clientPayment,
        fromClient: true 
      } // (Note to self, could also subtract viewmodel balance in the interim as well).
    });
    // Verify updated accordingly (only one payment since no existing payments yet): 
    expect(reducerState.payments).toStrictEqual([ clientPayment ]);
    expect(reducerState.payments[0].status.type).toBe(statusEnum.PENDING);

    // Initiate the send_payment call:
    const [spr] = await handleMessage({ type: actionTypes.UPDATE, identity, key: stateKeys.payment, args });
    // Verify returned payment view model has the same values as the client created payment:
    const { payment } = spr.payload;
    expect(payment.status.type).toBe(statusEnum.CONFIRMED);
    expect(payment.clientPaymentId).toBe(clientPayment.clientPaymentId);
    expect(payment.description).toBe(clientPayment.description);
    expect(payment.recipientAddress).toBe(clientPayment.recipientAddress);
    expect(payment.amountBaseUnits).toBe(clientPayment.amountBaseUnits);

    // Finally update the reducer state: 
    reducerState = reducer(reducerState, spr);
    // Confirm the payment was updated:
    expect(reducerState.payments[0].status.type).toBe(statusEnum.CONFIRMED);
    expect(reducerState.payments[0].id).toBe(payment.id);
    expect(reducerState.payments[0].clientPaymentId).toBe(payment.clientPaymentId);
    expect(reducerState.payments[0].clientPaymentId).toBe(clientPayment.clientPaymentId);

    // Finally double check the payment view model was updated (not duplicated):
    expect(reducerState.payments.length).toBe(1);
  });

});