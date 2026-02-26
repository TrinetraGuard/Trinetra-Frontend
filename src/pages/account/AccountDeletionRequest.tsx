import { addDoc, collection } from "firebase/firestore";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebase";
import Footer from "@/pages/home/components/Footer";
import Navbar from "@/pages/home/components/Navbar";

const CONTACT_EMAIL = "nisargalokhande@gmail.com";

const AccountDeletionRequest = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [name, setName] = useState(user?.displayName ?? "");
  const [reason, setReason] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!confirmChecked) {
      setError("Please confirm that you understand the consequences of account deletion.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "deletion_requests"), {
        email: email.trim().toLowerCase(),
        name: name.trim() || null,
        reason: reason.trim() || null,
        userId: user?.uid || null,
        status: "pending",
        createdAt: new Date(),
        source: "web",
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Deletion request error:", err);
      setError("We couldn't submit your request. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <Navbar />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-xl mx-auto">
            <Card className="shadow-lg border-green-200 bg-green-50/30">
              <CardHeader>
                <div className="flex items-center gap-3 text-green-700">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Request received</CardTitle>
                    <CardDescription className="text-green-700/80 mt-1">
                      We will process your account deletion request as soon as possible.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <p>
                  You will receive a confirmation or follow-up at <strong>{email}</strong> once your request has been processed. If you do not hear back within a few business days, please contact us at{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">
                    {CONTACT_EMAIL}
                  </a>
                  .
                </p>
                <p className="text-gray-600">
                  Thank you for using Trinetra.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link to="/">Return to home</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Request account deletion</h1>
            <p className="text-gray-600 mt-2">
              Use this form to request that your Trinetra account and associated data be deleted.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Account & data deletion request</CardTitle>
                  <CardDescription>
                    Submit your request below. We will process it and confirm by email.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">What happens when you request deletion</p>
                  <p className="text-amber-700/90">
                    Your account, profile data, and other associated information will be permanently removed from our systems. This action cannot be undone. You may need to sign in once more so we can identify your account.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!user?.email}
                    className="bg-white"
                  />
                  {user?.email && (
                    <p className="text-xs text-gray-500">This is the email linked to your current account.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason or comments (optional)</Label>
                  <Textarea
                    id="reason"
                    placeholder="Any additional details for our team..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="bg-white resize-none"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="confirm"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="confirm" className="text-sm font-normal cursor-pointer">
                    I understand that my account and associated data will be permanently deleted and this cannot be undone.
                  </Label>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit deletion request"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="border-t bg-gray-50/50 text-sm text-gray-600">
              <p>
                You can also send a deletion request by email to{" "}
                <a href={`mailto:${CONTACT_EMAIL}?subject=Account%20Deletion%20Request`} className="text-blue-600 underline">
                  {CONTACT_EMAIL}
                </a>
                . Include the email address associated with your account.
              </p>
            </CardFooter>
          </Card>

          <p className="text-center mt-6 text-sm text-gray-500">
            <Link to="/" className="text-blue-600 hover:underline">Back to home</Link>
            {" · "}
            <a href="/privacy-policy.html" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Privacy policy
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AccountDeletionRequest;
