"use client";

import { Box, Button, Container, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DateTimeFilter } from './DateTimeFilter';
import { EventCard } from './EventCard';
import { LocationFilter } from './LocationFilter';

interface Event {
  time: string;
  artist: string;
  duration: number;
  attending: boolean;
  date?: string;
}

interface Location {
  name: string;
  address: string;
  events: Event[];
}

interface EventsGridProps {
  data: {
    locations: Location[];
  };
}

export function EventsGrid({ data: initialData }: EventsGridProps) {
  const [locations, setLocations] = useState<Location[]>(initialData.locations);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    initialData.locations.map(location => location.name)
  );
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [filteredEvents, setFilteredEvents] = useState<{ [key: string]: Event[] }>({});
  const [showAttendingOnly, setShowAttendingOnly] = useState(false);
  const [dayHeights, setDayHeights] = useState<{ saturday: number; sunday: number; other: number }>({ saturday: 0, sunday: 0, other: 0 });

  // Helper function to convert time string to hour number
  const timeToHour = (timeStr: string): number => {
    const match = timeStr.match(/^(\d+)h/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  };

  // Helper function to convert date string to a numeric value for sorting
  const dateToNumeric = (dateStr: string | undefined): number => {
    if (!dateStr) return 999; // If no date, put at the end
    
    // Extract day and month from format like "24.5"
    const parts = dateStr.split('.');
    if (parts.length === 2) {
      // Ensure Saturday (24.5) comes before Sunday (25.5)
      return parseInt(parts[0], 10);
    }
    return 999; // If invalid format, put at the end
  };
  
  // Apply filters to events and sort by day and time
  useEffect(() => {
    const filtered: { [key: string]: Event[] } = {};
    
    // First, create a copy of all events and sort them by day and time
    const allEventsByLocation: { [key: string]: Event[] } = {};
    
    // Collect all events by location
    locations.forEach(location => {
      if (!selectedLocations.includes(location.name)) {
        return;
      }
      
      // Filter events based on criteria
      const filteredLocationEvents = location.events.filter(event => {
        const hour = timeToHour(event.time);
        const dateMatches = selectedDate === 'all' || !event.date || event.date === selectedDate;
        const timeMatches = hour >= timeRange[0] && hour <= timeRange[1];
        const attendingMatches = !showAttendingOnly || event.attending;
        
        return dateMatches && timeMatches && attendingMatches;
      });
      
      if (filteredLocationEvents.length > 0) {
        allEventsByLocation[location.name] = filteredLocationEvents;
      }
    });
    
    // Group events by day first
    const saturdayEvents: { [key: string]: Event[] } = {};
    const sundayEvents: { [key: string]: Event[] } = {};
    const otherEvents: { [key: string]: Event[] } = {};
    
    // Helper function to calculate timeline height
    const calculateTimelineHeight = (dayEvents: Event[]) => {
      if (dayEvents.length === 0) return 0;
      
      const timeValues = dayEvents.map(e => {
        const timeMatch = e.time.match(/^(\d+)h/);
        return timeMatch ? parseInt(timeMatch[1], 10) : 0;
      });
      const minHour = Math.max(0, Math.min(...timeValues) - 1);
      const maxHour = Math.min(24, Math.max(...timeValues) + 1);
      return (maxHour - minHour + 1) * 100;
    };
    
    // Sort events into day groups
    Object.entries(allEventsByLocation).forEach(([locationName, events]) => {
      const saturday: Event[] = [];
      const sunday: Event[] = [];
      const other: Event[] = [];
      
      events.forEach(event => {
        if (event.date === '24.5') {
          saturday.push(event);
        } else if (event.date === '25.5') {
          sunday.push(event);
        } else {
          other.push(event);
        }
      });
      
      // Sort each day's events by time
      const sortByTime = (a: Event, b: Event) => {
        const hourA = timeToHour(a.time);
        const hourB = timeToHour(b.time);
        return hourA - hourB;
      };
      
      saturday.sort(sortByTime);
      sunday.sort(sortByTime);
      other.sort(sortByTime);
      
      if (saturday.length > 0) saturdayEvents[locationName] = saturday;
      if (sunday.length > 0) sundayEvents[locationName] = sunday;
      if (other.length > 0) otherEvents[locationName] = other;
    });
    
    // Calculate the maximum height for each day across all locations
    let maxSaturdayHeight = 0;
    let maxSundayHeight = 0;
    let maxOtherHeight = 0;
    
    // Find the maximum height for Saturday events across all locations
    Object.values(saturdayEvents).forEach(events => {
      const height = calculateTimelineHeight(events);
      maxSaturdayHeight = Math.max(maxSaturdayHeight, height);
    });
    
    // Find the maximum height for Sunday events across all locations
    Object.values(sundayEvents).forEach(events => {
      const height = calculateTimelineHeight(events);
      maxSundayHeight = Math.max(maxSundayHeight, height);
    });
    
    // Find the maximum height for other events across all locations
    Object.values(otherEvents).forEach(events => {
      const height = calculateTimelineHeight(events);
      maxOtherHeight = Math.max(maxOtherHeight, height);
    });
    
    // Store the calculated heights in state for use in the render function
    setDayHeights({
      saturday: maxSaturdayHeight,
      sunday: maxSundayHeight,
      other: maxOtherHeight
    });
    
    // Combine all events back together, with Saturday first, then Sunday
    Object.entries(saturdayEvents).forEach(([locationName, events]) => {
      filtered[locationName] = events;
    });
    
    Object.entries(sundayEvents).forEach(([locationName, events]) => {
      filtered[locationName] = filtered[locationName] ? [...filtered[locationName], ...events] : events;
    });
    
    Object.entries(otherEvents).forEach(([locationName, events]) => {
      filtered[locationName] = filtered[locationName] ? [...filtered[locationName], ...events] : events;
    });
    
    setFilteredEvents(filtered);
  }, [locations, selectedLocations, timeRange, selectedDate, showAttendingOnly]);

  // Sort events by day and time when component mounts
  useEffect(() => {
    // Create a sorted copy of the locations with events sorted by day and time
    const locationsWithSortedEvents = locations.map(location => {
      const sortedEvents = [...location.events].sort((a, b) => {
        // First sort by date (day)
        const dateA = dateToNumeric(a.date);
        const dateB = dateToNumeric(b.date);
        
        if (dateA !== dateB) {
          return dateA - dateB; // Sort by day (ascending)
        }
        
        // If same day, sort by time
        const hourA = timeToHour(a.time);
        const hourB = timeToHour(b.time);
        return hourA - hourB; // Sort by hour (ascending)
      });
      
      return {
        ...location,
        events: sortedEvents
      };
    });
    
    setLocations(locationsWithSortedEvents);
  }, []);
  
  // Save attending state to localStorage
  const saveAttendingState = (attendingState: Record<string, boolean>) => {
    try {
      localStorage.setItem('viradaAttendingState', JSON.stringify(attendingState));
    } catch (error) {
      console.error('Error saving attending state:', error);
    }
  };
  
  // Load saved attending state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('viradaAttendingState');
      if (savedState) {
        const parsedState = JSON.parse(savedState) as Record<string, boolean>;
        
        // Update locations with saved attending state
        setLocations(prevLocations => {
          return prevLocations.map(location => {
            return {
              ...location,
              events: location.events.map(event => {
                // Create a unique ID for each event
                const eventId = `${location.name}-${event.artist}-${event.time}`;
                
                if (parsedState[eventId] !== undefined) {
                  return { ...event, attending: parsedState[eventId] };
                }
                return event;
              })
            };
          });
        });
      }
    } catch (error) {
      console.error('Error loading attending state:', error);
    }
  }, []);
  
  // Handle toggling attending status for an event
  const handleToggleAttending = (locationName: string, artistName: string, attending: boolean) => {
    setLocations(prevLocations => {
      const newLocations = prevLocations.map(location => {
        if (location.name === locationName) {
          return {
            ...location,
            events: location.events.map(event => {
              if (event.artist === artistName) {
                return { ...event, attending };
              }
              return event;
            })
          };
        }
        return location;
      });
      
      // Save the updated attending state to localStorage
      const attendingState: Record<string, boolean> = {};
      
      newLocations.forEach(location => {
        location.events.forEach(event => {
          const eventId = `${location.name}-${event.artist}-${event.time}`;
          attendingState[eventId] = event.attending;
        });
      });
      
      saveAttendingState(attendingState);
      
      return newLocations;
    });
  };

  return (
    <Container size="xl" py="xl">
      {/* <Title order={1} mb="lg">Virada Cultural 2025</Title> */}
      <Image src="/viradasp.svg" alt="Virada Cultural 2025" width={240} height={240} style={{
        display: 'block',
        margin: '0 auto',
        marginBottom: '24px'
      }}/>
      
      {/* Desktop Filters */}
      <Box display={{ base: 'none', md: 'block' }} mb="xl">
        <Stack>
          <Group grow>
            <LocationFilter
              locations={initialData.locations.map((loc: Location) => loc.name)}
              selectedLocations={selectedLocations}
              onLocationChange={setSelectedLocations}
            />
            
            <DateTimeFilter
              onTimeRangeChange={setTimeRange}
              onDateChange={setSelectedDate}
            />
          </Group>
          
          <Button
            variant={showAttendingOnly ? "filled" : "outline"}
            color="green"
            onClick={() => setShowAttendingOnly(!showAttendingOnly)}
            w="fit-content"
          >
            {showAttendingOnly ?  "Mostrar apenas os eventos que estou participando" : "Mostrar Todos os eventos"}
          </Button>
        </Stack>
      </Box>
      
      {/* Mobile Filters */}
      <Box display={{ base: 'block', md: 'none' }} mb="xl">
        <Stack gap='lg'>
          <LocationFilter
            locations={initialData.locations.map((loc: Location) => loc.name)}
            selectedLocations={selectedLocations}
            onLocationChange={setSelectedLocations}
          />
          
          {/* <DateTimeFilter
            onTimeRangeChange={setTimeRange}
            onDateChange={setSelectedDate}
          /> */}
          
          <Button
            variant={showAttendingOnly ? "filled" : "outline"}
            color="cyan"
            onClick={() => setShowAttendingOnly(!showAttendingOnly)}
           
          >
            {showAttendingOnly ? "Eventos selecionados" : "Todos os eventos"}
          </Button>
        </Stack>
      </Box>
      
      {/* Desktop View - Horizontal Scrolling */}
      <Box display={{ base: 'none', md: 'block' }}>
        <ScrollArea type="scroll" scrollbarSize={8} offsetScrollbars scrollHideDelay={500}>
          <Box style={{ display: 'flex', minWidth: 'max-content', gap: '16px', paddingBottom: '16px' }}>
            {Object.keys(filteredEvents).length > 0 ? (
              Object.entries(filteredEvents).map(([locationName, events]) => {
                // Split events by day
                const saturdayEvents = events.filter(event => event.date === '24.5')
                  .sort((a, b) => timeToHour(a.time) - timeToHour(b.time));
                
                const sundayEvents = events.filter(event => event.date === '25.5')
                  .sort((a, b) => timeToHour(a.time) - timeToHour(b.time));
                
                const otherEvents = events.filter(event => event.date !== '24.5' && event.date !== '25.5')
                  .sort((a, b) => timeToHour(a.time) - timeToHour(b.time));
                
                return (
                  <Box key={locationName} style={{ minWidth: '300px', maxWidth: '350px' }}>
                    <Stack>
                      <Title order={3}>{locationName}</Title>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {locations.find(loc => loc.name === locationName)?.address}
                      </Text>
                      <ScrollArea style={{ height: '70vh' }} offsetScrollbars>
                        <Stack>
                          {/* Saturday Events */}
                          {saturdayEvents.length > 0 && (
                            <>
                              <Title order={4} mt="md" style={{ color: '#1976d2' }}>Saturday (24.5)</Title>
                              {saturdayEvents.map((event, index) => (
                                <EventCard
                                  key={`sat-${event.time}-${event.artist}`}
                                  event={event}
                                  onToggleAttending={(attending) => 
                                    handleToggleAttending(
                                      locationName, 
                                      event.artist,
                                      attending
                                    )
                                  }
                                />
                              ))}
                            </>
                          )}
                          
                          {/* Sunday Events */}
                          {sundayEvents.length > 0 && (
                            <>
                              <Title order={4} mt="md" style={{ color: '#9c27b0' }}>Sunday (25.5)</Title>
                              {sundayEvents.map((event, index) => (
                                <EventCard
                                  key={`sun-${event.time}-${event.artist}`}
                                  event={event}
                                  onToggleAttending={(attending) => 
                                    handleToggleAttending(
                                      locationName, 
                                      event.artist,
                                      attending
                                    )
                                  }
                                />
                              ))}
                            </>
                          )}
                          
                          {/* Other Events */}
                          {otherEvents.length > 0 && (
                            <>
                              <Title order={4} mt="md" style={{ color: '#757575' }}>Other Events</Title>
                              {otherEvents.map((event, index) => (
                                <EventCard
                                  key={`other-${event.time}-${event.artist}`}
                                  event={event}
                                  onToggleAttending={(attending) => 
                                    handleToggleAttending(
                                      locationName, 
                                      event.artist,
                                      attending
                                    )
                                  }
                                />
                              ))}
                            </>
                          )}
                        </Stack>
                      </ScrollArea>
                    </Stack>
                  </Box>
                );
              })
            ) : (
              <Text ta="center" fz="lg" fw={500} w="100%">
                No events match your filters. Try adjusting your selection.
              </Text>
            )}
          </Box>
        </ScrollArea>
      </Box>
      
      {/* Mobile View - Vertical Columns with Horizontal Scroll */}
      <Box display={{ base: 'block', md: 'none' }} mt="xl">
        <ScrollArea type="scroll" scrollbarSize={8} offsetScrollbars>
          <Box style={{ display: 'flex', gap: '16px', paddingBottom: '16px' }}>
            {Object.keys(filteredEvents).length > 0 ? (
              Object.entries(filteredEvents).map(([locationName, events]) => {
                // Split events by day
                const saturdayEvents = events.filter(event => event.date === '24.5')
                  .sort((a, b) => timeToHour(a.time) - timeToHour(b.time));
                
                const sundayEvents = events.filter(event => event.date === '25.5')
                  .sort((a, b) => timeToHour(a.time) - timeToHour(b.time));
                
                const otherEvents = events.filter(event => event.date !== '24.5' && event.date !== '25.5')
                  .sort((a, b) => timeToHour(a.time) - timeToHour(b.time));
                
                // Calculate timeline heights for each day
                const calculateTimelineHeight = (dayEvents: Event[]) => {
                  if (dayEvents.length === 0) return 0;
                  
                  const timeValues = dayEvents.map(e => {
                    const timeMatch = e.time.match(/^(\d+)h/);
                    return timeMatch ? parseInt(timeMatch[1], 10) : 0;
                  });
                  const minHour = Math.max(0, Math.min(...timeValues) - 1);
                  const maxHour = Math.min(24, Math.max(...timeValues) + 1);
                  return (maxHour - minHour + 1) * 100;
                };
                
                // Use the global day heights for consistent sizing across all locations
                const saturdayHeight = saturdayEvents.length > 0 ? dayHeights.saturday : 0;
                const sundayHeight = sundayEvents.length > 0 ? dayHeights.sunday : 0;
                const otherHeight = otherEvents.length > 0 ? dayHeights.other : 0;
                
                // Calculate min hours for positioning
                const getSaturdayMinHour = () => {
                  if (saturdayEvents.length === 0) return 0;
                  const timeValues = saturdayEvents.map(e => {
                    const timeMatch = e.time.match(/^(\d+)h/);
                    return timeMatch ? parseInt(timeMatch[1], 10) : 0;
                  });
                  return Math.max(0, Math.min(...timeValues) - 1);
                };
                
                const getSundayMinHour = () => {
                  if (sundayEvents.length === 0) return 0;
                  const timeValues = sundayEvents.map(e => {
                    const timeMatch = e.time.match(/^(\d+)h/);
                    return timeMatch ? parseInt(timeMatch[1], 10) : 0;
                  });
                  return Math.max(0, Math.min(...timeValues) - 1);
                };
                
                const getOtherMinHour = () => {
                  if (otherEvents.length === 0) return 0;
                  const timeValues = otherEvents.map(e => {
                    const timeMatch = e.time.match(/^(\d+)h/);
                    return timeMatch ? parseInt(timeMatch[1], 10) : 0;
                  });
                  return Math.max(0, Math.min(...timeValues) - 1);
                };
                
                const saturdayMinHour = getSaturdayMinHour();
                const sundayMinHour = getSundayMinHour();
                const otherMinHour = getOtherMinHour();
                
                return (
                  <Box 
                    key={locationName} 
                    style={{ 
                      minWidth: '280px', 
                      maxWidth: 'calc(75vw)', 
                      flex: '0 0 auto',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '16px'
                    }}
                  >
                    <Stack>
                      <Title order={3}>{locationName}</Title>
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {locations.find(loc => loc.name === locationName)?.address}
                      </Text>
                      
                      {/* Saturday Events */}
                      {saturdayEvents.length > 0 && (
                        <>
                          <Title order={4} mt="md" style={{ color: '#1976d2' }}>Saturday (24.5)</Title>
                          <Box style={{ position: 'relative', height: `${saturdayHeight}px` }}>
                            <Box style={{ position: 'relative', height: '100%' }}>
                              {saturdayEvents.map((event, index) => {
                                // Calculate position based on time
                                const timeMatch = event.time.match(/^(\d+)h/);
                                const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
                                const top = (hour - saturdayMinHour) * 100; // 100px per hour
                                const height = Math.max(48, (event.duration / 60) * 100 - 12); // Convert minutes to pixels
                                
                                return (
                                  <Box 
                                    key={`sat-${event.time}-${event.artist}`}
                                    style={{
                                      position: 'absolute',
                                      top: `${top}px`,
                                      left: 0,
                                      right: 0,
                                      height: `${height}px`,
                                      padding: '0 0 24px 0'
                                    }}
                                  >
                                    <EventCard
                                      event={event}
                                      onToggleAttending={(attending) => 
                                        handleToggleAttending(
                                          locationName, 
                                          event.artist,
                                          attending
                                        )
                                      }
                                    />
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        </>
                      )}
                      
                      {/* Sunday Events */}
                      {sundayEvents.length > 0 && (
                        <>
                          <Title order={4} mt="md" style={{ color: '#9c27b0' }}>Sunday (25.5)</Title>
                          <Box style={{ position: 'relative', height: `${sundayHeight}px` }}>
                            <Box style={{ position: 'relative', height: '100%' }}>
                              {sundayEvents.map((event, index) => {
                                // Calculate position based on time
                                const timeMatch = event.time.match(/^(\d+)h/);
                                const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
                                const top = (hour - sundayMinHour) * 100; // 100px per hour
                                const height = Math.max(48, (event.duration / 60) * 100 - 12); // Convert minutes to pixels
                                
                                return (
                                  <Box 
                                    key={`sun-${event.time}-${event.artist}`}
                                    style={{
                                      position: 'absolute',
                                      top: `${top}px`,
                                      left: 0,
                                      right: 0,
                                      height: `${height}px`,
                                      padding: '0 0 24px 0'
                                    }}
                                  >
                                    <EventCard
                                      event={event}
                                      onToggleAttending={(attending) => 
                                        handleToggleAttending(
                                          locationName, 
                                          event.artist,
                                          attending
                                        )
                                      }
                                    />
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        </>
                      )}
                      
                      {/* Other Events (no specific day) */}
                      {otherEvents.length > 0 && (
                        <>
                          <Title order={4} mt="md" style={{ color: '#757575' }}>Other Events</Title>
                          <Box style={{ position: 'relative', height: `${otherHeight}px` }}>
                            <Box style={{ position: 'relative', height: '100%' }}>
                              {otherEvents.map((event, index) => {
                                // Calculate position based on time
                                const timeMatch = event.time.match(/^(\d+)h/);
                                const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
                                const top = (hour - otherMinHour) * 100; // 100px per hour
                                const height = Math.max(48, (event.duration / 60) * 100 - 12); // Convert minutes to pixels
                                
                                return (
                                  <Box 
                                    key={`other-${event.time}-${event.artist}`}
                                    style={{
                                      position: 'absolute',
                                      top: `${top}px`,
                                      left: 0,
                                      right: 0,
                                      height: `${height}px`,
                                      padding: '0 0 24px 0'
                                    }}
                                  >
                                    <EventCard
                                      event={event}
                                      onToggleAttending={(attending) => 
                                        handleToggleAttending(
                                          locationName, 
                                          event.artist,
                                          attending
                                        )
                                      }
                                    />
                                  </Box>
                                );
                              })}
                            </Box>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Box>
                );
              })
            ) : (
              <Text ta="center" fz="lg" fw={500} w="100%">
                No events match your filters. Try adjusting your selection.
              </Text>
            )}
          </Box>
        </ScrollArea>
      </Box>
    </Container>
  );
}
