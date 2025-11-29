import createFetchClient from "openapi-fetch";
import type { paths } from "./types";

export const createClient = ({ accessToken }: { accessToken: string }) =>
  createFetchClient<paths>({
    baseUrl: "https://api.productboard.com",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    fetch,
  });
