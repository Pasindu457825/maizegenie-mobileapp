import { supabase } from "../lib/supabase";
import type { PostDraft } from "../navigation/PriceForecastStack";

/* =====================================================
   TYPES
===================================================== */
export interface Post {
  id: string;
  farmer_id: string;
  seed_variety: string;
  price_per_kg: number;
  quantity_kg: number;
  district: string;
  week: number;
  season: string;
  created_at: string;
  status: "active" | "sold";
  farmer_name?: string;
  farmer_phone?: string | null; // only populated for the accepted buyer via RPC
  accepted_offer_id?: string | null;
}

export interface Offer {
  id: string;
  post_id: string;
  buyer_id: string;
  offer_price_per_kg: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  buyer_name?: string;
}

export interface PostWithOffers extends Post {
  offers: Offer[];
}

/** Fields a farmer is allowed to change on an active post. */
export interface PostUpdatePayload {
  seed_variety?: string;
  price_per_kg?: number;
  quantity_kg?: number;
  district?: string;
  week?: number;
  season?: string;
}

/* =====================================================
   CREATE POST
===================================================== */
export const createPost = async (postDraft: PostDraft): Promise<Post> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("posts")
    .insert({
      farmer_id: user.id,
      seed_variety: postDraft.seedVariety,
      price_per_kg: postDraft.pricePerKg,
      quantity_kg: postDraft.quantityKg,
      district: postDraft.district,
      week:
        postDraft.forecastWeek || parseInt(postDraft.forecastWeek as any) || 1,
      season: postDraft.season || "Maha",
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Post;
};

/* =====================================================
   LIST ACTIVE POSTS
===================================================== */
export const listPosts = async (filters?: {
  district?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Post[]> => {
  // Show ALL posts (active + sold) so sold posts remain visible in the
  // marketplace with a SOLD badge instead of disappearing.
  // Sort: active posts first (status ASC: "active" < "sold" alphabetically),
  // then newest-first within each group.
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      farmer:profiles!posts_farmer_id_fkey(full_name)
    `,
    )
    .order("status", { ascending: true }) // active before sold
    .order("created_at", { ascending: false }); // newest first within each group

  if (filters?.district) {
    query = query.eq("district", filters.district);
  }

  if (filters?.minPrice !== undefined) {
    query = query.gte("price_per_kg", filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    query = query.lte("price_per_kg", filters.maxPrice);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((post: any) => ({
    ...post,
    farmer_name: post.farmer?.full_name || "Unknown Farmer",
  })) as Post[];
};

/* =====================================================
   GET POST WITH OFFERS
===================================================== */
export const getPost = async (postId: string): Promise<PostWithOffers> => {
  // 1. Get post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      `
      *,
      farmer:profiles!posts_farmer_id_fkey(full_name)
    `,
    )
    .eq("id", postId)
    .single();

  if (postError) throw postError;
  if (!post) throw new Error("Post not found");

  // 2. Get offers for this post
  const { data: offers, error: offersError } = await supabase
    .from("offers")
    .select(
      `
      *,
      buyer:profiles!offers_buyer_id_fkey(full_name)
    `,
    )
    .eq("post_id", postId)
    .order("offer_price_per_kg", { ascending: false });

  if (offersError) throw offersError;

  return {
    ...post,
    farmer_name: post.farmer?.full_name || "Unknown Farmer",
    offers: (offers || []).map((o: any) => ({
      ...o,
      buyer_name: o.buyer?.full_name || "Anonymous",
    })) as Offer[],
  } as PostWithOffers;
};

/* =====================================================
   GET FARMER CONTACT (accepted buyer only)
   Calls a SECURITY DEFINER RPC — returns phone only when
   auth.uid() has an accepted offer on this post. Otherwise null.
===================================================== */
export const getFarmerContact = async (
  postId: string,
): Promise<string | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .rpc("get_farmer_contact", { p_post_id: postId })
    .single();

  if (error) {
    console.error("[getFarmerContact] RPC error:", error);
    return null;
  }

  // data = { phone: "07xxxxxxxx" } or { phone: null }
  return (data as { phone: string | null })?.phone ?? null;
};

/* =====================================================
   CHECK IF USER ALREADY OFFERED
===================================================== */
export const checkUserOffer = async (postId: string): Promise<Offer | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("post_id", postId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as Offer) || null;
};

/* =====================================================
   CREATE OFFER (One per user per post)
===================================================== */
export const createOffer = async (
  postId: string,
  offerPrice: number,
): Promise<Offer> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Check if user already has an offer
  const existing = await checkUserOffer(postId);
  if (existing) {
    throw new Error("You have already submitted an offer for this post");
  }

  // Validate price
  if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
    throw new Error("Offer price must be a positive number");
  }

  // Guard: do not allow offers on a sold post
  const { data: targetPost, error: postCheckError } = await supabase
    .from("posts")
    .select("status")
    .eq("id", postId)
    .single();

  if (postCheckError) throw postCheckError;
  if (targetPost?.status === "sold") {
    throw new Error(
      "This post has already been sold and is no longer accepting offers",
    );
  }

  const { data, error } = await supabase
    .from("offers")
    .insert({
      post_id: postId,
      buyer_id: user.id,
      offer_price_per_kg: offerPrice,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("You have already submitted an offer for this post");
    }
    throw error;
  }

  return data as Offer;
};

/* =====================================================
   ACCEPT OFFER (Farmer only)
===================================================== */
export const acceptOffer = async (offerId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // 1. Get the offer to extract post_id
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("post_id, id, status")
    .eq("id", offerId)
    .single();

  if (offerError) {
    console.error("[acceptOffer] Failed to fetch offer:", offerError);
    throw offerError;
  }
  if (!offer) throw new Error("Offer not found");

  console.log("[acceptOffer] Fetched offer:", offer);

  // 2. Get the post to verify farmer ownership + status
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("farmer_id, status")
    .eq("id", offer.post_id)
    .single();

  if (postError) {
    console.error("[acceptOffer] Failed to fetch post:", postError);
    throw postError;
  }

  console.log("[acceptOffer] Fetched post:", post);
  console.log("[acceptOffer] Current user:", user.id);

  // 3. Guard: farmer ownership + post not already sold
  if (post.farmer_id !== user.id) {
    throw new Error("Only the post owner can accept offers");
  }
  if (post.status === "sold") {
    throw new Error("Post is already sold");
  }
  if (offer.status !== "pending") {
    throw new Error(`Offer is already ${offer.status} and cannot be accepted`);
  }

  // 4. Accept the selected offer — use .select() to confirm the row was updated
  const { data: acceptedRow, error: acceptError } = await supabase
    .from("offers")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", offerId)
    .select("id, status")
    .single();

  if (acceptError) {
    console.error(
      "[acceptOffer] RLS or DB error on accept update:",
      acceptError,
    );
    throw acceptError;
  }

  // If RLS silently blocked the update, acceptedRow will be null
  if (!acceptedRow) {
    throw new Error(
      "Accept update was blocked — check your Supabase RLS policy for UPDATE on offers (farmer must be allowed to update offers on their own posts)",
    );
  }

  console.log("[acceptOffer] Offer successfully accepted:", acceptedRow);

  // 5. Reject all other pending offers for this post
  const { data: rejectedRows, error: rejectOthersError } = await supabase
    .from("offers")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("post_id", offer.post_id)
    .eq("status", "pending")
    .neq("id", offerId)
    .select("id");

  if (rejectOthersError) {
    console.error(
      "[acceptOffer] Failed to reject other offers:",
      rejectOthersError,
    );
    throw rejectOthersError;
  }

  console.log(
    `[acceptOffer] Rejected ${rejectedRows?.length ?? 0} other pending offer(s)`,
  );

  // 6. Mark the post as sold — use .select() to confirm
  const { data: updatedPost, error: postUpdateError } = await supabase
    .from("posts")
    .update({ status: "sold" })
    .eq("id", offer.post_id)
    .select("id, status")
    .single();

  if (postUpdateError) {
    console.error(
      "[acceptOffer] Failed to mark post as sold:",
      postUpdateError,
    );
    throw postUpdateError;
  }

  if (!updatedPost) {
    throw new Error(
      "Post status update was blocked — check your Supabase RLS policy for UPDATE on posts (farmer must be allowed to update their own posts)",
    );
  }

  console.log("[acceptOffer] Post marked as sold:", updatedPost);
};

/* =====================================================
   REJECT OFFER (Farmer only)
===================================================== */
export const rejectOffer = async (offerId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // 1. Get the offer + post
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("post_id")
    .eq("id", offerId)
    .single();

  if (offerError) throw offerError;

  // 2. Verify farmer ownership and post status
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("farmer_id, status")
    .eq("id", offer.post_id)
    .single();

  if (postError) throw postError;

  if (post.farmer_id !== user.id) {
    throw new Error("Only the post owner can reject offers");
  }

  if (post.status === "sold") {
    throw new Error("Cannot reject offers on a post that is already sold");
  }

  // 3. Reject offer
  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", offerId);

  if (updateError) throw updateError;
};

/* =====================================================
   GET BEST OFFER
===================================================== */
export const getBestOffer = (offers: Offer[]): Offer | null => {
  if (offers.length === 0) return null;
  return offers.reduce((best, current) =>
    current.offer_price_per_kg > best.offer_price_per_kg ? current : best,
  );
};

/* =====================================================
   GET USER OFFERS (for buyer dashboard)
===================================================== */
export const getUserOffers = async (): Promise<(Offer & { post: Post })[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("offers")
    .select(
      `
      *,
      post:posts(
        id,
        seed_variety,
        district,
        price_per_kg,
        quantity_kg,
        status
      )
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as (Offer & { post: Post })[];
};

/* =====================================================
   GET USER POSTS (for farmer dashboard)
===================================================== */
export const getUserPosts = async (): Promise<Post[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Post[];
};

/* =====================================================
   UPDATE OFFER (Buyer only, pending offers only)
   RLS: "buyer_update_own_pending_offer"
   Guards:
     - Caller must be the offer owner
     - Offer must still be pending (enforced at DB + here)
     - New price must be a positive finite number
===================================================== */
export const updateOffer = async (
  offerId: string,
  newPricePerKg: number,
): Promise<Offer> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Validate price
  if (!Number.isFinite(newPricePerKg) || newPricePerKg <= 0) {
    throw new Error("Offer price must be a positive number");
  }

  // Frontend guard: refuse before hitting the DB
  const { data: existing, error: fetchErr } = await supabase
    .from("offers")
    .select("id, buyer_id, status")
    .eq("id", offerId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!existing) throw new Error("Offer not found");
  if (existing.buyer_id !== user.id)
    throw new Error("You can only edit your own offer");
  if (existing.status !== "pending")
    throw new Error(
      `Offer cannot be edited — it has already been ${existing.status}`,
    );

  const { data, error } = await supabase
    .from("offers")
    .update({
      offer_price_per_kg: newPricePerKg,
      updated_at: new Date().toISOString(),
    })
    .eq("id", offerId)
    .select()
    .single();

  if (error) throw error;

  // RLS silently blocked (row not returned)
  if (!data)
    throw new Error(
      "Update was blocked — offer may no longer be pending or you are not the owner",
    );

  return data as Offer;
};

/* =====================================================
   DELETE OFFER (Buyer only, pending offers only)
   RLS: "buyer_delete_own_pending_offer"
   Guards:
     - Caller must be the offer owner
     - Offer must still be pending
===================================================== */
export const deleteOffer = async (offerId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Frontend guard
  const { data: existing, error: fetchErr } = await supabase
    .from("offers")
    .select("id, buyer_id, status")
    .eq("id", offerId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!existing) throw new Error("Offer not found");
  if (existing.buyer_id !== user.id)
    throw new Error("You can only delete your own offer");
  if (existing.status !== "pending")
    throw new Error(
      `Offer cannot be deleted — it has already been ${existing.status}`,
    );

  const { error } = await supabase.from("offers").delete().eq("id", offerId);

  if (error) throw error;
};

/* =====================================================
   UPDATE POST (Farmer only, active posts only)
   RLS: "farmer_update_own_active_post"
   Guards:
     - Caller must be the post owner
     - Post must still be active (not sold)
     - Validates each numeric field before hitting DB
===================================================== */
export const updatePost = async (
  postId: string,
  updates: PostUpdatePayload,
): Promise<Post> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Validate numeric fields if provided
  if (
    updates.price_per_kg !== undefined &&
    (!Number.isFinite(updates.price_per_kg) || updates.price_per_kg <= 0)
  ) {
    throw new Error("Price must be a positive number");
  }
  if (
    updates.quantity_kg !== undefined &&
    (!Number.isFinite(updates.quantity_kg) || updates.quantity_kg <= 0)
  ) {
    throw new Error("Quantity must be a positive number");
  }
  if (
    updates.week !== undefined &&
    (!Number.isInteger(updates.week) || updates.week < 1 || updates.week > 52)
  ) {
    throw new Error("Week must be between 1 and 52");
  }

  // Frontend guard
  const { data: existing, error: fetchErr } = await supabase
    .from("posts")
    .select("id, farmer_id, status")
    .eq("id", postId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!existing) throw new Error("Post not found");
  if (existing.farmer_id !== user.id)
    throw new Error("You can only edit your own post");
  if (existing.status !== "active")
    throw new Error("Post cannot be edited — it has already been sold");

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;

  if (!data)
    throw new Error(
      "Update was blocked — post may no longer be active or you are not the owner",
    );

  return data as Post;
};

/* =====================================================
   DELETE POST (Farmer only, active posts only)
   RLS: "farmer_delete_own_active_post"

   DB-level: offers.post_id FK is ON DELETE CASCADE, so all
   associated offers are automatically deleted by Postgres —
   no separate offer cleanup needed in the service layer.

   Guards:
     - Caller must be the post owner
     - Post must still be active
===================================================== */
export const deletePost = async (postId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Frontend guard
  const { data: existing, error: fetchErr } = await supabase
    .from("posts")
    .select("id, farmer_id, status")
    .eq("id", postId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!existing) throw new Error("Post not found");
  if (existing.farmer_id !== user.id)
    throw new Error("You can only delete your own post");
  if (existing.status !== "active")
    throw new Error(
      "Sold posts cannot be deleted — the transaction record must be preserved",
    );

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) throw error;
};
