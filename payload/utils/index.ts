import { getPayload as getPayloadClient } from "payload";
import config from "../payload.config";

export async function getPayload() {
  return await getPayloadClient({
    config,
  });
}
