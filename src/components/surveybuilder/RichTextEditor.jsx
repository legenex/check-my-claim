import React, { useRef, useState, useEffect } from "react";
import { Code } from "lucide-react";

const TOOLBAR = [
  { cmd: "bold",          label: "B",   style: { fontWeight: 700 } },
  { cmd: "italic",        label: "I",   style: { fontStyle: "italic" } },
  { cmd: "underline",     label: "U",   style: { textDecoration: "underline" } },
  { cmd: "strikeThrough", label: "S",   style: { textDecoration: "line-through" } },
  { sep: true },
  { cmd: "formatBlock", val: "H1", label: "H1" },
  { cmd: "formatBlock", val: "H2", label: "H2" },
  { cmd: "formatBlock", val: "H3", label: "H3" },
  { sep: true },
  { cmd: "insertUnorderedList", label: "• List" },
  { cmd: "insertOrderedList",   label: "1. List" },
  { cmd: "formatBlock", val: "blockquote", label: "❝" },
  { cmd: "insertHorizontalRule", label: "HR" },
];

function sanitizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [rawMode, setRawMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || "");

  useEffect(() => {
    if (!rawMode && editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, rawMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = sanitizeHtml(editorRef.current.innerHTML);
      onChange(html);
    }
  };

  const execCmd = (cmd, val) => {
    if (cmd === "formatBlock") {
      document.execCommand("formatBlock", false, val);
    } else {
      document.execCommand(cmd, false, val || null);
    }
    editorRef.current?.focus();
    handleInput();
  };

  const toggleRaw = () => {
    if (!rawMode) {
      setRawHtml(value || "");
      setRawMode(true);
    } else {
      const sanitized = sanitizeHtml(rawHtml);
      onChange(sanitized);
      setRawMode(false);
    }
  };

  const insertFieldToken = () => {
    const key = prompt("Enter field key (e.g. first_name):");
    if (key) {
      document.execCommand("insertHTML", false, `<span style="background:rgba(34,130,252,0.2);color:#2282fc;border-radius:3px;padding:1px 5px;font-family:'JetBrains Mono',monospace;font-size:12px;">{fields.${key}}</span>`);
      handleInput();
    }
  };

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, background: "#050b14" }}>
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-white/10">
        {TOOLBAR.map((btn, i) => {
          if (btn.sep) return <span key={`sep-${i}`} className="w-px h-4 bg-white/10 mx-1" />;
          return (
            <button
              key={i}
              onMouseDown={e => { e.preventDefault(); execCmd(btn.cmd, btn.val); }}
              className="px-2 py-0.5 rounded text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              style={{ fontFamily: btn.style?.fontStyle === "italic" ? "serif" : "inherit", ...btn.style }}
            >
              {btn.label}
            </button>
          );
        })}
        <span className="w-px h-4 bg-white/10 mx-1" />
        <button
          onMouseDown={e => { e.preventDefault(); insertFieldToken(); }}
          className="px-2 py-0.5 rounded text-xs hover:bg-white/10 transition-colors"
          style={{ color: "#2282fc", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {"{field}"}
        </button>
        <button
          onMouseDown={e => { e.preventDefault(); toggleRaw(); }}
          className="ml-auto px-2 py-0.5 rounded text-xs hover:bg-white/10 transition-colors"
          style={{ color: rawMode ? "#3ab54b" : "#64748b" }}
        >
          <Code className="w-3 h-3 inline" /> {rawMode ? "WYSIWYG" : "HTML"}
        </button>
      </div>

      {rawMode ? (
        <textarea
          value={rawHtml}
          onChange={e => setRawHtml(e.target.value)}
          onBlur={e => { const s = sanitizeHtml(e.target.value); onChange(s); }}
          className="w-full outline-none resize-none"
          style={{
            background: "transparent", color: "#e2e8f0", padding: "10px 12px",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, minHeight: 120,
          }}
          spellCheck={false}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="outline-none"
          style={{
            minHeight: 100, padding: "10px 12px", color: "#e2e8f0",
            fontFamily: "'Manrope', sans-serif", fontSize: 14, lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: value || "" }}
        />
      )}
    </div>
  );
}