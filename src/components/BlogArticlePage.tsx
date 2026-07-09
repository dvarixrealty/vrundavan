import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Calendar, User, Clock, Tag, MessageSquare, Send, 
  Facebook, Linkedin, Share2, Copy, Check, Twitter, ArrowRight, ArrowLeft as ArrowLeftIcon 
} from 'lucide-react';
import { BlogArticle, SiteCMSConfig, BlogComment } from '../types';

interface BlogArticlePageProps {
  selectedArticleSlug: string | null;
  siteSettings?: SiteCMSConfig;
  setSiteSettings?: (newSettings: SiteCMSConfig) => void;
  onBack: () => void;
  onNavigateToArticle: (slug: string) => void;
}

export default function BlogArticlePage({
  selectedArticleSlug,
  siteSettings,
  setSiteSettings,
  onBack,
  onNavigateToArticle
}: BlogArticlePageProps) {
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  // Load all blogs
  const blogsList = useMemo(() => {
    return (siteSettings?.blogs as BlogArticle[]) || [];
  }, [siteSettings?.blogs]);

  // Find the selected article
  const currentArticle = useMemo(() => {
    if (!selectedArticleSlug) return null;
    return blogsList.find(b => b.slug === selectedArticleSlug || b.id === selectedArticleSlug);
  }, [blogsList, selectedArticleSlug]);

  // Find other published blogs for Prev/Next/Related
  const publishedBlogs = useMemo(() => {
    return blogsList.filter(b => b.status === 'Published' || b.published === true);
  }, [blogsList]);

  // Find index of current article among published ones
  const currentIdx = useMemo(() => {
    if (!currentArticle) return -1;
    return publishedBlogs.findIndex(b => b.id === currentArticle.id);
  }, [publishedBlogs, currentArticle]);

  // Previous article in sorted flow
  const prevArticle = useMemo(() => {
    if (currentIdx <= 0) return null;
    return publishedBlogs[currentIdx - 1];
  }, [publishedBlogs, currentIdx]);

  // Next article in sorted flow
  const nextArticle = useMemo(() => {
    if (currentIdx === -1 || currentIdx >= publishedBlogs.length - 1) return null;
    return publishedBlogs[currentIdx + 1];
  }, [publishedBlogs, currentIdx]);

  // Related articles (matching category or tags, excluding current, limit to 2 or 3)
  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    return publishedBlogs
      .filter(b => b.id !== currentArticle.id && (b.category === currentArticle.category || b.tags?.some(t => currentArticle.tags?.includes(t))))
      .slice(0, 2);
  }, [publishedBlogs, currentArticle]);

  // Fallback related if none found
  const finalRelated = useMemo(() => {
    if (relatedArticles.length > 0) return relatedArticles;
    if (!currentArticle) return [];
    return publishedBlogs.filter(b => b.id !== currentArticle.id).slice(0, 2);
  }, [publishedBlogs, relatedArticles, currentArticle]);

  // Copy Link action
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Comments
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentArticle || !commentName.trim() || !commentText.trim()) return;

    const newComment: BlogComment = {
      id: `comment-${Date.now()}`,
      authorName: commentName.trim(),
      content: commentText.trim(),
      timestamp: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedComments = [...(currentArticle.comments || []), newComment];
    const updatedBlogs = blogsList.map(blog => {
      if (blog.id === currentArticle.id) {
        return {
          ...blog,
          comments: updatedComments
        };
      }
      return blog;
    });

    if (siteSettings && setSiteSettings) {
      setSiteSettings({
        ...siteSettings,
        blogs: updatedBlogs
      });
    }

    setCommentName('');
    setCommentText('');

    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: {
        title: "Comment Posted",
        message: "Your comment was published successfully.",
        category: "Blogs"
      }
    }));
  };

  if (!currentArticle) {
    return (
      <div className="py-24 text-center bg-slate-950 min-h-[60vh] flex flex-col justify-center items-center font-sans text-slate-100">
        <p className="text-slate-400 text-sm font-medium">Insight article not found or has been removed.</p>
        <button onClick={onBack} className="mt-4 px-5 py-2.5 bg-[#ff5a3c] text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider hover:bg-[#e04326] transition cursor-pointer shadow-md">
          Back to Portal Home
        </button>
      </div>
    );
  }

  // Social Links mapping
  const articleUrl = encodeURIComponent(window.location.href);
  const articleTitle = encodeURIComponent(currentArticle.title);
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${articleUrl}&text=${articleTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${articleUrl}&title=${articleTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${articleTitle}%20${articleUrl}`
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 pb-24 font-sans" id="blog-article-full-page-view">
      
      {/* 1. COMPACT FIXED BREADCRUMB / BACK BAR */}
      <div className="border-b border-slate-900/60 bg-[#060b18]/85 sticky top-[72px] z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#ff5a3c] transition-colors cursor-pointer uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home Insights
          </button>
          
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#ff5a3c] bg-[#ff5a3c]/10 border border-[#ff5a3c]/20 px-2.5 py-0.5 rounded-full font-black">
            {currentArticle.category}
          </div>
        </div>
      </div>

      {/* 2. MAIN BLOG FRAME */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 space-y-8">
        
        {/* Header Block */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-white leading-tight tracking-tight">
            {currentArticle.title}
          </h1>
          
          <p className="text-sm text-slate-400 font-light leading-relaxed max-w-3xl italic">
            {currentArticle.summary}
          </p>

          {/* Author Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-2 border-t border-b border-slate-900/60 py-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <User className="w-4 h-4 text-[#ff5a3c]" />
              BY <strong className="font-bold text-white uppercase">{currentArticle.author}</strong>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {currentArticle.publishDate || currentArticle.createdAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              {currentArticle.readingTime || "3 min read"}
            </span>
          </div>
        </div>

        {/* Featured Image Banner */}
        {currentArticle.featuredImage && (
          <div className="w-full aspect-21/9 rounded-3xl overflow-hidden border border-slate-900 shadow-2xl relative">
            <img 
              src={currentArticle.featuredImage} 
              alt={currentArticle.title} 
              className="w-full h-full object-cover filter brightness-95"
              referrerPolicy="no-referrer"
            />
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060b18]/40 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Formatted Markdown Content Block */}
        <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed font-light text-base space-y-6 pt-4 border-b border-slate-900/60 pb-12 whitespace-pre-line">
          {currentArticle.content}
        </div>

        {/* 3. SHARE & ACTIONS PANEL */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/20 p-6 rounded-2xl border border-slate-900/60">
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#ff5a3c]" />
              Share this insight
            </h4>
            <p className="text-[10px] text-slate-500">Spread knowledge to partners and fellow real estate investors.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a 
              href={shareLinks.facebook} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 bg-slate-900 hover:bg-[#1877F2]/20 border border-slate-800 hover:border-[#1877F2]/45 text-slate-400 hover:text-[#1877F2] rounded-xl transition"
              title="Share on Facebook"
            >
              <Facebook className="w-4.5 h-4.5" />
            </a>
            <a 
              href={shareLinks.twitter} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 bg-slate-900 hover:bg-[#1DA1F2]/20 border border-slate-800 hover:border-[#1DA1F2]/45 text-slate-400 hover:text-[#1DA1F2] rounded-xl transition"
              title="Share on X"
            >
              <Twitter className="w-4.5 h-4.5" />
            </a>
            <a 
              href={shareLinks.linkedin} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 bg-slate-900 hover:bg-[#0A66C2]/20 border border-slate-800 hover:border-[#0A66C2]/45 text-slate-400 hover:text-[#0A66C2] rounded-xl transition"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-4.5 h-4.5" />
            </a>
            <a 
              href={shareLinks.whatsapp} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-emerald-500 rounded-xl transition"
              title="Share on WhatsApp"
            >
              <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.637-1.03-5.114-2.905-6.99C16.556 1.875 14.09 1.84 11.464 1.84c-5.44 0-9.866 4.42-9.869 9.866-.001 1.77.476 3.498 1.38 5.048L1.935 21.8l5.127-1.346-.415-.3z"/>
              </svg>
            </a>
            <button 
              onClick={handleCopyLink}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-[#ff5a3c] rounded-xl transition text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer"
              title="Copy Link URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* 4. PREVIOUS / NEXT ARTICLE SHORTCUT NAVIGATION */}
        {(prevArticle || nextArticle) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-900/60 py-8">
            {prevArticle ? (
              <button 
                onClick={() => onNavigateToArticle(prevArticle.slug)}
                className="group p-5 bg-slate-900/10 border border-slate-900 hover:border-slate-800 rounded-2xl flex flex-col text-left transition duration-300 cursor-pointer"
              >
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1 group-hover:text-[#ff5a3c] transition-colors">
                  <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Previous Brief
                </span>
                <span className="text-sm font-bold text-white mt-1 group-hover:text-slate-200 transition-colors line-clamp-1">{prevArticle.title}</span>
              </button>
            ) : <div className="hidden sm:block" />}

            {nextArticle ? (
              <button 
                onClick={() => onNavigateToArticle(nextArticle.slug)}
                className="group p-5 bg-slate-900/10 border border-slate-900 hover:border-slate-800 rounded-2xl flex flex-col text-right items-end transition duration-300 cursor-pointer"
              >
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1 group-hover:text-[#ff5a3c] transition-colors">
                  Next Brief <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-sm font-bold text-white mt-1 group-hover:text-slate-200 transition-colors line-clamp-1">{nextArticle.title}</span>
              </button>
            ) : <div className="hidden sm:block" />}
          </div>
        )}

        {/* 5. COMMENTS SYSTEM (IF ENABLED) */}
        {currentArticle.commentsEnabled !== false && (
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-sans font-black text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#ff5a3c]" />
              Reader Comments ({currentArticle.comments?.length || 0})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-slate-900/20 border border-slate-900/60 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Add Public Comment</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  type="text"
                  placeholder="Your Full Name"
                  required
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                />
              </div>
              <textarea 
                rows={3}
                placeholder="Write your thoughtful response, question, or commentary..."
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
              />
              <button 
                type="submit"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5 text-[#ff5a3c]" />
                Post Comment
              </button>
            </form>

            {/* Comments List */}
            {currentArticle.comments && currentArticle.comments.length > 0 ? (
              <div className="space-y-4 divide-y divide-slate-900/60">
                {currentArticle.comments.map((comment) => (
                  <div key={comment.id} className="pt-4 first:pt-0 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center font-black text-slate-300 text-xs uppercase font-mono shadow-md">
                      {comment.authorName ? comment.authorName.charAt(0) : 'R'}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white uppercase">{comment.authorName}</h5>
                        <span className="text-[10px] font-mono text-slate-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-300 font-light leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-sans italic text-xs py-4 text-center">Be the first to leave a comment on this article.</p>
            )}

          </div>
        )}

        {/* 6. RELATED ARTICLES ROW */}
        {publishedBlogs.length > 1 && (
          <div className="pt-12 border-t border-slate-900/60 space-y-6">
            <h3 className="text-sm font-sans font-extrabold uppercase tracking-widest text-slate-400">
              Related Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {finalRelated.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => onNavigateToArticle(blog.slug)}
                  className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 hover:border-slate-800 transition-all duration-300 flex gap-4 text-left group cursor-pointer"
                >
                  {blog.featuredImage && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={blog.featuredImage} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 min-w-0">
                    <span className="text-[9px] uppercase font-mono text-slate-500 block">
                      {blog.publishDate || blog.createdAt} • BY {blog.author.toUpperCase()}
                    </span>
                    <h4 className="font-bold text-white text-xs group-hover:text-[#ff5a3c] transition-colors truncate">
                      {blog.title}
                    </h4>
                    <p className="text-slate-450 text-[11px] leading-relaxed line-clamp-2">
                      {blog.summary}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </article>

    </div>
  );
}
