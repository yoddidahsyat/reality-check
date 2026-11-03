/**
 * Remembers that the user came *back* to the walkthrough from the form, so it should open on
 * its last slide instead of the first. Module-level so it survives route changes; changed
 * through functions so screens don't mutate imported state directly.
 */
let resumeAtEnd = false;

export const markWalkthroughResume = () => {
  resumeAtEnd = true;
};
export const peekWalkthroughResume = () => resumeAtEnd;
export const clearWalkthroughResume = () => {
  resumeAtEnd = false;
};
