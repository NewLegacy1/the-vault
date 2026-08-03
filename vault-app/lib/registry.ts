/**
 * Strategy registry (Phase 3 of pipeline build-out).
 *
 * Every book is a first-class entity with a lifecycle state and linked
 * artifacts. The registry file (data/registry/strategies.json) is shared by
 * the /pipeline board, the /api/registry route, and the research agent loop —
 * one source of truth instead of prose scattered across sim-queue / SCORECARD.
 *
 * `lintRegistry` makes the kill-lessons hard constraints machine-checkable:
 *   - family blacklist — a candidate sharing a family tag with a killed book
 *     is flagged (kill-lessons rule 11: no costume retunes),
 *   - one open Stage-0 at a time (research loop rule),
 *   - independence — a candidate must differ from gated PRB on ≥2 of
 *     {time_box, level_set, regime_feature, barrier_geometry} (rule 12).
 */

export type StrategyState =
  | "idea"
  | "stage0_draft"
  | "waiting_csv"
  | "analyzed"
  | "toward"
  | "away"
  | "killed"
  | "live_sprint"
  | "funded"
  | "retired";

export type StrategyLane = "track_a" | "track_b" | "lane_r" | "lane_f" | "lane_s" | "study";

export type IndependenceAxis =
  | "time_box"
  | "level_set"
  | "regime_feature"
  | "barrier_geometry";

export interface StrategyArtifact {
  label: string;
  /** Workspace-relative path (pine, analysis note, playbook, CSV). */
  path: string;
}

export interface StrategyEntry {
  id: string;
  name: string;
  lane: StrategyLane;
  state: StrategyState;
  /** ISO date of last state change / review. */
  updated: string;
  summary: string;
  /** Event/barrier family keywords — drives the kill-family lint. */
  familyTags: string[];
  /** Axes on which this book differs from gated PRB (candidates only). */
  independenceAxes?: IndependenceAxis[];
  artifacts?: StrategyArtifact[];
  /** kill-lessons hard-constraint id (killed books), e.g. "9g". */
  killConstraint?: string;
  /** Headline metric line, e.g. "MC pass 79% · E[$/wk] ~$104 (TPT)". */
  metrics?: string;
}

export interface RegistryFile {
  version: 1;
  updated: string;
  entries: StrategyEntry[];
}

export interface LintViolation {
  entryId: string;
  ruleId: "kill_family" | "one_stage0" | "independence";
  message: string;
}

/** States that count as "an open Stage-0 slot". */
export function isOpenStage0(state: StrategyState): boolean {
  switch (state) {
    case "stage0_draft":
    case "waiting_csv":
      return true;
    case "idea":
    case "analyzed":
    case "toward":
    case "away":
    case "killed":
    case "live_sprint":
    case "funded":
    case "retired":
      return false;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

/** States where the kill-family / independence lints apply (pre-verdict). */
export function isCandidate(state: StrategyState): boolean {
  switch (state) {
    case "idea":
    case "stage0_draft":
    case "waiting_csv":
      return true;
    case "analyzed":
    case "toward":
    case "away":
    case "killed":
    case "live_sprint":
    case "funded":
    case "retired":
      return false;
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

export function stateLabel(state: StrategyState): string {
  switch (state) {
    case "idea":
      return "IDEA";
    case "stage0_draft":
      return "STAGE-0 DRAFT";
    case "waiting_csv":
      return "WAITING CSV";
    case "analyzed":
      return "ANALYZED";
    case "toward":
      return "TOWARD";
    case "away":
      return "AWAY";
    case "killed":
      return "KILLED";
    case "live_sprint":
      return "LIVE SPRINT";
    case "funded":
      return "FUNDED";
    case "retired":
      return "RETIRED";
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

/** Board column order on /pipeline. */
export const PIPELINE_STATE_ORDER: StrategyState[] = [
  "idea",
  "stage0_draft",
  "waiting_csv",
  "analyzed",
  "toward",
  "live_sprint",
  "funded",
  "away",
  "retired",
  "killed",
];

export function lintRegistry(entries: StrategyEntry[]): LintViolation[] {
  const violations: LintViolation[] = [];

  const killedTags = new Map<string, string>(); // tag → killed entry id
  for (const e of entries) {
    if (e.state !== "killed") continue;
    for (const t of e.familyTags) {
      if (!killedTags.has(t)) killedTags.set(t, e.id);
    }
  }

  const openStage0 = entries.filter((e) => isOpenStage0(e.state));
  if (openStage0.length > 1) {
    for (const e of openStage0) {
      violations.push({
        entryId: e.id,
        ruleId: "one_stage0",
        message: `${openStage0.length} open Stage-0 slots (${openStage0
          .map((x) => x.id)
          .join(", ")}) — loop allows exactly one.`,
      });
    }
  }

  for (const e of entries) {
    if (!isCandidate(e.state)) continue;

    for (const t of e.familyTags) {
      const killer = killedTags.get(t);
      if (killer) {
        violations.push({
          entryId: e.id,
          ruleId: "kill_family",
          message: `Family tag "${t}" belongs to killed book ${killer} — no costume retunes without a new event definition.`,
        });
      }
    }

    const axes = e.independenceAxes ?? [];
    if (axes.length < 2) {
      violations.push({
        entryId: e.id,
        ruleId: "independence",
        message: `Only ${axes.length} independence axis(es) vs gated PRB declared — rule 12 requires ≥2 of {time box, level set, regime feature, barrier geometry}.`,
      });
    }
  }

  return violations;
}
