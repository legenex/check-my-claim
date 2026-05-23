import React, { useState } from "react";
import SettingsGeneral from "./settings/SettingsGeneral";
import SettingsFields from "./settings/SettingsFields";
import SettingsScripts from "./settings/SettingsScripts";
import SettingsTracking from "./settings/SettingsTracking";
import SettingsTheme from "./settings/SettingsTheme";
import SettingsLookup from "./settings/SettingsLookup";
import SettingsDQ from "./settings/SettingsDQ";
import SettingsIntegrations from "./settings/SettingsIntegrations";

const SETTINGS_TABS = ["General","Fields","Scripts","Tracking","Theme","Lookup","DQ","Integrations"];

export default function SettingsPanel({ survey, steps, fields, theme, onSurveyChange, onFieldCreated, onFieldUpdated, onFieldDeleted }) {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Sub-tab bar */}
      <div className="flex items-center gap-0 overflow-x-auto flex-shrink-0 border-b border-white/10 px-2 pt-2" style={{ background: "#0a1320" }}>
        {SETTINGS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0"
            style={{
              fontFamily: "'Manrope', sans-serif",
              color: activeTab === tab ? "#fff" : "#64748b",
              borderBottom: activeTab === tab ? "2px solid #2282fc" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto" style={{ background: "#0a1320" }}>
        {activeTab === "General" && <SettingsGeneral survey={survey} steps={steps} onChange={onSurveyChange} />}
        {activeTab === "Fields" && <SettingsFields fields={fields} steps={steps} onCreated={onFieldCreated} onUpdated={onFieldUpdated} onDeleted={onFieldDeleted} />}
        {activeTab === "Scripts" && <SettingsScripts survey={survey} onChange={onSurveyChange} />}
        {activeTab === "Tracking" && <SettingsTracking survey={survey} onChange={onSurveyChange} />}
        {activeTab === "Theme" && <SettingsTheme survey={survey} theme={theme} onChange={onSurveyChange} />}
        {activeTab === "Lookup" && <SettingsLookup survey={survey} onChange={onSurveyChange} />}
        {activeTab === "DQ" && <SettingsDQ survey={survey} onChange={onSurveyChange} />}
        {activeTab === "Integrations" && <SettingsIntegrations survey={survey} onChange={onSurveyChange} />}
      </div>
    </div>
  );
}