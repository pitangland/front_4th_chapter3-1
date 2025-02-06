import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';

import { MonthView } from '../../../components/calendar/MonthView';

const setup = (props: any) => {
  return {
    ...render(
      <ChakraProvider>
        <MonthView {...props} />
      </ChakraProvider>
    ),
  };
};

describe('MonthView 컴포넌트', () => {
  const mockProps = {
    currentDate: new Date('2024-02-07'),
    events: [
      {
        id: '1',
        title: '월간 테스트 일정',
        date: '2024-02-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '월간 뷰 테스트',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      },
    ],
    notifiedEvents: ['1'],
    weekDays: ['일', '월', '화', '수', '목', '금', '토'],
    holidays: {
      '2024-02-09': '설날',
      '2024-02-10': '설날연휴',
    },
  };

  it('월간 뷰가 정상적으로 렌더링된다', async () => {
    setup(mockProps);
    const monthView = screen.getByTestId('month-view');
    expect(monthView).toBeInTheDocument();
  });

  it('모든 요일이 표시된다', async () => {
    setup(mockProps);
    mockProps.weekDays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('일정이 올바른 날짜에 표시된다', async () => {
    setup(mockProps);
    const monthView = screen.getByTestId('month-view');

    expect(within(monthView).getByText('월간 테스트 일정')).toBeInTheDocument();
  });

  it('공휴일이 올바르게 표시된다', async () => {
    setup(mockProps);
    const monthView = screen.getByTestId('month-view');

    expect(within(monthView).getByText('설날')).toBeInTheDocument();
    expect(within(monthView).getByText('설날연휴')).toBeInTheDocument();
  });

  it('알림이 있는 일정은 다른 스타일로 표시된다', async () => {
    setup(mockProps);
    const monthView = screen.getByTestId('month-view');
    const eventElement = within(monthView).getByText('월간 테스트 일정').closest('div');

    expect(eventElement).toHaveStyle({ backgroundColor: 'var(--chakra-colors-red-100)' });
  });
});
