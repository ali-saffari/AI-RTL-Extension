export const UPDATE_MODAL_ENABLED = true; // Set to false to skip showing modal for this release
// First rename/story modal — users who dismissed this missed the 2026-09-26 ChatGPT modal.
export const FIRST_UPDATE_MODAL_ID = '2026-09-20';
// Second modal (ChatGPT follow-up) — users who dismissed this get the perf + Copilot follow-up.
export const SECOND_UPDATE_MODAL_ID = '2026-09-26';
// Stored after any variant of the current release modal is closed.
export const UPDATE_MODAL_ID = '2026-09-29';
export const UPDATE_MODAL_STORAGE_KEY = 'updateModalClosedId';
