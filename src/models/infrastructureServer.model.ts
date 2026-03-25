import type { InfrastructureServerRow } from "../repositories/infrastructureServer.repository";

export type InfrastructureServerJson = {
  id: string;
  provider: string;
  region: string | null;
  name: string;
  role: string | null;
  environment: string | null;
  notes: string | null;
  consoleUrl: string | null;
  runbookUrl: string | null;
  tags: string[];
  linkedDomainIds: string[];
  createdAt: string;
  updatedAt: string;
};

export function infrastructureServerRowToJson(row: InfrastructureServerRow): InfrastructureServerJson {
  return {
    id: row.id,
    provider: row.provider,
    region: row.region,
    name: row.name,
    role: row.role,
    environment: row.environment,
    notes: row.notes,
    consoleUrl: row.consoleUrl,
    runbookUrl: row.runbookUrl,
    tags: Array.isArray(row.tags) ? row.tags : [],
    linkedDomainIds: Array.isArray(row.linkedDomainIds) ? row.linkedDomainIds : [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
