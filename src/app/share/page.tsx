"use client";

import { ActionIcon, Box, Stack } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function SharePage() {
  return (
    <Stack justify="center" align="center" style={{ height: "100vh" }} p="lg">
      <Box style={{ width: "100%", maxWidth: "500px" }}>
        <Image
          src="/bit.ly_viradaviralata.svg"
          alt="Virada Viralata QR Code"
          width={500}
          height={500}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        />
      </Box>

      {/* Fixed Back Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 1000,
        }}
      >
        <Link href="/" passHref>
          <ActionIcon size="xl" radius="xl" variant="filled" color="cyan" aria-label="Back to Home">
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
              aria-labelledby="homeIconTitle"
            >
              <title id="homeIconTitle">Home Icon</title>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </ActionIcon>
        </Link>
      </Box>
    </Stack>
  );
}
