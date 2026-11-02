import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createServer } from "vite";

const root = process.cwd();
const servers = new Set();
let restoreBrowser;

function installBrowser(pathname = "/", consentValue = null) {
  const keys = ["window", "navigator", "localStorage", "sessionStorage", "Event"];
  const previous = new Map(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const localValues = new Map();
  const sessionValues = new Map();
  const makeStorage = (values) => ({
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  });
  const events = [];
  const windowMock = {
    location: { pathname },
    dispatchEvent: (event) => events.push(event.type),
  };
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: windowMock },
    navigator: {
      configurable: true,
      value: { doNotTrack: null, globalPrivacyControl: false, userAgent: "Test" },
    },
    localStorage: { configurable: true, value: makeStorage(localValues) },
    sessionStorage: { configurable: true, value: makeStorage(sessionValues) },
    Event: {
      configurable: true,
      value: class TestEvent {
        constructor(type) {
          this.type = type;
        }
      },
    },
  });
  if (consentValue !== null) localValues.set("asbesoc-analytics-consent", consentValue);
  restoreBrowser = () => {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    restoreBrowser = undefined;
  };
  return { localValues, sessionValues, events };
}

async function loadHarness({ enabled = true, pathname = "/", consent = null } = {}) {
  const browser = installBrowser(pathname, consent);
  globalThis.__asbesocAnalyticsTest = {
    analyticsLoads: 0,
    analyticsCalls: [],
    applicationCalls: [],
  };

  const virtualModules = {
    "\0asbesoc-analytics-client-test": `
      globalThis.__asbesocAnalyticsTest.analyticsLoads += 1;
      export async function trackWebsiteEvent(...args) {
        globalThis.__asbesocAnalyticsTest.analyticsCalls.push(args);
      }
    `,
    "\0asbesoc-firestore-test": `
      export const addDoc = async () => undefined;
      export const collection = () => undefined;
      export const serverTimestamp = () => undefined;
    `,
    "\0asbesoc-firebase-config-test": "export const db = {};",
    "\0asbesoc-membership-test": `
      export async function createApplication(data) {
        globalThis.__asbesocAnalyticsTest.applicationCalls.push(data);
        return globalThis.__asbesocAnalyticsTest.createApplication(data);
      }
    `,
    "\0asbesoc-submission-analytics-test": `
      export async function trackWebsiteEvent(...args) {
        globalThis.__asbesocAnalyticsTest.submissionEvents ??= [];
        globalThis.__asbesocAnalyticsTest.submissionEvents.push(args);
        globalThis.__asbesocAnalyticsTest.trackSubmissionEvent?.(...args);
      }
    `,
  };

  const plugin = {
    name: "asbesoc-analytics-client-test-mocks",
    enforce: "pre",
    resolveId(source, importer) {
      const normalizedImporter = importer?.replaceAll("\\", "/") ?? "";
      if (
        normalizedImporter.endsWith("/src/firebase/analyticsEvents.ts") &&
        source === "./analytics"
      ) {
        return "\0asbesoc-analytics-client-test";
      }
      if (normalizedImporter.endsWith("/src/firebase/submissions.ts")) {
        if (source === "firebase/firestore") return "\0asbesoc-firestore-test";
        if (source === "./firebaseConfig") return "\0asbesoc-firebase-config-test";
        if (source === "./membership") return "\0asbesoc-membership-test";
        if (source === "./analyticsEvents") {
          return "\0asbesoc-submission-analytics-test";
        }
      }
      return null;
    },
    load(id) {
      return virtualModules[id] ?? null;
    },
    transform(code, id) {
      if (id.replaceAll("\\", "/").endsWith("/src/firebase/analyticsConsent.ts")) {
        return code.replace(
          "import.meta.env.VITE_WEBSITE_ANALYTICS_ENABLED",
          JSON.stringify(enabled ? "true" : "false"),
        );
      }
      return null;
    },
  };

  const server = await createServer({
    configFile: false,
    root,
    plugins: [plugin],
    logLevel: "silent",
    server: { middlewareMode: true },
    appType: "custom",
  });
  servers.add(server);

  return {
    ...browser,
    state: globalThis.__asbesocAnalyticsTest,
    load: (entry) => server.ssrLoadModule(entry),
  };
}

afterEach(async () => {
  await Promise.all([...servers].map((server) => server.close()));
  servers.clear();
  restoreBrowser?.();
  delete globalThis.__asbesocAnalyticsTest;
});

test("disabled analytics does not initialize or send events", async () => {
  const harness = await loadHarness({ enabled: false, consent: "accepted" });
  const { trackWebsiteEvent } = await harness.load(
    "/src/firebase/analyticsEvents.ts",
  );

  await trackWebsiteEvent("page", "/");

  assert.equal(harness.state.analyticsLoads, 0);
  assert.deepEqual(harness.state.analyticsCalls, []);
});

test("analytics client stays unloaded until accepted consent and an event", async () => {
  const harness = await loadHarness({ enabled: true });
  const events = await harness.load("/src/firebase/analyticsEvents.ts");

  assert.equal(harness.state.analyticsLoads, 0);
  await events.trackWebsiteEvent("page", "/");
  assert.equal(harness.state.analyticsLoads, 0);

  const consent = await harness.load("/src/firebase/analyticsConsent.ts");
  consent.setAnalyticsConsent("accepted");
  assert.deepEqual(harness.events, ["asbesoc-consent"]);
  assert.equal(harness.state.analyticsLoads, 0);

  await events.trackWebsiteEvent("page", "/");
  assert.equal(harness.state.analyticsLoads, 1);
  assert.deepEqual(harness.state.analyticsCalls, [["page", "/", ""]]);
});

test("denial and withdrawal clear identifiers and stop later collection", async () => {
  const harness = await loadHarness({ enabled: true, consent: "accepted" });
  harness.localValues.set("asbesoc-visitor", "fixture-visitor");
  harness.sessionValues.set("asbesoc-session", "fixture-session");
  const events = await harness.load("/src/firebase/analyticsEvents.ts");
  const consent = await harness.load("/src/firebase/analyticsConsent.ts");

  await events.trackWebsiteEvent("page", "/");
  assert.equal(harness.state.analyticsCalls.length, 1);

  consent.setAnalyticsConsent("declined");
  assert.equal(harness.localValues.has("asbesoc-visitor"), false);
  assert.equal(harness.sessionValues.has("asbesoc-session"), false);
  assert.deepEqual(harness.events, ["asbesoc-consent"]);
  await events.trackWebsiteEvent("page", "/about");
  assert.equal(harness.state.analyticsLoads, 1);
  assert.equal(harness.state.analyticsCalls.length, 1);
});

test("a previously denied visitor does not load analytics", async () => {
  const harness = await loadHarness({ enabled: true, consent: "declined" });
  const { trackWebsiteEvent } = await harness.load(
    "/src/firebase/analyticsEvents.ts",
  );

  await trackWebsiteEvent("page", "/");

  assert.equal(harness.state.analyticsLoads, 0);
  assert.deepEqual(harness.state.analyticsCalls, []);
});

for (const [label, privacyValue] of [
  ["Do Not Track", { doNotTrack: "1", globalPrivacyControl: false }],
  ["Global Privacy Control", { doNotTrack: null, globalPrivacyControl: true }],
]) {
  test(`${label} prevents deferred analytics loading`, async () => {
    const harness = await loadHarness({ enabled: true, consent: "accepted" });
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { ...globalThis.navigator, ...privacyValue },
    });
    const { trackWebsiteEvent } = await harness.load(
      "/src/firebase/analyticsEvents.ts",
    );

    await trackWebsiteEvent("page", "/");

    assert.equal(harness.state.analyticsLoads, 0);
    assert.deepEqual(harness.state.analyticsCalls, []);
  });
}

test("admin routes do not initialize or send analytics", async () => {
  const harness = await loadHarness({
    enabled: true,
    pathname: "/admin/analytics",
    consent: "accepted",
  });
  const { trackWebsiteEvent } = await harness.load(
    "/src/firebase/analyticsEvents.ts",
  );

  await trackWebsiteEvent("page", "/admin/analytics");

  assert.equal(harness.state.analyticsLoads, 0);
  assert.deepEqual(harness.state.analyticsCalls, []);
});

test("malformed stored visitor and session identifiers are replaced so collection can continue", async () => {
  const harness = await loadHarness({ enabled: true, consent: "accepted" });
  harness.localValues.set("asbesoc-visitor", "{malformed-json");
  harness.sessionValues.set("asbesoc-session", JSON.stringify({ id: "not-a-uuid", last: "recent" }));
  const analytics = await harness.load("/src/firebase/analyticsIdentifiers.ts");
  const identifiers = analytics.getAnalyticsIdentifiers(Date.now());

  const visitor = JSON.parse(harness.localValues.get("asbesoc-visitor"));
  const session = JSON.parse(harness.sessionValues.get("asbesoc-session"));
  assert.match(visitor.id, /^[a-f0-9-]{36}$/i);
  assert.match(session.id, /^[a-f0-9-]{36}$/i);
  assert.equal(identifiers.visitorId, visitor.id);
  assert.equal(identifiers.sessionId, session.id);
});

test("membership conversion fires only after the application save succeeds", async () => {
  const harness = await loadHarness();
  const sequence = [];
  harness.state.createApplication = async (data) => {
    sequence.push("save-started");
    await Promise.resolve();
    sequence.push("save-succeeded");
    return { id: "saved-application", data };
  };
  const submissions = await harness.load("/src/firebase/submissions.ts");
  harness.state.submissionEvents = [];
  harness.state.trackSubmissionEvent = (...args) => {
    assert.deepEqual(args, ["application"]);
    sequence.push("conversion-event");
  };
  const result = await submissions.submitMembership({ fullName: "Test Member" });

  assert.equal(result.id, "saved-application");
  assert.deepEqual(sequence, [
    "save-started",
    "save-succeeded",
    "conversion-event",
  ]);
  assert.deepEqual(harness.state.submissionEvents, [["application"]]);
});

test("failed membership application save emits no conversion event", async () => {
  const harness = await loadHarness();
  harness.state.createApplication = async () => {
    throw new Error("save failed");
  };
  const submissions = await harness.load("/src/firebase/submissions.ts");

  await assert.rejects(
    submissions.submitMembership({ fullName: "Test Member" }),
    /save failed/,
  );
  assert.deepEqual(harness.state.submissionEvents ?? [], []);
});
