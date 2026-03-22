export interface DemoUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  education: string;
  location: string;
  hookCount: number;
  friendCount: number;
  postCount: number;
  isOnline: boolean;
}

export interface DemoPost {
  id: string;
  userId: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  hooked: boolean;
  createdAt: string;
}

export interface DemoFlick {
  id: string;
  userId: string;
  video: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
}

export const demoUsers: DemoUser[] = [
  {
    id: "1",
    name: "Aria Kapoor",
    username: "@ariak",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    bio: "Digital artist & creative thinker. Making the world more colorful ✨",
    education: "NID Ahmedabad",
    location: "Mumbai, India",
    hookCount: 842,
    friendCount: 1243,
    postCount: 156,
    isOnline: true,
  },
  {
    id: "2",
    name: "Rohan Mehta",
    username: "@rohanm",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "Full-stack dev by day, guitarist by night 🎸",
    education: "IIT Delhi",
    location: "Bangalore, India",
    hookCount: 567,
    friendCount: 890,
    postCount: 89,
    isOnline: true,
  },
  {
    id: "3",
    name: "Priya Sharma",
    username: "@priyash",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    bio: "Travel blogger | 30 countries and counting 🌍",
    education: "DU Delhi",
    location: "New Delhi, India",
    hookCount: 1203,
    friendCount: 2104,
    postCount: 312,
    isOnline: false,
  },
  {
    id: "4",
    name: "Vikram Singh",
    username: "@vikrams",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    bio: "Fitness coach & nutrition enthusiast 💪",
    education: "BITS Pilani",
    location: "Pune, India",
    hookCount: 945,
    friendCount: 1567,
    postCount: 201,
    isOnline: true,
  },
  {
    id: "5",
    name: "Meera Patel",
    username: "@meerap",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    bio: "Architect | Designing spaces that inspire 🏛️",
    education: "CEPT University",
    location: "Ahmedabad, India",
    hookCount: 678,
    friendCount: 934,
    postCount: 134,
    isOnline: false,
  },
  {
    id: "6",
    name: "Aditya Rao",
    username: "@adityar",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Startup founder | Building the future of ed-tech 🚀",
    education: "ISB Hyderabad",
    location: "Hyderabad, India",
    hookCount: 1456,
    friendCount: 2890,
    postCount: 267,
    isOnline: true,
  },
];

export const demoPosts: DemoPost[] = [
  {
    id: "p1",
    userId: "1",
    content: "Just finished this digital painting after 3 weeks of work. Every pixel tells a story. What do you think? 🎨",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop",
    likes: 234,
    comments: 45,
    shares: 12,
    hooked: false,
    createdAt: "2h ago",
  },
  {
    id: "p2",
    userId: "2",
    content: "Late night coding session. There's something magical about solving problems at 2 AM when the world is quiet. ☕💻",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
    likes: 189,
    comments: 32,
    shares: 8,
    hooked: true,
    createdAt: "4h ago",
  },
  {
    id: "p3",
    userId: "3",
    content: "Sunrise at Santorini. Some views make you forget everything else exists. This is one of them. 🌅",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop",
    likes: 567,
    comments: 89,
    shares: 45,
    hooked: false,
    createdAt: "6h ago",
  },
  {
    id: "p4",
    userId: "4",
    content: "6 months transformation complete! Consistency beats motivation every single time. Never give up on yourself. 💪🔥",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
    likes: 432,
    comments: 67,
    shares: 23,
    hooked: false,
    createdAt: "8h ago",
  },
  {
    id: "p5",
    userId: "5",
    content: "My latest project — a sustainable home that breathes with nature. Architecture is frozen music. 🏡",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop",
    likes: 312,
    comments: 54,
    shares: 19,
    hooked: false,
    createdAt: "12h ago",
  },
  {
    id: "p6",
    userId: "6",
    content: "Just raised our Series A! 🚀 The journey of a thousand miles begins with a single step. Grateful for this incredible team.",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop",
    likes: 891,
    comments: 123,
    shares: 67,
    hooked: false,
    createdAt: "1d ago",
  },
];

export const demoFlicks: DemoFlick[] = [
  {
    id: "f1",
    userId: "1",
    video: "",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=700&fit=crop",
    caption: "Art in motion ✨ #digitalart",
    likes: 1234,
    comments: 89,
    shares: 45,
  },
  {
    id: "f2",
    userId: "3",
    video: "",
    thumbnail: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=400&h=700&fit=crop",
    caption: "Paradise found 🏝️ #travel",
    likes: 2345,
    comments: 156,
    shares: 78,
  },
  {
    id: "f3",
    userId: "4",
    video: "",
    thumbnail: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=700&fit=crop",
    caption: "Morning workout vibes 💪 #fitness",
    likes: 1890,
    comments: 201,
    shares: 56,
  },
  {
    id: "f4",
    userId: "2",
    video: "",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=700&fit=crop",
    caption: "Late night jam session 🎸 #music",
    likes: 987,
    comments: 67,
    shares: 34,
  },
];

export const demoMessages = [
  { id: "m1", userId: "2", text: "Hey! Check out the new feature I built", time: "2m ago" },
  { id: "m2", userId: "1", text: "Love the new painting! 😍", time: "5m ago" },
  { id: "m3", userId: "4", text: "Gym tomorrow at 6?", time: "15m ago" },
  { id: "m4", userId: "6", text: "Let's discuss the pitch deck", time: "1h ago" },
  { id: "m5", userId: "3", text: "Just landed in Bali! 🌴", time: "2h ago" },
];

export function getUserById(id: string): DemoUser | undefined {
  return demoUsers.find(u => u.id === id);
}
