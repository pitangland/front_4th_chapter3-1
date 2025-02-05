import { act, renderHook } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
// import { formatDate } from '../../utils/dateUtils.ts';
import { createNotificationMessage } from '../../utils/notificationUtils.ts';
// import { parseHM } from '../utils.ts';
// import { a } from 'framer-motion/client';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-02-01',
    startTime: '10:00',
    endTime: '18:00',
    description: '팀 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-02-01',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '카페',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 15,
  },
];

describe('useNotifications', () => {
  it('초기 상태에서는 알림이 없어야 한다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));
    expect(result.current.notifications).toEqual([]);
  });

  it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
    vi.setSystemTime(new Date('2025-02-01T09:50:00')); // 10:00 시작, 10분 전 (9:50)
    const { result } = renderHook(() => useNotifications(mockEvents));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications).toEqual([
      { id: '1', message: createNotificationMessage(mockEvents[0]) },
    ]);
  });

  it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
    const { result } = renderHook(() => useNotifications(mockEvents));
    act(() => {
      result.current.removeNotification(0);
    });
    expect(result.current.notifications).toEqual([]);
  });

  it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
    vi.setSystemTime(new Date('2025-02-01T09:50:00')); // 10:00 시작, 10분 전 (9:50)
    const { result } = renderHook(() => useNotifications(mockEvents));
    const notificationsInfo = { id: '1', message: createNotificationMessage(mockEvents[0]) };

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications).toEqual([notificationsInfo]);

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications).toEqual([notificationsInfo]);
  });
});
