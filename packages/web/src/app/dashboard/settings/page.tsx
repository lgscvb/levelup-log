"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n";

export default function SettingsPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const tr = t(locale).settings;
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        birth_date: profile.birth_date,
        default_public: profile.default_public,
      })
      .eq("id", user.id);

    setSaving(false);
    setMessage(error ? `Error: ${error.message}` : tr.saved);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!profile)
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-bold">{tr.title}</h1>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-400">
            {tr.displayName}
          </label>
          <input
            type="text"
            value={profile.display_name || ""}
            onChange={(e) =>
              setProfile({ ...profile, display_name: e.target.value })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">{tr.bio}</label>
          <textarea
            value={profile.bio || ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">
            {tr.birthDate}
          </label>
          <input
            type="date"
            value={profile.birth_date || ""}
            onChange={(e) =>
              setProfile({ ...profile, birth_date: e.target.value })
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="default_public"
            checked={profile.default_public ?? true}
            onChange={(e) =>
              setProfile({ ...profile, default_public: e.target.checked })
            }
            className="h-4 w-4 accent-emerald-500"
          />
          <label htmlFor="default_public" className="text-sm text-gray-400">
            {tr.publicDefault}
          </label>
        </div>

        {message && (
          <p
            className={`text-sm ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-emerald-600 px-6 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? tr.saving : tr.save}
        </button>
      </div>

      <hr className="my-8 border-gray-800" />

      <button
        onClick={handleLogout}
        className="w-full rounded-lg border border-red-800 px-6 py-2.5 text-red-400 transition hover:bg-red-950"
      >
        {tr.signOut}
      </button>
    </main>
  );
}
