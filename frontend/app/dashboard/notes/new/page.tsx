import { NoteCreateForm } from "@/components/note-create-form";

export default function NewNotePage() {
    return (
        <div className="space-y-6">
            <h1 className="text-xl font-black font-climate-crisis-sans">
                Новая заметка
            </h1>
            <NoteCreateForm />
        </div>
    );
}
