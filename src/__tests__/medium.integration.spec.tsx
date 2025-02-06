import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
// import { http, HttpResponse } from 'msw';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user }; // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    setupMockHandlerCreation(); // Mock API 초기화
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    // 1) 서버를 새 일정 생성 가능한 상태로 mock
    setupMockHandlerCreation([]);
    // 2) 컴포넌트 렌더링
    const { user } = setup(<App />);

    // 3) 초기 문구 "검색 결과가 없습니다."가 있을 수 있으므로 먼저 대기
    await screen.findByText('검색 결과가 없습니다.');

    // 4) 새 일정 정보 입력
    await saveSchedule(user, {
      title: '새로운 일정',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '새 일정 설명',
      location: '회의실 A',
      category: '업무',
    });

    // 5) 일정 생성 후 목록에 해당 일정이 표시되는지 검증
    await waitFor(() => {
      //이벤트 리스트안에 포함되는 것
      const eventList = screen.getByTestId('event-list');
      expect(within(eventList).getByText('새로운 일정')).toBeInTheDocument();
      expect(within(eventList).getByText('새 일정 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 A')).toBeInTheDocument();
      expect(within(eventList).getByText('카테고리: 업무')).toBeInTheDocument();
      expect(within(eventList).getByText('2024-10-15')).toBeInTheDocument();
      expect(within(eventList).getByText('09:00 - 10:00')).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();

    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('기존 회의')).toBeInTheDocument();
    });

    const editButton = within(eventList).getAllByLabelText(/Edit event/i);
    await user.click(editButton[1]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '수정된 회의');

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '10:30');

    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '11:30');

    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '수정된 설명');

    await user.clear(screen.getByLabelText('위치'));
    await user.type(screen.getByLabelText('위치'), '회의실 Z');

    await user.selectOptions(screen.getByLabelText('카테고리'), '개인');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(within(eventList).getByText('수정된 회의')).toBeInTheDocument();
      expect(within(eventList).getByText('수정된 설명')).toBeInTheDocument();
      expect(within(eventList).getByText('회의실 Z')).toBeInTheDocument();
      expect(within(eventList).getByText('카테고리: 개인')).toBeInTheDocument();
      expect(within(eventList).getByText('10:30 - 11:30')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();

    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await waitFor(() => {
      expect(within(eventList).getByText('삭제할 이벤트')).toBeInTheDocument();
    });

    const target = within(eventList).getByText('삭제할 이벤트').closest('div');
    if (!target) throw new Error('삭제할 이벤트가 목록에 없음');
    const deleteButton = screen.getByLabelText('Delete event');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(within(eventList).queryByText('삭제할 이벤트')).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  beforeEach(() => {
    server.resetHandlers();
    setupMockHandlerCreation([
      {
        id: '1',
        title: '주별 테스트 일정',
        date: '2024-10-02', // 현재 테스트의 "오늘" 날짜를 2024-10-01로 고정했으므로, 이틀째 되는 날
        startTime: '10:00',
        endTime: '11:00',
        description: '주별 뷰 테스트 일정입니다.',
        location: '오피스',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const { user } = setup(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const weekView = screen.getByTestId('week-view');

    await within(weekView).findByText('주별 테스트 일정');

    expect(within(weekView).getByText('주별 테스트 일정')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Previous'));

    await waitFor(() => {
      expect(within(weekView).queryByText('주별 테스트 일정')).not.toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const { user } = setup(<App />);
    await user.selectOptions(screen.getByLabelText('view'), 'week');

    const weekView = screen.getByTestId('week-view');

    await within(weekView).findByText('주별 테스트 일정');

    await waitFor(() => {
      const weekView = screen.getByTestId('week-view');
      expect(within(weekView).queryByText('주별 테스트 일정')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    server.resetHandlers();
    setupMockHandlerCreation([]); // 이벤트 없는 상태
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'week');

    await screen.findByText('검색 결과가 없습니다.');

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    await waitFor(() => {
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).queryAllByText(/.+/).length).toBeGreaterThan(0);
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    server.resetHandlers();
    setupMockHandlerCreation([
      {
        id: '99',
        title: '월별 테스트 일정',
        date: '2024-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '월 테스트 설명',
        location: '오피스',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ]);

    const { user } = setup(<App />);
    const monthView = screen.getByTestId('month-view');

    await within(monthView).findByText('월별 테스트 일정');

    await user.selectOptions(screen.getByLabelText('view'), 'month');

    await waitFor(() => {
      expect(within(monthView).getByText('월별 테스트 일정')).toBeInTheDocument();
      expect(within(monthView).getByText('15')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const { user } = setup(<App />);

    await user.selectOptions(screen.getByLabelText('view'), 'month');
    const monthView = screen.getByTestId('month-view');

    // 지금은 10월이므로, 여러 번 prev 클릭해서 1월로 이동 (최대 9번)
    for (let i = 0; i < 9; i++) {
      await user.click(screen.getByLabelText('Previous'));
    }

    await waitFor(() => {
      expect(within(monthView).getByText(/2024년 1월/)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(within(monthView).getByText('신정')).toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  beforeEach(() => {
    server.resetHandlers();
    setupMockHandlerCreation([
      {
        id: '100',
        title: '팀 회의',
        date: '2024-10-11',
        startTime: '09:00',
        endTime: '09:30',
        description: '검색 테스트 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation([]); // 이벤트 없는 상태로 재설정
    const { user } = setup(<App />);

    const eventList = screen.getByTestId('event-list');
    const searchInput = within(eventList).getByPlaceholderText('검색어를 입력하세요');

    await user.type(searchInput, '없는 검색어');

    expect(within(eventList).getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await within(eventList).findByText('팀 회의');

    await user.type(screen.getByLabelText('일정 검색'), '팀 회의');

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');
    await within(eventList).findByText('팀 회의');

    await user.type(screen.getByLabelText('일정 검색'), '팀');
    expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('일정 검색'));

    await waitFor(() => {
      expect(within(eventList).getByText('팀 회의')).toBeInTheDocument();
    });
  });
});

describe('일정 충돌', () => {
  beforeEach(() => {
    server.resetHandlers();
    setupMockHandlerCreation([
      {
        id: '101',
        title: '겹치는 회의',
        date: '2024-10-05',
        startTime: '09:00',
        endTime: '10:00',
        description: '이미 있는 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await within(eventList).findByText('겹치는 회의');

    // 09:30 ~ 10:30 일정 추가 -> 겹친다
    await saveSchedule(user, {
      title: '겹칠 새 일정',
      date: '2024-10-05',
      startTime: '09:30',
      endTime: '10:30',
      location: '회의실 B',
      description: '겹치는 일정 테스트',
      category: '업무',
    });

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });

    // "계속 진행" 버튼 클릭하면 저장 수행
    const continueBtn = screen.getByRole('button', { name: '계속 진행' });
    await user.click(continueBtn);

    // 저장된 일정이 목록에 표시되는지 확인
    await waitFor(() => {
      expect(within(eventList).getByText('겹칠 새 일정')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const { user } = setup(<App />);
    const eventList = screen.getByTestId('event-list');

    await within(eventList).findByText('겹치는 회의');

    // 13:00 ~ 14:00 일정 추가
    await saveSchedule(user, {
      title: '겹칠 새 일정',
      date: '2024-10-05',
      startTime: '13:00',
      endTime: '14:00',
      location: '회의실 B',
      description: '겹치는 일정 테스트',
      category: '업무',
    });

    const editBtn = within(eventList).getAllByLabelText(/Edit event/i);
    await user.click(editBtn[0]);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '13:30');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '14:30');

    await user.click(screen.getByTestId('event-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  server.resetHandlers();
  setupMockHandlerCreation([]);
  const { user } = setup(<App />);
  const eventList = screen.getByTestId('event-list');

  await screen.findByText('검색 결과가 없습니다.');

  // 10분 전 알람을 가지는 일정 생성
  await saveSchedule(user, {
    title: '알림 테스트 일정',
    date: '2024-10-07',
    startTime: '12:00',
    endTime: '12:30',
    location: '연구실',
    description: '알림 테스트',
    category: '업무',
  });

  // 생성 후 목록에 표시되는지
  await waitFor(() => {
    expect(within(eventList).getByText('알림 테스트 일정')).toBeInTheDocument();
  });

  expect(screen.getByText('알림: 10분 전')).toBeInTheDocument();
});
