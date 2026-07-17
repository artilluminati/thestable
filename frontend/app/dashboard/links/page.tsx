import { UrlForm } from "@/components/url-form";
import { UrlList } from "@/components/url-list";

export default function LinksPage() {
    return (
        <div className="space-y-8">
            <section>
                <h1 className="mb-4 text-xl font-black font-climate-crisis-sans text-neutral-100">
                    Создать короткую ссылку
                </h1>
                <UrlForm />
            </section>
            <section>
                <h2 className="mb-4 text-lg font-black font-climate-crisis-sans text-neutral-100">
                    Мои ссылки
                </h2>
                <UrlList />
            </section>
        </div>
    );
}
