import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import { anyApi } from "convex/server";
import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as emailOtp from "../auth/emailOtp.js";
import type * as http from "../http.js";
import type * as users from "../users.js";

const fullApi: ApiFromModules<{
  "auth": typeof auth;
  "dashboard": typeof dashboard;
  "auth/emailOtp": typeof emailOtp;
  "http": typeof http;
  "users": typeof users;
}> = anyApi as any;

export const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
> = anyApi as any;

export const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
> = anyApi as any;