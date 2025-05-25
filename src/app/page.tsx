"use client";

import { ActionIcon, Box } from "@mantine/core";
import Link from "next/link";
import { EventsGrid } from "../components/EventsGrid";
import eventsData from "../data/events.json";

export default function Home() {
  return (
    <main>
      <EventsGrid data={eventsData} />

      {/* Fixed Share Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <Link href="/share" passHref>
          <ActionIcon size="xl" radius="xl" variant="filled" color="cyan" aria-label="Share">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-labelledby="shareIconTitle"
            >
              <title id="shareIconTitle">Share Icon</title>
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </ActionIcon>
        </Link>
      </Box>
    </main>
  );
}
