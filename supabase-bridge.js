/* Supabase client and small helpers used by the app UI. */
(function () {
  const config = window.SUPABASE_CONFIG || {};
  const url = String(config.url || "").trim();
  const key = String(config.publishableKey || "").trim();

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("Supabase-biblioteket kunne ikkje lastast. Kontroller internettilgangen.");
  }
  if (!url.startsWith("https://") || url.includes("LIM_INN") || !key || key.includes("LIM_INN")) {
    throw new Error("Fyll først inn Project URL og Publishable key i fila supabase-config.js.");
  }

  const client = window.supabase.createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  const syncState = () => ({
    online: navigator.onLine,
    persistence: "not-available",
    pending: 0,
    error: ""
  });

  const notifyConnection = () => {
    window.dispatchEvent(new CustomEvent("farm-sync-state", { detail: syncState() }));
  };
  window.addEventListener("online", notifyConnection);
  window.addEventListener("offline", notifyConnection);

  client.getSyncState = syncState;
  client.countAnimals = async () => {
    const { count, error } = await client
      .from("animals")
      .select("id", { count: "exact", head: true });
    return { data: count, error };
  };

  window.supabaseClient = client;
})();
