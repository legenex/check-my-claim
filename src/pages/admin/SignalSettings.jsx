import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ComplianceBanner from "@/components/signals/ComplianceBanner";
import { base44 } from "@/api/base44Client";

export default function SignalSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch or create default settings
      const results = await base44.entities.SignalEngineSettings.list();
      if (results.length > 0) {
        setSettings(results[0]);
        setAcknowledged(results[0].compliance_acknowledgment);
      } else {
        // Create default
        const defaults = {
          alert_recipients: [],
          alert_threshold_composite_score: 60,
          urgent_threshold_composite_score: 80,
          digest_email_enabled: true,
          digest_send_time: '08:00',
          digest_recipients: [],
          notification_quiet_hours_start: '22:00',
          notification_quiet_hours_end: '06:00',
          scoring_weights: {
            severity: 0.30,
            volume: 0.20,
            wealth: 0.20,
            urgency: 0.20,
            competition: 0.10,
          },
          enabled: false,
          compliance_acknowledgment: false,
        };
        const created = await base44.entities.SignalEngineSettings.create(defaults);
        setSettings(created);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.SignalEngineSettings.update(settings.id, {
        ...settings,
        compliance_acknowledgment: acknowledged,
        enabled: acknowledged ? settings.enabled : false,
      });
      // Refresh
      fetchSettings();
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout title="Settings"><ComplianceBanner /><div className="text-center py-8 text-slate-400">Loading...</div></AdminLayout>;
  if (!settings) return <AdminLayout title="Settings"><ComplianceBanner /><div className="text-center py-8 text-slate-400">No settings found.</div></AdminLayout>;

  return (
    <AdminLayout title="Signal Engine Settings" breadcrumbs={[
      { label: "Admin", href: "/admin" },
      { label: "Signal Engine", href: "/admin/signals" },
      { label: "Settings" }
    ]}>
      <ComplianceBanner />

      <div className="max-w-3xl space-y-8">
        {/* Compliance Acknowledgment */}
        <div className="bg-amber-50 rounded-xl p-6 border-2 border-amber-500">
          <h3 className="text-lg font-bold text-amber-900 mb-4">Legal Compliance Acknowledgment</h3>
          <p className="text-sm text-amber-800 mb-4 leading-relaxed">
            Before enabling the Signal Engine, you must acknowledge and understand:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-800 space-y-2 mb-6">
            <li>Federal DPPA (Drivers Privacy Protection Act, 18 U.S.C. §2721) prohibits using crash data to identify or contact individual accident victims</li>
            <li>State anti-solicitation laws impose strict penalties for unsolicited contact to crash victims</li>
            <li>The Signal Engine produces TARGETING DATA ONLY for paid advertising campaigns, not victim contact lists</li>
            <li>All campaigns must use opt-in lead forms with explicit TCPA consent</li>
            <li>You are responsible for compliance with all applicable federal and state laws</li>
          </ul>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={e => setAcknowledged(e.target.checked)}
              className="w-5 h-5 rounded border-amber-500 mt-1"
            />
            <span className="text-sm font-semibold text-amber-900">
              I acknowledge that I have read and understand the DPPA, state anti-solicitation rules, and the compliance requirements above. I commit to using the Signal Engine exclusively for lawful targeting intelligence and paid advertising campaigns.
            </span>
          </label>
        </div>

        {/* Master Enable */}
        <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Enable Signal Engine</h3>
              <p className="text-sm text-slate-400 mt-1">Master kill switch. Requires compliance acknowledgment.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged && settings.enabled}
                onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
                disabled={!acknowledged}
                className="w-6 h-6 rounded border-white/20"
              />
            </label>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Alert Configuration</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-white block mb-2">Alert Recipients (emails)</label>
              <input
                type="text"
                placeholder="admin@example.com, manager@example.com"
                value={(settings.alert_recipients || []).join(', ')}
                onChange={e => setSettings({
                  ...settings,
                  alert_recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Alert Threshold Score</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.alert_threshold_composite_score}
                  onChange={e => setSettings({ ...settings, alert_threshold_composite_score: parseInt(e.target.value) })}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Urgent Threshold Score</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.urgent_threshold_composite_score}
                  onChange={e => setSettings({ ...settings, urgent_threshold_composite_score: parseInt(e.target.value) })}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Digest */}
        <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Daily Digest</h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.digest_email_enabled}
                onChange={e => setSettings({ ...settings, digest_email_enabled: e.target.checked })}
                className="w-5 h-5 rounded border-white/20"
              />
              <span className="text-sm font-semibold text-white">Enable daily digest emails</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Send Time (ET)</label>
                <input
                  type="time"
                  value={settings.digest_send_time}
                  onChange={e => setSettings({ ...settings, digest_send_time: e.target.value })}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-white block mb-2">Digest Recipients</label>
                <input
                  type="text"
                  placeholder="email1@example.com, email2@example.com"
                  value={(settings.digest_recipients || []).join(', ')}
                  onChange={e => setSettings({
                    ...settings,
                    digest_recipients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#1e90ff]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-[#0f1e35] rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6">Quiet Hours (no alerts)</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-white block mb-2">Start Time</label>
              <input
                type="time"
                value={settings.notification_quiet_hours_start}
                onChange={e => setSettings({ ...settings, notification_quiet_hours_start: e.target.value })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white block mb-2">End Time</label>
              <input
                type="time"
                value={settings.notification_quiet_hours_end}
                onChange={e => setSettings({ ...settings, notification_quiet_hours_end: e.target.value })}
                className="w-full bg-[#0a1628] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1e90ff]"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Urgent signals (80+) always break quiet hours</p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-[#1e90ff] hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </AdminLayout>
  );
}