import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFSM } from './useFSM';

describe('useFSM', () => {
  type TestState = 'idle' | 'loading' | 'success' | 'error';
  type TestEvent = 'FETCH' | 'SUCCESS' | 'ERROR' | 'RETRY' | 'REFRESH';

  it('should initialize with the correct state', () => {
    const { result } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { FETCH: 'loading' },
        loading: {
          SUCCESS: 'success',
          ERROR: 'error',
        },
        error: { RETRY: 'loading' },
        success: { REFRESH: 'loading' },
      })
    );

    expect(result.current.state).toBe('idle');
  });

  it('should transition states when sending a valid event', () => {
    const { result } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { FETCH: 'loading' },
        loading: {
          SUCCESS: 'success',
          ERROR: 'error',
        },
        error: { RETRY: 'loading' },
        success: { REFRESH: 'loading' },
      })
    );

    act(() => {
      result.current.send('FETCH');
    });
    expect(result.current.state).toBe('loading');

    act(() => {
      result.current.send('SUCCESS');
    });
    expect(result.current.state).toBe('success');
  });

  it('should return true for successful transitions', () => {
    const { result } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { FETCH: 'loading' },
        loading: {},
        success: {},
        error: {},
      })
    );

    let transitionResult = false;
    act(() => {
      transitionResult = result.current.send('FETCH');
    });
    expect(transitionResult).toBe(true);
  });

  it('should not transition when there is no matching event', () => {
    const { result } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { FETCH: 'loading' },
        loading: {},
        success: {},
        error: {},
      })
    );

    let transitionResult = false;
    act(() => {
      transitionResult = result.current.send('SUCCESS' as TestEvent);
    });
    
    expect(result.current.state).toBe('idle');
    expect(transitionResult).toBe(false);
  });

  it('should support transition objects with target state', () => {
    const { result } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { 
          FETCH: { target: 'loading' } 
        },
        loading: {},
        success: {},
        error: {},
      })
    );

    act(() => {
      result.current.send('FETCH');
    });
    
    expect(result.current.state).toBe('loading');
  });

  it('should respect guard conditions', () => {
    const guardMock = vi.fn();
    
    // First test: guard returns false
    guardMock.mockReturnValueOnce(false);
    
    const { result, rerender } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { 
          FETCH: { target: 'loading', guard: guardMock } 
        },
        loading: {},
        success: {},
        error: {},
      })
    );

    let transitionResult = false;
    act(() => {
      transitionResult = result.current.send('FETCH');
    });
    
    expect(guardMock).toHaveBeenCalled();
    expect(result.current.state).toBe('idle'); // Should not transition
    expect(transitionResult).toBe(false);
    
    // Second test: guard returns true
    guardMock.mockReset();
    guardMock.mockReturnValueOnce(true);
    
    // Need to rerender to reset the hook
    rerender();
    
    transitionResult = false;
    act(() => {
      transitionResult = result.current.send('FETCH');
    });
    
    expect(guardMock).toHaveBeenCalled();
    expect(result.current.state).toBe('loading'); // Should transition
    expect(transitionResult).toBe(true);
  });

  it('should provide an "is" helper to check current state', () => {
    const { result } = renderHook(() => 
      useFSM<TestState, TestEvent>('idle', {
        idle: { FETCH: 'loading' },
        loading: { SUCCESS: 'success' },
        success: {},
        error: {},
      })
    );

    expect(result.current.is('idle')).toBe(true);
    expect(result.current.is('loading')).toBe(false);

    act(() => {
      result.current.send('FETCH');
    });

    expect(result.current.is('idle')).toBe(false);
    expect(result.current.is('loading')).toBe(true);
  });
});
