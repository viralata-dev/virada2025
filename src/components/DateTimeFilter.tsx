"use client";

import { Group, RangeSlider, SegmentedControl, Stack, Text } from "@mantine/core";
import { useState } from "react";

interface DateTimeFilterProps {
  onTimeRangeChange: (range: [number, number]) => void;
  onDateChange: (date: string) => void;
}

export function DateTimeFilter({ onTimeRangeChange, onDateChange }: DateTimeFilterProps) {
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);

  const handleTimeRangeChange = (range: [number, number]) => {
    setTimeRange(range);
    onTimeRangeChange(range);
  };

  return (
    <Stack>
      <Text fw={700} size="lg">
        Filters
      </Text>

      <Stack gap="xs">
        <Text fw={500}>Date</Text>
        <SegmentedControl
          data={[
            { label: "All Days", value: "all" },
            { label: "24.5", value: "24.5" },
            { label: "25.5", value: "25.5" },
          ]}
          onChange={onDateChange}
          defaultValue="all"
          fullWidth
        />
      </Stack>

      <Stack gap="xs" mt="md" mb="lg">
        <Group justify="space-between">
          <Text fw={500}>Time Range</Text>
          <Text size="sm" c="dimmed">
            {timeRange[0]}h - {timeRange[1]}h
          </Text>
        </Group>
        <RangeSlider
          min={0}
          max={24}
          step={1}
          minRange={1}
          value={timeRange}
          onChange={handleTimeRangeChange}
          marks={[
            { value: 0, label: "0h" },
            { value: 6, label: "6h" },
            { value: 12, label: "12h" },
            { value: 18, label: "18h" },
            { value: 24, label: "24h" },
          ]}
          labelAlwaysOn
          labelTransitionProps={{
            transition: "fade",
            duration: 200,
            timingFunction: "ease",
          }}
        />
      </Stack>
    </Stack>
  );
}
