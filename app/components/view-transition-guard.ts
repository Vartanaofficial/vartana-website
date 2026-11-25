// Chrome aborts view transitions in hidden tabs with "Transition was aborted because of invalid state.
// Document hidden", which React's ignore-list does not match, so React reports a harmless error.
// This guard skips transitions while the tab is hidden (React then updates the page without animation)
// and normalises that abort message so React treats it as the expected, ignorable case.
const ABORTED = 'Transition was aborted because of invalid state';
const GUARD = Symbol.for('vartana.viewTransitionGuard');

type GuardedDocument = Document & {[GUARD]?: boolean};

export function installViewTransitionGuard() {
  if (typeof document === 'undefined') return;
  const doc = document as GuardedDocument;
  if (doc[GUARD] || typeof doc.startViewTransition !== 'function') return;
  const original = doc.startViewTransition.bind(doc);
  doc.startViewTransition = ((options?: Parameters<Document['startViewTransition']>[0]) => {
    // Throwing makes React fall back to applying the update immediately, without a transition.
    if (doc.visibilityState === 'hidden') throw new DOMException('Document hidden', 'InvalidStateError');
    const transition = original(options);
    const ready = transition.ready.catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'InvalidStateError' && error.message.startsWith(ABORTED)) {
        throw new DOMException(ABORTED, 'InvalidStateError');
      }
      throw error;
    });
    return new Proxy(transition, {
      get(target, property) {
        if (property === 'ready') return ready;
        const value = Reflect.get(target, property, target);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  }) as Document['startViewTransition'];
  doc[GUARD] = true;
}
