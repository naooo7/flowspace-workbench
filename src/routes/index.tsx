import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CalendarDays, ChevronRight, FileText } from "lucide-react";
import { Screen } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { findMaterial, todaysFocus, user } from "@/data/prototype";
import { dayKey, formatDuration, needsReview, streak, summarize, useActivity } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fundamental. — Your daily question drill" },
      {
        name: "description",
        content:
          "Fundamental. is a calm, focused drilling app for SKD, UTBK, TPA and more. Pick a topic, answer questions, understand every explanation.",
      },
      { property: "og:title", content: "Fundamental. — Your daily question drill" },
      {
        property: "og:description",
        content: "Less interface. More learning. A serious study tool that gets out of your way.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const data = useActivity();
  const attempts = data?.attempts ?? [];
  const reviewCount = needsReview(attempts).length;
  const today = new Date();
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const key = dayKey(date);
    return { key, label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], count: attempts.filter((a) => dayKey(new Date(a.answeredAt)) === key).length, isToday: key === dayKey(today) };
  });
  const ws = summarize(attempts.filter((a) => weekDays.some((d) => d.key === dayKey(new Date(a.answeredAt)))));
  const days = streak(attempts);
  const lastSession = data?.sessions.at(-1);
  const focusMaterial = lastSession
    ? findMaterial(lastSession.examId, lastSession.subtestId, lastSession.materialId)
    : undefined;
  const focus = lastSession && focusMaterial
    ? { examId: lastSession.examId, subtestId: lastSession.subtestId, materialId: lastSession.materialId, name: focusMaterial.name }
    : todaysFocus;
  const qCount = focusMaterial?.questionCount ?? todaysFocus.questions;
  const qMinutes = focusMaterial?.minutes ?? todaysFocus.minutes;
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Screen>
      <header className="mb-4 flex items-start justify-between">
        <p className="relative inline-block text-[19px] font-bold leading-none tracking-[-0.03em]">
          Fundamental<span className="text-primary">.</span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 left-0 h-[3px] w-full -rotate-1 rounded-full bg-gradient-to-r from-primary/30 via-primary/20 to-primary/5"
          />
        </p>
        <button type="button" aria-label="Notifications" className="relative mt-0.5 text-foreground/80">
          <Bell className="size-[22px]" strokeWidth={1.6} />
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive" />
        </button>
      </header>

      <div className="mb-4">
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.025em]" suppressHydrationWarning>
          {greeting}, {user.name}.
        </h1>
        <p className="mt-0.5 text-[15px] text-muted-foreground">Preparing for {institution?.short ?? "your exam"}</p>
      </div>

      <section aria-label="Streak" className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-soft">
        <span role="img" aria-label="Streak" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warm-soft text-[16px] leading-none">
          🔥
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{days ? `${days} day${days === 1 ? "" : "s"} streak` : "No streak yet"}</p>
          <p className="text-[12px] text-muted-foreground">{days ? "Nice consistency." : "Start today."}</p>
        </div>
        <span className="h-8 w-px bg-border" />
        <Link to="/progress" className="flex items-center gap-1 pl-1 text-[12px] font-medium text-primary">
          Keep it going! <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </section>

      <section aria-label="This Week" className="mt-3.5 rounded-2xl border border-border bg-surface p-4 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.01em]">This Week</h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {ws.total ? `${ws.total} questions · ${ws.accuracy}% · ${formatDuration(ws.timeMs)}` : "No activity yet"}
            </p>
          </div>
          <Link to="/progress" className="flex items-center gap-1 text-[12px] font-medium text-primary">
            View details <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-7">
          {weekDays.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1.5">
              <span
                className={`flex size-[22px] items-center justify-center rounded-full text-[10px] font-medium tabular ${d.count ? "bg-primary text-primary-foreground" : "bg-muted"} ${d.isToday ? "ring-1 ring-primary/40 ring-offset-2 ring-offset-surface" : ""}`}
              >
                {d.count || ""}
              </span>
              <span className={`text-[11px] ${d.isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{d.label}</span>
            </div>
          ))}
        </div>
        {ws.total === 0 && (
          <div className="mt-4 flex flex-col items-center pb-1 text-center">
            <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary-soft/60">
              <CalendarDays className="size-6 text-primary/70" strokeWidth={1.5} />
              <span aria-hidden="true" className="absolute -left-2.5 top-2 h-[2px] w-2 -rotate-[28deg] rounded-full bg-primary/30" />
              <span aria-hidden="true" className="absolute -right-2.5 top-2 h-[2px] w-2 rotate-[28deg] rounded-full bg-primary/30" />
            </span>
            <p className="mt-2.5 text-[14px] font-medium">No activity yet</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">Start practicing to see your weekly activity.</p>
          </div>
        )}
      </section>

      <Link to="/review" className="tap mt-3.5 flex items-center gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-soft">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft">
          <FileText className="size-[18px] text-primary" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">Needs Review</p>
          <p className="text-[12.5px] text-muted-foreground">
            {reviewCount ? `${reviewCount} topic${reviewCount === 1 ? "" : "s"} need${reviewCount === 1 ? "s" : ""} another look` : "All caught up"}
          </p>
          {!reviewCount && <p className="mt-0.5 text-[11.5px] text-muted-foreground/80">No items yet</p>}
        </div>
        <ChevronRight className="size-4 text-muted-foreground/70" />
      </Link>

      <section className="relative mt-3.5 overflow-hidden rounded-2xl border border-primary/15 bg-primary-soft/50 p-4 shadow-soft">
        <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 size-44 rotate-12 rounded-[45%] bg-primary/5" />
        <div className="relative flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground">
            √x
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-muted-foreground">{lastSession ? "Continue" : "Suggested start"}</p>
            <p className="truncate text-[15px] font-medium tracking-[-0.01em]">{focus.name}</p>
            <p className="tabular text-[12px] text-muted-foreground">{qCount} questions · ~{qMinutes} min</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <Button asChild size="block" className="relative mt-3.5">
          <Link
            to="/practice/$examId/$subtestId/$materialId"
            params={{ examId: focus.examId, subtestId: focus.subtestId, materialId: focus.materialId }}
          >
            {lastSession ? "Continue" : "Start"} <ChevronRight className="size-4" />
          </Link>
        </Button>
      </section>
    </Screen>
  );
}
