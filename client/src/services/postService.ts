import { supabase } from "../lib/supabase";
import type { PostDraft } from "../navigation/PriceForecastStack";

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
}

export interface Offer {
  id: string;
  post_id: string;
  buyer_id: string;
  offer_price_per_kg: number;
  created_at: string;
  status: "pending" | "accepted" | "rejected";
  buyer_name?: string;
}

export interface PostWithOffers extends Post {
  offers: Offer[];
}

// Create a new post
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
      season: postDraft.season,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get all active posts
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
      profiles:farmer_id(full_name)
    `
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
    farmer_name: post.profiles?.full_name || "Unknown Farmer",
  }));
};

// Get single post with offers
export const getPost = async (postId: string): Promise<PostWithOffers> => {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:farmer_id(full_name)
    `
    )
    .eq("id", postId)
    .single();

  if (postError) throw postError;

  const { data: offers, error: offersError } = await supabase
    .from("offers")
    .select(
      `
      *,
      buyer_profile:profiles!offers_buyer_id_fkey(full_name)
    `
    )
    .eq("post_id", postId)
    .order("offer_price_per_kg", { ascending: false });

  if (offersError) throw offersError;

  return {
    ...post,
    farmer_name: post.profiles?.full_name || "Unknown Farmer",
    offers: (offers || []).map((offer: any) => ({
      ...offer,
      buyer_name: offer.buyer_profile?.full_name || "Anonymous Buyer",
    })),
  };
};

// Create an offer
export const createOffer = async (
  postId: string,
  offerPrice: number
): Promise<Offer> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

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

  if (error) throw error;
  return data;
};

// Accept an offer
export const acceptOffer = async (offerId: string): Promise<void> => {
  // Get the offer first
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("post_id")
    .eq("id", offerId)
    .single();

  if (offerError) throw offerError;

  // Update this offer to accepted
  const { error: updateError } = await supabase
    .from("offers")
    .update({ status: "accepted" })
    .eq("id", offerId);

  if (updateError) throw updateError;

  // Reject all other offers for this post
  await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("post_id", offer.post_id)
    .neq("id", offerId);

  // Mark post as sold
  await supabase
    .from("posts")
    .update({ status: "sold" })
    .eq("id", offer.post_id);
};

// Reject an offer
export const rejectOffer = async (offerId: string): Promise<void> => {
  const { error } = await supabase
    .from("offers")
    .update({ status: "rejected" })
    .eq("id", offerId);

  if (error) throw error;
};

// Get user's posts
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
  return data || [];
};

// Get user's offers
export const getUserOffers = async (): Promise<Offer[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("offers")
    .select(
      `
      *,
      post:posts(seed_variety, district, price_per_kg)
    `
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};
