import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

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

describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    vi.setSystemTime(new Date('2025-02-01T09:50:00')); // 회의 시작 10분 전
    const result = getUpcomingEvents(mockEvents, new Date(), []);
    expect(result).toEqual([mockEvents[0]]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    vi.setSystemTime(new Date('2025-02-01T09:50:00')); // 회의 시작 10분 전
    const notifiedEvents = ['1']; // 회의 알림이 이미 발송됨
    const result = getUpcomingEvents(mockEvents, new Date(), notifiedEvents);
    expect(result).toEqual([]); // 이미 알림이 간 이벤트는 제외됨
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    vi.setSystemTime(new Date('2025-02-01T11:40:00'));
    const result = getUpcomingEvents(mockEvents, new Date(), []);
    expect(result).toEqual([]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    vi.setSystemTime(new Date('2025-02-01T10:00:00'));
    const result = getUpcomingEvents(mockEvents, new Date(), []);
    expect(result).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = mockEvents[0];
    const result = createNotificationMessage(event);
    expect(result).toBe(`${event.notificationTime}분 후 ${event.title} 일정이 시작됩니다.`);
  });
});
