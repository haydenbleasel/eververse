import { getProductboardCompanies } from './lib/companies';
import { getProductboardComponents } from './lib/components';
import { getProductboardCustomFieldValues } from './lib/custom-field-value';
import { getProductboardCustomFields } from './lib/custom-fields';
import { getProductboardFeatureReleaseAssignments } from './lib/feature-release-assignments';
import { getProductboardFeatureStatuses } from './lib/feature-statuses';
import { getProductboardFeatures } from './lib/features';
import { getProductboardJiraIntegrations } from './lib/jira-integrations';
import { getProductboardJiraLinks } from './lib/jira-links';
import { getProductboardNotes } from './lib/notes';
import { getProductboardProducts } from './lib/products';
import { getProductboardReleases } from './lib/releases';
import { getProductboardUsers } from './lib/users';

export class Productboard {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  company = {
    list: async () => {
      return await getProductboardCompanies(this.apiKey);
    },
  };

  component = {
    list: async () => {
      return await getProductboardComponents(this.apiKey);
    },
  };

  customFieldValue = {
    list: async (customFieldId: string) => {
      return await getProductboardCustomFieldValues(this.apiKey, customFieldId);
    },
  };

  customField = {
    list: async () => {
      return await getProductboardCustomFields(this.apiKey);
    },
  };

  featureReleaseAssignment = {
    list: async () => {
      return await getProductboardFeatureReleaseAssignments(this.apiKey);
    },
  };

  featureStatus = {
    list: async () => {
      return await getProductboardFeatureStatuses(this.apiKey);
    },
  };

  feature = {
    list: async () => {
      return await getProductboardFeatures(this.apiKey);
    },
  };

  jiraIntegration = {
    list: async () => {
      return await getProductboardJiraIntegrations(this.apiKey);
    },
  };

  jiraLink = {
    list: async (integrationId: string) => {
      return await getProductboardJiraLinks(this.apiKey, integrationId);
    },
  };

  note = {
    list: async () => {
      return await getProductboardNotes(this.apiKey);
    },
  };

  product = {
    list: async () => {
      return await getProductboardProducts(this.apiKey);
    },
  };

  release = {
    list: async () => {
      return await getProductboardReleases(this.apiKey);
    },
  };

  user = {
    list: async () => {
      return await getProductboardUsers(this.apiKey);
    },
  };
}
