import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  sendMessage,
  saveDraft,
  getDrafts,
  deleteDraft,
  type MessageDraft,
} from "@/lib/messaging";

const DEMO_USER_ID = 1;

const ComposeMessagePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const toUserId = searchParams.get("to") || "";
  const subjectParam = searchParams.get("subject") || "";
  const draftId = searchParams.get("draft");

  const [to, setTo] = useState(toUserId);
  const [subject, setSubject] = useState(subjectParam);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (draftId) {
      getDrafts(DEMO_USER_ID).then((drafts) => {
        const draft = drafts.find((d) => d.id === Number(draftId));
        if (draft) {
          setTo(draft.toUserId?.toString() || "");
          setSubject(draft.subject);
          setBody(draft.body);
        }
      });
    }
  }, [draftId]);

  const handleSend = async () => {
    if (!to || !subject || !body) return;
    setSending(true);
    try {
      await sendMessage(DEMO_USER_ID, {
        toUserId: Number(to),
        subject,
        body,
      });
      if (draftId) {
        await deleteDraft(DEMO_USER_ID, Number(draftId));
      }
      navigate("/messages?tab=sent");
    } catch {
      // error handled silently
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveDraft(DEMO_USER_ID, {
        toUserId: to ? Number(to) : undefined,
        subject,
        body,
      });
      navigate("/messages?tab=drafts");
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 pt-24">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="font-heading text-2xl font-light mb-6">
          {draftId ? "Edit Draft" : "Compose Message"}
        </h1>

        <div className="space-y-4 border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              To (User ID)
            </label>
            <input
              type="number"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient user ID"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={12}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSend}
              disabled={sending || !to || !subject || !body}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send"}
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-2 border border-border px-5 py-2 rounded-lg text-sm font-medium hover:bg-muted transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Draft"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ComposeMessagePage;
