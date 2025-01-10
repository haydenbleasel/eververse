import { database } from '@repo/backend/database';
import { parseError } from '@repo/lib/parse-error';
import { log } from '@repo/observability/log';
import { migrateBoards } from './migrate-boards';
import { migrateCategories } from './migrate-categories';
import { migrateChangelogs } from './migrate-changelogs';
import { migrateComments } from './migrate-comments';
import { migrateCompanies } from './migrate-companies';
import { migratePosts } from './migrate-posts';
import { migrateStatusChanges } from './migrate-status-changes';
import { migrateStatuses } from './migrate-statuses';
import { migrateTags } from './migrate-tags';
import { migrateUsers } from './migrate-users';
import { migrateVotes } from './migrate-votes';

export const handleCannyImports = async (): Promise<boolean> => {
  log.info('⏬ Looking for open Canny imports...');

  /*
   * Find all imports that have a pending job
   * But no failed jobs (if there are failed jobs, we should retry them instead of starting a new import)
   * And no running jobs (if there are running jobs, we should wait for them to finish)
   */
  const cannyImport = await database.cannyImport.findFirst({
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

  if (!cannyImport) {
    log.info('⏬ No open Canny imports found.');
    return false;
  }

  log.info('⏬ Found an open Canny import...');

  // Get the next job to run
  const nextJob = cannyImport.jobs.find((job) => job.status === 'PENDING');

  if (!nextJob) {
    log.error('⏬ No job found for the import.');
    return false;
  }

  log.info(`⏬ Starting job ${nextJob.type}...`);

  // Update the job status to RUNNING
  await database.cannyImportJob.update({
    where: { id: nextJob.id },
    data: { status: 'RUNNING' },
  });

  const properties = {
    creatorId: cannyImport.creatorId,
    token: cannyImport.token,
    organizationId: cannyImport.organizationId,
  };

  // Start the import
  try {
    let count = 0;

    switch (nextJob.type) {
      case 'STATUSES': {
        count = await migrateStatuses(properties);
        break;
      }
      case 'BOARDS': {
        count = await migrateBoards(properties);
        break;
      }
      case 'CATEGORIES': {
        count = await migrateCategories(properties);
        break;
      }
      case 'TAGS': {
        count = await migrateTags(properties);
        break;
      }
      case 'COMPANIES': {
        count = await migrateCompanies(properties);
        break;
      }
      case 'USERS': {
        count = await migrateUsers(properties);
        break;
      }
      case 'POSTS': {
        count = await migratePosts(properties);
        break;
      }
      case 'CHANGELOGS': {
        count = await migrateChangelogs(properties);
        break;
      }
      case 'VOTES': {
        count = await migrateVotes(properties);
        break;
      }
      case 'COMMENTS': {
        count = await migrateComments(properties);
        break;
      }
      case 'STATUS_CHANGES': {
        count = await migrateStatusChanges(properties);
        break;
      }
      default: {
        throw new Error('Unknown job type');
      }
    }

    await database.cannyImportJob.update({
      where: { id: nextJob.id },
      data: { status: 'SUCCESS', finishedAt: new Date(), count },
    });
  } catch (error) {
    const message = parseError(error);
    await database.cannyImportJob.update({
      where: { id: nextJob.id },
      data: { status: 'FAILURE', error: message, finishedAt: new Date() },
    });
  }

  return true;
};
