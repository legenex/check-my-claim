import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight, Share2, Copy, Check, ArrowRight, ChevronDown, ChevronUp, Cpu, Menu } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Navbar from "@/components/landing/Navbar";
import LandingFooter from "@/components/landing/Footer";

function CategoryBadge({ category }) {
  return (
    <span className="inline-block bg-[#1e90ff]/15 text-[#1e90ff] border border-[#1e90ff]/25 text-xs font-semibold px-2.5 py-1 rounded-full">
      {category}
    </span>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left text-white font-semibold text-sm bg-[#0f1e35] hover:bg-white/5 transition-colors">
        <span>{question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#1e90ff] flex-shrink-0 ml-3" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-3" />}
      </button>
      {open && (
        <div className="px-5 py-4 bg-[#0a1628] text-slate-300 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-slate-400 font-medium flex items-center gap-1.5"><Share2 className="w-4 h-4" /> Share:</span>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Twitter/X
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-blue-700/20 text-blue-400 border border-blue-700/30 hover:bg-blue-700/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        LinkedIn
      </a>
      <button onClick={handleCopy} className="flex items-center gap-1.5 bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
        {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
      </button>
    </div>
  );
}

function TableOfContents({ body }) {
  const [activeId, setActiveId] = useState("");
  const headings = [...(body || "").matchAll(/<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>/gi)].map(m => ({
    level: parseInt(m[1]),
    id: m[2],
    text: m[3].replace(/<[^>]+>/g, "")
  }));
  if (!headings.length) return null;
  return (
    <div className="bg-[#0f1e35] rounded-2xl border border-white/10 p-5 sticky top-28">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Menu className="w-3.5 h-3.5" /> Table of Contents</h4>
      <nav className="space-y-1">
        {headings.map(h => (
          <a key={h.id} href={`#${h.id}`} className={`block text-sm transition-colors ${h.level === 3 ? "pl-3" : ""} ${activeId === h.id ? "text-[#1e90ff]" : "text-slate-300 hover:text-[#1e90ff]"}`}>
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

function RelatedCard({ post }) {
  const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  return (
    <Link to={`/blog/${post.slug}`} className="group bg-[#0f1e35] rounded-2xl border border-white/10 overflow-hidden hover:border-[#1e90ff]/40 hover:-translate-y-1 transition-all duration-300">
      <div className="h-40 bg-[#0a1628] overflow-hidden">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1e90ff]/20 to-blue-900/40 flex items-center justify-center text-4xl">⚖️</div>
        )}
      </div>
      <div className="p-4">
        {post.category && <span className="text-[#1e90ff] text-xs font-semibold">{post.category}</span>}
        <h4 className="text-white font-bold text-sm mt-1 mb-1 group-hover:text-[#1e90ff] transition-colors line-clamp-2">{post.title}</h4>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {dateStr && <span>{dateStr}</span>}
          {post.readTimeMinutes && <span>{post.readTimeMinutes} min</span>}
        </div>
      </div>
    </Link>
  );
}

function injectSchema(post) {
  const url = window.location.href;
  const schemas = [];

  schemas.push({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.seoTitle || post.title,
    "description": post.metaDescription || post.excerpt,
    "image": post.ogImage || post.featuredImage,
    "datePublished": post.publishedAt,
    "dateModified": post.updated_date || post.publishedAt,
    "author": { "@type": "Person", "name": post.authorName || "Check My Claim Team" },
    "publisher": { "@type": "Organization", "name": "Check My Claim", "url": "https://checkmyclaim.co" },
    "url": url,
  });

  if (post.faqItems?.length) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": post.faqItems.map(f => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } }))
    });
  }

  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://checkmyclaim.co" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://checkmyclaim.co/Blog" },
      post.category && { "@type": "ListItem", "position": 3, "name": post.category, "item": `https://checkmyclaim.co/Blog?cat=${post.category}` },
      { "@type": "ListItem", "position": 4, "name": post.title, "item": url },
    ].filter(Boolean)
  });

  schemas.forEach((schema, i) => {
    const existing = document.getElementById(`blog-schema-${i}`);
    if (existing) existing.remove();
    const el = document.createElement("script");
    el.id = `blog-schema-${i}`;
    el.type = "application/ld+json";
    el.text = JSON.stringify(schema);
    document.head.appendChild(el);
  });

  document.title = post.seoTitle || post.title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) { meta = document.createElement("meta"); meta.name = "description"; document.head.appendChild(meta); }
  meta.content = post.metaDescription || post.excerpt || "";

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
  canonical.href = url;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    base44.entities.BlogPost.filter({ slug, status: "Published" }, "-publishedAt", 1)
      .then(async data => {
        if (!data.length) { setNotFound(true); setLoading(false); return; }
        const p = data[0];
        setPost(p);
        injectSchema(p);
        const rel = await base44.entities.BlogPost.filter({ status: "Published", category: p.category }, "-publishedAt", 4).catch(() => []);
        setRelated(rel.filter(r => r.id !== p.id).slice(0, 3));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    return () => {
      [0, 1, 2].forEach(i => document.getElementById(`blog-schema-${i}`)?.remove());
    };
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />
      <div className="pt-28 max-w-4xl mx-auto px-4 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded mb-6" />
        <div className="h-10 w-full bg-white/10 rounded mb-3" />
        <div className="h-10 w-3/4 bg-white/10 rounded mb-8" />
        <div className="h-96 bg-white/5 rounded-2xl mb-8" />
        {Array(6).fill(0).map((_, i) => <div key={i} className="h-4 bg-white/5 rounded mb-3" />)}
      </div>
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-slate-400 mb-6">This article may have been moved or deleted.</p>
          <Link to="/Blog" className="bg-[#1e90ff] text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-500 transition-all">← Back to Blog</Link>
        </div>
      </div>
      <LandingFooter />
    </div>
  );

  const dateStr = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
  const url = window.location.href;

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />

      {/* Hero Image */}
      {post.featuredImage && (
        <div className="pt-20 h-80 md:h-96 overflow-hidden relative">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1628]/40 to-[#0a1628]" />
        </div>
      )}

      <div className={`max-w-7xl mx-auto px-4 ${post.featuredImage ? "-mt-16" : "pt-28"} pb-16`}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/Blog" className="hover:text-white transition-colors">Blog</Link>
          {post.category && <><ChevronRight className="w-3 h-3" /><span>{post.category}</span></>}
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300 line-clamp-1">{post.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Article */}
          <article className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {post.category && <CategoryBadge category={post.category} />}
              {post.isAIGenerated && (
                <span className="flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs px-2 py-0.5 rounded-full"><Cpu className="w-3 h-3" /> AI-Generated</span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">{post.title}</h1>

            {post.excerpt && <p className="text-lg text-slate-300 leading-relaxed mb-6 border-l-4 border-[#1e90ff] pl-4">{post.excerpt}</p>}

            {/* Meta */}
            <div className="flex items-center gap-5 flex-wrap text-sm text-slate-400 mb-8 pb-8 border-b border-white/10">
              {post.authorName && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e90ff] to-blue-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {post.authorAvatar ? <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full rounded-full object-cover" /> : post.authorName.charAt(0)}
                  </div>
                  <span className="font-semibold text-white">{post.authorName}</span>
                </div>
              )}
              {dateStr && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{dateStr}</span>}
              {post.readTimeMinutes && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTimeMinutes} min read</span>}
            </div>

            {/* Body */}
            {post.body ? (
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-white prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-3
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[#1e90ff]
                  prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
                  prose-a:text-[#1e90ff] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white prose-em:text-slate-200
                  prose-blockquote:border-l-4 prose-blockquote:border-[#1e90ff] prose-blockquote:bg-[#0f1e35] prose-blockquote:rounded-r-xl prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:text-slate-300 prose-blockquote:not-italic
                  prose-ul:text-slate-300 prose-li:mb-1
                  prose-img:rounded-2xl prose-img:shadow-2xl"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <div className="text-slate-400 italic py-10 text-center">Article content coming soon...</div>
            )}

            {/* Share */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <ShareButtons title={post.title} url={url} />
            </div>

            {/* FAQs */}
            {post.faqItems?.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold text-white mb-5">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {post.faqItems.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
                </div>
              </div>
            )}

            {/* Author Bio */}
            {post.authorName && post.authorBio && (
              <div className="mt-10 bg-[#0f1e35] rounded-2xl border border-white/10 p-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1e90ff] to-blue-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {post.authorAvatar ? <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full rounded-full object-cover" /> : post.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs text-[#1e90ff] font-semibold mb-1">About the Author</div>
                  <div className="text-white font-bold mb-2">{post.authorName}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{post.authorBio}</p>
                </div>
              </div>
            )}

            {/* CTA Banner */}
            <div className="mt-10 bg-gradient-to-br from-[#0C2D5B] via-[#0f1e35] to-[#0C2D5B] rounded-3xl border border-[#1e90ff]/25 p-8 text-center">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="text-xl font-extrabold text-white mb-2">Unsure If You Have a Case?</h3>
              <p className="text-slate-300 mb-5">Check your eligibility in just 2 minutes — completely free, no obligation.</p>
              <Link to="/Survey" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4ba8ee] to-[#0486e9] hover:shadow-2xl hover:shadow-blue-500/30 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105">
                Check My Claim Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-5">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map(r => <RelatedCard key={r.id} post={r} />)}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar ToC */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <TableOfContents body={post.body} />
          </aside>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}