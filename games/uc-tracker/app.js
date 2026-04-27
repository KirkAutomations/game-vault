// ===== UC Tracker — Main Application =====
(function () {
    'use strict';

    const STORAGE_KEY = 'uc_tracker_entries';
    let currentDate = todayStr();

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initDatePicker();
        initFormInteractions();
        loadEntry(currentDate);
    });

    // ===== UTILITIES =====
    function todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function parseDate(str) {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function formatDate(str) {
        const d = parseDate(str);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function shiftDate(dateStr, days) {
        const d = parseDate(dateStr);
        d.setDate(d.getDate() + days);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function getAllEntries() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
        catch { return {}; }
    }

    function saveAllEntries(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    // ===== NAVIGATION =====
    function initNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                btn.classList.add('active');
                const viewId = 'view-' + btn.dataset.view;
                document.getElementById(viewId).classList.add('active');

                if (btn.dataset.view === 'history') renderHistory();
                if (btn.dataset.view === 'insights') renderInsights();
            });
        });

        // Card collapse toggles
        document.querySelectorAll('.card-title[data-toggle]').forEach(title => {
            title.addEventListener('click', () => {
                const body = document.getElementById(title.dataset.toggle);
                body.classList.toggle('collapsed');
                const chevron = title.querySelector('.chevron');
                if (chevron) chevron.textContent = body.classList.contains('collapsed') ? '▸' : '▾';
            });
        });
    }

    // ===== DATE PICKER =====
    function initDatePicker() {
        const dateInput = document.getElementById('log-date');
        dateInput.value = currentDate;
        updateDayLabel();

        dateInput.addEventListener('change', () => {
            currentDate = dateInput.value;
            updateDayLabel();
            loadEntry(currentDate);
        });

        document.getElementById('prev-day').addEventListener('click', () => {
            currentDate = shiftDate(currentDate, -1);
            dateInput.value = currentDate;
            updateDayLabel();
            loadEntry(currentDate);
        });

        document.getElementById('next-day').addEventListener('click', () => {
            currentDate = shiftDate(currentDate, 1);
            dateInput.value = currentDate;
            updateDayLabel();
            loadEntry(currentDate);
        });
    }

    function updateDayLabel() {
        const label = document.getElementById('day-label');
        if (currentDate === todayStr()) {
            label.textContent = 'Today';
        } else {
            const d = parseDate(currentDate);
            label.textContent = d.toLocaleDateString('en-US', { weekday: 'long' });
        }
    }

    // ===== FORM INTERACTIONS =====
    function initFormInteractions() {
        // Slider value displays
        const sliderMap = {
            painLevel: 'pain-val',
            fatigueLevel: 'fatigue-val',
            stressLevel: 'stress-val',
            anxietyLevel: 'anxiety-val',
            moodLevel: 'mood-val',
            sleepQuality: 'sleepq-val'
        };

        Object.entries(sliderMap).forEach(([name, valId]) => {
            const input = document.querySelector(`[name="${name}"]`);
            const display = document.getElementById(valId);
            if (input && display) {
                input.addEventListener('input', () => {
                    display.textContent = input.value;
                    updateMayo();
                });
            }
        });

        // Mayo score updates on radio changes
        document.querySelectorAll('[name="stoolFreq"], [name="bleeding"], [name="wellbeing"]').forEach(r => {
            r.addEventListener('change', updateMayo);
        });

        // Form submit
        document.getElementById('daily-form').addEventListener('submit', (e) => {
            e.preventDefault();
            saveEntry();
        });

        // History range
        document.getElementById('history-range').addEventListener('change', renderHistory);

        // Insights range
        document.getElementById('insights-range').addEventListener('change', renderInsights);

        // Export
        document.getElementById('export-btn').addEventListener('click', exportCSV);
    }

    // ===== MAYO SCORE =====
    function updateMayo() {
        const sf = getRadioValue('stoolFreq');
        const rb = getRadioValue('bleeding');
        const wb = getRadioValue('wellbeing');

        const badge = document.getElementById('partial-mayo');
        const label = document.getElementById('mayo-label');

        if (sf === null || rb === null || wb === null) {
            badge.textContent = '—';
            badge.className = 'mayo-badge';
            label.textContent = 'Fill all three fields above';
            return;
        }

        const score = sf + rb + wb;
        badge.textContent = score;
        badge.className = 'mayo-badge';

        if (score <= 1) { badge.classList.add('remission'); label.textContent = 'Remission'; }
        else if (score <= 4) { badge.classList.add('mild'); label.textContent = 'Mild Activity'; }
        else if (score <= 7) { badge.classList.add('moderate'); label.textContent = 'Moderate Activity'; }
        else { badge.classList.add('severe'); label.textContent = 'Severe Activity'; }
    }

    function getRadioValue(name) {
        const el = document.querySelector(`[name="${name}"]:checked`);
        return el ? parseInt(el.value) : null;
    }

    // ===== SAVE / LOAD ENTRY =====
    function collectFormData() {
        const form = document.getElementById('daily-form');
        const data = {};

        // Radio fields
        ['stoolFreq', 'bleeding', 'wellbeing', 'urgency', 'weather'].forEach(name => {
            data[name] = getRadioValue(name);
        });

        // Numeric fields
        ['totalBM', 'painLevel', 'fatigueLevel', 'stressLevel', 'anxietyLevel', 'moodLevel',
         'waterIntake', 'alcoholDrinks', 'sleepHours', 'sleepQuality', 'nightAwakenings',
         'exerciseDuration', 'aqi', 'temperature', 'humidity', 'outdoorHours', 'sunExposure',
         'cycleDay'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && el.value !== '') data[name] = parseFloat(el.value);
        });

        // Select fields
        ['bristolScale', 'exerciseIntensity', 'period'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && el.value) data[name] = el.value;
        });

        // Time fields
        ['bedtime', 'wakeTime'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && el.value) data[name] = el.value;
        });

        // Text fields
        ['foods', 'stressEvents', 'ucMeds', 'otherMeds', 'illnessDetails', 'notes'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && el.value.trim()) data[name] = el.value.trim();
        });

        // Checkbox groups
        ['triggerFoods', 'protectiveFoods', 'relaxation', 'exerciseType', 'supplements', 'illness'].forEach(name => {
            const checked = [];
            form.querySelectorAll(`[name="${name}"]:checked`).forEach(c => checked.push(c.value));
            if (checked.length) data[name] = checked;
        });

        // Single checkboxes
        ['missedMeds', 'tookNSAID', 'tookAntibiotic'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && el.checked) data[name] = true;
        });

        // Compute partial mayo
        if (data.stoolFreq !== null && data.stoolFreq !== undefined &&
            data.bleeding !== null && data.bleeding !== undefined &&
            data.wellbeing !== null && data.wellbeing !== undefined) {
            data.partialMayo = data.stoolFreq + data.bleeding + data.wellbeing;
        }

        return data;
    }

    function saveEntry() {
        const data = collectFormData();
        const entries = getAllEntries();
        entries[currentDate] = data;
        saveAllEntries(entries);

        const status = document.getElementById('save-status');
        status.textContent = 'Saved!';
        setTimeout(() => { status.textContent = ''; }, 2000);
    }

    function loadEntry(dateStr) {
        const entries = getAllEntries();
        const data = entries[dateStr] || {};
        const form = document.getElementById('daily-form');

        // Reset form
        form.reset();

        // Set slider defaults
        ['painLevel', 'fatigueLevel', 'stressLevel', 'anxietyLevel'].forEach(name => {
            form.querySelector(`[name="${name}"]`).value = 0;
        });
        form.querySelector('[name="moodLevel"]').value = 5;
        form.querySelector('[name="sleepQuality"]').value = 5;

        // Populate radio fields
        ['stoolFreq', 'bleeding', 'wellbeing', 'urgency', 'weather'].forEach(name => {
            if (data[name] !== undefined && data[name] !== null) {
                const el = form.querySelector(`[name="${name}"][value="${data[name]}"]`);
                if (el) el.checked = true;
            }
        });

        // Populate numeric fields
        ['totalBM', 'painLevel', 'fatigueLevel', 'stressLevel', 'anxietyLevel', 'moodLevel',
         'waterIntake', 'alcoholDrinks', 'sleepHours', 'sleepQuality', 'nightAwakenings',
         'exerciseDuration', 'aqi', 'temperature', 'humidity', 'outdoorHours', 'sunExposure',
         'cycleDay'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && data[name] !== undefined) el.value = data[name];
        });

        // Populate selects
        ['bristolScale', 'exerciseIntensity', 'period'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && data[name]) el.value = data[name];
        });

        // Populate time fields
        ['bedtime', 'wakeTime'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && data[name]) el.value = data[name];
        });

        // Populate text fields
        ['foods', 'stressEvents', 'ucMeds', 'otherMeds', 'illnessDetails', 'notes'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el && data[name]) el.value = data[name];
        });

        // Populate checkbox groups
        ['triggerFoods', 'protectiveFoods', 'relaxation', 'exerciseType', 'supplements', 'illness'].forEach(name => {
            if (data[name] && Array.isArray(data[name])) {
                data[name].forEach(val => {
                    const el = form.querySelector(`[name="${name}"][value="${val}"]`);
                    if (el) el.checked = true;
                });
            }
        });

        // Populate single checkboxes
        ['missedMeds', 'tookNSAID', 'tookAntibiotic'].forEach(name => {
            const el = form.querySelector(`[name="${name}"]`);
            if (el) el.checked = !!data[name];
        });

        // Update displays
        updateSliderDisplays();
        updateMayo();
    }

    function updateSliderDisplays() {
        const map = {
            painLevel: 'pain-val',
            fatigueLevel: 'fatigue-val',
            stressLevel: 'stress-val',
            anxietyLevel: 'anxiety-val',
            moodLevel: 'mood-val',
            sleepQuality: 'sleepq-val'
        };
        Object.entries(map).forEach(([name, valId]) => {
            const input = document.querySelector(`[name="${name}"]`);
            const display = document.getElementById(valId);
            if (input && display) display.textContent = input.value;
        });
    }

    // ===== HISTORY VIEW =====
    function renderHistory() {
        const entries = getAllEntries();
        const range = document.getElementById('history-range').value;
        const container = document.getElementById('history-list');

        let dates = Object.keys(entries).sort().reverse();

        if (range !== 'all') {
            const cutoff = shiftDate(todayStr(), -parseInt(range));
            dates = dates.filter(d => d >= cutoff);
        }

        if (dates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="big-icon">📋</div>
                    <h3>No entries yet</h3>
                    <p>Start logging your daily data to see your history here.</p>
                </div>`;
            return;
        }

        container.innerHTML = dates.map(date => {
            const e = entries[date];
            const mayo = e.partialMayo;
            let mayoClass = '';
            if (mayo !== undefined) {
                if (mayo <= 1) mayoClass = 'remission';
                else if (mayo <= 4) mayoClass = 'mild';
                else if (mayo <= 7) mayoClass = 'moderate';
                else mayoClass = 'severe';
            }

            const tags = [];
            if (e.triggerFoods && e.triggerFoods.length) tags.push(...e.triggerFoods.map(t => triggerLabel(t)));
            if (e.stressLevel >= 7) tags.push('High Stress');
            if (e.sleepHours && e.sleepHours < 6) tags.push('Low Sleep');
            if (e.tookNSAID) tags.push('NSAID');
            if (e.missedMeds) tags.push('Missed Meds');
            if (e.illness && e.illness.length) tags.push('Illness');

            return `
                <div class="history-entry" data-date="${date}">
                    <div class="history-date">${formatDate(date)}</div>
                    <div class="history-tags">
                        ${tags.slice(0, 5).map(t => `<span class="history-tag">${t}</span>`).join('')}
                    </div>
                    <div class="history-mayo ${mayoClass}" style="background:var(${mayoClass === 'remission' ? '--green' : mayoClass === 'mild' ? '--yellow' : mayoClass === 'moderate' ? '--orange' : mayoClass === 'severe' ? '--red' : '--border'});color:${mayoClass === 'mild' ? '#000' : '#fff'}">
                        ${mayo !== undefined ? mayo : '—'}
                    </div>
                </div>`;
        }).join('');

        // Click to navigate to that day
        container.querySelectorAll('.history-entry').forEach(el => {
            el.addEventListener('click', () => {
                currentDate = el.dataset.date;
                document.getElementById('log-date').value = currentDate;
                updateDayLabel();
                loadEntry(currentDate);
                // Switch to log view
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                document.querySelector('[data-view="log"]').classList.add('active');
                document.getElementById('view-log').classList.add('active');
            });
        });
    }

    function triggerLabel(key) {
        const labels = {
            redMeat: 'Red Meat', dairy: 'Dairy', spicy: 'Spicy', processedFood: 'Processed',
            highSugar: 'Sugar', highFiber: 'High Fiber', alcohol: 'Alcohol', caffeine: 'Caffeine',
            gluten: 'Gluten', emulsifiers: 'Additives'
        };
        return labels[key] || key;
    }

    // ===== INSIGHTS VIEW =====
    function renderInsights() {
        const entries = getAllEntries();
        const range = document.getElementById('insights-range').value;

        let dates = Object.keys(entries).sort();
        if (range !== 'all') {
            const cutoff = shiftDate(todayStr(), -parseInt(range));
            dates = dates.filter(d => d >= cutoff);
        }

        const data = dates.map(d => ({ date: d, ...entries[d] }));

        renderSymptomChart(data);
        renderCorrelations(data);
        renderComparison(data);
        renderTopTriggers(data);
    }

    // ===== SYMPTOM TREND CHART (Canvas) =====
    function renderSymptomChart(data) {
        const canvas = document.getElementById('chart-symptoms');
        const ctx = canvas.getContext('2d');

        // High DPI
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 200 * dpr;
        ctx.scale(dpr, dpr);
        const W = rect.width;
        const H = 200;

        ctx.clearRect(0, 0, W, H);

        if (data.length < 2) {
            ctx.fillStyle = '#8b8fa3';
            ctx.font = '14px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Need at least 2 entries to show trends', W / 2, H / 2);
            return;
        }

        const padding = { top: 20, right: 15, bottom: 35, left: 35 };
        const chartW = W - padding.left - padding.right;
        const chartH = H - padding.top - padding.bottom;

        // Get mayo scores
        const points = data.filter(d => d.partialMayo !== undefined).map((d, i, arr) => ({
            x: padding.left + (i / (arr.length - 1 || 1)) * chartW,
            y: padding.top + chartH - (d.partialMayo / 9) * chartH,
            mayo: d.partialMayo,
            date: d.date
        }));

        if (points.length < 2) {
            ctx.fillStyle = '#8b8fa3';
            ctx.font = '14px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Need at least 2 entries with Mayo scores', W / 2, H / 2);
            return;
        }

        // Grid lines
        ctx.strokeStyle = '#2a2d3a';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 9; i += 3) {
            const y = padding.top + chartH - (i / 9) * chartH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(W - padding.right, y);
            ctx.stroke();

            ctx.fillStyle = '#8b8fa3';
            ctx.font = '11px Segoe UI, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(i.toString(), padding.left - 8, y + 4);
        }

        // Zone backgrounds
        const zones = [
            { from: 0, to: 1, color: 'rgba(34,197,94,0.08)' },   // remission
            { from: 2, to: 4, color: 'rgba(234,179,8,0.06)' },    // mild
            { from: 5, to: 7, color: 'rgba(249,115,22,0.06)' },   // moderate
            { from: 8, to: 9, color: 'rgba(239,68,68,0.06)' }     // severe
        ];
        zones.forEach(z => {
            const y1 = padding.top + chartH - (z.to / 9) * chartH;
            const y2 = padding.top + chartH - (z.from / 9) * chartH;
            ctx.fillStyle = z.color;
            ctx.fillRect(padding.left, y1, chartW, y2 - y1);
        });

        // Line + gradient fill
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Fill under
        ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
        ctx.lineTo(points[0].x, padding.top + chartH);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        grad.addColorStop(0, 'rgba(99,102,241,0.25)');
        grad.addColorStop(1, 'rgba(99,102,241,0.02)');
        ctx.fillStyle = grad;
        ctx.fill();

        // Dots
        points.forEach(p => {
            let color = '#22c55e';
            if (p.mayo >= 2) color = '#eab308';
            if (p.mayo >= 5) color = '#f97316';
            if (p.mayo >= 8) color = '#ef4444';

            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#1a1d27';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Date labels (first, mid, last)
        ctx.fillStyle = '#8b8fa3';
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        const labelIndices = [0, Math.floor(points.length / 2), points.length - 1];
        labelIndices.forEach(i => {
            if (points[i]) {
                const d = parseDate(points[i].date);
                ctx.fillText(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), points[i].x, H - 8);
            }
        });

        // Y-axis label
        ctx.save();
        ctx.translate(10, padding.top + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#8b8fa3';
        ctx.font = '10px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('pMayo', 0, 0);
        ctx.restore();
    }

    // ===== CORRELATION ANALYSIS =====
    function renderCorrelations(data) {
        const container = document.getElementById('correlation-results');

        if (data.length < 7) {
            container.innerHTML = `<p class="empty-state">Need at least 7 entries for correlation analysis.</p>`;
            return;
        }

        const withMayo = data.filter(d => d.partialMayo !== undefined);
        if (withMayo.length < 7) {
            container.innerHTML = `<p class="empty-state">Need at least 7 entries with complete symptom data.</p>`;
            return;
        }

        const mayoScores = withMayo.map(d => d.partialMayo);

        // Build factor arrays
        const factors = [];

        // Numeric correlations
        const numericFactors = [
            { key: 'stressLevel', label: 'Stress Level' },
            { key: 'anxietyLevel', label: 'Anxiety Level' },
            { key: 'sleepHours', label: 'Sleep Hours' },
            { key: 'sleepQuality', label: 'Sleep Quality' },
            { key: 'painLevel', label: 'Pain Level' },
            { key: 'fatigueLevel', label: 'Fatigue Level' },
            { key: 'waterIntake', label: 'Water Intake' },
            { key: 'alcoholDrinks', label: 'Alcohol' },
            { key: 'exerciseDuration', label: 'Exercise Duration' },
            { key: 'aqi', label: 'Air Quality (AQI)' },
            { key: 'temperature', label: 'Temperature' },
            { key: 'nightAwakenings', label: 'Night Awakenings' },
            { key: 'outdoorHours', label: 'Hours Outdoors' },
        ];

        numericFactors.forEach(f => {
            const vals = withMayo.map(d => d[f.key]);
            const validPairs = [];
            for (let i = 0; i < vals.length; i++) {
                if (vals[i] !== undefined && vals[i] !== null) {
                    validPairs.push({ x: vals[i], y: mayoScores[i] });
                }
            }
            if (validPairs.length >= 5) {
                const r = pearsonCorrelation(validPairs.map(p => p.x), validPairs.map(p => p.y));
                if (!isNaN(r)) {
                    factors.push({ label: f.label, r, n: validPairs.length });
                }
            }
        });

        // Boolean / checkbox correlations
        const boolFactors = [
            { key: 'missedMeds', label: 'Missed Medication' },
            { key: 'tookNSAID', label: 'Took NSAID' },
            { key: 'tookAntibiotic', label: 'Took Antibiotic' },
        ];

        boolFactors.forEach(f => {
            const vals = withMayo.map(d => d[f.key] ? 1 : 0);
            if (vals.some(v => v === 1)) {
                const r = pearsonCorrelation(vals, mayoScores);
                if (!isNaN(r)) {
                    factors.push({ label: f.label, r, n: withMayo.length });
                }
            }
        });

        // Trigger food correlations
        const triggerFoodKeys = ['redMeat', 'dairy', 'spicy', 'processedFood', 'highSugar', 'highFiber', 'alcohol', 'caffeine', 'gluten', 'emulsifiers'];
        triggerFoodKeys.forEach(food => {
            const vals = withMayo.map(d => (d.triggerFoods && d.triggerFoods.includes(food)) ? 1 : 0);
            if (vals.some(v => v === 1)) {
                const r = pearsonCorrelation(vals, mayoScores);
                if (!isNaN(r)) {
                    factors.push({ label: triggerLabel(food), r, n: withMayo.length });
                }
            }
        });

        // Protective food correlations
        const protFoodKeys = ['fish', 'fermented', 'probiotics', 'turmeric', 'bonebroth'];
        const protLabels = { fish: 'Fatty Fish', fermented: 'Fermented Foods', probiotics: 'Probiotics', turmeric: 'Turmeric', bonebroth: 'Bone Broth' };
        protFoodKeys.forEach(food => {
            const vals = withMayo.map(d => (d.protectiveFoods && d.protectiveFoods.includes(food)) ? 1 : 0);
            if (vals.some(v => v === 1)) {
                const r = pearsonCorrelation(vals, mayoScores);
                if (!isNaN(r)) {
                    factors.push({ label: protLabels[food] || food, r, n: withMayo.length });
                }
            }
        });

        // Illness
        const illnessVals = withMayo.map(d => (d.illness && d.illness.length > 0) ? 1 : 0);
        if (illnessVals.some(v => v === 1)) {
            const r = pearsonCorrelation(illnessVals, mayoScores);
            if (!isNaN(r)) factors.push({ label: 'Illness/Infection', r, n: withMayo.length });
        }

        // Sort by absolute correlation
        factors.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

        container.innerHTML = factors.map(f => {
            const pct = Math.abs(f.r) * 50;
            const cls = f.r >= 0 ? 'positive' : 'negative';
            const dir = f.r >= 0 ? 'Worse symptoms' : 'Better symptoms';
            const strength = Math.abs(f.r) >= 0.5 ? 'Strong' : Math.abs(f.r) >= 0.3 ? 'Moderate' : 'Weak';

            return `
                <div class="correlation-bar">
                    <div class="corr-label">
                        <span>${f.label}</span>
                        <span style="color:${f.r >= 0 ? 'var(--red)' : 'var(--green)'}">${f.r >= 0 ? '+' : ''}${f.r.toFixed(2)} (${strength} — ${dir})</span>
                    </div>
                    <div class="corr-track">
                        <div class="corr-center"></div>
                        <div class="corr-fill ${cls}" style="width:${pct}%;${cls === 'negative' ? `right:50%;left:auto;` : ''}"></div>
                    </div>
                </div>`;
        }).join('');
    }

    function pearsonCorrelation(x, y) {
        const n = x.length;
        if (n < 3) return NaN;
        const mx = x.reduce((a, b) => a + b, 0) / n;
        const my = y.reduce((a, b) => a + b, 0) / n;
        let num = 0, dx2 = 0, dy2 = 0;
        for (let i = 0; i < n; i++) {
            const dx = x[i] - mx;
            const dy = y[i] - my;
            num += dx * dy;
            dx2 += dx * dx;
            dy2 += dy * dy;
        }
        const denom = Math.sqrt(dx2 * dy2);
        return denom === 0 ? NaN : num / denom;
    }

    // ===== FLARE vs GOOD DAY COMPARISON =====
    function renderComparison(data) {
        const container = document.getElementById('comparison-results');
        const withMayo = data.filter(d => d.partialMayo !== undefined);

        const flareDays = withMayo.filter(d => d.partialMayo >= 4);
        const goodDays = withMayo.filter(d => d.partialMayo <= 2);

        if (flareDays.length < 2 || goodDays.length < 2) {
            container.innerHTML = `<p class="empty-state">Need at least 2 flare days (pMayo >= 4) and 2 good days (pMayo <= 2) for comparison.</p>`;
            return;
        }

        function avg(arr, key) {
            const valid = arr.filter(d => d[key] !== undefined && d[key] !== null);
            if (valid.length === 0) return null;
            return valid.reduce((s, d) => s + d[key], 0) / valid.length;
        }

        function pct(arr, key) {
            return (arr.filter(d => d[key]).length / arr.length * 100);
        }

        function pctArr(arr, key, val) {
            return (arr.filter(d => d[key] && Array.isArray(d[key]) && d[key].includes(val)).length / arr.length * 100);
        }

        const metrics = [
            { label: 'Stress Level', flare: avg(flareDays, 'stressLevel'), good: avg(goodDays, 'stressLevel'), higherIsWorse: true },
            { label: 'Anxiety Level', flare: avg(flareDays, 'anxietyLevel'), good: avg(goodDays, 'anxietyLevel'), higherIsWorse: true },
            { label: 'Mood', flare: avg(flareDays, 'moodLevel'), good: avg(goodDays, 'moodLevel'), higherIsWorse: false },
            { label: 'Sleep Hours', flare: avg(flareDays, 'sleepHours'), good: avg(goodDays, 'sleepHours'), higherIsWorse: false },
            { label: 'Sleep Quality', flare: avg(flareDays, 'sleepQuality'), good: avg(goodDays, 'sleepQuality'), higherIsWorse: false },
            { label: 'Water Intake', flare: avg(flareDays, 'waterIntake'), good: avg(goodDays, 'waterIntake'), higherIsWorse: false },
            { label: 'Exercise (min)', flare: avg(flareDays, 'exerciseDuration'), good: avg(goodDays, 'exerciseDuration'), higherIsWorse: false },
            { label: 'AQI', flare: avg(flareDays, 'aqi'), good: avg(goodDays, 'aqi'), higherIsWorse: true },
            { label: 'Missed Meds %', flare: pct(flareDays, 'missedMeds'), good: pct(goodDays, 'missedMeds'), higherIsWorse: true, isPct: true },
            { label: 'NSAID Use %', flare: pct(flareDays, 'tookNSAID'), good: pct(goodDays, 'tookNSAID'), higherIsWorse: true, isPct: true },
        ];

        let html = `<table class="comparison-table">
            <thead><tr><th>Factor</th><th>Flare Days (n=${flareDays.length})</th><th>Good Days (n=${goodDays.length})</th><th>Diff</th></tr></thead><tbody>`;

        metrics.forEach(m => {
            if (m.flare === null && m.good === null) return;
            const f = m.flare !== null ? (m.isPct ? m.flare.toFixed(0) + '%' : m.flare.toFixed(1)) : '—';
            const g = m.good !== null ? (m.isPct ? m.good.toFixed(0) + '%' : m.good.toFixed(1)) : '—';

            let diff = '';
            let cls = '';
            if (m.flare !== null && m.good !== null) {
                const d = m.flare - m.good;
                const isWorse = m.higherIsWorse ? d > 0 : d < 0;
                cls = Math.abs(d) > 0.5 ? (isWorse ? 'worse' : 'better') : '';
                diff = (d > 0 ? '+' : '') + (m.isPct ? d.toFixed(0) + '%' : d.toFixed(1));
            }

            html += `<tr><td>${m.label}</td><td>${f}</td><td>${g}</td><td class="${cls}">${diff}</td></tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // ===== TOP TRIGGERS =====
    function renderTopTriggers(data) {
        const container = document.getElementById('top-triggers');
        const withMayo = data.filter(d => d.partialMayo !== undefined);

        if (withMayo.length < 7) {
            container.innerHTML = `<p class="empty-state">Need at least 7 entries to identify triggers.</p>`;
            return;
        }

        const triggers = [];

        // Check trigger foods
        const triggerFoodKeys = ['redMeat', 'dairy', 'spicy', 'processedFood', 'highSugar', 'highFiber', 'alcohol', 'caffeine', 'gluten', 'emulsifiers'];
        triggerFoodKeys.forEach(food => {
            const withFood = withMayo.filter(d => d.triggerFoods && d.triggerFoods.includes(food));
            const withoutFood = withMayo.filter(d => !d.triggerFoods || !d.triggerFoods.includes(food));
            if (withFood.length >= 2 && withoutFood.length >= 2) {
                const avgWith = withFood.reduce((s, d) => s + d.partialMayo, 0) / withFood.length;
                const avgWithout = withoutFood.reduce((s, d) => s + d.partialMayo, 0) / withoutFood.length;
                const diff = avgWith - avgWithout;
                if (diff > 0.3) {
                    triggers.push({
                        name: triggerLabel(food),
                        detail: `Avg pMayo ${avgWith.toFixed(1)} with vs ${avgWithout.toFixed(1)} without (n=${withFood.length})`,
                        score: diff
                    });
                }
            }
        });

        // Check stress
        const highStress = withMayo.filter(d => d.stressLevel >= 7);
        const lowStress = withMayo.filter(d => d.stressLevel !== undefined && d.stressLevel < 4);
        if (highStress.length >= 2 && lowStress.length >= 2) {
            const avgHigh = highStress.reduce((s, d) => s + d.partialMayo, 0) / highStress.length;
            const avgLow = lowStress.reduce((s, d) => s + d.partialMayo, 0) / lowStress.length;
            const diff = avgHigh - avgLow;
            if (diff > 0.3) {
                triggers.push({
                    name: 'High Stress (7+)',
                    detail: `Avg pMayo ${avgHigh.toFixed(1)} vs ${avgLow.toFixed(1)} on low-stress days`,
                    score: diff
                });
            }
        }

        // Check poor sleep
        const poorSleep = withMayo.filter(d => d.sleepHours !== undefined && d.sleepHours < 6);
        const goodSleep = withMayo.filter(d => d.sleepHours !== undefined && d.sleepHours >= 7);
        if (poorSleep.length >= 2 && goodSleep.length >= 2) {
            const avgPoor = poorSleep.reduce((s, d) => s + d.partialMayo, 0) / poorSleep.length;
            const avgGood = goodSleep.reduce((s, d) => s + d.partialMayo, 0) / goodSleep.length;
            const diff = avgPoor - avgGood;
            if (diff > 0.3) {
                triggers.push({
                    name: 'Poor Sleep (<6 hrs)',
                    detail: `Avg pMayo ${avgPoor.toFixed(1)} vs ${avgGood.toFixed(1)} with good sleep`,
                    score: diff
                });
            }
        }

        // Missed meds
        const missed = withMayo.filter(d => d.missedMeds);
        const notMissed = withMayo.filter(d => !d.missedMeds);
        if (missed.length >= 2 && notMissed.length >= 2) {
            const avgM = missed.reduce((s, d) => s + d.partialMayo, 0) / missed.length;
            const avgNM = notMissed.reduce((s, d) => s + d.partialMayo, 0) / notMissed.length;
            const diff = avgM - avgNM;
            if (diff > 0.3) {
                triggers.push({ name: 'Missed Medication', detail: `Avg pMayo ${avgM.toFixed(1)} vs ${avgNM.toFixed(1)}`, score: diff });
            }
        }

        // NSAIDs
        const nsaid = withMayo.filter(d => d.tookNSAID);
        const noNsaid = withMayo.filter(d => !d.tookNSAID);
        if (nsaid.length >= 2 && noNsaid.length >= 2) {
            const avgN = nsaid.reduce((s, d) => s + d.partialMayo, 0) / nsaid.length;
            const avgNN = noNsaid.reduce((s, d) => s + d.partialMayo, 0) / noNsaid.length;
            const diff = avgN - avgNN;
            if (diff > 0.3) {
                triggers.push({ name: 'NSAID Use', detail: `Avg pMayo ${avgN.toFixed(1)} vs ${avgNN.toFixed(1)}`, score: diff });
            }
        }

        // High AQI
        const highAQI = withMayo.filter(d => d.aqi !== undefined && d.aqi > 100);
        const lowAQI = withMayo.filter(d => d.aqi !== undefined && d.aqi <= 50);
        if (highAQI.length >= 2 && lowAQI.length >= 2) {
            const avgHA = highAQI.reduce((s, d) => s + d.partialMayo, 0) / highAQI.length;
            const avgLA = lowAQI.reduce((s, d) => s + d.partialMayo, 0) / lowAQI.length;
            const diff = avgHA - avgLA;
            if (diff > 0.3) {
                triggers.push({ name: 'Poor Air Quality (AQI>100)', detail: `Avg pMayo ${avgHA.toFixed(1)} vs ${avgLA.toFixed(1)}`, score: diff });
            }
        }

        // Illness
        const sick = withMayo.filter(d => d.illness && d.illness.length > 0);
        const well = withMayo.filter(d => !d.illness || d.illness.length === 0);
        if (sick.length >= 1 && well.length >= 2) {
            const avgS = sick.reduce((s, d) => s + d.partialMayo, 0) / sick.length;
            const avgW = well.reduce((s, d) => s + d.partialMayo, 0) / well.length;
            const diff = avgS - avgW;
            if (diff > 0.3) {
                triggers.push({ name: 'Illness/Infection', detail: `Avg pMayo ${avgS.toFixed(1)} vs ${avgW.toFixed(1)}`, score: diff });
            }
        }

        // Sort by impact
        triggers.sort((a, b) => b.score - a.score);

        if (triggers.length === 0) {
            container.innerHTML = `<p class="empty-state">No clear triggers identified yet. Keep logging daily to build more data.</p>`;
            return;
        }

        container.innerHTML = triggers.map((t, i) => {
            const strength = t.score >= 2 ? 'high' : t.score >= 1 ? 'medium' : 'low';
            const strengthLabel = t.score >= 2 ? 'Strong' : t.score >= 1 ? 'Moderate' : 'Weak';
            return `
                <div class="trigger-item">
                    <span class="trigger-rank">#${i + 1}</span>
                    <div>
                        <div class="trigger-name">${t.name}</div>
                        <div class="trigger-detail">${t.detail}</div>
                    </div>
                    <span class="trigger-strength ${strength}">${strengthLabel}</span>
                </div>`;
        }).join('');
    }

    // ===== CSV EXPORT =====
    function exportCSV() {
        const entries = getAllEntries();
        const dates = Object.keys(entries).sort();
        if (dates.length === 0) { alert('No data to export.'); return; }

        const allKeys = new Set();
        dates.forEach(d => {
            Object.keys(entries[d]).forEach(k => allKeys.add(k));
        });

        const cols = ['date', ...Array.from(allKeys).sort()];
        const rows = [cols.join(',')];

        dates.forEach(date => {
            const e = entries[date];
            const row = cols.map(col => {
                if (col === 'date') return date;
                const val = e[col];
                if (val === undefined || val === null) return '';
                if (Array.isArray(val)) return `"${val.join('; ')}"`;
                if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
                return val;
            });
            rows.push(row.join(','));
        });

        const csv = rows.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uc_tracker_export_${todayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

})();
