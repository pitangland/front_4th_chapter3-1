import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2024-07-01', '14:30');
    expect(result).toBeInstanceOf(Date);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025:02:29', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2024-07-01', '29:30');
    expect(result.toString()).toBe('Invalid Date');
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(result.toString()).toBe('Invalid Date');
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-02-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const result = convertEventToDateRange(event);
    expect(result.start).toEqual(new Date('2025-02-01T10:00'));
    expect(result.end).toEqual(new Date('2025-02-01T11:00'));
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025:02:01',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-02-01',
      startTime: '10-00',
      endTime: '11-00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };
    const result = convertEventToDateRange(event);
    expect(result.start.toString()).toBe('Invalid Date');
    expect(result.end.toString()).toBe('Invalid Date');
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event: Event[] = [
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
    const result = isOverlapping(event[0], event[1]);
    expect(result).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event: Event[] = [
      {
        id: '1',
        title: '회의',
        date: '2025-02-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 회의',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '점심 약속',
        date: '2025-03-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '친구와 점심',
        location: '카페',
        category: '개인',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 15,
      },
    ];
    const result = isOverlapping(event[0], event[1]);
    expect(result).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {});

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {});
});
