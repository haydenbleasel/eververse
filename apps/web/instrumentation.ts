import {
  captureRequestError,
  initializeSentry,
} from "@repo/observability/instrumentation";

export const register = initializeSentry();

export const onRequestError = captureRequestError;
