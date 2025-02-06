import { renderHook, act } from '@testing-library/react';

import { useEventConflict } from '../../hooks/useEventConflict';
import { Event } from '../../types';

describe('useEventConflict', () => {
  const createEvent = (id: string, date: string, startTime: string, endTime: string): Event => ({
    id,
    title: `Event ${id}`,
    date,
    startTime,
    endTime,
    description: '',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  });

  describe('기본 동작 테스트', () => {
    it('초기 상태가 올바르게 설정된다', () => {
      const { result } = renderHook(() => useEventConflict());

      expect(result.current.isOverlapDialogOpen).toBe(false);
      expect(result.current.overlappingEvents).toHaveLength(0);
    });

    it('다이얼로그를 닫으면 상태가 초기화된다', () => {
      const { result } = renderHook(() => useEventConflict());
      const event1 = createEvent('1', '2024-02-07', '10:00', '11:00');
      const event2 = createEvent('2', '2024-02-07', '10:30', '11:30');

      act(() => {
        result.current.checkEventConflict(event2, [event1]);
      });

      expect(result.current.isOverlapDialogOpen).toBe(true);

      act(() => {
        result.current.closeOverlapDialog();
      });

      expect(result.current.isOverlapDialogOpen).toBe(false);
      expect(result.current.overlappingEvents).toHaveLength(0);
    });
  });

  describe('일정 충돌 검사', () => {
    it('시간이 완전히 겹치는 경우를 감지한다', () => {
      const { result } = renderHook(() => useEventConflict());
      const event1 = createEvent('1', '2024-02-07', '10:00', '11:00');
      const event2 = createEvent('2', '2024-02-07', '10:00', '11:00');

      act(() => {
        const hasConflict = result.current.checkEventConflict(event2, [event1]);
        expect(hasConflict).toBe(true);
      });

      expect(result.current.overlappingEvents).toContainEqual(event1);
    });

    it('시간이 부분적으로 겹치는 경우를 감지한다', () => {
      const { result } = renderHook(() => useEventConflict());
      const event1 = createEvent('1', '2024-02-07', '10:00', '11:00');
      const event2 = createEvent('2', '2024-02-07', '10:30', '11:30');

      act(() => {
        const hasConflict = result.current.checkEventConflict(event2, [event1]);
        expect(hasConflict).toBe(true);
      });

      expect(result.current.overlappingEvents).toContainEqual(event1);
    });

    it('시간이 겹치지 않는 경우는 통과한다', () => {
      const { result } = renderHook(() => useEventConflict());
      const event1 = createEvent('1', '2024-02-07', '10:00', '11:00');
      const event2 = createEvent('2', '2024-02-07', '11:00', '12:00');

      act(() => {
        const hasConflict = result.current.checkEventConflict(event2, [event1]);
        expect(hasConflict).toBe(false);
      });

      expect(result.current.overlappingEvents).toHaveLength(0);
    });
  });

  describe('예외 상황 테스트', () => {
    it('빈 이벤트 배열을 처리할 수 있다', () => {
      const { result } = renderHook(() => useEventConflict());
      const event = createEvent('1', '2024-02-07', '10:00', '11:00');

      act(() => {
        const hasConflict = result.current.checkEventConflict(event, []);
        expect(hasConflict).toBe(false);
      });

      expect(result.current.overlappingEvents).toHaveLength(0);
    });
  });
});
