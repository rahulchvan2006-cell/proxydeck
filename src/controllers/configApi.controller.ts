import { Elysia } from "elysia";
import { readJsonBody, toResponse } from "../http/json";
import {
  applyConfigBody,
  getConfigHistoryList,
  getConfigPreview,
  getCurrentConfig,
  rollbackConfigBody,
  validateConfigBody,
} from "../services/configApi.service";

export const configApiRoutes = new Elysia()
  .post("/api/config/validate", async ({ body }) =>
    toResponse(await validateConfigBody(typeof body === "string" ? JSON.parse(body) : body))
  )
  .post("/api/config/apply", async ({ body }) =>
    toResponse(await applyConfigBody(typeof body === "string" ? JSON.parse(body) : body))
  )
  .get("/api/config/preview", async () => toResponse(await getConfigPreview()))
  .get("/api/config/current", async () => toResponse(await getCurrentConfig()))
  .get("/api/config/history", async () => toResponse(await getConfigHistoryList()))
  .post("/api/config/rollback", async ({ body }) =>
    toResponse(await rollbackConfigBody(typeof body === "string" ? JSON.parse(body) : body))
  );
