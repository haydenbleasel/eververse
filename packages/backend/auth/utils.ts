import { createClient } from "./server";

export const currentUser = async () => {
  const client = await createClient();
  const { data } = await client.auth.getUser();

  return data.user;
};

export const currentOrganizationId = async () => {
  const user = await currentUser();

  if (
    !user ||
    typeof user.user_metadata.organization_id !== "string" ||
    !user.user_metadata.organization_id
  ) {
    return null;
  }

  return user.user_metadata.organization_id;
};

export const getMembers = async (organizationId: string) => {
  const client = await createClient();

  if (!organizationId) {
    return [];
  }

  const users = await client.auth.admin.listUsers({
    perPage: 100_000,
  });

  const members = users.data.users.filter(
    (user) => user.user_metadata.organization_id === organizationId
  );

  return members;
};

export const currentMembers = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return [];
  }

  return getMembers(organizationId);
};
