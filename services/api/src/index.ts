import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// --- MOCK DATA STORE ---
// In a real app, this would be PostgreSQL/TimescaleDB
const db = {
  users: [
    { id: 'u1', name: 'Abenezer Tadesse', role: 'PATIENT' },
    { id: 'd1', name: 'Dr. Amanuel Bekele', role: 'PSYCHIATRIST' }
  ],
  consents: [
    // This connects patient u1 to doctor d1
    { patientId: 'u1', doctorId: 'd1', scope: 'FULL_REPORTS', active: true }
  ],
  currentReadings: {
    'u1': { state: 'CALM', severity: 2, timestamp: new Date() }
  },
  reports: {
    'u1': [
      {
        id: 'r1',
        date: new Date().toISOString().split('T')[0], // Today
        summary: 'Today was a moderately stressful day. You experienced two stress spikes — one around 10am and another at 3pm. Both responded well to gamma wave intervention.',
        avgSeverity: 3.8,
        episodes: 2,
        patterns: [
          'Stress peaks correlate with late morning hours',
          'Gamma 40Hz most effective (avg -3.5 severity reduction)'
        ],
        clinicianNote: 'Patient exhibited two acute stress responses with appropriate autonomic recovery. Gamma 40Hz intervention showed consistent efficacy.'
      }
    ]
  }
};

// --- ENDPOINTS ---

// 1. Get current emotional state (Live)
app.get('/api/readings/:userId/current', (req, res) => {
  const { userId } = req.params;
  const { requesterId } = req.query; // in real app, from JWT

  // Check consent if requester is a doctor
  if (requesterId && requesterId !== userId) {
    const consent = db.consents.find(c => c.patientId === userId && c.doctorId === requesterId);
    if (!consent || !consent.active) {
      return res.status(403).json({ error: 'Access denied. Patient has not granted consent.' });
    }
  }

  const reading = db.currentReadings[userId as keyof typeof db.currentReadings];
  res.json(reading || { state: 'UNKNOWN', severity: 0 });
});

// 1b. Update current emotional state (Simulated BCI input)
app.post('/api/readings/:userId', (req, res) => {
  const { userId } = req.params;
  const { state, severity } = req.body;
  
  if (!state || severity === undefined) {
    return res.status(400).json({ error: 'Missing state or severity' });
  }
  
  db.currentReadings[userId as keyof typeof db.currentReadings] = {
    state: state.toUpperCase(),
    severity: Number(severity),
    timestamp: new Date()
  };
  
  console.log(`[API] Device Update: ${userId} set to ${state} (Severity: ${severity})`);
  res.json({ success: true, reading: db.currentReadings[userId as keyof typeof db.currentReadings] });
});

// 2. Get user reports (Consent-gated if requested by doctor)
app.get('/api/reports/:userId', (req, res) => {
  const { userId } = req.params;
  const { requesterId } = req.query; // in real app, from JWT

  // Check consent if requester is a doctor
  if (requesterId && requesterId !== userId) {
    const consent = db.consents.find(c => c.patientId === userId && c.doctorId === requesterId);
    if (!consent || !consent.active) {
      return res.status(403).json({ error: 'Access denied. Patient has not granted consent.' });
    }
  }

  res.json(db.reports[userId as keyof typeof db.reports] || []);
});

// 3. Toggle Consent
app.post('/api/consent/toggle', (req, res) => {
  const { patientId, doctorId, active } = req.body;
  const consent = db.consents.find(c => c.patientId === patientId && c.doctorId === doctorId);
  if (consent) {
    consent.active = active;
    res.json({ success: true, consent });
  } else {
    res.status(404).json({ error: 'Consent record not found' });
  }
});

// 4. Get Consents for a Patient
app.get('/api/consent/:patientId', (req, res) => {
  const { patientId } = req.params;
  const patientConsents = db.consents
    .filter(c => c.patientId === patientId)
    .map(c => {
      const doctor = db.users.find(u => u.id === c.doctorId);
      return {
        ...c,
        doctorName: doctor?.name || 'Unknown Doctor',
        doctorRole: doctor?.role === 'PSYCHIATRIST' ? 'Psychiatry' : (doctor?.role || 'Specialist')
      };
    });
  res.json(patientConsents);
});
// 4b. Get user details
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// 5. Get all patients for a doctor
app.get('/api/patients', (req, res) => {
  const { doctorId } = req.query; // in real app, from JWT
  
  // Get all patients who have granted consent (or just all patients for the hackathon)
  const patients = db.users.filter(u => u.role === 'PATIENT').map(patient => {
    const reading = db.currentReadings[patient.id as keyof typeof db.currentReadings] || { state: 'UNKNOWN', severity: 0 };
    const consent = db.consents.find(c => c.patientId === patient.id && c.doctorId === (doctorId || 'd1'));
    
    // Fetch last report time
    const reports = db.reports[patient.id as keyof typeof db.reports] || [];
    const lastReport = reports.length > 0 ? reports[reports.length - 1].date : 'No reports';

    return {
      id: patient.id,
      name: patient.name,
      state: reading.state,
      severity: reading.severity,
      lastReport,
      status: consent?.active ? 'Live Access' : 'Revoked'
    };
  });
  
  res.json(patients);
});

// --- SIMULATOR (Updates live state every 5s) ---
setInterval(() => {
  const states = ['CALM', 'STRESSED', 'ANXIOUS', 'ANGRY', 'DEPRESSED'];
  const reading = db.currentReadings['u1'];
  
  // Randomly drift severity up or down by 1
  let nextSeverity = reading.severity + (Math.random() > 0.5 ? 1 : -1);
  if (nextSeverity < 1) nextSeverity = 1;
  if (nextSeverity > 10) nextSeverity = 10;

  let nextState = 'CALM';
  if (nextSeverity > 7) nextState = 'ANXIOUS';
  else if (nextSeverity > 4) nextState = 'STRESSED';

  db.currentReadings['u1'] = { state: nextState, severity: nextSeverity, timestamp: new Date() };
  console.log(`[SIMULATOR] Updated u1 to ${nextState} (Severity: ${nextSeverity})`);
}, 5000);

app.listen(PORT, () => {
  console.log(`[API] MindWave API + Simulator running on http://localhost:${PORT}`);
});
