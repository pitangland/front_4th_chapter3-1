import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import { WeekView } from '../../../components/calendar/WeekView';

const setup = (props: any) => {
  return {
    ...render(
      <ChakraProvider>
        <WeekView {...props} />
      </ChakraProvider>
    ),
  };
};

describe('WeekView 컴포넌트', () => {
  const mockProps = {
    currentDate: new Date('2024-02-07'),
    events: [
      {
        id: '1',
        title: '주간 테스트 일정',
        date: '2024-02-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 뷰 테스트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['1'],
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],
  };

  it('주간 뷰가 정상적으로 렌더링된다', async () => {
    setup(mockProps);
    const weekView = screen.getByTestId('week-view');
    expect(weekView).toBeInTheDocument();
  });

  it('모든 요일이 표시된다', async () => {
    setup(mockProps);
    mockProps.weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('일정이 올바른 날짜에 표시된다', async () => {
    setup(mockProps);
    const weekView = screen.getByTestId('week-view');

    expect(within(weekView).getByText('주간 테스트 일정')).toBeInTheDocument();
  });

  it('알림이 있는 일정은 다른 스타일로 표시된다', async () => {
    setup(mockProps);
    const weekView = screen.getByTestId('week-view');
    const eventElement = within(weekView).getByText('주간 테스트 일정').closest('div');

    expect(eventElement).toHaveStyle({ backgroundColor: 'var(--chakra-colors-red-100)' });
  });
});
