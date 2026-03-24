function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const LICENSE_ID_MAP = new Map([
  ["odc-pddl-1.0", "odc-pddl"],
  ["odc-pddl", "odc-pddl"],
  ["https://opendatacommons.org/licenses/pddl/1-0/", "odc-pddl"],
  ["https://www.opendefinition.org/licenses/odc-pddl", "odc-pddl"],
  ["https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode", "cc-by-nc-sa"],
  ["https://creativecommons.org/licenses/by-nc-sa/4.0/", "cc-by-nc-sa"],
  ["cc-by-nc-sa", "cc-by-nc-sa"],
]);

export function buildDatapackageUrl(sourceUrl) {
  return `${String(sourceUrl).replace(/\/+$/, "")}/_r/-/datapackage.json`;
}

export function normalizeLicenseId(value) {
  if (!value) return undefined;
  const normalized = String(value).trim().toLowerCase();
  return LICENSE_ID_MAP.get(normalized) || value;
}

export function shouldFetchDatapackage(dataset = {}) {
  return !dataset.skipDatapackageFetch;
}

export function buildFallbackDatapackage(dataset = {}) {
  return {
    name: dataset.slug,
    title: dataset.title,
    description: dataset.notes,
    sources: [{ path: dataset.sourceUrl }],
    resources: [],
  };
}

function normalizeTagPayloads(tags = []) {
  return [...new Set(tags.map(tag => slugify(tag)).filter(Boolean))].map(name => ({ name }));
}

function normalizeGroupRefs(groups = []) {
  return [...new Set(groups.map(group => slugify(group)).filter(Boolean))].map(name => ({ name }));
}

function normalizeResourceUrl(resourcePath, sourceUrl) {
  if (!resourcePath) return resourcePath;
  if (/^https?:\/\//i.test(resourcePath)) return resourcePath;
  const normalizedPath = String(resourcePath).replace(/^\/+/, "");
  return `${String(sourceUrl).replace(/\/+$/, "")}/_r/-/${normalizedPath}`;
}

function normalizeResources(resources = [], sourceUrl) {
  return resources
    .filter(resource => resource?.path)
    .map(resource => ({
      name: resource.name || resource.title || slugify(resource.path.split("/").pop() || "resource"),
      url: normalizeResourceUrl(resource.path, sourceUrl),
      format: String(resource.format || resource.mediatype || "unknown").toUpperCase(),
      mimetype: resource.mediatype || resource.mime_type || undefined,
    }));
}

export function buildGroupPayloads(manifest) {
  const seen = new Set();
  const payloads = [];

  for (const group of manifest.groups || []) {
    const name = slugify(group.name);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    payloads.push({
      name,
      title: group.name,
      display_name: group.name,
      description: group.description || "",
      image_display_url: group.image_display_url,
      image_url: group.image_display_url,
    });
  }

  return payloads;
}

export function buildPackagePayload({ ownerOrg, dataset, datapackage }) {
  const source =
    datapackage?.sources?.[0]?.path ||
    datapackage?.sources?.[0]?.web ||
    dataset.sourceUrl;
  const licenseId = normalizeLicenseId(
    dataset.license_id || datapackage?.licenses?.[0]?.name || datapackage?.license || undefined
  );
  const normalizedTags = normalizeTagPayloads(dataset.tags);
  const normalizedResources = dataset.resourceOverrides?.length
    ? dataset.resourceOverrides.map(resource => ({
        name: resource.name,
        url: resource.url,
        format: String(resource.format || "unknown").toUpperCase(),
        mimetype: resource.mimetype || resource.mime_type || undefined,
      }))
    : normalizeResources(datapackage?.resources, dataset.sourceUrl);

  return {
    name: dataset.slug || slugify(datapackage?.name || dataset.title),
    title: dataset.title || datapackage?.title || datapackage?.name,
    notes: dataset.notes || datapackage?.description || "",
    owner_org: ownerOrg,
    license_id: licenseId,
    tags: normalizedTags,
    language: dataset.language,
    version: dataset.version,
    author: dataset.author,
    author_email: dataset.author_email,
    maintainer: dataset.maintainer,
    maintainer_email: dataset.maintainer_email,
    coverage: dataset.coverage,
    rights: dataset.rights,
    conforms_to: dataset.conforms_to,
    has_version: dataset.has_version || dataset.version,
    is_version_of: dataset.is_version_of || source,
    contact_point: dataset.contact_point,
    source: dataset.source || [source],
    groups: normalizeGroupRefs(dataset.groups),
    resources: normalizedResources,
  };
}

export function filterManifestDatasets(manifest, selectedSlugs = []) {
  if (!selectedSlugs.length) return manifest.datasets;
  const allowed = new Set(selectedSlugs.map(slugify));
  return manifest.datasets.filter(dataset => allowed.has(slugify(dataset.slug)));
}

export function mergeResourceWithExisting(resource, existingResource) {
  if (!existingResource?.id) return resource;
  return {
    ...resource,
    id: existingResource.id,
    package_id: existingResource.package_id,
  };
}

export function findExistingResourceMatch(existingResources = [], nextResource) {
  return (
    existingResources.find(resource => resource.url === nextResource.url) ||
    existingResources.find(resource => resource.name === nextResource.name) ||
    null
  );
}
