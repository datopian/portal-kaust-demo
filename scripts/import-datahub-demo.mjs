import "dotenv/config";

import { DATAHUB_DEMO_MANIFEST } from "./datahub-demo-manifest.mjs";
import {
  buildFallbackDatapackage,
  buildDatapackageUrl,
  buildGroupPayloads,
  buildPackagePayload,
  filterManifestDatasets,
  findExistingResourceMatch,
  mergeResourceWithExisting,
  shouldFetchDatapackage,
} from "./datahub-importer-lib.mjs";

const DEFAULT_DMS = "https://api.cloud.portaljs.com/@datopian-research";
const ownerOrg = DATAHUB_DEMO_MANIFEST.ownerOrg;

function parseArgs(argv) {
  const args = {
    dryRun: !argv.includes("--apply"),
    selectedSlugs: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dataset" && argv[index + 1]) {
      args.selectedSlugs.push(
        ...argv[index + 1]
          .split(",")
          .map(value => value.trim())
          .filter(Boolean)
      );
      index += 1;
    }
  }

  return args;
}

function getActionBase() {
  const dms = process.env.NEXT_PUBLIC_DMS || DEFAULT_DMS;
  return `${dms.replace(/\/+$/, "")}/api/3/action`;
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText} (${url})`);
  }

  return response.json();
}

async function ckanAction(actionBase, action, payload, apiKey) {
  const response = await fetch(`${actionBase}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(
      `CKAN action ${action} failed: ${data?.error?.message || data?.error || response.statusText}`
    );
  }

  return data.result;
}

async function ckanGet(actionBase, action, query) {
  const url = new URL(`${actionBase}/${action}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return fetchJson(url.toString());
}

async function ensureGroup(actionBase, apiKey, groupPayload, dryRun) {
  if (dryRun) {
    console.log(`[dry-run] ensure group ${groupPayload.name}`);
    return;
  }

  const existing = await ckanGet(actionBase, "group_show", { id: groupPayload.name }).catch(
    () => null
  );

  if (existing?.success) {
    await ckanAction(
      actionBase,
      "group_update",
      {
        ...existing.result,
        ...groupPayload,
        id: existing.result.id,
      },
      apiKey
    );
    console.log(`group updated: ${groupPayload.name}`);
    return;
  }

  await ckanAction(actionBase, "group_create", groupPayload, apiKey);
  console.log(`group created: ${groupPayload.name}`);
}

async function upsertPackage(actionBase, apiKey, packagePayload, dryRun) {
  if (dryRun) {
    console.log(
      `[dry-run] upsert dataset ${packagePayload.name} with ${packagePayload.resources.length} resources`
    );
    return { result: { id: packagePayload.name, resources: [] } };
  }

  const existing = await ckanGet(actionBase, "package_show", { id: packagePayload.name }).catch(
    () => null
  );

  const { resources, ...packageFields } = packagePayload;

  if (existing?.success) {
    const updated = await ckanAction(
      actionBase,
      "package_update",
      {
        ...existing.result,
        ...packageFields,
        id: existing.result.id,
      },
      apiKey
    );
    console.log(`dataset updated: ${packagePayload.name}`);
    return { result: updated, desiredResources: resources };
  }

  const created = await ckanAction(actionBase, "package_create", packageFields, apiKey);
  console.log(`dataset created: ${packagePayload.name}`);
  return { result: created, desiredResources: resources };
}

async function upsertResources(actionBase, apiKey, ckanPackage, desiredResources = [], dryRun) {
  for (const resource of desiredResources) {
    if (dryRun) {
      console.log(`[dry-run]   resource ${resource.name} -> ${resource.url}`);
      continue;
    }

    const existingResource = findExistingResourceMatch(ckanPackage.resources, resource);
    const payload = mergeResourceWithExisting(
      {
        ...resource,
        package_id: ckanPackage.id,
      },
      existingResource
    );

    if (existingResource?.id) {
      await ckanAction(actionBase, "resource_update", payload, apiKey);
      console.log(`  resource updated: ${resource.name}`);
    } else {
      await ckanAction(actionBase, "resource_create", payload, apiKey);
      console.log(`  resource created: ${resource.name}`);
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const actionBase = getActionBase();
  const apiKey = process.env.CKAN_API_KEY || "";

  if (!args.dryRun && !apiKey) {
    throw new Error("CKAN_API_KEY is required when using --apply");
  }

  const datasets = filterManifestDatasets(DATAHUB_DEMO_MANIFEST, args.selectedSlugs);
  const groupPayloads = buildGroupPayloads(DATAHUB_DEMO_MANIFEST);

  console.log(
    `${args.dryRun ? "Dry run" : "Applying"} import for ${datasets.length} datasets into ${ownerOrg}`
  );

  for (const groupPayload of groupPayloads) {
    await ensureGroup(actionBase, apiKey, groupPayload, args.dryRun);
  }

  for (const dataset of datasets) {
    const datasetWithDefaults = {
      ...DATAHUB_DEMO_MANIFEST.defaults,
      ...dataset,
    };
    let datapackage;

    if (shouldFetchDatapackage(datasetWithDefaults)) {
      const datapackageUrl = buildDatapackageUrl(dataset.sourceUrl);
      try {
        datapackage = await fetchJson(datapackageUrl);
      } catch (error) {
        if (!args.dryRun) {
          throw error;
        }
        console.warn(
          `[dry-run] warning: could not fetch ${datapackageUrl}; continuing with manifest metadata only`
        );
        datapackage = buildFallbackDatapackage(datasetWithDefaults);
      }
    } else {
      datapackage = buildFallbackDatapackage(datasetWithDefaults);
    }

    const packagePayload = buildPackagePayload({
      ownerOrg,
      dataset: datasetWithDefaults,
      datapackage,
    });

    const upserted = await upsertPackage(actionBase, apiKey, packagePayload, args.dryRun);
    await upsertResources(
      actionBase,
      apiKey,
      upserted.result,
      packagePayload.resources,
      args.dryRun
    );
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
