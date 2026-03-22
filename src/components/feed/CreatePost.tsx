import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function CreatePost() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please pick an image under 5 MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;
    if (!user) return;

    setSubmitting(true);
    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, imageFile, { upsert: false });

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      content: content.trim(),
      image_url,
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Post failed", description: error.message, variant: "destructive" });
      return;
    }

    setContent("");
    removeImage();
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast({ title: "Posted! 🎉", description: "Your post is now live." });
  };

  const avatarFallback = profile?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <motion.div
      className="glass-card p-4 mb-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              avatarFallback
            )}
          </div>

          {/* Input area */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={content.length > 60 ? 3 : 2}
              data-testid="input-post-content"
              className="w-full bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/50 leading-relaxed"
            />

            {/* Image preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div
                  className="relative mt-2 rounded-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    data-testid="button-remove-image"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions row */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagePick}
                  data-testid="input-image-upload"
                />
                <motion.button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1.5 rounded-lg hover:bg-primary/10"
                  whileTap={{ scale: 0.93 }}
                  data-testid="button-add-image"
                >
                  <ImageIcon className="w-4 h-4" />
                  Photo
                </motion.button>
              </div>

              <motion.button
                type="submit"
                disabled={submitting || (!content.trim() && !imageFile)}
                data-testid="button-submit-post"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                whileTap={{ scale: 0.93 }}
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Post
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
