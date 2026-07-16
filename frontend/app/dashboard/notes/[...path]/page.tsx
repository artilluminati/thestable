import { NoteEditor } from "@/components/note-editor";

// Catch-all segment so nested paths work too (e.g. /dashboard/notes/projects/idea).
// Next.js 15 makes route params async, same as cookies()/headers().
export default async function NotePage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const notePath = path.join("/");

  return <NoteEditor path={notePath} />;
}
