"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useReminders, useTestReminder } from "@/hooks/use-reminders";
import { formatSchedule, scheduleTypeLabel } from "@/lib/reminder-schedule";

export function RemindersList() {
  const { data: reminders, isLoading, isError } = useReminders();
  const testReminder = useTestReminder();

  if (isLoading) return <p className="text-sm text-neutral-500">Загрузка...</p>;
  if (isError) return <p className="text-sm text-red-500">Не удалось загрузить напоминания</p>;
  if (!reminders || reminders.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        В vault/reminders пока нет ни одного файла с расписанием
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <Card key={reminder.path} className="flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-neutral-900">{reminder.title}</p>
              <Badge>{scheduleTypeLabel(reminder.schedule.type)}</Badge>
            </div>
            <p className="text-sm text-neutral-500">{formatSchedule(reminder.schedule)}</p>
            <p className="text-xs text-neutral-400">{reminder.path}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => testReminder.mutate(reminder.path)}
            disabled={testReminder.isPending}
          >
            Тест
          </Button>
        </Card>
      ))}
      {testReminder.isError && (
        <p className="text-sm text-red-500">{(testReminder.error as Error).message}</p>
      )}
      {testReminder.isSuccess && (
        <p className="text-sm text-green-600">Тестовое сообщение отправлено в Telegram</p>
      )}
    </div>
  );
}
