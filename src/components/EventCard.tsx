"use client";

import { Badge, Card, Flex, Group, Stack, Switch, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

interface EventCardProps {
  event: {
    time: string;
    artist: string;
    duration: number;
    attending: boolean;
    date?: string;
  };
  onToggleAttending: (attending: boolean) => void;
}

export function EventCard({ event, onToggleAttending }: EventCardProps) {
  const [isAttending, setIsAttending] = useState(event.attending);
  const [isHappening, setIsHappening] = useState(false);
  
  // Check if the event is currently happening
  useEffect(() => {
    const checkIfHappening = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDate = `${now.getDate()}.${now.getMonth() + 1}`;
      
      // Extract hour from event time (format: "18h" or "20h30")
      const timeMatch = event.time.match(/^(\d+)h(\d+)?/);
      if (!timeMatch) return false;
      
      const eventHour = parseInt(timeMatch[1], 10);
      const eventMinutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      
      // If event has a date, check if it's today
      if (event.date && event.date !== currentDate) {
        return false;
      }
      
      // Calculate event end time
      const eventEndHour = eventHour + Math.floor(event.duration / 60);
      const eventEndMinutes = eventMinutes + (event.duration % 60);
      
      // Check if current time is within event time range
      const eventStartTime = eventHour + (eventMinutes / 60);
      const eventEndTime = eventEndHour + (eventEndMinutes / 60);
      const currentTime = currentHour + (now.getMinutes() / 60);
      
      return currentTime >= eventStartTime && currentTime <= eventEndTime;
    };
    
    // Initial check
    setIsHappening(checkIfHappening());
    
    // Set up interval to check every minute
    const intervalId = setInterval(() => {
      setIsHappening(checkIfHappening());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [event]);

  const handleToggleAttending = () => {
    const newAttendingState = !isAttending;
    setIsAttending(newAttendingState);
    onToggleAttending(newAttendingState);
  };

  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? ` ${mins}min` : ''}`;
  };

  // Determine card color based on day and happening status
  const getCardStyle = () => {
    // Base style
    const style: React.CSSProperties = {
      //set the height based on the duration
      height: `${event.duration / 60*5}rem`,
      display: 'flex',
      flexDirection: 'column',
      borderWidth: isHappening ? '4px' : '1px'
    };
    
    // If event is happening now, orange tint takes priority
    if (isHappening) {
      return {
        ...style,
        backgroundColor: '#FFF3E0',
        borderColor: '#FF9800'
      };
    }
    
    // Otherwise, tint based on day
    if (event.date) {
      if (event.date === '24.5') { // Saturday
        return {
          ...style,
          backgroundColor: '#E3F2FD', // Light blue
          borderColor: '#2196F3'
        };
      } else if (event.date === '25.5') { // Sunday
        return {
          ...style,
          backgroundColor: '#F3E5F5', // Light purple
          borderColor: '#9C27B0'
        };
      }
    }
    
    // Default style for events without a specific day
    return style;
  };

  return (
    <Card 
      shadow="sm" 
      padding="sm" 
      radius="md" 
      withBorder 
      style={getCardStyle()}
    >
      <Group justify="space-between"  wrap="nowrap" align="flex-start" gap="md" h="100%">
        <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="center">
            <Flex gap="md">
            <Text fw={500} size="md" >
              {event.time} 
            </Text>
            <Text lh={1.2} fw={600} size="md"  >
             {event.artist}
            </Text>
            </Flex>
            {isHappening && (
              <Badge color="orange" variant="filled" size="sm" radius="sm">
                Happening Now
              </Badge>
            )}
          </Group>
          
          <Group gap="xs" wrap="wrap">
            {event.date && (
              <Badge 
                color={event.date === '24.5' ? 'blue' : 'violet'} 
                variant="light" 
                size="sm"
              >
                {event.date === '24.5' ? 'Saturday' : 'Sunday'}
              </Badge>
            )}
            <Badge color="gray" variant="light" size="sm">
              {formatDuration(event.duration)}
            </Badge>
          </Group>
        </Stack>
        
        <Switch 
          checked={isAttending}
          onChange={handleToggleAttending}
          size="md"
          color="green"
          style={{ flexShrink: 0 }}
        />
      </Group>
    </Card>
  );
}
