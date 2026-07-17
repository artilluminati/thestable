import { RemindersList } from "@/components/reminders-list";

export default function RemindersPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-black font-climate-crisis-sans text-neutral-100">
                Напоминания
            </h1>
            <p className="text-sm text-neutral-400">
                Файлы из vault/reminders/. Создаются и редактируются как обычные
                заметки (через раздел «Заметки» или напрямую в Obsidian) - здесь
                только просмотр расписания и тестовая отправка в Telegram.
            </p>
            <RemindersList />
        </div>
    );
}
