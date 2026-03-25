import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { infrastructureServers } from "../db/schema";

export type InfrastructureServerRow = typeof infrastructureServers.$inferSelect;
export type InfrastructureServerInsert = typeof infrastructureServers.$inferInsert;

export async function findInfrastructureServersByUserId(
  userId: string
): Promise<InfrastructureServerRow[]> {
  return db
    .select()
    .from(infrastructureServers)
    .where(eq(infrastructureServers.userId, userId))
    .orderBy(asc(infrastructureServers.name));
}

export async function findInfrastructureServerByIdForUser(
  serverId: string,
  userId: string
): Promise<InfrastructureServerRow | undefined> {
  const rows = await db
    .select()
    .from(infrastructureServers)
    .where(
      and(eq(infrastructureServers.id, serverId), eq(infrastructureServers.userId, userId))
    )
    .limit(1);
  return rows[0];
}

export async function insertInfrastructureServer(
  values: InfrastructureServerInsert
): Promise<InfrastructureServerRow | undefined> {
  const [row] = await db.insert(infrastructureServers).values(values).returning();
  return row;
}

export async function updateInfrastructureServerForUser(
  serverId: string,
  userId: string,
  patch: Partial<{
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
    updatedAt: Date;
  }>
): Promise<InfrastructureServerRow | undefined> {
  const [row] = await db
    .update(infrastructureServers)
    .set(patch)
    .where(
      and(eq(infrastructureServers.id, serverId), eq(infrastructureServers.userId, userId))
    )
    .returning();
  return row;
}

export async function deleteInfrastructureServerForUser(
  serverId: string,
  userId: string
): Promise<boolean> {
  const deleted = await db
    .delete(infrastructureServers)
    .where(
      and(eq(infrastructureServers.id, serverId), eq(infrastructureServers.userId, userId))
    )
    .returning({ id: infrastructureServers.id });
  return deleted.length > 0;
}

/** Remove a domain id from all server rows for this user (when a portfolio domain is deleted). */
export async function unlinkDomainIdFromServersForUser(
  userId: string,
  domainId: string
): Promise<void> {
  const rows = await db
    .select()
    .from(infrastructureServers)
    .where(eq(infrastructureServers.userId, userId));
  const now = new Date();
  for (const row of rows) {
    const ids = Array.isArray(row.linkedDomainIds) ? row.linkedDomainIds : [];
    if (!ids.includes(domainId)) continue;
    const next = ids.filter((id) => id !== domainId);
    await db
      .update(infrastructureServers)
      .set({ linkedDomainIds: next, updatedAt: now })
      .where(eq(infrastructureServers.id, row.id));
  }
}
