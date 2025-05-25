"use client";

import { Box, Button, Flex, Stack, Text } from '@mantine/core';

interface LocationFilterProps {
  locations: string[];
  selectedLocations: string[];
  onLocationChange: (locations: string[]) => void;
}

export function LocationFilter({ 
  locations, 
  selectedLocations, 
  onLocationChange 
}: LocationFilterProps) {
  
  const handleLocationToggle = (location: string) => {
    // if all locations are selected, remove all
    if (selectedLocations.length === locations.length) {
      onLocationChange([]);
      return;
    }
    if (selectedLocations.includes(location)) {
      onLocationChange(selectedLocations.filter(l => l !== location));
    } else {
      onLocationChange([...selectedLocations, location]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLocations.length === locations.length) {
      onLocationChange([]);
    } else {
      onLocationChange([...locations]);
    }
  };

  return (
    <Stack>
        <Text fw={700} size="lg">Locations</Text>

      
      <Box style={{ maxHeight: '150px', overflowY: 'auto' }}>
        <Stack gap="xs">
        <Button
          size="sm"
          mb="sm"  
          color="green"     
          variant={selectedLocations.length === locations.length ? 'filled' : 'outline'}
          onClick={handleSelectAll}
        >
          Select All
        </Button>
        <Flex wrap="wrap" gap="xs">
          {locations.map(location => (
       
            <Button size="xs" w="fit-content" color="green" key={location} onClick={() => handleLocationToggle(location)} variant={selectedLocations.includes(location) ? 'filled' : 'outline'}>
              {location}
            </Button>
          ))}
          </Flex>
        </Stack>
      </Box>
    </Stack>
  );
}
