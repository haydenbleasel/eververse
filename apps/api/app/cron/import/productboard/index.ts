import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';
import { migrateCompanies } from './migrate-companies';
import { migrateComponents } from './migrate-components';
import { migrateCustomFieldValues } from './migrate-custom-field-values';
import { migrateCustomFields } from './migrate-custom-fields';
import { migrateDomains } from './migrate-domains';
import { migrateFeatureReleaseAssignments } from './migrate-feature-release-assignments';
import { migrateFeatureStatuses } from './migrate-feature-statuses';
import { migrateFeatures } from './migrate-features';
import { migrateJiraConnections } from './migrate-jira-connections';
import { migrateNoteConnections } from './migrate-note-connections';
import { migrateNoteTags } from './migrate-note-tags';
import { migrateNotes } from './migrate-notes';
import { migrateProducts } from './migrate-products';
import { migrateReleases } from './migrate-releases';
import { migrateTags } from './migrate-tags';
import { migrateUsers } from './migrate-users';

export const handleProductboardImports = async (): Promise<boolean> => {
  log.info('⏬ Looking for open Productboard imports...');

  /*
   * Find all imports that have a pending job
   * But no failed jobs (if there are failed jobs, we should retry them instead of starting a new import)
   * And no running jobs (if there are running jobs, we should wait for them to finish)
   */
  const productboardImport = await database.productboardImport.findFirst({
    where: {
      jobs: {
        some: {
          status: 'PENDING',
        },
        none: {
          status: {
            in: ['FAILURE', 'RUNNING'],
          },
        },
      },
    },
    select: {
      organizationId: true,
      token: true,
      creatorId: true,
      jobs: {
        orderBy: {
          order: 'asc',
        },
        select: {
          type: true,
          id: true,
          status: true,
        },
      },
    },
  });

  if (!productboardImport) {
    log.info('⏬ No open Productboard imports found.');
    return false;
  }

  log.info('⏬ Found an open Productboard import...');

  // Get the next job to run
  const nextJob = productboardImport.jobs.find(
    (job) => job.status === 'PENDING'
  );

  if (!nextJob) {
    log.error('⏬ No job found for the import.');
    return false;
  }

  log.info(`⏬ Starting job ${nextJob.type}...`);

  // Update the job status to RUNNING
  await database.productboardImportJob.update({
    where: { id: nextJob.id },
    data: { status: 'RUNNING' },
  });

  const properties = {
    creatorId: productboardImport.creatorId,
    token: productboardImport.token,
    organizationId: productboardImport.organizationId,
  };

  // Start the import
  try {
    let count = 0;

    switch (nextJob.type) {
      case 'PRODUCTS': {
        count = await migrateProducts(properties);
        break;
      }
      case 'COMPONENTS': {
        count = await migrateComponents(properties);
        break;
      }
      case 'FEATURE_STATUSES': {
        count = await migrateFeatureStatuses(properties);
        break;
      }
      case 'FEATURES': {
        count = await migrateFeatures(properties);
        break;
      }
      case 'CUSTOM_FIELDS': {
        count = await migrateCustomFields(properties);
        break;
      }
      case 'CUSTOM_FIELD_VALUES': {
        count = await migrateCustomFieldValues(properties);
        break;
      }
      case 'COMPANIES': {
        count = await migrateCompanies(properties);
        break;
      }
      case 'DOMAINS': {
        count = await migrateDomains(properties);
        break;
      }
      case 'USERS': {
        count = await migrateUsers(properties);
        break;
      }
      case 'TAGS': {
        count = await migrateTags(properties);
        break;
      }
      case 'NOTES': {
        count = await migrateNotes(properties);
        break;
      }
      case 'NOTE_TAGS': {
        count = await migrateNoteTags(properties);
        break;
      }
      case 'RELEASES': {
        count = await migrateReleases(properties);
        break;
      }
      case 'FEATURE_RELEASE_ASSIGNMENTS': {
        count = await migrateFeatureReleaseAssignments(properties);
        break;
      }
      case 'JIRA_CONNECTIONS': {
        count = await migrateJiraConnections(properties);
        break;
      }
      case 'NOTE_CONNECTIONS': {
        count = await migrateNoteConnections(properties);
        break;
      }
      default: {
        throw new Error('Unknown job type');
      }
    }

    await database.productboardImportJob.update({
      where: { id: nextJob.id },
      data: { status: 'SUCCESS', finishedAt: new Date(), count },
    });
  } catch (error) {
    const message = parseError(error);
    await database.productboardImportJob.update({
      where: { id: nextJob.id },
      data: { status: 'FAILURE', error: message, finishedAt: new Date() },
    });
  }

  return true;
};
