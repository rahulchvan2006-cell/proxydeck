import type { ApiResult } from "../types/api";
import { dbFailureBody } from "../http/json";
import { infrastructureServerRowToJson } from "../models/infrastructureServer.model";
import type { InfrastructureServerInsert } from "../repositories/infrastructureServer.repository";
import {
  deleteInfrastructureServerForUser,
  findInfrastructureServerByIdForUser,
  findInfrastructureServersByUserId,
  insertInfrastructureServer,
  updateInfrastructureServerForUser,
} from "../repositories/infrastructureServer.repository";
import { findDomainsByUserId } from "../repositories/domain.repository";

const LIMITS = {
  providerMax: 64,
  nameMax: 200,
  regionMax: 128,
  roleMax: 128,
  environmentMax: 64,
  notesMax: 10000,
  urlMax: 2048,
  tagsMaxCount: 32,
  tagMaxLen: 64,
  linkedDomainIdsMax: 50,
} as const;

function unauthorized(): ApiResult {
  return { status: 401, body: { error: "Unauthorized" } };
}

function notFound(): ApiResult {
  return { status: 404, body: { error: "Not found" } };
}

function trimOrNull(v: string | null | undefined): string | null {
  if (v === undefined || v === null) return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function parseHttpsUrl(raw: unknown, field: string): { ok: true; value: string | null } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") return { ok: true, value: null };
  if (typeof raw !== "string") return { ok: false, error: `${field} must be a string or null` };
  const t = raw.trim();
  if (t === "") return { ok: true, value: null };
  if (t.length > LIMITS.urlMax) return { ok: false, error: `${field} is too long` };
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return { ok: false, error: `${field} must be a valid URL` };
  }
  if (u.protocol !== "https:") {
    return { ok: false, error: `${field} must use https` };
  }
  return { ok: true, value: t };
}

function parseTags(raw: unknown): { ok: true; value: string[] } | { ok: false; error: string } {
  if (raw === undefined || raw === null) return { ok: true, value: [] };
  if (!Array.isArray(raw)) return { ok: false, error: "tags must be an array of strings" };
  if (raw.length > LIMITS.tagsMaxCount) {
    return { ok: false, error: `At most ${LIMITS.tagsMaxCount} tags` };
  }
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") return { ok: false, error: "Each tag must be a string" };
    const t = item.trim();
    if (t === "") continue;
    if (t.length > LIMITS.tagMaxLen) {
      return { ok: false, error: `Each tag must be at most ${LIMITS.tagMaxLen} characters` };
    }
    out.push(t);
  }
  return { ok: true, value: out };
}

async function validateLinkedDomainIds(
  userId: string,
  raw: unknown
): Promise<{ ok: true; value: string[] } | { ok: false; error: string }> {
  if (raw === undefined || raw === null) return { ok: true, value: [] };
  if (!Array.isArray(raw)) return { ok: false, error: "linkedDomainIds must be an array of strings" };
  if (raw.length > LIMITS.linkedDomainIdsMax) {
    return { ok: false, error: `At most ${LIMITS.linkedDomainIdsMax} linked domains` };
  }
  const ids: string[] = [];
  for (const id of raw) {
    if (typeof id !== "string" || id.trim() === "") {
      return { ok: false, error: "Each linkedDomainId must be a non-empty string" };
    }
    ids.push(id.trim());
  }
  const unique = [...new Set(ids)];
  if (unique.length === 0) return { ok: true, value: [] };
  const domains = await findDomainsByUserId(userId);
  const allowed = new Set(domains.map((d) => d.id));
  for (const id of unique) {
    if (!allowed.has(id)) {
      return { ok: false, error: "linkedDomainIds must reference your portfolio domains only" };
    }
  }
  return { ok: true, value: unique };
}

export async function listInfrastructureServersForUser(userId: string | null): Promise<ApiResult> {
  if (!userId) return unauthorized();
  try {
    const rows = await findInfrastructureServersByUserId(userId);
    return {
      status: 200,
      body: { servers: rows.map(infrastructureServerRowToJson) },
    };
  } catch (e) {
    return dbFailureBody(e);
  }
}

export async function getInfrastructureServerForUser(
  userId: string | null,
  serverId: string
): Promise<ApiResult> {
  if (!userId) return unauthorized();
  if (!serverId) return notFound();
  try {
    const row = await findInfrastructureServerByIdForUser(serverId, userId);
    if (!row) return notFound();
    return { status: 200, body: { server: infrastructureServerRowToJson(row) } };
  } catch (e) {
    return dbFailureBody(e);
  }
}

export async function createInfrastructureServerForUser(
  userId: string | null,
  body: unknown
): Promise<ApiResult> {
  if (!userId) return unauthorized();
  if (body === null || typeof body !== "object") {
    return { status: 400, body: { error: "Expected application/json body" } };
  }
  const b = body as Record<string, unknown>;

  const providerRaw = b.provider;
  if (typeof providerRaw !== "string") {
    return { status: 400, body: { error: "provider is required and must be a string" } };
  }
  const provider = providerRaw.trim();
  if (provider.length === 0 || provider.length > LIMITS.providerMax) {
    return {
      status: 400,
      body: { error: `provider must be 1–${LIMITS.providerMax} characters` },
    };
  }

  const nameRaw = b.name;
  if (typeof nameRaw !== "string") {
    return { status: 400, body: { error: "name is required and must be a string" } };
  }
  const name = nameRaw.trim();
  if (name.length === 0 || name.length > LIMITS.nameMax) {
    return {
      status: 400,
      body: { error: `name must be 1–${LIMITS.nameMax} characters` },
    };
  }

  const region = trimOrNull(typeof b.region === "string" ? b.region : null);
  if (region && region.length > LIMITS.regionMax) {
    return { status: 400, body: { error: "region is too long" } };
  }

  const role = trimOrNull(typeof b.role === "string" ? b.role : null);
  if (role && role.length > LIMITS.roleMax) {
    return { status: 400, body: { error: "role is too long" } };
  }

  const environment = trimOrNull(typeof b.environment === "string" ? b.environment : null);
  if (environment && environment.length > LIMITS.environmentMax) {
    return { status: 400, body: { error: "environment is too long" } };
  }

  let notes: string | null = null;
  if ("notes" in b) {
    if (b.notes !== null && typeof b.notes !== "string") {
      return { status: 400, body: { error: "notes must be a string or null" } };
    }
    notes = trimOrNull(typeof b.notes === "string" ? b.notes : null);
  }
  if (notes && notes.length > LIMITS.notesMax) {
    return { status: 400, body: { error: "notes is too long" } };
  }

  const consoleParsed = parseHttpsUrl(b.consoleUrl, "consoleUrl");
  if (!consoleParsed.ok) return { status: 400, body: { error: consoleParsed.error } };

  const runbookParsed = parseHttpsUrl(b.runbookUrl, "runbookUrl");
  if (!runbookParsed.ok) return { status: 400, body: { error: runbookParsed.error } };

  const tagsParsed = parseTags(b.tags);
  if (!tagsParsed.ok) return { status: 400, body: { error: tagsParsed.error } };

  const linkedParsed = await validateLinkedDomainIds(userId, b.linkedDomainIds);
  if (!linkedParsed.ok) return { status: 400, body: { error: linkedParsed.error } };

  const id = crypto.randomUUID();
  const now = new Date();
  const insert: InfrastructureServerInsert = {
    id,
    userId,
    provider,
    region,
    name,
    role,
    environment,
    notes,
    consoleUrl: consoleParsed.value,
    runbookUrl: runbookParsed.value,
    tags: tagsParsed.value,
    linkedDomainIds: linkedParsed.value,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const row = await insertInfrastructureServer(insert);
    if (!row) return { status: 500, body: { error: "Insert failed" } };
    return { status: 201, body: { server: infrastructureServerRowToJson(row) } };
  } catch (e) {
    return dbFailureBody(e);
  }
}

export async function updateInfrastructureServerForUserRequest(
  userId: string | null,
  serverId: string,
  body: unknown
): Promise<ApiResult> {
  if (!userId) return unauthorized();
  if (!serverId) return notFound();
  if (body === null || typeof body !== "object") {
    return { status: 400, body: { error: "Expected application/json body" } };
  }
  const b = body as Record<string, unknown>;

  let existing: Awaited<ReturnType<typeof findInfrastructureServerByIdForUser>>;
  try {
    existing = await findInfrastructureServerByIdForUser(serverId, userId);
  } catch (e) {
    return dbFailureBody(e);
  }
  if (!existing) return notFound();

  let nextProvider = existing.provider;
  if ("provider" in b) {
    if (typeof b.provider !== "string") {
      return { status: 400, body: { error: "provider must be a string" } };
    }
    const p = b.provider.trim();
    if (p.length === 0 || p.length > LIMITS.providerMax) {
      return {
        status: 400,
        body: { error: `provider must be 1–${LIMITS.providerMax} characters` },
      };
    }
    nextProvider = p;
  }

  let nextName = existing.name;
  if ("name" in b) {
    if (typeof b.name !== "string") {
      return { status: 400, body: { error: "name must be a string" } };
    }
    const n = b.name.trim();
    if (n.length === 0 || n.length > LIMITS.nameMax) {
      return {
        status: 400,
        body: { error: `name must be 1–${LIMITS.nameMax} characters` },
      };
    }
    nextName = n;
  }

  let nextRegion = existing.region;
  if ("region" in b) {
    nextRegion = trimOrNull(typeof b.region === "string" ? b.region : null);
    if (nextRegion && nextRegion.length > LIMITS.regionMax) {
      return { status: 400, body: { error: "region is too long" } };
    }
  }

  let nextRole = existing.role;
  if ("role" in b) {
    nextRole = trimOrNull(typeof b.role === "string" ? b.role : null);
    if (nextRole && nextRole.length > LIMITS.roleMax) {
      return { status: 400, body: { error: "role is too long" } };
    }
  }

  let nextEnv = existing.environment;
  if ("environment" in b) {
    nextEnv = trimOrNull(typeof b.environment === "string" ? b.environment : null);
    if (nextEnv && nextEnv.length > LIMITS.environmentMax) {
      return { status: 400, body: { error: "environment is too long" } };
    }
  }

  let nextNotes = existing.notes;
  if ("notes" in b) {
    if (b.notes !== null && typeof b.notes !== "string") {
      return { status: 400, body: { error: "notes must be a string or null" } };
    }
    nextNotes = trimOrNull(typeof b.notes === "string" ? b.notes : null);
    if (nextNotes && nextNotes.length > LIMITS.notesMax) {
      return { status: 400, body: { error: "notes is too long" } };
    }
  }

  let nextConsole = existing.consoleUrl;
  if ("consoleUrl" in b) {
    const parsed = parseHttpsUrl(b.consoleUrl, "consoleUrl");
    if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
    nextConsole = parsed.value;
  }

  let nextRunbook = existing.runbookUrl;
  if ("runbookUrl" in b) {
    const parsed = parseHttpsUrl(b.runbookUrl, "runbookUrl");
    if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
    nextRunbook = parsed.value;
  }

  let nextTags = existing.tags ?? [];
  if ("tags" in b) {
    const parsed = parseTags(b.tags);
    if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
    nextTags = parsed.value;
  }

  let nextLinked = existing.linkedDomainIds ?? [];
  if ("linkedDomainIds" in b) {
    const parsed = await validateLinkedDomainIds(userId, b.linkedDomainIds);
    if (!parsed.ok) return { status: 400, body: { error: parsed.error } };
    nextLinked = parsed.value;
  }

  const now = new Date();
  try {
    const updated = await updateInfrastructureServerForUser(serverId, userId, {
      provider: nextProvider,
      name: nextName,
      region: nextRegion,
      role: nextRole,
      environment: nextEnv,
      notes: nextNotes,
      consoleUrl: nextConsole,
      runbookUrl: nextRunbook,
      tags: nextTags,
      linkedDomainIds: nextLinked,
      updatedAt: now,
    });
    if (!updated) return notFound();
    return { status: 200, body: { server: infrastructureServerRowToJson(updated) } };
  } catch (e) {
    return dbFailureBody(e);
  }
}

export async function deleteInfrastructureServerForUserRequest(
  userId: string | null,
  serverId: string
): Promise<ApiResult> {
  if (!userId) return unauthorized();
  if (!serverId) return notFound();
  try {
    const ok = await deleteInfrastructureServerForUser(serverId, userId);
    if (!ok) return notFound();
    return { status: 200, body: { ok: true } };
  } catch (e) {
    return dbFailureBody(e);
  }
}
