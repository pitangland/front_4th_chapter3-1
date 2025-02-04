import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '이벤트 1',
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
      title: '이벤트 2',
      date: '2025-02-01',
      startTime: '12:00',
      endTime: '13:00',
      description: '친구와 점심',
      location: '카페',
      category: '개인',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 15,
    },
    {
      id: '3',
      title: '이벤트 3',
      date: '2024-07-01',
      startTime: '19:00',
      endTime: '20:00',
      description: '헬스장',
      location: '체육관',
      category: '건강',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
    {
      id: '4',
      title: 'events',
      date: '2025-03-01',
      startTime: '19:00',
      endTime: '20:00',
      description: '헬스장',
      location: '체육관',
      category: '건강',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
    {
      id: '5',
      title: 'EvenTs',
      date: '2025-03-01',
      startTime: '19:00',
      endTime: '20:00',
      description: '헬스장',
      location: '체육관',
      category: '건강',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 30,
    },
    {
      id: '6',
      title: '이벤트',
      date: '2025-06-01',
      startTime: '10:00',
      endTime: '18:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    },
  ];
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-02-01'), 'week');
    expect(result).toEqual([mockEvents[1]]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');
    expect(result).toEqual([mockEvents[2]]);
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'month');
    expect(result).toEqual([mockEvents[2]]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2025-02-01'), 'week');
    expect(result).toEqual([mockEvents[0], mockEvents[1]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2025-02-01'), 'week');
    expect(result).toEqual([mockEvents[0], mockEvents[1]]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'events', new Date('2025-03-01'), 'week');
    expect(result).toEqual([mockEvents[3], mockEvents[4]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2025-01-31'), 'week');
    expect(result).toEqual([mockEvents[1]]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents([], '이벤트 2', new Date('2025-02-01'), 'week');
    expect(result).toEqual([]);
  });
});
