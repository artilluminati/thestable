import type { Reminder } from "./types";

const WEEKDAY_LABELS: Record<string, string> = {
  mon: "Пн",
  tue: "Вт",
  wed: "Ср",
  thu: "Чт",
  fri: "Пт",
  sat: "Сб",
  sun: "Вс",
};

export function formatSchedule(schedule: Reminder["schedule"]): string {
  const time = typeof schedule.time === "string" ? schedule.time : "";

  switch (schedule.type) {
    case "once":
      return `Разово: ${schedule.date ?? "?"} в ${time}`;
    case "daily":
      return `Ежедневно в ${time}`;
    case "weekly": {
      const days = Array.isArray(schedule.days)
        ? schedule.days
            .map((d) => WEEKDAY_LABELS[String(d).toLowerCase()] ?? String(d))
            .join(", ")
        : "";
      return `По ${days} в ${time}`;
    }
    case "monthly":
      return `Каждый месяц ${schedule.day_of_month ?? "?"} числа в ${time}`;
    case "interval":
      return `Каждые ${schedule.every_days ?? "?"} дн. (с ${schedule.start_date ?? "?"}) в ${time}`;
    default:
      return "Неизвестное расписание";
  }
}

export function scheduleTypeLabel(type: unknown): string {
  switch (type) {
    case "once":
      return "Разово";
    case "daily":
      return "Ежедневно";
    case "weekly":
      return "Еженедельно";
    case "monthly":
      return "Ежемесячно";
    case "interval":
      return "Интервал";
    default:
      return "?";
  }
}
