import { useCallback, useState } from "react";

type Transition<S extends string> = {
  target: S;
  guard?: () => boolean;
};

type TransitionMap<S extends string, E extends string> = Record<
  S,
  Partial<Record<E, Transition<S> | S>>
>;

/**
 * A simple finite state machine hook for React
 * @param initialState The initial state
 * @param transitions Map of transitions between states
 * @returns State management utilities
 */
export function useFSM<S extends string, E extends string>(
  initialState: S,
  transitions: TransitionMap<S, E>
) {
  const [state, setState] = useState<S>(initialState);

  const send = useCallback(
    (event: E) => {
      const transition = transitions[state]?.[event];

      if (!transition) {
        return false; // No transition for this event in current state
      }

      // If transition is just a string, it's the target state
      if (typeof transition === "string") {
        setState(transition as S);
        return true;
      }

      // Otherwise it's a transition object
      const { target, guard } = transition;

      // Check guard condition if it exists
      if (guard && !guard()) {
        return false;
      }

      setState(target);
      return true;
    },
    [state, transitions]
  );

  return {
    state,
    send,
    is: useCallback((s: S) => state === s, [state]), // Helper to check current state
  };
}

// Usage example (for reference):
// const { state, send, is } = useFSM('idle', {
//   idle: {
//     FETCH: 'loading',
//   },
//   loading: {
//     SUCCESS: 'success',
//     ERROR: 'error',
//   },
//   error: {
//     RETRY: 'loading',
//   },
//   success: {
//     REFRESH: 'loading',
//   },
// });
