"use server";

import { generateCsv } from "@/lib/csv";
import { database } from "@/lib/database";

export const exportAll = async (): Promise<
  { data: Record<string, string> } | { error: unknown }
> => {
  try {
    const [
      features,
      feedback,
      feedbackUsers,
      feedbackAnalyses,
      feedbackOrganizations,
      feedbackFeatureLinks,
      initiatives,
      initiativeMembers,
      initiativePages,
      initiativeCanvases,
      initiativeUpdates,
      initiativeFiles,
      initiativeExternalLinks,
      changelogs,
      changelogContributors,
      changelogTags,
      releases,
      products,
      groups,
      featureStatuses,
      featureConnections,
      featureRice,
      aiFeatureRice,
      featureDrivers,
      featureAssignments,
      featureAssignmentRoles,
      featureCustomFields,
      featureCustomFieldValues,
      tags,
      drivers,
      digests,
      portals,
      portalStatuses,
      portalStatusMappings,
      portalFeatures,
      portalFeatureVotes,
      portalFeatureStatusChanges,
      roadmapEvents,
      templates,
      widgets,
      widgetItems,
      apiKeys,
      githubInstallations,
      linearInstallations,
      slackInstallations,
      intercomInstallations,
      atlassianInstallations,
      installationStatusMappings,
      installationFieldMappings,
      installationStates,
    ] = await Promise.all([
      // Core entities
      database.feature.findMany({
        where: { example: false },
        include: {
          status: true,
          product: true,
          group: true,
          tags: { select: { id: true } },
          initiatives: { select: { id: true } },
        },
      }),
      database.feedback.findMany({
        where: { example: false },
        include: {
          feedbackUser: true,
          tags: { select: { id: true } },
        },
      }),
      database.feedbackUser.findMany({ where: { example: false } }),
      database.feedbackAnalysis.findMany(),
      database.feedbackOrganization.findMany({ where: { example: false } }),
      database.feedbackFeatureLink.findMany(),
      database.initiative.findMany({
        where: { example: false },
        include: { products: { select: { id: true } } },
      }),
      database.initiativeMember.findMany(),
      database.initiativePage.findMany({ where: { example: false } }),
      database.initiativeCanvas.findMany({ where: { example: false } }),
      database.initiativeUpdate.findMany(),
      database.initiativeFile.findMany(),
      database.initiativeExternalLink.findMany(),
      database.changelog.findMany({
        where: { example: false },
        include: { tags: { select: { id: true } } },
      }),
      database.changelogContributor.findMany(),
      database.changelogTag.findMany(),
      database.release.findMany({ where: { example: false } }),
      database.product.findMany({ where: { example: false } }),
      database.group.findMany({
        include: {
          product: true,
          initiatives: { select: { id: true } },
        },
      }),
      database.featureStatus.findMany({ orderBy: { order: "asc" } }),
      database.featureConnection.findMany(),
      database.featureRice.findMany(),
      database.aiFeatureRice.findMany(),
      database.featureDriver.findMany(),
      database.featureAssignment.findMany(),
      database.featureAssignmentRole.findMany(),
      database.featureCustomField.findMany(),
      database.featureCustomFieldValue.findMany(),
      database.tag.findMany(),
      database.driver.findMany(),
      database.digest.findMany(),
      database.portal.findMany(),
      database.portalStatus.findMany({ orderBy: { order: "asc" } }),
      database.portalStatusMapping.findMany(),
      database.portalFeature.findMany(),
      database.portalFeatureVote.findMany(),
      database.portalFeatureStatusChange.findMany(),
      database.roadmapEvent.findMany(),
      database.template.findMany(),
      database.widget.findMany(),
      database.widgetItem.findMany(),
      database.apiKey.findMany(),
      database.gitHubInstallation.findMany(),
      database.linearInstallation.findMany(),
      database.slackInstallation.findMany(),
      database.intercomInstallation.findMany(),
      database.atlassianInstallation.findMany(),
      database.installationStatusMapping.findMany(),
      database.installationFieldMapping.findMany(),
      database.installationState.findMany(),
    ]);

    const data: Record<string, string> = {
      // Core entities
      "features.csv": generateCsv(
        [
          "id",
          "title",
          "status",
          "product",
          "group",
          "ownerId",
          "startAt",
          "endAt",
          "source",
          "createdAt",
          "updatedAt",
        ],
        features.map((f) => [
          f.id,
          f.title,
          f.status.name,
          f.product?.name ?? "",
          f.group?.name ?? "",
          f.ownerId,
          f.startAt?.toISOString() ?? "",
          f.endAt?.toISOString() ?? "",
          f.source,
          f.createdAt.toISOString(),
          f.updatedAt.toISOString(),
        ])
      ),
      "feedback.csv": generateCsv(
        [
          "id",
          "title",
          "sentiment",
          "source",
          "userName",
          "userEmail",
          "createdAt",
        ],
        feedback.map((f) => [
          f.id,
          f.title,
          f.aiSentiment ?? "",
          f.source,
          f.feedbackUser?.name ?? "",
          f.feedbackUser?.email ?? "",
          f.createdAt.toISOString(),
        ])
      ),
      "feedback-users.csv": generateCsv(
        ["id", "name", "email", "role", "source", "createdAt", "updatedAt"],
        feedbackUsers.map((u) => [
          u.id,
          u.name,
          u.email,
          u.role ?? "",
          u.source,
          u.createdAt.toISOString(),
          u.updatedAt.toISOString(),
        ])
      ),
      "feedback-analyses.csv": generateCsv(
        [
          "id",
          "feedbackId",
          "summary",
          "outcomes",
          "painPoints",
          "recommendations",
          "createdAt",
        ],
        feedbackAnalyses.map((a) => [
          a.id,
          a.feedbackId,
          a.summary ?? "",
          a.outcomes ?? "",
          a.painPoints ?? "",
          a.recommendations ?? "",
          a.createdAt.toISOString(),
        ])
      ),
      "feedback-organizations.csv": generateCsv(
        ["id", "name", "domain", "source", "createdAt", "updatedAt"],
        feedbackOrganizations.map((o) => [
          o.id,
          o.name,
          o.domain ?? "",
          o.source,
          o.createdAt.toISOString(),
          o.updatedAt.toISOString(),
        ])
      ),
      "feedback-feature-links.csv": generateCsv(
        ["id", "feedbackId", "featureId", "creatorId", "createdAt"],
        feedbackFeatureLinks.map((l) => [
          l.id,
          l.feedbackId,
          l.featureId,
          l.creatorId ?? "",
          l.createdAt.toISOString(),
        ])
      ),
      "initiatives.csv": generateCsv(
        ["id", "title", "state", "ownerId", "emoji", "createdAt", "updatedAt"],
        initiatives.map((i) => [
          i.id,
          i.title,
          i.state,
          i.ownerId,
          i.emoji,
          i.createdAt.toISOString(),
          i.updatedAt.toISOString(),
        ])
      ),
      "initiative-members.csv": generateCsv(
        ["id", "initiativeId", "userId", "creatorId", "createdAt"],
        initiativeMembers.map((m) => [
          m.id,
          m.initiativeId,
          m.userId,
          m.creatorId,
          m.createdAt.toISOString(),
        ])
      ),
      "initiative-pages.csv": generateCsv(
        [
          "id",
          "initiativeId",
          "title",
          "default",
          "creatorId",
          "createdAt",
          "updatedAt",
        ],
        initiativePages.map((p) => [
          p.id,
          p.initiativeId,
          p.title,
          p.default,
          p.creatorId,
          p.createdAt.toISOString(),
          p.updatedAt.toISOString(),
        ])
      ),
      "initiative-canvases.csv": generateCsv(
        ["id", "initiativeId", "title", "creatorId", "createdAt", "updatedAt"],
        initiativeCanvases.map((c) => [
          c.id,
          c.initiativeId,
          c.title,
          c.creatorId,
          c.createdAt.toISOString(),
          c.updatedAt.toISOString(),
        ])
      ),
      "initiative-updates.csv": generateCsv(
        [
          "id",
          "initiativeId",
          "title",
          "creatorId",
          "sendEmail",
          "sendSlack",
          "emailSentAt",
          "slackSentAt",
          "createdAt",
        ],
        initiativeUpdates.map((u) => [
          u.id,
          u.initiativeId,
          u.title,
          u.creatorId,
          u.sendEmail,
          u.sendSlack,
          u.emailSentAt?.toISOString() ?? "",
          u.slackSentAt?.toISOString() ?? "",
          u.createdAt.toISOString(),
        ])
      ),
      "initiative-files.csv": generateCsv(
        ["id", "initiativeId", "name", "url", "creatorId", "createdAt"],
        initiativeFiles.map((f) => [
          f.id,
          f.initiativeId,
          f.name,
          f.url,
          f.creatorId,
          f.createdAt.toISOString(),
        ])
      ),
      "initiative-external-links.csv": generateCsv(
        ["id", "initiativeId", "title", "href", "creatorId", "createdAt"],
        initiativeExternalLinks.map((l) => [
          l.id,
          l.initiativeId,
          l.title,
          l.href,
          l.creatorId,
          l.createdAt.toISOString(),
        ])
      ),
      "changelogs.csv": generateCsv(
        ["id", "title", "status", "slug", "publishAt", "createdAt"],
        changelogs.map((c) => [
          c.id,
          c.title,
          c.status,
          c.slug ?? "",
          c.publishAt.toISOString(),
          c.createdAt.toISOString(),
        ])
      ),
      "changelog-contributors.csv": generateCsv(
        ["id", "changelogId", "userId", "createdAt"],
        changelogContributors.map((c) => [
          c.id,
          c.changelogId,
          c.userId,
          c.createdAt.toISOString(),
        ])
      ),
      "changelog-tags.csv": generateCsv(
        ["id", "name", "createdAt", "updatedAt"],
        changelogTags.map((t) => [
          t.id,
          t.name,
          t.createdAt.toISOString(),
          t.updatedAt.toISOString(),
        ])
      ),
      "releases.csv": generateCsv(
        [
          "id",
          "title",
          "description",
          "state",
          "startAt",
          "endAt",
          "createdAt",
        ],
        releases.map((r) => [
          r.id,
          r.title,
          r.description ?? "",
          r.state,
          r.startAt?.toISOString() ?? "",
          r.endAt?.toISOString() ?? "",
          r.createdAt.toISOString(),
        ])
      ),
      "products.csv": generateCsv(
        ["id", "name", "emoji", "ownerId", "createdAt", "updatedAt"],
        products.map((p) => [
          p.id,
          p.name,
          p.emoji,
          p.ownerId ?? "",
          p.createdAt.toISOString(),
          p.updatedAt.toISOString(),
        ])
      ),
      "groups.csv": generateCsv(
        ["id", "name", "emoji", "product", "ownerId", "createdAt", "updatedAt"],
        groups.map((g) => [
          g.id,
          g.name,
          g.emoji,
          g.product?.name ?? "",
          g.ownerId ?? "",
          g.createdAt.toISOString(),
          g.updatedAt.toISOString(),
        ])
      ),
      "feature-statuses.csv": generateCsv(
        ["id", "name", "color", "order", "complete", "createdAt", "updatedAt"],
        featureStatuses.map((s) => [
          s.id,
          s.name,
          s.color,
          s.order,
          s.complete,
          s.createdAt.toISOString(),
          s.updatedAt.toISOString(),
        ])
      ),
      "feature-connections.csv": generateCsv(
        ["id", "featureId", "type", "externalId", "href", "createdAt"],
        featureConnections.map((c) => [
          c.id,
          c.featureId,
          c.type,
          c.externalId,
          c.href,
          c.createdAt.toISOString(),
        ])
      ),
      "feature-rice.csv": generateCsv(
        [
          "id",
          "featureId",
          "reach",
          "impact",
          "confidence",
          "effort",
          "createdAt",
        ],
        featureRice.map((r) => [
          r.id,
          r.featureId,
          r.reach,
          r.impact,
          r.confidence,
          r.effort,
          r.createdAt.toISOString(),
        ])
      ),
      "ai-feature-rice.csv": generateCsv(
        [
          "id",
          "featureId",
          "reach",
          "impact",
          "confidence",
          "effort",
          "reachReason",
          "impactReason",
          "confidenceReason",
          "effortReason",
          "createdAt",
        ],
        aiFeatureRice.map((r) => [
          r.id,
          r.featureId,
          r.reach,
          r.impact,
          r.confidence,
          r.effort,
          r.reachReason,
          r.impactReason,
          r.confidenceReason,
          r.effortReason,
          r.createdAt.toISOString(),
        ])
      ),
      "feature-drivers.csv": generateCsv(
        ["id", "featureId", "driverId", "value", "createdAt"],
        featureDrivers.map((d) => [
          d.id,
          d.featureId,
          d.driverId,
          d.value,
          d.createdAt.toISOString(),
        ])
      ),
      "feature-assignments.csv": generateCsv(
        ["id", "featureId", "userId", "roleId", "createdAt"],
        featureAssignments.map((a) => [
          a.id,
          a.featureId,
          a.userId,
          a.roleId,
          a.createdAt.toISOString(),
        ])
      ),
      "feature-assignment-roles.csv": generateCsv(
        ["id", "name", "description", "createdAt", "updatedAt"],
        featureAssignmentRoles.map((r) => [
          r.id,
          r.name,
          r.description,
          r.createdAt.toISOString(),
          r.updatedAt.toISOString(),
        ])
      ),
      "feature-custom-fields.csv": generateCsv(
        ["id", "name", "description", "createdAt", "updatedAt"],
        featureCustomFields.map((f) => [
          f.id,
          f.name,
          f.description ?? "",
          f.createdAt.toISOString(),
          f.updatedAt.toISOString(),
        ])
      ),
      "feature-custom-field-values.csv": generateCsv(
        ["id", "featureId", "customFieldId", "value", "createdAt", "updatedAt"],
        featureCustomFieldValues.map((v) => [
          v.id,
          v.featureId,
          v.customFieldId,
          v.value,
          v.createdAt.toISOString(),
          v.updatedAt.toISOString(),
        ])
      ),
      "tags.csv": generateCsv(
        ["id", "name", "slug", "description", "createdAt", "updatedAt"],
        tags.map((t) => [
          t.id,
          t.name,
          t.slug,
          t.description ?? "",
          t.createdAt.toISOString(),
          t.updatedAt.toISOString(),
        ])
      ),
      "drivers.csv": generateCsv(
        ["id", "name", "description", "color", "createdAt", "updatedAt"],
        drivers.map((d) => [
          d.id,
          d.name,
          d.description,
          d.color,
          d.createdAt.toISOString(),
          d.updatedAt.toISOString(),
        ])
      ),
      "digests.csv": generateCsv(
        ["id", "text", "summary", "createdAt", "updatedAt"],
        digests.map((d) => [
          d.id,
          d.text,
          d.summary,
          d.createdAt.toISOString(),
          d.updatedAt.toISOString(),
        ])
      ),

      // Portal
      "portals.csv": generateCsv(
        [
          "id",
          "name",
          "slug",
          "enableRoadmap",
          "enableChangelog",
          "createdAt",
          "updatedAt",
        ],
        portals.map((p) => [
          p.id,
          p.name,
          p.slug,
          p.enableRoadmap,
          p.enableChangelog,
          p.createdAt.toISOString(),
          p.updatedAt.toISOString(),
        ])
      ),
      "portal-statuses.csv": generateCsv(
        ["id", "portalId", "name", "color", "order", "createdAt", "updatedAt"],
        portalStatuses.map((s) => [
          s.id,
          s.portalId,
          s.name,
          s.color,
          s.order,
          s.createdAt.toISOString(),
          s.updatedAt.toISOString(),
        ])
      ),
      "portal-status-mappings.csv": generateCsv(
        ["id", "portalId", "featureStatusId", "portalStatusId", "createdAt"],
        portalStatusMappings.map((m) => [
          m.id,
          m.portalId,
          m.featureStatusId,
          m.portalStatusId,
          m.createdAt.toISOString(),
        ])
      ),
      "portal-features.csv": generateCsv(
        [
          "id",
          "portalId",
          "featureId",
          "title",
          "creatorId",
          "createdAt",
          "updatedAt",
        ],
        portalFeatures.map((f) => [
          f.id,
          f.portalId,
          f.featureId,
          f.title,
          f.creatorId,
          f.createdAt.toISOString(),
          f.updatedAt.toISOString(),
        ])
      ),
      "portal-feature-votes.csv": generateCsv(
        ["id", "portalId", "portalFeatureId", "feedbackUserId", "createdAt"],
        portalFeatureVotes.map((v) => [
          v.id,
          v.portalId,
          v.portalFeatureId,
          v.feedbackUserId,
          v.createdAt.toISOString(),
        ])
      ),
      "portal-feature-status-changes.csv": generateCsv(
        [
          "id",
          "portalFeatureId",
          "portalStatusId",
          "userId",
          "comment",
          "createdAt",
        ],
        portalFeatureStatusChanges.map((c) => [
          c.id,
          c.portalFeatureId,
          c.portalStatusId,
          c.userId ?? "",
          c.comment ?? "",
          c.createdAt.toISOString(),
        ])
      ),

      // Misc
      "roadmap-events.csv": generateCsv(
        ["id", "text", "date", "creatorId", "createdAt", "updatedAt"],
        roadmapEvents.map((e) => [
          e.id,
          e.text,
          e.date.toISOString(),
          e.creatorId,
          e.createdAt.toISOString(),
          e.updatedAt.toISOString(),
        ])
      ),
      "templates.csv": generateCsv(
        ["id", "title", "description", "creatorId", "createdAt", "updatedAt"],
        templates.map((t) => [
          t.id,
          t.title,
          t.description ?? "",
          t.creatorId,
          t.createdAt.toISOString(),
          t.updatedAt.toISOString(),
        ])
      ),
      "widgets.csv": generateCsv(
        [
          "id",
          "enableChangelog",
          "enableFeedback",
          "enablePortal",
          "creatorId",
          "createdAt",
          "updatedAt",
        ],
        widgets.map((w) => [
          w.id,
          w.enableChangelog,
          w.enableFeedback,
          w.enablePortal,
          w.creatorId,
          w.createdAt.toISOString(),
          w.updatedAt.toISOString(),
        ])
      ),
      "widget-items.csv": generateCsv(
        [
          "id",
          "widgetId",
          "name",
          "link",
          "icon",
          "creatorId",
          "createdAt",
          "updatedAt",
        ],
        widgetItems.map((i) => [
          i.id,
          i.widgetId,
          i.name,
          i.link,
          i.icon,
          i.creatorId,
          i.createdAt.toISOString(),
          i.updatedAt.toISOString(),
        ])
      ),
      "api-keys.csv": generateCsv(
        ["id", "name", "creatorId", "createdAt", "updatedAt"],
        apiKeys.map((k) => [
          k.id,
          k.name,
          k.creatorId,
          k.createdAt.toISOString(),
          k.updatedAt.toISOString(),
        ])
      ),

      // Installations (secrets excluded)
      "github-installations.csv": generateCsv(
        ["id", "installationId", "creatorId", "createdAt"],
        githubInstallations.map((i) => [
          i.id,
          i.installationId,
          i.creatorId,
          i.createdAt.toISOString(),
        ])
      ),
      "linear-installations.csv": generateCsv(
        ["id", "creatorId", "createdAt"],
        linearInstallations.map((i) => [
          i.id,
          i.creatorId,
          i.createdAt.toISOString(),
        ])
      ),
      "slack-installations.csv": generateCsv(
        ["id", "creatorId", "createdAt"],
        slackInstallations.map((i) => [
          i.id,
          i.creatorId,
          i.createdAt.toISOString(),
        ])
      ),
      "intercom-installations.csv": generateCsv(
        ["id", "appId", "creatorId", "createdAt"],
        intercomInstallations.map((i) => [
          i.id,
          i.appId,
          i.creatorId,
          i.createdAt.toISOString(),
        ])
      ),
      "atlassian-installations.csv": generateCsv(
        ["id", "email", "siteUrl", "creatorId", "createdAt"],
        atlassianInstallations.map((i) => [
          i.id,
          i.email,
          i.siteUrl,
          i.creatorId,
          i.createdAt.toISOString(),
        ])
      ),
      "installation-status-mappings.csv": generateCsv(
        [
          "id",
          "type",
          "featureStatusId",
          "eventType",
          "eventId",
          "creatorId",
          "createdAt",
        ],
        installationStatusMappings.map((m) => [
          m.id,
          m.type,
          m.featureStatusId,
          m.eventType,
          m.eventId ?? "",
          m.creatorId,
          m.createdAt.toISOString(),
        ])
      ),
      "installation-field-mappings.csv": generateCsv(
        [
          "id",
          "type",
          "externalId",
          "internalId",
          "externalType",
          "internalType",
          "creatorId",
          "createdAt",
        ],
        installationFieldMappings.map((m) => [
          m.id,
          m.type,
          m.externalId,
          m.internalId,
          m.externalType,
          m.internalType,
          m.creatorId,
          m.createdAt.toISOString(),
        ])
      ),
      "installation-states.csv": generateCsv(
        ["id", "platform", "creatorId", "createdAt"],
        installationStates.map((s) => [
          s.id,
          s.platform,
          s.creatorId,
          s.createdAt.toISOString(),
        ])
      ),

      // Many-to-many join tables (derived from includes)
      "feature-to-tag.csv": generateCsv(
        ["featureId", "tagId"],
        features.flatMap((f) => f.tags.map((t) => [f.id, t.id]))
      ),
      "feature-to-initiative.csv": generateCsv(
        ["featureId", "initiativeId"],
        features.flatMap((f) => f.initiatives.map((i) => [f.id, i.id]))
      ),
      "feedback-to-tag.csv": generateCsv(
        ["feedbackId", "tagId"],
        feedback.flatMap((f) => f.tags.map((t) => [f.id, t.id]))
      ),
      "changelog-to-changelog-tag.csv": generateCsv(
        ["changelogId", "changelogTagId"],
        changelogs.flatMap((c) => c.tags.map((t) => [c.id, t.id]))
      ),
      "group-to-initiative.csv": generateCsv(
        ["groupId", "initiativeId"],
        groups.flatMap((g) => g.initiatives.map((i) => [g.id, i.id]))
      ),
      "initiative-to-product.csv": generateCsv(
        ["initiativeId", "productId"],
        initiatives.flatMap((i) => i.products.map((p) => [i.id, p.id]))
      ),
    };

    return { data };
  } catch (error) {
    return { error };
  }
};
