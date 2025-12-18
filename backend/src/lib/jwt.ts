import * as jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { env } from "../config/env";

export type AccessTokenPayload = {
  sub: string;
};

export function signAccessToken(userId: string) {
  const payload: AccessTokenPayload = { sub: userId };

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as StringValue,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}
