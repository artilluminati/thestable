import { UrlForm } from "@/components/url-form";
import { UrlList } from "@/components/url-list";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-4 text-xl font-semibold">Создать короткую ссылку</h1>
        <UrlForm />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Мои ссылки</h2>
        <UrlList />
      </section>
    </div>
  );
}
