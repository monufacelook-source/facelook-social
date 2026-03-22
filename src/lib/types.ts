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

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  profiles?: Profile | null;
}

export interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  last_message: string | null;
  last_message_at: string;
  created_at: string;
}

export interface ConversationWithMeta extends Conversation {
  other_profile: Profile;
  unread_count: number;
  is_friend: boolean;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}
