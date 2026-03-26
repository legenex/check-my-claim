import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, Calendar, ChevronRight, Cpu, ArrowRight, Mail, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/landing/Navbar";
import LandingFooter from "@/components/landing/Footer";

const CATEGORIES = ["All", "Car Accidents", "Personal Injury", "Legal Process", "Settlement Tips", "Slip & Fall", "Legal Advice", "Medical Malpractice"];

const CATEGORY_COUNTS = {
  "Car Accidents": 12, "Personal Injury": 8, "Legal Process": 6,
  "Settlement Tips": 5, "Slip & Fall": 4, "Legal Advice": 9, "Medical Malpractice": 3
};

function SkeletonCard() {
  return (
    <div className="bg-[#0f1e35] rounded-2xl border border-white/10 overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-5 w-full bg-white/10 rounded" />
        <div className="h-5 w-3/4 bg-white/10 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-2/3 bg-white/5 rounded" />
        <div className="flex gap-3 pt-2">
          <div className="h-3 w-16 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }) {
  return (
    <span className="inline-block bg-[#1e90ff]/15 text-[#1e90ff] border border-[#1e90ff]/25 text-xs font-semibold px-2.5 py-1 rounded-full">
      {category}
    </span>
  );
}

function BlogCard({ post }) {
  const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group bg-[#0f1e35] rounded-2xl border border-white/10 overflow-hidden hover:border-[#1e90ff]/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1e90ff]/10 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-[#0a1628]">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        )}
        {post.isAIGenerated && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
            <Cpu className="w-3 h-3" /> AI
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {post.category && <CategoryBadge category={post.category} />}
        <h3 className="text-white font-bold text-lg leading-snug mt-3 mb-2 group-hover:text-[#1e90ff] transition-colors line-clamp-2">{post.title}</h3>
        {post.excerpt && <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
          {post.authorName && <span className="font-medium text-slate-300">{post.authorName}</span>}
          {dateStr && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>}
          {post.readTimeMinutes && <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{post.readTimeMinutes} min</span>}
        </div>
      </div>
    </Link>
  );
}

function FeaturedPost({ post }) {
  const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  return (
    <Link to={`/blog/${post.slug}`} className="group block bg-[#0f1e35] rounded-3xl border border-white/10 overflow-hidden hover:border-[#1e90ff]/40 transition-all duration-300 mb-12">
      <div className="md:flex">
        <div className="relative md:w-1/2 h-64 md:h-auto overflow-hidden bg-[#0a1628]">
          {post.featuredImage ? (
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-[#1e90ff]/20 to-blue-900/40 flex items-center justify-center">
              <span className="text-6xl">⚖️</span>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-[#1e90ff] text-white text-xs font-bold px-3 py-1.5 rounded-full">Featured</div>
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          {post.category && <CategoryBadge category={post.category} />}
          <h2 className="text-2xl md:text-3xl font-bold text-white mt-4 mb-3 leading-tight group-hover:text-[#1e90ff] transition-colors">{post.title}</h2>
          {post.excerpt && <p className="text-slate-300 leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>}
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
            {post.authorName && <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1e90ff] to-blue-700 flex items-center justify-center text-xs font-bold text-white">{post.authorName.charAt(0)}</div>
              <span className="text-slate-200 font-medium">{post.authorName}</span>
            </div>}
            {dateStr && <span>{dateStr}</span>}
            {post.readTimeMinutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTimeMinutes} min read</span>}
          </div>
          <div className="inline-flex items-center gap-2 bg-[#1e90ff] text-white font-semibold px-5 py-3 rounded-xl text-sm w-fit group-hover:bg-blue-500 transition-colors">
            Read Article <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function Sidebar({ posts, search, setSearch }) {
  const popular = [...posts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
  return (
    <aside className="space-y-6">
      {/* Search */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-3">Search Articles</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#0a1628] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]" />
        </div>
      </div>

      {/* Popular Articles */}
      {popular.length > 0 && (
        <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#1e90ff]" /> Popular Articles</h3>
          <div className="space-y-3">
            {popular.map((p, i) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="flex items-start gap-3 group">
                <span className="text-2xl font-bold text-white/10 leading-none mt-0.5 w-6 flex-shrink-0 text-right">{i + 1}</span>
                <span className="text-sm text-slate-300 group-hover:text-[#1e90ff] transition-colors leading-snug line-clamp-2">{p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5">
        <h3 className="text-sm font-bold text-white mb-4">Categories</h3>
        <div className="space-y-2">
          {Object.entries(CATEGORY_COUNTS).map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-sm text-slate-300 hover:text-[#1e90ff] cursor-pointer transition-colors">{cat}</span>
              <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-gradient-to-br from-[#1e90ff]/15 to-blue-900/20 rounded-2xl border border-[#1e90ff]/20 p-5">
        <Mail className="w-6 h-6 text-[#1e90ff] mb-3" />
        <h3 className="text-sm font-bold text-white mb-1">Get Legal Tips in Your Inbox</h3>
        <p className="text-xs text-slate-400 mb-4">Weekly insights on claims, rights, and settlements.</p>
        <input placeholder="Your email address" className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff] mb-2" />
        <button className="w-full bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg transition-all">Subscribe Free</button>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#0C2D5B] to-[#0f1e35] rounded-2xl border border-[#1e90ff]/20 p-5 text-center">
        <div className="text-2xl mb-2">⚖️</div>
        <h3 className="text-sm font-bold text-white mb-2">Do You Have a Claim?</h3>
        <p className="text-xs text-slate-400 mb-4">Find out in 2 minutes with our free claim checker.</p>
        <Link to="/Survey" className="block bg-[#1e90ff] hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Check My Claim Free →</Link>
      </div>
    </aside>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    base44.entities.BlogPost.filter({ status: "Published" }, "-publishedAt", 100)
      .then(data => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(p => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = posts.find(p => p.isFeatured) || posts[0];
  const gridPosts = filtered.filter(p => p.id !== featured?.id).slice(0, page * PER_PAGE);
  const hasMore = filtered.filter(p => p.id !== featured?.id).length > page * PER_PAGE;

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-12 px-4 text-center bg-gradient-to-b from-[#0f1e35] to-[#0a1628]">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-[#1e90ff]/15 text-[#1e90ff] border border-[#1e90ff]/25 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Legal Insights</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Legal Insights &<br /><span className="text-[#1e90ff]">Claim Tips</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8">Expert articles to help you understand your rights and maximize your compensation after an accident.</p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." className="w-full bg-[#0f1e35] border border-white/15 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-[#1e90ff] text-base" />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="sticky top-20 z-30 bg-[#0a1628]/90 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-0.5">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(1); }} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat ? "bg-[#1e90ff] text-white" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Featured Post */}
        {!loading && featured && category === "All" && !search && <FeaturedPost post={featured} />}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : gridPosts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <div className="text-4xl mb-3">📰</div>
                <div className="text-lg font-semibold text-white mb-1">No articles found</div>
                <div className="text-sm">Try a different search or category</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {gridPosts.map(post => <BlogCard key={post.id} post={post} />)}
                </div>
                {hasMore && (
                  <div className="text-center mt-10">
                    <button onClick={() => setPage(p => p + 1)} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-all">
                      Load More Articles
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <Sidebar posts={posts} search={search} setSearch={setSearch} />
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}