import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Copy, ArrowUp, ArrowDown, Search, Filter, 
  Eye, FileText, Check, X, Calendar, User, Tag, Layout, Settings, 
  MessageSquare, Sliders, Globe, EyeOff, Save, FolderOpen, RefreshCw, Sparkles, AlertCircle
} from 'lucide-react';
import { BlogArticle, SiteCMSConfig, BlogComment } from '../../types';

interface BlogManagerProps {
  siteSettings?: SiteCMSConfig;
  setSiteSettings?: (newSettings: SiteCMSConfig) => void;
}

export default function BlogManager({ siteSettings, setSiteSettings }: BlogManagerProps) {
  // Ensure blogs exists
  const blogsList: BlogArticle[] = useMemo(() => {
    return (siteSettings?.blogs as BlogArticle[]) || [];
  }, [siteSettings?.blogs]);

  // Ensure categories exists (with defaults if missing)
  const defaultCategories = [
    'Market Insights', 'Investment', 'Luxury Homes', 
    'Commercial', 'Plots & Land', 'Home Buying', 
    'Legal Advice', 'Construction'
  ];
  
  const categoriesList = useMemo(() => {
    return siteSettings?.blogCategories || defaultCategories;
  }, [siteSettings?.blogCategories]);

  // --- BLOG SETTINGS STATE ---
  const [showBlogSection, setShowBlogSection] = useState(true);
  const [maxBlogsToDisplay, setMaxBlogsToDisplay] = useState(6);

  useEffect(() => {
    if (siteSettings?.blogSettings) {
      setShowBlogSection(siteSettings.blogSettings.showSection !== false);
      setMaxBlogsToDisplay(siteSettings.blogSettings.maxArticles || 6);
    }
  }, [siteSettings]);

  // --- SEARCH & FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAuthor, setFilterAuthor] = useState('All');

  // --- MODALS / EDIT STATES ---
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<BlogArticle> | null>(null);
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');

  // Category Manager State
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIdx, setEditingCategoryIdx] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Auto-generate slug helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')         // replace spaces with hyphens
      .replace(/-+/g, '-')          // replace multiple hyphens
      .trim();
  };

  // Auto-calculate reading time
  const calculateReadingTime = (text: string) => {
    const words = text ? text.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  // Authors list for filter dropdown
  const uniqueAuthors = useMemo(() => {
    const authors = new Set<string>();
    blogsList.forEach(blog => {
      if (blog.author) authors.add(blog.author);
    });
    return Array.from(authors);
  }, [blogsList]);

  // --- CRUD ACTIONS ---

  const handleOpenAdd = () => {
    const newOrder = blogsList.length > 0 ? Math.max(...blogsList.map(b => b.displayOrder || 0)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    setEditingArticle({
      id: `blog-${Date.now()}`,
      title: '',
      slug: '',
      summary: '',
      content: '',
      featuredImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      category: categoriesList[0] || 'Market Insights',
      tags: [],
      author: 'Dvarix Sourcing Desk',
      status: 'Draft',
      featured: false,
      displayOrder: newOrder,
      readingTime: '2 min read',
      seoTitle: '',
      seoDescription: '',
      publishDate: today,
      createdAt: today,
      updatedAt: today,
      commentsEnabled: true,
      comments: []
    });
    setEditorTab('edit');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (article: BlogArticle) => {
    setEditingArticle({ ...article });
    setEditorTab('edit');
    setIsEditorOpen(true);
  };

  const handleDuplicate = (article: BlogArticle) => {
    const duplicated: BlogArticle = {
      ...article,
      id: `blog-${Date.now()}`,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy`,
      featured: false,
      publishDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      displayOrder: blogsList.length > 0 ? Math.max(...blogsList.map(b => b.displayOrder || 0)) + 1 : 1,
      comments: []
    };

    const updatedBlogs = [...blogsList, duplicated];
    saveBlogsToSettings(updatedBlogs, 'Article Duplicated', 'Duplicated successfully');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    const updated = blogsList.filter(b => b.id !== id);
    saveBlogsToSettings(updated, 'Article Deleted', 'Deleted successfully');
  };

  const handleTogglePublish = (article: BlogArticle) => {
    const newStatus = article.status === 'Published' ? 'Draft' : 'Published';
    const updated = blogsList.map(b => {
      if (b.id === article.id) {
        return { 
          ...b, 
          status: newStatus as 'Published' | 'Draft',
          published: newStatus === 'Published',
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return b;
    });
    saveBlogsToSettings(updated, 'Article Status Updated', `Article marked as ${newStatus}`);
  };

  const handleToggleFeatured = (article: BlogArticle) => {
    const updated = blogsList.map(b => {
      if (b.id === article.id) {
        return { ...b, featured: !b.featured };
      }
      return b;
    });
    saveBlogsToSettings(updated, 'Featured Status Updated', 'Featured status updated');
  };

  // Ordering Helpers
  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const newList = [...filteredArticles];
    const itemA = newList[idx];
    const itemB = newList[idx - 1];

    // Swap orders
    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    // Update global list
    const updatedGlobal = blogsList.map(blog => {
      if (blog.id === itemA.id) return itemA;
      if (blog.id === itemB.id) return itemB;
      return blog;
    });

    saveBlogsToSettings(updatedGlobal, 'Display Order Updated', 'Display order shifted up');
  };

  const handleMoveDown = (idx: number) => {
    if (idx === filteredArticles.length - 1) return;
    const newList = [...filteredArticles];
    const itemA = newList[idx];
    const itemB = newList[idx + 1];

    // Swap orders
    const tempOrder = itemA.displayOrder;
    itemA.displayOrder = itemB.displayOrder;
    itemB.displayOrder = tempOrder;

    // Update global list
    const updatedGlobal = blogsList.map(blog => {
      if (blog.id === itemA.id) return itemA;
      if (blog.id === itemB.id) return itemB;
      return blog;
    });

    saveBlogsToSettings(updatedGlobal, 'Display Order Updated', 'Display order shifted down');
  };

  // Save changes back to siteSettings in Firebase
  const saveBlogsToSettings = (newBlogs: BlogArticle[], alertTitle: string, alertMsg: string) => {
    if (!siteSettings || !setSiteSettings) return;

    // Maintain fallback 'published' boolean field matching the status
    const sanitizedBlogs = newBlogs.map(b => ({
      ...b,
      published: b.status === 'Published'
    }));

    const updatedSettings: SiteCMSConfig = {
      ...siteSettings,
      blogs: sanitizedBlogs,
      blogSettings: {
        showSection: showBlogSection,
        maxArticles: maxBlogsToDisplay
      }
    };

    setSiteSettings(updatedSettings);

    // Trigger alert banner
    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: {
        title: alertTitle,
        message: alertMsg,
        category: "Blogs"
      }
    }));
  };

  // Category CRUD
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categoriesList.includes(newCategoryName.trim())) {
      alert('Category already exists!');
      return;
    }
    const updatedCategories = [...categoriesList, newCategoryName.trim()];
    updateGlobalCategories(updatedCategories, 'Category Added', `Added "${newCategoryName.trim()}"`);
    setNewCategoryName('');
  };

  const handleEditCategorySave = () => {
    if (editingCategoryIdx === null || !editingCategoryName.trim()) return;
    if (categoriesList.includes(editingCategoryName.trim()) && categoriesList[editingCategoryIdx] !== editingCategoryName.trim()) {
      alert('Category name already exists!');
      return;
    }

    const updatedCategories = [...categoriesList];
    const oldName = updatedCategories[editingCategoryIdx];
    updatedCategories[editingCategoryIdx] = editingCategoryName.trim();

    // Map any blogs using the old category name to the new name
    const updatedBlogs = blogsList.map(blog => {
      if (blog.category === oldName) {
        return { ...blog, category: editingCategoryName.trim() };
      }
      return blog;
    });

    if (!siteSettings || !setSiteSettings) return;

    const updatedSettings: SiteCMSConfig = {
      ...siteSettings,
      blogCategories: updatedCategories,
      blogs: updatedBlogs
    };

    setSiteSettings(updatedSettings);
    
    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: {
        title: 'Category Updated',
        message: `Renamed to "${editingCategoryName.trim()}"`,
        category: "Blogs"
      }
    }));

    setEditingCategoryIdx(null);
    setEditingCategoryName('');
  };

  const handleDeleteCategory = (catName: string) => {
    if (categoriesList.length <= 1) {
      alert('You must keep at least one category!');
      return;
    }
    const isUsed = blogsList.some(blog => blog.category === catName);
    if (isUsed) {
      if (!window.confirm(`Warning: The category "${catName}" is currently used by some articles. Deleting it will re-categorize those articles to "${categoriesList[0] === catName ? categoriesList[1] : categoriesList[0]}". Continue?`)) {
        return;
      }
    }

    const updatedCategories = categoriesList.filter(c => c !== catName);
    const fallbackCategory = updatedCategories[0];

    const updatedBlogs = blogsList.map(blog => {
      if (blog.category === catName) {
        return { ...blog, category: fallbackCategory };
      }
      return blog;
    });

    if (!siteSettings || !setSiteSettings) return;

    const updatedSettings: SiteCMSConfig = {
      ...siteSettings,
      blogCategories: updatedCategories,
      blogs: updatedBlogs
    };

    setSiteSettings(updatedSettings);

    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: {
        title: 'Category Deleted',
        message: `Removed category "${catName}" successfully.`,
        category: "Blogs"
      }
    }));
  };

  const updateGlobalCategories = (newCategories: string[], title: string, desc: string) => {
    if (!siteSettings || !setSiteSettings) return;
    const updatedSettings = {
      ...siteSettings,
      blogCategories: newCategories
    };
    setSiteSettings(updatedSettings);
    window.dispatchEvent(new CustomEvent('cms-alert-notification', {
      detail: {
        title,
        message: desc,
        category: "Blogs"
      }
    }));
  };

  // Settings Save Handler
  const handleSaveSettings = () => {
    saveBlogsToSettings(blogsList, 'Settings Saved', 'Homepage Blog Layout updated successfully');
  };

  // Save Modal Article
  const handleSaveArticle = () => {
    if (!editingArticle) return;
    if (!editingArticle.title?.trim()) {
      alert('Article Title is required!');
      return;
    }
    if (!editingArticle.content?.trim()) {
      alert('Article content body is required!');
      return;
    }

    // Fill missing properties
    const finalArticle: BlogArticle = {
      id: editingArticle.id || `blog-${Date.now()}`,
      title: editingArticle.title.trim(),
      slug: editingArticle.slug?.trim() || generateSlug(editingArticle.title),
      summary: editingArticle.summary?.trim() || editingArticle.title.trim(),
      content: editingArticle.content,
      featuredImage: editingArticle.featuredImage || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      category: editingArticle.category || categoriesList[0] || 'Market Insights',
      tags: editingArticle.tags || [],
      author: editingArticle.author?.trim() || 'Dvarix Sourcing Desk',
      status: editingArticle.status || 'Draft',
      featured: !!editingArticle.featured,
      displayOrder: editingArticle.displayOrder || 1,
      readingTime: editingArticle.readingTime || calculateReadingTime(editingArticle.content),
      seoTitle: editingArticle.seoTitle?.trim() || editingArticle.title.trim(),
      seoDescription: editingArticle.seoDescription?.trim() || editingArticle.summary?.trim() || editingArticle.title.trim(),
      publishDate: editingArticle.publishDate || new Date().toISOString().split('T')[0],
      createdAt: editingArticle.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      commentsEnabled: editingArticle.commentsEnabled !== false,
      comments: editingArticle.comments || []
    };

    // Replace or Add
    let updatedBlogs = [...blogsList];
    const existingIdx = blogsList.findIndex(b => b.id === finalArticle.id);
    if (existingIdx > -1) {
      updatedBlogs[existingIdx] = finalArticle;
    } else {
      updatedBlogs.push(finalArticle);
    }

    saveBlogsToSettings(updatedBlogs, 'Article Saved', `"${finalArticle.title}" saved successfully`);
    setIsEditorOpen(false);
    setEditingArticle(null);
  };

  // --- FILTERED ARTICLES LISTING ---
  const filteredArticles = useMemo(() => {
    let list = [...blogsList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.summary?.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      );
    }

    // Category
    if (filterCategory !== 'All') {
      list = list.filter(b => b.category === filterCategory);
    }

    // Status
    if (filterStatus !== 'All') {
      list = list.filter(b => b.status === filterStatus);
    }

    // Author
    if (filterAuthor !== 'All') {
      list = list.filter(b => b.author === filterAuthor);
    }

    // Sorted by display order ascending, then featured descending, then publish date descending
    return list.sort((a, b) => {
      // Featured first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then display order
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [blogsList, searchQuery, filterCategory, filterStatus, filterAuthor]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans" id="blog-cms-manager-container">
      
      {/* 1. HEADER CONTROL BOX */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#ff5a3c]" />
            Enterprise Blog & Insights CMS
          </h2>
          <p className="text-xs text-slate-500">Manage expert real estate content, SEO configurations, and categories on Dvarix Portal.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCategoryManagerOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            Categories
          </button>
          <button 
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#ff5a3c] hover:bg-[#e04326] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Article
          </button>
        </div>
      </div>

      {/* 2. LAYOUT CONFIGURATION PANEL */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" />
          Homepage Layout Options
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <input 
              type="checkbox" 
              id="show-blog-section-toggle"
              checked={showBlogSection}
              onChange={(e) => setShowBlogSection(e.target.checked)}
              className="w-4 h-4 text-[#ff5a3c] border-slate-300 rounded focus:ring-[#ff5a3c]"
            />
            <label htmlFor="show-blog-section-toggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Show Section on Homepage
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-black text-slate-500 block">Maximum Articles on Homepage</label>
            <input 
              type="number" 
              min={1} 
              max={24}
              value={maxBlogsToDisplay}
              onChange={(e) => setMaxBlogsToDisplay(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
            />
          </div>

          <div>
            <button 
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              Apply Homepage settings
            </button>
          </div>
        </div>
      </div>

      {/* 3. SEARCH, FILTER & STATS ROW */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by title, body, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
            />
          </div>

          {/* Filter Category */}
          <div className="space-y-0.5">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
            >
              <option value="All">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="space-y-0.5">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
            >
              <option value="All">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Filter Author */}
          <div className="space-y-0.5">
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
            >
              <option value="All">All Authors</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Filters Clear Row */}
        {(searchQuery || filterCategory !== 'All' || filterStatus !== 'All' || filterAuthor !== 'All') && (
          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
            <span className="text-slate-500">Filtered <strong>{filteredArticles.length}</strong> of <strong>{blogsList.length}</strong> articles.</span>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('All');
                setFilterStatus('All');
                setFilterAuthor('All');
              }}
              className="text-[#ff5a3c] font-bold uppercase tracking-wider text-[10px] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. ARTICLES DATA TABLE / GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="p-4 w-12 text-center">Order</th>
                  <th className="p-4">Article</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Featured</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredArticles.map((article, index) => {
                  const commentsCount = article.comments?.length || 0;
                  return (
                    <tr key={article.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Order Controls */}
                      <td className="p-4 align-middle">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button 
                            disabled={index === 0}
                            onClick={() => handleMoveUp(index)}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-mono font-bold text-slate-500">{article.displayOrder || index + 1}</span>
                          <button 
                            disabled={index === filteredArticles.length - 1}
                            onClick={() => handleMoveDown(index)}
                            className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Title & Info */}
                      <td className="p-4 max-w-xs align-middle">
                        <div className="flex items-center gap-3">
                          {article.featuredImage && (
                            <img 
                              src={article.featuredImage} 
                              alt="" 
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                            />
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="font-bold text-slate-800 text-xs truncate" title={article.title}>{article.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={article.summary}>{article.summary}</p>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                              <span>Slug: /{article.slug}</span>
                              {commentsCount > 0 && (
                                <span className="flex items-center gap-0.5 text-blue-600 font-bold bg-blue-50 px-1 rounded">
                                  <MessageSquare className="w-2.5 h-2.5" /> {commentsCount} comments
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 align-middle">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg uppercase tracking-wide">
                          {article.category}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="p-4 text-xs font-medium text-slate-600 align-middle">
                        {article.author}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-xs font-mono text-slate-500 align-middle">
                        {article.publishDate || article.createdAt}
                      </td>

                      {/* Featured Star Toggle */}
                      <td className="p-4 text-center align-middle">
                        <button 
                          onClick={() => handleToggleFeatured(article)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            article.featured 
                              ? 'text-amber-500 hover:text-amber-600' 
                              : 'text-slate-300 hover:text-slate-400'
                          }`}
                          title={article.featured ? "Remove featured badge" : "Mark as Featured"}
                        >
                          <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono tracking-widest ${
                          article.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          article.status === 'Draft' ? 'bg-slate-100 text-slate-550 border border-slate-200' :
                          article.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          'bg-red-50 text-red-500 border border-red-200' // Archived
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            article.status === 'Published' ? 'bg-emerald-500' :
                            article.status === 'Draft' ? 'bg-slate-400' :
                            article.status === 'Scheduled' ? 'bg-blue-500' : 'bg-red-500'
                          }`} />
                          {article.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleTogglePublish(article)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                            title={article.status === 'Published' ? "Unpublish to draft" : "Publish article"}
                          >
                            {article.status === 'Published' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(article)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-lg transition cursor-pointer"
                            title="Edit details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDuplicate(article)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-50 text-amber-600 rounded-lg transition cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 bg-slate-100 hover:bg-red-50 text-red-550 rounded-lg transition cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
            <p className="text-sm font-medium">No articles matched your current filter criteria.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('All');
                setFilterStatus('All');
                setFilterAuthor('All');
              }}
              className="mt-2 text-xs font-extrabold text-[#ff5a3c] uppercase hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ==================== 5. ARTICLE ADD / EDIT MODAL ==================== */}
      {isEditorOpen && editingArticle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#ff5a3c] font-black">
                  {editingArticle.id ? 'Edit active draft' : 'New Article Draft'}
                </span>
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  {editingArticle.title || 'Untitled Article'}
                </h3>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Editor Tabs switcher */}
                <div className="bg-slate-200/60 p-1 rounded-xl flex items-center gap-1">
                  <button 
                    onClick={() => setEditorTab('edit')}
                    className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-lg transition ${
                      editorTab === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    Edit Document
                  </button>
                  <button 
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1 text-[10px] uppercase font-black tracking-wider rounded-lg transition ${
                      editorTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setIsEditorOpen(false);
                    setEditingArticle(null);
                  }}
                  className="p-1.5 hover:bg-slate-150 rounded-full text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto p-8">
              {editorTab === 'edit' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Core Fields */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Title */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 block">Article Title</label>
                      <input 
                        type="text"
                        placeholder="e.g., JP Nagar Metro Corridor Property Surge"
                        value={editingArticle.title || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingArticle(prev => ({
                            ...prev,
                            title: val,
                            // Auto-generate slug & SEO title if they were unset or match the old title
                            slug: prev?.slug === generateSlug(prev?.title || '') ? generateSlug(val) : prev?.slug || generateSlug(val),
                            seoTitle: prev?.seoTitle === prev?.title ? val : prev?.seoTitle || val
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                    </div>

                    {/* Slug */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 block flex items-center justify-between">
                        <span>Slug URL (Auto-Generated)</span>
                        <span className="font-mono text-[9px] text-[#ff5a3c]">/insights/{editingArticle.slug || ''}</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="metro-corridor-property-surge"
                        value={editingArticle.slug || ''}
                        onChange={(e) => {
                          const val = generateSlug(e.target.value);
                          setEditingArticle(prev => ({ ...prev, slug: val }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                    </div>

                    {/* Summary */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-black text-slate-500 block">Short Excerpt (Summary)</label>
                      <textarea 
                        rows={2}
                        placeholder="Write a catchy 1-2 sentence brief summary to show on homepage list views..."
                        value={editingArticle.summary || ''}
                        onChange={(e) => setEditingArticle(prev => ({ ...prev, summary: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c]"
                      />
                    </div>

                    {/* Rich Content Editor */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase font-black text-slate-500 block">Rich Document Content</label>
                        <span className="text-[9px] text-slate-400">supports HTML paragraphs, lists, and line breaks</span>
                      </div>
                      <textarea 
                        rows={12}
                        placeholder="Write your beautiful complete article body here..."
                        value={editingArticle.content || ''}
                        onChange={(e) => {
                          const content = e.target.value;
                          setEditingArticle(prev => ({
                            ...prev,
                            content,
                            // Auto estimate reading time
                            readingTime: calculateReadingTime(content)
                          }));
                        }}
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff5a3c] font-sans leading-relaxed"
                      />
                    </div>

                    {/* Comments Toggle */}
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <input 
                        type="checkbox" 
                        id="comments-enabled-toggle"
                        checked={editingArticle.commentsEnabled !== false}
                        onChange={(e) => setEditingArticle(prev => ({ ...prev, commentsEnabled: e.target.checked }))}
                        className="w-4 h-4 text-[#ff5a3c] border-slate-300 rounded focus:ring-[#ff5a3c]"
                      />
                      <label htmlFor="comments-enabled-toggle" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        Enable Readers Comments for this Article
                      </label>
                    </div>

                  </div>

                  {/* Right Column: Settings & Metadata */}
                  <div className="space-y-6">
                    
                    {/* Status & Banner Configuration */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-slate-600 tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-slate-500" />
                        Status & Priority
                      </h4>
                      
                      {/* Status */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">Publication Status</label>
                        <select
                          value={editingArticle.status || 'Draft'}
                          onChange={(e) => setEditingArticle(prev => ({ 
                            ...prev, 
                            status: e.target.value as any,
                            published: e.target.value === 'Published'
                          }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold focus:outline-none"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Published">Published</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>

                      {/* Featured */}
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-250">
                        <input 
                          type="checkbox" 
                          id="edit-featured-toggle"
                          checked={!!editingArticle.featured}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, featured: e.target.checked }))}
                          className="w-4 h-4 text-[#ff5a3c] border-slate-300 rounded focus:ring-[#ff5a3c]"
                        />
                        <label htmlFor="edit-featured-toggle" className="text-xs font-extrabold text-amber-600 flex items-center gap-1 cursor-pointer select-none">
                          <Sparkles className="w-4 h-4 fill-amber-400 text-amber-500" />
                          Featured Article (Homepage Banner)
                        </label>
                      </div>

                      {/* Display Order */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">Display Sort Order</label>
                        <input 
                          type="number"
                          value={editingArticle.displayOrder || 1}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
                        />
                      </div>

                    </div>

                    {/* Metadata Options */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-slate-600 tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-500" />
                        Article Parameters
                      </h4>

                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">Category</label>
                        <select
                          value={editingArticle.category || categoriesList[0]}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold focus:outline-none"
                        >
                          {categoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Featured Image */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">Featured Cover Image URL</label>
                        <input 
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={editingArticle.featuredImage || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, featuredImage: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] font-mono text-slate-700 placeholder-slate-400 focus:outline-none"
                        />
                        {editingArticle.featuredImage && (
                          <img 
                            src={editingArticle.featuredImage} 
                            alt="" 
                            className="w-full h-24 rounded-lg object-cover border border-slate-200 mt-2"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                        )}
                      </div>

                      {/* Author */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">Author Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. Sourcing Desk"
                          value={editingArticle.author || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold focus:outline-none"
                        />
                      </div>

                      {/* Reading Time */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block flex justify-between">
                          <span>Reading Time</span>
                          <span className="text-[8px] text-slate-400">manual override</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="5 min read"
                          value={editingArticle.readingTime || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, readingTime: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 focus:outline-none font-medium"
                        />
                      </div>

                      {/* Publish Date */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">Publish Date</label>
                        <input 
                          type="date"
                          value={editingArticle.publishDate || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, publishDate: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-mono focus:outline-none"
                        />
                      </div>

                    </div>

                    {/* SEO Config */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <h4 className="text-[10px] uppercase font-black text-slate-600 tracking-wider border-b border-slate-200 pb-2 flex items-center gap-2">
                        <Layout className="w-4 h-4 text-slate-500" />
                        Search Engine Optimization (SEO)
                      </h4>

                      {/* SEO Title */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">SEO Title Meta</label>
                        <input 
                          type="text"
                          placeholder="Search engine meta title..."
                          value={editingArticle.seoTitle || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, seoTitle: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 focus:outline-none"
                        />
                      </div>

                      {/* SEO Description */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase font-black text-slate-500 block">SEO Description Meta</label>
                        <textarea 
                          rows={2}
                          placeholder="Brief meta description..."
                          value={editingArticle.seoDescription || ''}
                          onChange={(e) => setEditingArticle(prev => ({ ...prev, seoDescription: e.target.value }))}
                          className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* LIVE PREVIEW TAB */
                <div className="max-w-3xl mx-auto space-y-8 py-4">
                  <div className="bg-[#0b1329] text-white p-6 rounded-2xl border border-slate-800/80 font-sans shadow-lg">
                    <span className="text-[9px] uppercase font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full font-black tracking-widest">
                      {editingArticle.category || 'MARKET INSIGHTS'}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 leading-tight">
                      {editingArticle.title || 'Draft Article Title'}
                    </h1>
                    <p className="text-slate-400 mt-3 text-sm italic font-light">
                      {editingArticle.summary || 'Write a summary to see it formatted here.'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-t border-b border-slate-800/80 py-3 mt-6">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#ff5a3c]" />
                        BY {editingArticle.author?.toUpperCase() || 'DVARIX REALTY'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {editingArticle.publishDate || 'July 6, 2026'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                        {editingArticle.readingTime || '1 min read'}
                      </span>
                    </div>

                    {editingArticle.featuredImage && (
                      <div className="w-full aspect-21/9 rounded-2xl overflow-hidden border border-slate-800 mt-6 shadow-md">
                        <img 
                          src={editingArticle.featuredImage} 
                          alt="" 
                          className="w-full h-full object-cover filter brightness-90"
                        />
                      </div>
                    )}

                    <div className="mt-8 text-slate-300 leading-relaxed font-light text-sm space-y-4 whitespace-pre-line">
                      {editingArticle.content || 'Article content is empty. Type in the Editor tab to view.'}
                    </div>

                    {editingArticle.commentsEnabled !== false && (
                      <div className="border-t border-slate-800/80 pt-6 mt-12 space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-[#ff5a3c]" />
                          Comments (Enabled)
                        </h4>
                        <p className="text-xs text-slate-400 italic">User replies, inquiries, or feedback submitted on active portals will append here live.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-150 flex justify-between items-center bg-slate-50">
              <button 
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingArticle(null);
                }}
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-150 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-3">
                {/* Draft vs Published Selector Shortcut */}
                <select 
                  value={editingArticle.status || 'Draft'}
                  onChange={(e) => setEditingArticle(prev => ({ 
                    ...prev, 
                    status: e.target.value as any,
                    published: e.target.value === 'Published'
                  }))}
                  className="bg-white border border-slate-200 text-xs font-bold text-slate-700 p-2.5 rounded-xl focus:outline-none"
                >
                  <option value="Draft">Draft Status</option>
                  <option value="Published">Published Live</option>
                  <option value="Scheduled">Scheduled Later</option>
                  <option value="Archived">Archived Document</option>
                </select>

                <button 
                  onClick={handleSaveArticle}
                  className="px-6 py-2.5 bg-[#ff5a3c] hover:bg-[#e04326] text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== 6. CATEGORY MANAGER MODAL ==================== */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-[#ff5a3c]" />
                Blog Category Manager
              </h3>
              <button 
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setEditingCategoryIdx(null);
                }}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              
              {/* Add New Category Form */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                />
                <button 
                  onClick={handleAddCategory}
                  className="px-4 bg-[#ff5a3c] hover:bg-[#e04326] text-white rounded-xl transition text-xs font-bold uppercase cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Categories Scrollable Area */}
              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 p-2 rounded-xl">
                {categoriesList.map((cat, idx) => (
                  <div key={cat} className="flex items-center justify-between bg-slate-50/55 p-2 rounded-lg border border-slate-150 text-xs">
                    
                    {editingCategoryIdx === idx ? (
                      <div className="flex items-center gap-1.5 flex-1 pr-2">
                        <input 
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditCategorySave();
                          }}
                          className="flex-1 bg-white border border-slate-300 px-2 py-1 rounded text-xs font-medium"
                          autoFocus
                        />
                        <button 
                          onClick={handleEditCategorySave}
                          className="text-emerald-600 p-1 hover:bg-emerald-50 rounded"
                          title="Save change"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingCategoryIdx(null)}
                          className="text-red-500 p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-slate-750">{cat}</span>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingCategoryIdx(idx);
                              setEditingCategoryName(cat);
                            }}
                            className="text-indigo-600 px-1.5 py-0.5 hover:bg-indigo-50 rounded text-[10px] font-bold"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-red-500 px-1.5 py-0.5 hover:bg-red-50 rounded text-[10px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}

                  </div>
                ))}
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsCategoryManagerOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
