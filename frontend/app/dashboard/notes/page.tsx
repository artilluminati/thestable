import { NotesList } from "@/components/notes-list";

export default function NotesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-black font-climate-crisis-sans">
                Заметки
            </h1>
            <NotesList />
        </div>
    );
}
