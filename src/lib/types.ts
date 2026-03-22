export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  education: string | null;
  location: string | null;
  hook_count: number;
  friend_count: number;
  post_count: number;
  is_online: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  profiles: Profile | null;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
}
