"use client";

import { Box, Stack, Text } from '@mantine/core';

interface TimeBarProps {
  startHour: number;
  endHour: number;
}

export function TimeBar({ startHour, endHour }: TimeBarProps) {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  
  return (
    <Stack gap={0} style={{ position: 'relative' }}>
      {hours.map(hour => (
        <Box 
          key={hour} 
          style={{ 
            height: '100px', 
            borderBottom: '1px dashed #e0e0e0',
            position: 'relative',
            paddingLeft: '8px'
          }}
        >
          <Text 
            size="sm" 
            c="dimmed"
            style={{
              position: 'absolute',
              top: '-10px',
              left: '0',
            }}
          >
            {hour}:00
          </Text>
        </Box>
      ))}
    </Stack>
  );
}