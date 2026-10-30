import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secret = env.SUPABASE_SECRET_KEY;
const devProjectRef = "bqpnweyznvijtmwsctwj";

if (!url || !secret) {
  console.error("FAIL: missing Supabase env");
  process.exit(1);
}

if (!url.includes(devProjectRef)) {
  console.error(`FAIL: refusing to run outside dev project ${devProjectRef}`);
  process.exit(1);
}

const supabase = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
const guestEmail = `guest-${runId}@example.com`;
const otherEmail = `other-${runId}@example.com`;
const laterEmail = `d-${runId}@example.com`;
const phone = "+233570786961";
const runEmails = [guestEmail, otherEmail, laterEmail];
const createdUserIds: string[] = [];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function caseResult(name: string, test: () => Promise<void>) {
  try {
    await test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

try {
  await caseResult("A email match", async () => {
    const { error: insertError } = await supabase.from("customers").insert({
      full_name: `Guest ${runId}`,
      email: `Guest-${runId}@Example.com`,
      phone,
    });
    assert(!insertError, `could not create guest customer: ${insertError?.message}`);

    const { data: created, error: userError } = await supabase.auth.admin.createUser({
      email: guestEmail,
      email_confirm: true,
      user_metadata: { full_name: `Guest account ${runId}` },
    });
    assert(!userError && created.user, `could not create guest auth user: ${userError?.message}`);
    createdUserIds.push(created.user.id);

    const [{ data: profile, error: profileError }, { data: customer, error: customerError }] = await Promise.all([
      supabase.from("profiles").select("id, email").eq("id", created.user.id).maybeSingle(),
      supabase.from("customers").select("user_id, email").eq("email", guestEmail).maybeSingle(),
    ]);

    assert(!profileError && profile, `profile was not created: ${profileError?.message ?? "missing row"}`);
    assert(profile.email === guestEmail, `profile email was not normalized: ${profile.email}`);
    assert(!customerError && customer, `guest customer was not found: ${customerError?.message ?? "missing row"}`);
    assert(customer.user_id === created.user.id, "guest customer was not linked to the new account");
  });

  await caseResult("B phone is not identity", async () => {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: `Other ${runId}`,
        email: otherEmail,
        phone,
      })
      .select("user_id, email")
      .single();

    assert(!error && data, `could not create other customer: ${error?.message}`);
    assert(data.user_id === null, "same-phone customer was linked to the guest account");
    assert(data.email === otherEmail, `other customer email was not normalized: ${data.email}`);
  });

  await caseResult("C duplicate guest email is rejected", async () => {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: `Guest duplicate ${runId}`,
        email: `GUEST-${runId}@EXAMPLE.COM`,
      })
      .select("id")
      .maybeSingle();

    assert(!data, "duplicate guest email insert succeeded");
    assert(error, "duplicate guest email insert succeeded");
    assert(
      error.code === "23505" || /duplicate key|unique/i.test(error.message),
      `customer insert failed for a reason other than unique email: ${error.code} ${error.message}`,
    );
  });

  await caseResult("D customer created after account is linked", async () => {
    const { data: created, error: userError } = await supabase.auth.admin.createUser({
      email: laterEmail,
      email_confirm: true,
      user_metadata: { full_name: `Later ${runId}` },
    });
    assert(!userError && created.user, `could not create later auth user: ${userError?.message}`);
    createdUserIds.push(created.user.id);

    const { data, error } = await supabase
      .from("customers")
      .insert({
        full_name: `Later ${runId}`,
        email: `D-${runId}@Example.com`,
        user_id: null,
      })
      .select("user_id, email")
      .single();

    assert(!error && data, `could not create later customer: ${error?.message}`);
    assert(data.email === laterEmail, `later customer email was not normalized: ${data.email}`);
    assert(data.user_id === created.user.id, "customer created after the account was not linked");
  });
} finally {
  const { error: customerCleanupError } = await supabase.from("customers").delete().in("email", runEmails);
  if (customerCleanupError) console.error(`FAIL cleanup customers: ${customerCleanupError.message}`);

  for (const userId of createdUserIds) {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error(`FAIL cleanup auth user ${userId}: ${error.message}`);
  }

  const [{ count: customersLeft, error: customersLeftError }, { count: profilesLeft, error: profilesLeftError }] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }).in("email", runEmails),
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("email", runEmails),
  ]);
  const authUsersLeft = (
    await Promise.all(
      createdUserIds.map(async (userId) => {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (error) return 0;
        return data.user ? 1 : 0;
      }),
    )
  ).reduce((total, count) => total + count, 0);

  if (customersLeftError) console.error(`FAIL cleanup customer count: ${customersLeftError.message}`);
  if (profilesLeftError) console.error(`FAIL cleanup profile count: ${profilesLeftError.message}`);
  console.log(
    `CLEANUP customers=${customersLeft ?? "unknown"} profiles=${profilesLeft ?? "unknown"} auth_users=${authUsersLeft}`,
  );
}
