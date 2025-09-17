## 🚨 Copilot Prompt Guideline: AI-Based Anomaly Detection for GoSafe

**Goal** : Implement anomaly detection in the web portal to flag unsafe tourist behavior (sudden drop-offs, prolonged inactivity, deviations, distress).

---

### 1. **Define the Anomaly Context**

- Clearly tell Copilot that anomaly detection is **not ML-heavy** but based on **rules + lightweight AI checks** .
- Focus on **time-series location + activity patterns** stored in Supabase.
- Behaviors to detect:
  1. **Sudden location drop-off** → GPS jumps or missing pings.
  2. **Prolonged inactivity** → No location update for > N minutes.
  3. **Deviation from planned route** → Compare current path vs. expected waypoints.
  4. **Silent / distress pattern** → Panic button not pressed but inactivity + last known zone is risky.

---

### 2. **Database Preparation**

Instruct Copilot to ensure Supabase has:

- `locations` table → user_id, lat, lon, timestamp.
- `routes` table → user_id, planned_waypoints (JSON), active flag.
- `anomalies` table → anomaly_type, severity, user_id, timestamp, details.

> Tell Copilot: “Whenever you store a location, also run anomaly checks and insert into `anomalies` if needed.”

---

### 3. **Detection Workflow**

Copilot should generate code that:

1. On every **new location update** → fetch user’s last known point.
2. Compare → if distance > X km in < Y minutes → flag sudden drop-off.
3. Check inactivity → if last update > 15 mins → flag inactivity.
4. Check planned route deviation → if distance from nearest waypoint > Z meters → flag deviation.
5. On anomaly → insert into `anomalies` table + trigger notification.

---

### 4. **AI Layer (Optional Enhancement)**

- Ask Copilot to add a **basic ML-like scoring function** (not heavy training):
  - Assign severity score (0–100) combining factors (drop-off distance, time inactive, risk index of zone).
  - Use threshold (e.g., >70 = High Risk).
- Let Copilot propose a **utility function** `calculateAnomalyScore()` that can be reused.

---

### 5. **UI Integration**

Tell Copilot to:

- Add a **new “Anomalies Dashboard”** for Admin/Authorities.
- Show list of flagged events with:
  - User ID / name
  - Type of anomaly
  - Severity
  - Timestamp
  - Location (map marker)
- Allow filtering anomalies by type or severity.

---

### 6. **Notifications**

Ask Copilot to:

- Send email/SMS alert to emergency contacts if severity is “High”.
- Integrate anomaly alerts with **existing SOS/E-FIR workflow** so anomalies can auto-draft incidents.

---

### 7. **Copilot Anchors to Ensure Success**

- Keep schema consistent (`locations`, `routes`, `anomalies`).
- Use Supabase triggers/functions where possible.
- Write 1–2 example detection checks manually → Copilot will expand for others.
- Ensure Copilot always inserts anomalies in DB, never just logs them.
