import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Reply,
  Star,
  Trash2,
  Archive,
  MailOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getMessageById,
  markRead,
  softDeleteMessage,
  toggleStar,
  toggleArchive,
  type Message,
} from "@/lib/messaging";

const DEMO_USER_ID = 1;

const MessageDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMessageById(DEMO_USER_ID, Number(id))
      .then((msg) => {
        setMessage(msg);
        if (!msg.readAt) {
          markRead(DEMO_USER_ID, msg.id).then(setMessage);
        }
      })
      .catch(() => setMessage(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!message) return;
    await softDeleteMessage(DEMO_USER_ID, message.id);
    window.history.back();
  };

  const handleStar = async () => {
    if (!message) return;
    await toggleStar(DEMO_USER_ID, message.id);
    setMessage((prev) =>
      prev
        ? {
            ...prev,
            recipientStarred: !prev.recipientStarred,
            senderStarred: !prev.senderStarred,
          }
        : prev,
    );
  };

  const handleArchive = async () => {
    if (!message) return;
    await toggleArchive(DEMO_USER_ID, message.id);
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 pt-24 text-center text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8 pt-24 text-center text-muted-foreground">
          Message not found
        </div>
      </div>
    );
  }

  const isStarred = message.recipientStarred || message.senderStarred;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        <Link
          to="/messages?tab=inbox"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to inbox
        </Link>

        <div className="border border-border rounded-xl p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-light mb-2">
                {message.subject}
              </h1>
              <p className="text-sm text-muted-foreground">
                From: User #{message.fromUserId} &middot; To: User #
                {message.toUserId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleStar}
                className="p-2 rounded-lg hover:bg-muted transition"
                title={isStarred ? "Unstar" : "Star"}
              >
                <Star
                  className={`w-5 h-5 ${
                    isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
              <button
                onClick={handleArchive}
                className="p-2 rounded-lg hover:bg-muted transition"
                title="Archive"
              >
                <Archive className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-muted transition"
                title="Delete"
              >
                <Trash2 className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="prose prose-sm max-w-none mb-6">
            <p className="whitespace-pre-wrap">{message.body}</p>
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-2">Attachments</p>
              <div className="space-y-2">
                {message.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent hover:underline"
                  >
                    {att.name}
                    <span className="text-xs text-muted-foreground">
                      ({(att.size / 1024).toFixed(1)} KB)
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reply */}
          <div className="border-t border-border pt-4 mt-4">
            <Link
              to={`/messages/compose?reply=${message.id}&to=${message.fromUserId}&subject=Re: ${encodeURIComponent(message.subject)}`}
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              <Reply className="w-4 h-4" />
              Reply
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MessageDetailPage;
