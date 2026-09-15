import { createHash } from "node:crypto";

const hex64 = /^[0-9a-f]{64}$/;
const forbiddenKey = /email/i;

function fail(message) {
  throw new Error(message);
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash("sha256")
    .update(typeof value === "string" ? value : canonicalJson(value))
    .digest("hex");
}

function rejectEmailFields(value, path = "input") {
  if (Array.isArray(value))
    return value.forEach((item, index) =>
      rejectEmailFields(item, `${path}[${index}]`),
    );
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (forbiddenKey.test(key))
      fail(`${path}.${key}: email fields are forbidden`);
    rejectEmailFields(item, `${path}.${key}`);
  }
}

function nonempty(value, label) {
  if (typeof value !== "string" || !value.trim())
    fail(`${label} must be a non-empty string`);
  return value;
}

function normalizedLocal(snapshot) {
  if (snapshot?.version !== 1 || !Array.isArray(snapshot.users))
    fail("local snapshot must be version 1 with users");
  rejectEmailFields(snapshot, "local");
  const seen = new Set();
  const users = snapshot.users.map((user, index) => {
    const id = nonempty(user?.id, `local.users[${index}].id`);
    if (seen.has(id)) fail(`duplicate local user id: ${id}`);
    seen.add(id);
    if (user.role !== null && typeof user.role !== "string")
      fail(`local user ${id} role must be string or null`);
    if (
      !user.linkedRecords ||
      typeof user.linkedRecords !== "object" ||
      Array.isArray(user.linkedRecords)
    )
      fail(`local user ${id} requires linkedRecords`);
    const linkedRecords = {};
    for (const table of Object.keys(user.linkedRecords).sort()) {
      const ids = user.linkedRecords[table];
      if (
        !Array.isArray(ids) ||
        ids.some((item) => typeof item !== "string" || !item)
      )
        fail(`local user ${id} linkedRecords.${table} must contain IDs`);
      if (new Set(ids).size !== ids.length)
        fail(`local user ${id} has duplicate ${table} IDs`);
      linkedRecords[table] = [...ids].sort();
    }
    const normalized = { id, role: user.role, linkedRecords };
    if (user.linkedRecordDigests !== undefined) {
      if (
        !user.linkedRecordDigests ||
        typeof user.linkedRecordDigests !== "object" ||
        Array.isArray(user.linkedRecordDigests)
      )
        fail(`local user ${id} linkedRecordDigests must be an object`);
      const linkedRecordDigests = {};
      for (const table of Object.keys(user.linkedRecordDigests).sort()) {
        const digest = user.linkedRecordDigests[table];
        if (!hex64.test(digest))
          fail(`local user ${id} linkedRecordDigests.${table} must be SHA-256`);
        linkedRecordDigests[table] = digest;
      }
      normalized.linkedRecordDigests = linkedRecordDigests;
    }
    return normalized;
  });
  const normalized = {
    version: 1,
    users: users.sort((a, b) => a.id.localeCompare(b.id)),
  };
  if (snapshot.anonymousPollVotes !== undefined) {
    const poll = snapshot.anonymousPollVotes;
    if (
      !poll ||
      !Array.isArray(poll.ids) ||
      poll.ids.some((id) => typeof id !== "string" || !id) ||
      new Set(poll.ids).size !== poll.ids.length ||
      !hex64.test(poll.recordsDigest)
    )
      fail("local anonymousPollVotes must contain unique IDs and SHA-256");
    normalized.anonymousPollVotes = {
      ids: [...poll.ids].sort(),
      recordsDigest: poll.recordsDigest,
    };
  }
  return normalized;
}

export function buildReconciliation(localSnapshot, accountsSnapshot, mapping) {
  rejectEmailFields(accountsSnapshot, "accounts");
  rejectEmailFields(mapping, "mapping");
  const local = normalizedLocal(localSnapshot);
  if (
    accountsSnapshot?.version !== 1 ||
    !Array.isArray(accountsSnapshot.subjects)
  )
    fail("Accounts snapshot must be version 1 with subjects");
  const issuer = nonempty(accountsSnapshot.issuer, "Accounts issuer");
  const subjects = accountsSnapshot.subjects.map((subject, index) =>
    nonempty(subject, `accounts.subjects[${index}]`),
  );
  if (new Set(subjects).size !== subjects.length)
    fail("Accounts subjects must be unique");
  if (mapping?.version !== 1 || !Array.isArray(mapping.pairs))
    fail("mapping must be version 1 with pairs");
  const localById = new Map(local.users.map((user) => [user.id, user]));
  const accountSet = new Set(subjects);
  const seenLocal = new Set();
  const seenSubject = new Set();
  const rows = mapping.pairs
    .map((pair, index) => {
      const localUserId = nonempty(
        pair?.localUserId,
        `mapping.pairs[${index}].localUserId`,
      );
      const subject = nonempty(
        pair?.subject,
        `mapping.pairs[${index}].subject`,
      );
      if (!localById.has(localUserId))
        fail(`mapping references unknown local user: ${localUserId}`);
      if (!accountSet.has(subject))
        fail(`mapping references unknown Accounts subject: ${subject}`);
      if (seenLocal.has(localUserId))
        fail(`local user mapped more than once: ${localUserId}`);
      if (seenSubject.has(subject))
        fail(`Accounts subject mapped more than once: ${subject}`);
      seenLocal.add(localUserId);
      seenSubject.add(subject);
      const user = localById.get(localUserId);
      return {
        localUserId,
        issuer,
        subject,
        role: user.role,
        linkedRecordsDigest: sha256(user.linkedRecords),
      };
    })
    .sort((a, b) => a.localUserId.localeCompare(b.localUserId));
  if (seenLocal.size !== local.users.length)
    fail("every local user must have an explicit mapping before cutover");
  const core = {
    version: 1,
    issuer,
    localSnapshotDigest: sha256(local),
    accountsSubjectsDigest: sha256([...subjects].sort()),
    rows,
  };
  const mappingDigest = sha256(core);
  if (!hex64.test(mappingDigest)) fail("internal digest error");
  return { ...core, mappingDigest };
}

export function assertLocalStatePreserved(before, after, manifest) {
  const beforeNormalized = normalizedLocal(before);
  const afterNormalized = normalizedLocal(after);
  if (sha256(beforeNormalized) !== manifest.localSnapshotDigest)
    fail("pre-copy local snapshot does not match manifest");
  if (sha256(afterNormalized) !== manifest.localSnapshotDigest)
    fail(
      "local IDs, roles, or linked record ownership changed during rehearsal",
    );
  return true;
}
