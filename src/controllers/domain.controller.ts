import { Elysia } from "elysia";
import { readJsonBody, toResponse } from "../http/json";
import { getUserIdFromRequest } from "../http/sessionUser";
import {
  createDomainForUser,
  deleteDomainForUserRequest,
  getDomainForUser,
  listDomainsForUser,
  lookupDomainForUser,
  updateDomainForUserRequest,
} from "../services/domain.service";

export const domainRoutes = new Elysia().group("/api/domains", (app) =>
  app
    .get("/", async ({ request }) =>
      toResponse(await listDomainsForUser(await getUserIdFromRequest(request)))
    )
    .get("/lookup", async ({ request }) => {
      const url = new URL(request.url);
      const raw = url.searchParams.get("hostname") ?? url.searchParams.get("domain") ?? "";
      return toResponse(await lookupDomainForUser(await getUserIdFromRequest(request), raw));
    })
    .post("/", async ({ request }) =>
      toResponse(
        await createDomainForUser(await getUserIdFromRequest(request), await readJsonBody(request))
      )
    )
    .get("/:id", async ({ request, params }) =>
      toResponse(await getDomainForUser(await getUserIdFromRequest(request), params.id))
    )
    .patch("/:id", async ({ request, params }) =>
      toResponse(
        await updateDomainForUserRequest(
          await getUserIdFromRequest(request),
          params.id,
          await readJsonBody(request)
        )
      )
    )
    .delete("/:id", async ({ request, params }) =>
      toResponse(await deleteDomainForUserRequest(await getUserIdFromRequest(request), params.id))
    )
);
