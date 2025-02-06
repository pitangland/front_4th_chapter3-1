import { BellIcon } from '@chakra-ui/icons';
import {
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Box,
  HStack,
  Heading,
} from '@chakra-ui/react';
import React from 'react';

import { Event } from '../../types';
import { formatWeek, getWeekDates } from '../../utils/dateUtils';

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
  notifiedEvents: string[];
  weekDays: string[];
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  events,
  notifiedEvents,
  weekDays,
}) => {
  const weekDates = getWeekDates(currentDate);

  return (
    <VStack data-testid="week-view" align="stretch" w="full" spacing={4}>
      <Heading size="md">{formatWeek(currentDate)}</Heading>
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            {weekDays.map((day) => (
              <Th key={day} width="14.28%">
                {day}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            {weekDates.map((date) => (
              <Td key={date.toISOString()} height="100px" verticalAlign="top" width="14.28%">
                <Text fontWeight="bold">{date.getDate()}</Text>
                {events
                  .filter((event) => new Date(event.date).toDateString() === date.toDateString())
                  .map((event) => (
                    <Box
                      key={event.id}
                      p={1}
                      my={1}
                      bg={notifiedEvents.includes(event.id) ? 'red.100' : 'gray.100'}
                      borderRadius="md"
                      fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                      color={notifiedEvents.includes(event.id) ? 'red.500' : 'inherit'}
                    >
                      <HStack spacing={1}>
                        {notifiedEvents.includes(event.id) && <BellIcon />}
                        <Text fontSize="sm" noOfLines={1}>
                          {event.title}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </VStack>
  );
};
