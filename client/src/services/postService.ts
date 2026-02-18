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
  let query = supabase
    .from("posts")
    .select(
      `
      *,
      farmer:profiles!posts_farmer_id_fkey(full_name)
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

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

  // 1. Get the offer + post
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("post_id, id")
    .eq("id", offerId)
    .single();

  if (offerError) throw offerError;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("farmer_id")
    .eq("id", offer.post_id)
    .single();

  if (postError) throw postError;

  // 2. Verify farmer ownership
  if (post.farmer_id !== user.id) {
    throw new Error("Only the post owner can accept offers");
  }

  // 3. Accept offer (trigger will reject others + mark post sold)
  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", offerId);

  if (updateError) throw updateError;
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

  // 2. Verify farmer ownership
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("farmer_id")
    .eq("id", offer.post_id)
    .single();

  if (postError) throw postError;

  if (post.farmer_id !== user.id) {
    throw new Error("Only the post owner can reject offers");
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
