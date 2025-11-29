import { getCannyBoard, getCannyBoards } from "./lib/boards";
import {
  createCannyCategory,
  deleteCannyCategory,
  getCannyCategories,
  getCannyCategory,
} from "./lib/categories";
import { createCannyChangelog, getCannyChangelogs } from "./lib/changelog";
import {
  createCannyComment,
  deleteCannyComment,
  getCannyComment,
  getCannyComments,
} from "./lib/comments";
import {
  deleteCannyCompany,
  getCannyCompanies,
  updateCannyCompany,
} from "./lib/companies";
import { getCannyOpportunities } from "./lib/opportunities";
import {
  addTagToCannyPost,
  changeCannyPostCategory,
  changeCannyPostStatus,
  createCannyPost,
  getCannyPost,
  getCannyPosts,
  removeTagFromCannyPost,
  updateCannyPost,
} from "./lib/posts";
import { getCannyStatusChanges } from "./lib/status-change";
import { createCannyTag, getCannyTag, getCannyTags } from "./lib/tags";
import {
  createOrUpdateCannyUser,
  deleteCannyUser,
  getCannyUser,
  getCannyUsers,
  removeCannyUserFromCompany,
} from "./lib/users";
import {
  createCannyVote,
  deleteCannyVote,
  getCannyVote,
  getCannyVotes,
} from "./lib/votes";

export class Canny {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  board = {
    list: async () => await getCannyBoards(this.apiKey),
    get: async (props: Parameters<typeof getCannyBoard>[1]) =>
      await getCannyBoard(this.apiKey, props),
  };

  category = {
    list: async (limit?: number) =>
      await getCannyCategories(this.apiKey, limit),
    get: async (props: Parameters<typeof getCannyCategory>[1]) =>
      await getCannyCategory(this.apiKey, props),
    create: async (props: Parameters<typeof createCannyCategory>[1]) =>
      await createCannyCategory(this.apiKey, props),
    delete: async (props: Parameters<typeof deleteCannyCategory>[1]) =>
      await deleteCannyCategory(this.apiKey, props),
  };

  changelog = {
    list: async (limit?: number) =>
      await getCannyChangelogs(this.apiKey, limit),
    create: async (props: Parameters<typeof createCannyChangelog>[1]) =>
      await createCannyChangelog(this.apiKey, props),
  };

  comment = {
    list: async (limit?: number) => await getCannyComments(this.apiKey, limit),
    get: async (props: Parameters<typeof getCannyComment>[1]) =>
      await getCannyComment(this.apiKey, props),
    create: async (props: Parameters<typeof createCannyComment>[1]) =>
      await createCannyComment(this.apiKey, props),
    delete: async (props: Parameters<typeof deleteCannyComment>[1]) =>
      await deleteCannyComment(this.apiKey, props),
  };

  company = {
    list: async (limit?: number) => await getCannyCompanies(this.apiKey, limit),
    update: async (props: Parameters<typeof updateCannyCompany>[1]) =>
      await updateCannyCompany(this.apiKey, props),
    delete: async (props: Parameters<typeof deleteCannyCompany>[1]) =>
      await deleteCannyCompany(this.apiKey, props),
  };

  opportunity = {
    list: async (limit?: number) =>
      await getCannyOpportunities(this.apiKey, limit),
  };

  post = {
    list: async (limit?: number) => await getCannyPosts(this.apiKey, limit),
    get: async (props: Parameters<typeof getCannyPost>[1]) =>
      await getCannyPost(this.apiKey, props),
    create: async (props: Parameters<typeof createCannyPost>[1]) =>
      await createCannyPost(this.apiKey, props),
    update: async (props: Parameters<typeof updateCannyPost>[1]) =>
      await updateCannyPost(this.apiKey, props),
    category: {
      update: async (props: Parameters<typeof changeCannyPostCategory>[1]) =>
        await changeCannyPostCategory(this.apiKey, props),
    },
    status: {
      update: async (props: Parameters<typeof changeCannyPostStatus>[1]) =>
        await changeCannyPostStatus(this.apiKey, props),
    },
    tag: {
      add: async (props: Parameters<typeof addTagToCannyPost>[1]) =>
        await addTagToCannyPost(this.apiKey, props),
      delete: async (props: Parameters<typeof removeTagFromCannyPost>[1]) =>
        await removeTagFromCannyPost(this.apiKey, props),
    },
  };

  statusChange = {
    list: async (props?: Parameters<typeof getCannyStatusChanges>[1]) =>
      await getCannyStatusChanges(this.apiKey, props ?? {}),
  };

  tag = {
    list: async (limit?: number) => await getCannyTags(this.apiKey, limit),
    get: async (props: Parameters<typeof getCannyTag>[1]) =>
      await getCannyTag(this.apiKey, props),
    create: async (props: Parameters<typeof createCannyTag>[1]) =>
      await createCannyTag(this.apiKey, props),
  };

  user = {
    list: async (limit?: number) => await getCannyUsers(this.apiKey, limit),
    get: async (props: Parameters<typeof getCannyUser>[1]) =>
      await getCannyUser(this.apiKey, props),
    upsert: async (props: Parameters<typeof createOrUpdateCannyUser>[1]) =>
      await createOrUpdateCannyUser(this.apiKey, props),
    delete: async (props: Parameters<typeof deleteCannyUser>[1]) =>
      await deleteCannyUser(this.apiKey, props),
    company: {
      remove: async (props: Parameters<typeof removeCannyUserFromCompany>[1]) =>
        await removeCannyUserFromCompany(this.apiKey, props),
    },
  };

  vote = {
    list: async (limit?: number) => await getCannyVotes(this.apiKey, limit),
    get: async (props: Parameters<typeof getCannyVote>[1]) =>
      await getCannyVote(this.apiKey, props),
    create: async (props: Parameters<typeof createCannyVote>[1]) =>
      await createCannyVote(this.apiKey, props),
    delete: async (props: Parameters<typeof deleteCannyVote>[1]) =>
      await deleteCannyVote(this.apiKey, props),
  };
}
