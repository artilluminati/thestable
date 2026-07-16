import { NotesList } from "@/components/notes-list";

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Заметки</h1>
      <NotesList />
    </div>
  );
}
