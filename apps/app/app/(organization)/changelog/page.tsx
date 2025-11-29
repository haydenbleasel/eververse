import { redirect } from "next/navigation";
import { database } from "@/lib/database";

const Changelog = async () => {
  const changelogs = await database.changelog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return redirect(`/changelog/${changelogs.at(0)?.id}`);
};

export default Changelog;
