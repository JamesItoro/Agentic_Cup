import { PageHeader } from "@/components/layout/page-header";
import { AssistantChat } from "@/components/chat/assistant-chat";

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div>
      <PageHeader
        title="AI Assistant"
        description="Ask questions about Project Phoenix and get answers grounded in authorised documents, with citations."
      />
      <AssistantChat initialQuery={q ?? ""} />
    </div>
  );
}
