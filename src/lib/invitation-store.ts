import { createHash } from "node:crypto";
import { createInvitationSqlite } from "@/lib/db";
import { isSupabaseDataConfigured } from "@/lib/supabase/env";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export type InvitationInput = {
  name: string;
  email: string;
  phone?: string;
  source?: string;
};

export async function requestInvitation(
  input: InvitationInput
): Promise<{ alreadyExists: boolean }> {
  if (!isSupabaseDataConfigured()) {
    return createInvitationSqlite(input);
  }

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("invitations").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    source: input.source ?? "teaser",
  });

  if (!error) return { alreadyExists: false };
  if (error.code === "23505") return { alreadyExists: true };
  if (error.code === "PGRST205") return storeInvitationObject(input);
  throw error;
}

const INVITATION_BUCKET = "invitation-requests";

async function storeInvitationObject(
  input: InvitationInput
): Promise<{ alreadyExists: boolean }> {
  const supabase = createSupabaseServiceClient();
  const { error: bucketError } = await supabase.storage.getBucket(INVITATION_BUCKET);

  if (bucketError) {
    const { error: createError } = await supabase.storage.createBucket(INVITATION_BUCKET, {
      public: false,
    });
    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw createError;
    }
  }

  const key = createHash("sha256").update(input.email).digest("hex");
  const payload = JSON.stringify({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    source: input.source ?? "teaser",
    status: "pending",
    created_at: new Date().toISOString(),
  });
  const { error: uploadError } = await supabase.storage
    .from(INVITATION_BUCKET)
    .upload(`${key}.json`, payload, {
      contentType: "application/json",
      upsert: false,
    });

  if (!uploadError) return { alreadyExists: false };
  if (
    uploadError.message.toLowerCase().includes("already exists") ||
    uploadError.message.toLowerCase().includes("duplicate")
  ) {
    return { alreadyExists: true };
  }
  throw uploadError;
}
