/**
 * src/components/PathfinderUI.jsx
 * ─────────────────────────────────────────────────────────────
 * Barrel re-export of every UI component from the prototype.
 *
 * MIGRATION STEP:
 *  Open proactive-ai-partner.jsx and add `export` in front of
 *  every `function` declaration, e.g.:
 *
 *    export function AILogo(...) { ... }
 *    export function AuthScreen(...) { ... }
 *    ...etc
 *
 *  Then replace the `export default function App()` at the
 *  bottom with the production App.jsx in src/App.jsx.
 *
 *  Once done, update this barrel file to re-export from the
 *  split component files, e.g.:
 *
 *    export { AuthScreen }    from "./auth/AuthScreen";
 *    export { HomeScreen }    from "./home/HomeScreen";
 *    ...etc
 *
 * TEMPORARY: This file re-exports from a single flat file while
 * you complete the migration. App.jsx imports from here, so
 * nothing else needs to change during the transition.
 * ─────────────────────────────────────────────────────────────
 */

// When proactive-ai-partner.jsx has named exports:
// export {
//   AILogo,
//   StatusBar,
//   BackBtn,
//   ScrHeader,
//   TypingInd,
//   WaveAnim,
//   MsgBubble,
//   ChatHeader,
//   InputBar,
//   AuthScreen,
//   OnboardingScreen,
//   DatabasePanel,
//   UploadScreen,
//   HandoffModal,
//   ProjectHubScreen,
//   TalentCard,
//   ProCatalogueScreen,
//   InvestorGateScreen,
//   SettingsScreen,
//   PreflightScreen,
//   SprintBar,
//   FounderReadinessBar,
//   InjectVideoCard,
//   ShowDiffCard,
//   CourseScreen,
//   HomeScreen,
// } from "../../proactive-ai-partner";   // adjust path as needed

/**
 * TEMPORARY STUB — replace each export below with the real import
 * once proactive-ai-partner.jsx has named exports.
 *
 * To use immediately without refactoring:
 *  1. Add "export" before every "function" in proactive-ai-partner.jsx
 *  2. Move the file to src/components/PathfinderUI.jsx
 *  3. Remove the "export default function App()" from it
 *  4. Uncomment the re-exports above
 */

export { default as StatusBar }          from "./stubs/StatusBar";
export { default as ChatHeader }         from "./stubs/ChatHeader";
export { default as InputBar }           from "./stubs/InputBar";
export { default as MsgBubble }          from "./stubs/MsgBubble";
export { default as TypingInd }          from "./stubs/TypingInd";
export { default as WaveAnim }           from "./stubs/WaveAnim";
export { default as SprintBar }          from "./stubs/SprintBar";
export { default as FounderReadinessBar }from "./stubs/FounderReadinessBar";
export { default as AuthScreen }         from "./stubs/AuthScreen";
export { default as OnboardingScreen }   from "./stubs/OnboardingScreen";
export { default as HomeScreen }         from "./stubs/HomeScreen";
export { default as PreflightScreen }    from "./stubs/PreflightScreen";
export { default as UploadScreen }       from "./stubs/UploadScreen";
export { default as HandoffModal }       from "./stubs/HandoffModal";
export { default as ProjectHubScreen }   from "./stubs/ProjectHubScreen";
export { default as ProCatalogueScreen } from "./stubs/ProCatalogueScreen";
export { default as InvestorGateScreen } from "./stubs/InvestorGateScreen";
export { default as SettingsScreen }     from "./stubs/SettingsScreen";
export { default as CourseScreen }       from "./stubs/CourseScreen";
export { default as DatabasePanel }      from "./stubs/DatabasePanel";
export { default as InjectVideoCard }    from "./stubs/InjectVideoCard";
export { default as ShowDiffCard }       from "./stubs/ShowDiffCard";
