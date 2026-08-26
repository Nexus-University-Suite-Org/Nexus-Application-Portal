import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Inbox,
  Send,
  Star,
  FileText,
  Trash2,
  Archive,
  Mail,
  MailOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getMessages,
  getDrafts,
  softDeleteMessage,
  toggleStar,
  type Message,
  type MessageDraft,
} from "@/lib/messaging";

const DEMO_USER_ID = 1;

type Tab = "inbox" | "sent" | "starred" | "drafts";

const tabs: { key: Tab; label: string; icon: typeof Inbox }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "sent", label: "Sent", icon: Send },
  { key: "starred", label: "Starred", icon: Star },
  { key: "drafts", label: "Drafts", icon: FileText },
];

const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "inbox";
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<MessageDraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (activeTab === "drafts") {
      getDrafts(DEMO_USER_ID)
        .then(setDrafts)
        .catch(() => setDrafts([]))
        .finally(() => setLoading(false));
    } else {
      getMessages(DEMO_USER_ID, activeTab)
        .then(setMessages)
        .catch(() => setMessages([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleDelete = async (id: number) => {
    await softDeleteMessage(DEMO_USER_ID, id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const handleStar = async (id: number) => {
    await toggleStar(DEMO_USER_ID, id);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              recipientStarred: !m.recipientStarred,
              senderStarred: !m.senderStarred,
            }
          : m,
      ),
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading text-3xl font-light">Messages</h1>
          <Link
            to="/messages/compose"
            className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            Compose
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSearchParams({ tab: key })}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Loading...
          </div>
        ) : activeTab === "drafts" ? (
          drafts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No drafts
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <Link
                  key={draft.id}
                  to={`/messages/compose?draft=${draft.id}`}
                  className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition"
                >
                  <p className="font-medium text-sm">
                    {draft.subject || "(No subject)"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {draft.body || "(No content)"}
                  </p>
                </Link>
              ))}
            </div>
          )
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No messages
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg) => {
              const isUnread = !msg.readAt;
              const isStarred =
                activeTab === "starred"
                  ? true
                  : msg.recipientStarred || msg.senderStarred;
              return (
                <div
                  key={msg.id}
                  className={`group flex items-center gap-3 p-4 rounded-lg border transition hover:bg-muted/50 ${
                    isUnread ? "border-accent/30 bg-accent/5" : "border-border"
                  }`}
                >
                  <Link
                    to={`/messages/${msg.id}`}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      {isUnread ? (
                        <Mail className="w-4 h-4 text-accent shrink-0" />
                      ) : (
                        <MailOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <p
                        className={`text-sm truncate ${
                          isUnread ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {msg.subject}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">
                      {msg.body}
                    </p>
                  </Link>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(msg.createdAt)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleStar(msg.id)}
                      className="p-1 rounded hover:bg-muted"
                      title={isStarred ? "Unstar" : "Star"}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          isStarred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1 rounded hover:bg-muted"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MessagesPage;
