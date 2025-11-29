import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database as prisma } from "@repo/backend/database";

export const database = prisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const organizationId = await currentOrganizationId();

      // Create operations don't use where clauses
      if (operation.includes("create")) {
        return query(args);
      }

      if (!organizationId) {
        throw new Error("Organization not found");
      }

      if (model !== "Organization") {
        args.where = {
          ...(args.where ?? {}),
          organizationId,
        };
      }

      return query(args);
    },
  },
});
