import { EventsGrid } from "../components/EventsGrid";
import eventsData from "../data/events.json";

export default function Home() {
  return (
    <main>
      <EventsGrid data={eventsData} />
    </main>
  );
}
