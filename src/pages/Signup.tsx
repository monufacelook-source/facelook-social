import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Anchor, Eye, EyeOff, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, username },
      },
    });

    if (error) {
      setLoading(false);
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: name,
        username,
        avatar_url: null,
        bio: null,
      });
    }

    setLoading(false);
    toast({ title: "Account created!", description: "Welcome to Facelook 🎉" });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="glass-strong rounded-3xl p-8 w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 shadow-lg shadow-primary/30"
            whileHover={{ rotate: -10, scale: 1.05 }}
          >
            <Anchor className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold gradient-text">Facelook</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Aria Kapoor"
              data-testid="input-name"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 focus:bg-white/[0.08] transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                required
                placeholder="ariak"
                data-testid="input-username"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 pl-8 py-3 text-sm outline-none focus:border-primary/60 focus:bg-white/[0.08] transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              data-testid="input-email"
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/60 focus:bg-white/[0.08] transition-all placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
                data-testid="input-password"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-primary/60 focus:bg-white/[0.08] transition-all placeholder:text-muted-foreground/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            data-testid="button-signup"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors" data-testid="link-login">
            Sign in
          </Link>
        </p>
      </motion.div>

      <p className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.25em] text-purple-400/50 relative z-10">
        ⚡ POWERED BY FACELOOK 10.07
      </p>
    </div>
  );
}
