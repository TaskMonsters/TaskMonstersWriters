// ============================================================
// WRITING TRACKER (Novel Tracker)  v3.0
// Writer-focused features:
//  - Novel goal + deadline with daily pace calculator
//  - Session logging (words, minutes, chapter, mood, notes)
//  - Writing streak + milestone badges
//  - Chapter progress tracker
//  - Mood-over-time mini chart
//  - Writing Focus Timer
//  - Monster encouragement dialogue
// ============================================================

(function () {
    'use strict';

    const STORAGE_KEY = 'writingTrackerData_v3';

    // ── Default data structure ───────────────────────────────
    function defaultData() {
        return {
            novelTitle:   '',
            genre:        '',
            wordGoal:     80000,
            deadline:     '',          // ISO date string
            dailyGoal:    500,         // words/day target
            sessions:     [],          // { date, words, minutes, chapter, mood, notes }
            chapters:     [],          // { title, targetWords, status }
            totalWords:   0,
            totalMinutes: 0,
            bestSession:  0
        };
    }

    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultData();
            return Object.assign(defaultData(), JSON.parse(raw));
        } catch (e) {
            return defaultData();
        }
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[WritingTracker] Save failed:', e);
        }
    }

    // ── Streak calculation ───────────────────────────────────
    function calcStreak(sessions) {
        if (!sessions || sessions.length === 0) return 0;
        const days = [...new Set(sessions.map(s => s.date.slice(0, 10)))].sort().reverse();
        let streak = 0;
        let cursor = new Date();
        cursor.setHours(0, 0, 0, 0);
        for (const day of days) {
            const d = new Date(day);
            d.setHours(0, 0, 0, 0);
            const diff = Math.round((cursor - d) / 86400000);
            if (diff === 0 || diff === 1) { streak++; cursor = d; }
            else break;
        }
        return streak;
    }

    // ── Pace calculator ──────────────────────────────────────
    // Returns { daysLeft, wordsLeft, wordsPerDay, onTrack }
    function calcPace(data) {
        const wordsLeft = Math.max(0, data.wordGoal - data.totalWords);
        if (!data.deadline) {
            return { daysLeft: null, wordsLeft, wordsPerDay: data.dailyGoal, onTrack: null };
        }
        const today     = new Date(); today.setHours(0, 0, 0, 0);
        const deadlineD = new Date(data.deadline); deadlineD.setHours(0, 0, 0, 0);
        const daysLeft  = Math.max(0, Math.ceil((deadlineD - today) / 86400000));
        const wordsPerDay = daysLeft > 0 ? Math.ceil(wordsLeft / daysLeft) : wordsLeft;

        // Check today's words
        const todayStr = today.toISOString().slice(0, 10);
        const todayWords = data.sessions
            .filter(s => s.date.slice(0, 10) === todayStr)
            .reduce((sum, s) => sum + s.words, 0);
        const onTrack = todayWords >= data.dailyGoal;

        return { daysLeft, wordsLeft, wordsPerDay, onTrack, todayWords };
    }

    // ── Milestone badges ─────────────────────────────────────
    const MILESTONES = [
        { words: 1000,   badge: '🌱', label: 'First 1K' },
        { words: 5000,   badge: '✍️', label: '5K Words' },
        { words: 10000,  badge: '🔥', label: '10K Club' },
        { words: 25000,  badge: '⚡', label: 'Quarter Way' },
        { words: 50000,  badge: '🏆', label: 'NaNoWriMo' },
        { words: 80000,  badge: '📚', label: 'Novel Length' },
        { words: 100000, badge: '👑', label: 'Century' }
    ];

    function getEarnedBadges(totalWords) {
        return MILESTONES.filter(m => totalWords >= m.words);
    }

    function getNextMilestone(totalWords) {
        return MILESTONES.find(m => totalWords < m.words) || null;
    }

    // ── UI helpers ───────────────────────────────────────────
    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }

    function showWritingNotification(msg) {
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(msg);
        } else {
            console.log('[WritingTracker]', msg);
        }
    }

    // ── Full UI refresh ──────────────────────────────────────
    function refreshUI() {
        const data = loadData();

        // ── Novel Goal card ──
        const titleEl    = document.getElementById('writingNovelTitle');
        const genreEl    = document.getElementById('writingGenre');
        const goalEl     = document.getElementById('writingWordGoal');
        const deadlineEl = document.getElementById('writingDeadline');
        const dailyEl    = document.getElementById('writingDailyGoal');
        if (titleEl    && data.novelTitle) titleEl.value    = data.novelTitle;
        if (genreEl    && data.genre)      genreEl.value    = data.genre;
        if (goalEl     && data.wordGoal)   goalEl.value     = data.wordGoal;
        if (deadlineEl && data.deadline)   deadlineEl.value = data.deadline;
        if (dailyEl    && data.dailyGoal)  dailyEl.value    = data.dailyGoal;

        // Progress bar
        const pct = data.wordGoal > 0
            ? Math.min(100, Math.round((data.totalWords / data.wordGoal) * 100))
            : 0;
        const labelEl = document.getElementById('writingProgressLabel');
        const pctEl   = document.getElementById('writingProgressPercent');
        const barEl   = document.getElementById('writingProgressBar');
        if (labelEl) labelEl.textContent = `${data.totalWords.toLocaleString()} / ${data.wordGoal.toLocaleString()} words`;
        if (pctEl)   pctEl.textContent   = `${pct}%`;
        if (barEl)   barEl.style.width   = `${pct}%`;

        // Pace info
        const pace = calcPace(data);
        const paceEl = document.getElementById('writingPaceInfo');
        if (paceEl) {
            if (pace.daysLeft !== null) {
                const trackIcon = pace.onTrack ? '✅' : '⚠️';
                const todayNote = pace.todayWords > 0
                    ? ` · ${pace.todayWords.toLocaleString()} written today`
                    : '';
                paceEl.innerHTML = `
                    <span>${trackIcon} <strong>${pace.wordsPerDay.toLocaleString()} words/day</strong> needed · ${pace.daysLeft} days left${todayNote}</span>`;
            } else {
                paceEl.innerHTML = `<span>🎯 Daily goal: <strong>${data.dailyGoal.toLocaleString()} words/day</strong></span>`;
            }
        }

        // ── Stats tiles ──
        const streak  = calcStreak(data.sessions);
        const avgWords = data.sessions.length > 0
            ? Math.round(data.totalWords / data.sessions.length)
            : 0;
        const totalHours = Math.round(data.totalMinutes / 60 * 10) / 10;

        setText('writingTotalWords',    data.totalWords.toLocaleString());
        setText('writingTotalSessions', data.sessions.length);
        setText('writingAvgWords',      avgWords.toLocaleString());
        setText('writingBestSession',   data.bestSession.toLocaleString());
        setText('writingTotalHours',    totalHours + ' hrs');
        setText('writingStreak',        streak + (streak === 1 ? ' day 🔥' : ' days 🔥'));

        // ── Milestone badges ──
        renderBadges(data.totalWords);

        // ── Mood chart ──
        renderMoodChart(data.sessions);

        // ── Chapter tracker ──
        renderChapters(data.chapters, data.totalWords);

        // ── Session history ──
        renderHistory(data.sessions);
    }

    // ── Milestone badges ─────────────────────────────────────
    function renderBadges(totalWords) {
        const container = document.getElementById('writingBadges');
        if (!container) return;
        const earned = getEarnedBadges(totalWords);
        const next   = getNextMilestone(totalWords);

        let html = '';
        earned.forEach(m => {
            html += `<span title="${m.label}" style="
                display:inline-flex;align-items:center;gap:4px;
                padding:4px 10px;border-radius:20px;font-size:13px;
                background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.4);
                color:#a78bfa;margin:3px;
            ">${m.badge} ${m.label}</span>`;
        });

        if (next) {
            const pct = Math.round((totalWords / next.words) * 100);
            html += `<div style="margin-top:10px;font-size:12px;color:var(--text-secondary);">
                Next: ${next.badge} <strong style="color:#fff;">${next.label}</strong>
                (${(next.words - totalWords).toLocaleString()} words away · ${pct}%)
            </div>`;
        }

        if (!earned.length) {
            html = '<p style="font-size:13px;color:var(--text-secondary);">Write your first 1,000 words to earn your first badge! 🌱</p>';
        }

        container.innerHTML = html;
    }

    // ── Mood chart ───────────────────────────────────────────
    const MOOD_COLORS = {
        '🔥 In the zone':         '#f97316',
        '😊 Feeling good':        '#22c55e',
        '🤔 Struggled but pushed':'#eab308',
        '🧐 Brainstorming':       '#3b82f6',
        '😴 Tired but showed up': '#8b5cf6',
        '':                       '#4b5563'
    };

    function renderMoodChart(sessions) {
        const container = document.getElementById('writingMoodChart');
        if (!container) return;

        // Last 14 sessions with a mood
        const withMood = sessions.filter(s => s.mood).slice(-14);
        if (withMood.length === 0) {
            container.innerHTML = '<p style="font-size:12px;color:var(--text-secondary);text-align:center;padding:12px;">Log sessions with a mood to see your vibe over time.</p>';
            return;
        }

        const barW = Math.floor(100 / withMood.length);
        const bars = withMood.map(s => {
            const color = MOOD_COLORS[s.mood] || '#8b5cf6';
            const dateStr = new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            return `<div title="${s.mood} · ${dateStr}" style="
                flex:1;height:32px;border-radius:4px;background:${color};
                opacity:0.85;cursor:default;transition:opacity 0.2s;
            " onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.85"></div>`;
        }).join('');

        container.innerHTML = `
            <div style="display:flex;gap:3px;align-items:flex-end;height:36px;">${bars}</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
                ${Object.entries(MOOD_COLORS).filter(([k]) => k).map(([mood, color]) =>
                    `<span style="font-size:11px;color:var(--text-secondary);display:flex;align-items:center;gap:4px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block;"></span>${mood}
                    </span>`
                ).join('')}
            </div>`;
    }

    // ── Chapter tracker ──────────────────────────────────────
    function renderChapters(chapters, totalWords) {
        const container = document.getElementById('writingChapterList');
        if (!container) return;

        if (!chapters || chapters.length === 0) {
            container.innerHTML = '<p style="font-size:13px;color:var(--text-secondary);text-align:center;padding:12px;">No chapters added yet. Add your first chapter above!</p>';
            return;
        }

        container.innerHTML = chapters.map((ch, i) => {
            const statusColors = {
                'planning':    '#6b7280',
                'drafting':    '#3b82f6',
                'revising':    '#f59e0b',
                'complete':    '#22c55e'
            };
            const color = statusColors[ch.status] || '#6b7280';
            const statusLabel = ch.status.charAt(0).toUpperCase() + ch.status.slice(1);

            return `<div style="
                display:flex;align-items:center;gap:10px;
                padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.07);
            ">
                <span style="
                    width:8px;height:8px;border-radius:50%;
                    background:${color};flex-shrink:0;
                "></span>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:600;font-size:14px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ch.title}</div>
                    ${ch.targetWords ? `<div style="font-size:12px;color:var(--text-secondary);">Target: ${ch.targetWords.toLocaleString()} words</div>` : ''}
                </div>
                <span style="
                    font-size:11px;padding:3px 8px;border-radius:12px;
                    background:${color}22;color:${color};border:1px solid ${color}44;
                    white-space:nowrap;
                ">${statusLabel}</span>
                <button onclick="deleteWritingChapter(${i})" style="
                    background:none;border:none;color:#6b7280;cursor:pointer;
                    font-size:16px;padding:2px 6px;flex-shrink:0;
                " title="Remove chapter">×</button>
            </div>`;
        }).join('');
    }

    // ── Session history ──────────────────────────────────────
    function renderHistory(sessions) {
        const container = document.getElementById('writingSessionHistory');
        if (!container) return;
        if (!sessions || sessions.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:20px;">No sessions logged yet. Start writing!</p>';
            return;
        }
        const sorted = [...sessions].reverse().slice(0, 30); // last 30
        container.innerHTML = sorted.map((s, i) => {
            const dateStr = new Date(s.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            const wpm = s.minutes > 0 ? Math.round(s.words / s.minutes) : '—';
            const realIdx = sessions.length - 1 - i;
            return `
            <div style="
                display:flex;flex-direction:column;gap:4px;
                padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.07);
            ">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-weight:600;color:#a78bfa;">${s.chapter || 'Session'}</span>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:12px;color:var(--text-secondary);">${dateStr}</span>
                        <button onclick="deleteWritingSession(${realIdx})" style="
                            background:none;border:none;color:#6b7280;cursor:pointer;
                            font-size:14px;padding:2px 5px;
                        " title="Delete session">×</button>
                    </div>
                </div>
                <div style="display:flex;gap:12px;font-size:13px;color:var(--text-secondary);flex-wrap:wrap;">
                    <span>📝 <strong style="color:#fff;">${s.words.toLocaleString()}</strong> words</span>
                    ${s.minutes ? `<span>⏱️ <strong style="color:#fff;">${s.minutes}</strong> min</span>` : ''}
                    ${s.minutes ? `<span>⚡ <strong style="color:#fff;">${wpm}</strong> wpm</span>` : ''}
                    ${s.mood ? `<span>${s.mood}</span>` : ''}
                </div>
                ${s.notes ? `<div style="font-size:12px;color:var(--text-secondary);font-style:italic;margin-top:2px;">"${s.notes}"</div>` : ''}
            </div>`;
        }).join('');
    }

    // ── Public: Save Goal ────────────────────────────────────
    window.saveWritingGoal = function () {
        const data = loadData();
        const get  = id => document.getElementById(id);

        data.novelTitle = get('writingNovelTitle')?.value.trim() || data.novelTitle;
        data.genre      = get('writingGenre')?.value.trim()      || data.genre;
        data.wordGoal   = parseInt(get('writingWordGoal')?.value, 10)  || data.wordGoal;
        data.deadline   = get('writingDeadline')?.value           || data.deadline;
        data.dailyGoal  = parseInt(get('writingDailyGoal')?.value, 10) || data.dailyGoal;

        saveData(data);
        refreshUI();
        showWritingNotification('📚 Novel goal saved!');
    };

    // ── Public: Log Session ──────────────────────────────────
    window.logWritingSession = function () {
        const words   = parseInt(document.getElementById('writingWordsInput')?.value, 10);
        const minutes = parseInt(document.getElementById('writingMinutesInput')?.value, 10);
        const chapter = document.getElementById('writingChapterInput')?.value.trim();
        const mood    = document.getElementById('writingMoodInput')?.value;
        const notes   = document.getElementById('writingNotesInput')?.value.trim();

        if (!words || words < 1) {
            showWritingNotification('⚠️ Please enter how many words you wrote!');
            return;
        }

        const data = loadData();
        const prevTotal = data.totalWords;

        const session = {
            date:    new Date().toISOString(),
            words,
            minutes: minutes || 0,
            chapter: chapter || '',
            mood:    mood    || '',
            notes:   notes   || ''
        };

        data.sessions.push(session);
        data.totalWords   += words;
        data.totalMinutes += (minutes || 0);
        data.bestSession   = Math.max(data.bestSession, words);
        saveData(data);

        // Clear inputs
        ['writingWordsInput', 'writingMinutesInput', 'writingChapterInput', 'writingNotesInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const moodEl = document.getElementById('writingMoodInput');
        if (moodEl) moodEl.value = '';

        refreshUI();
        showWritingNotification(`✍️ +${words.toLocaleString()} words logged!`);

        // Check for newly earned milestone
        const newBadge = MILESTONES.find(m => prevTotal < m.words && data.totalWords >= m.words);
        if (newBadge) {
            setTimeout(() => showWritingNotification(`${newBadge.badge} Milestone unlocked: ${newBadge.label}! 🎉`), 1200);
        }

        // Monster dialogue
        triggerWritingDialogue(words, data);
    };

    // ── Public: Delete session ───────────────────────────────
    window.deleteWritingSession = function (idx) {
        if (!confirm('Remove this session?')) return;
        const data = loadData();
        const removed = data.sessions.splice(idx, 1)[0];
        if (removed) {
            data.totalWords   = Math.max(0, data.totalWords   - removed.words);
            data.totalMinutes = Math.max(0, data.totalMinutes - removed.minutes);
            data.bestSession  = data.sessions.reduce((m, s) => Math.max(m, s.words), 0);
        }
        saveData(data);
        refreshUI();
        showWritingNotification('🗑️ Session removed.');
    };

    // ── Public: Add chapter ──────────────────────────────────
    window.addWritingChapter = function () {
        const titleEl  = document.getElementById('writingChapterTitle');
        const wordsEl  = document.getElementById('writingChapterWords');
        const statusEl = document.getElementById('writingChapterStatus');

        const title = titleEl?.value.trim();
        if (!title) {
            showWritingNotification('⚠️ Please enter a chapter title.');
            return;
        }

        const data = loadData();
        data.chapters.push({
            title,
            targetWords: parseInt(wordsEl?.value, 10) || 0,
            status:      statusEl?.value || 'planning'
        });
        saveData(data);

        if (titleEl)  titleEl.value  = '';
        if (wordsEl)  wordsEl.value  = '';
        if (statusEl) statusEl.value = 'planning';

        refreshUI();
        showWritingNotification('📖 Chapter added!');
    };

    // ── Public: Delete chapter ───────────────────────────────
    window.deleteWritingChapter = function (idx) {
        if (!confirm('Remove this chapter?')) return;
        const data = loadData();
        data.chapters.splice(idx, 1);
        saveData(data);
        refreshUI();
    };

    // ── Public: Reset ────────────────────────────────────────
    window.resetWritingTracker = function () {
        if (!confirm('Reset all writing tracker data? This cannot be undone.')) return;
        localStorage.removeItem(STORAGE_KEY);
        // Clear inputs
        ['writingNovelTitle','writingGenre','writingWordGoal','writingDeadline','writingDailyGoal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        refreshUI();
        showWritingNotification('🔄 Writing tracker reset!');
    };

    // ── Writing Focus Timer ──────────────────────────────────
    let _wfTimerInterval = null;
    let _wfRemaining     = 0;
    let _wfTotal         = 0;
    let _wfActive        = false;
    let _wfPaused        = false;

    function wfUpdateDisplay() {
        const display = document.getElementById('writingFocusTimerDisplay');
        if (!display) return;
        const mins = Math.floor(_wfRemaining / 60);
        const secs = _wfRemaining % 60;
        display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        display.style.color = (_wfRemaining <= 120 && _wfRemaining > 0 && _wfRemaining % 2 === 0)
            ? '#FF4C4C' : 'var(--text-primary)';
    }

    function wfSetButtons(state) {
        const startBtn = document.getElementById('writingStartFocusBtn');
        const pauseBtn = document.getElementById('writingPauseFocusBtn');
        const note     = document.getElementById('writingFocusTimerNote');
        if (!startBtn) return;
        if (state === 'running') {
            startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = 'block';
            if (note) note.style.display = 'block';
        } else if (state === 'paused') {
            startBtn.style.display = 'block';
            startBtn.textContent   = '▶ Resume';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (note) note.style.display = 'block';
        } else {
            startBtn.style.display = 'block';
            startBtn.textContent   = '▶ Start';
            if (pauseBtn) pauseBtn.style.display = 'none';
            if (note) note.style.display = 'none';
        }
    }

    function wfStart() {
        if (_wfActive && !_wfPaused) return;
        if (_wfPaused) {
            _wfPaused = false;
            _wfTimerInterval = setInterval(wfTick, 1000);
            wfSetButtons('running');
            return;
        }
        const durEl = document.getElementById('writingFocusDuration');
        const mins  = parseInt(durEl ? durEl.value : 25, 10);
        if (isNaN(mins) || mins < 1 || mins > 180) {
            showWritingNotification('⚠️ Please enter a valid duration (1–180 minutes)');
            return;
        }
        _wfActive    = true;
        _wfPaused    = false;
        _wfRemaining = mins * 60;
        _wfTotal     = mins * 60;
        wfUpdateDisplay();
        _wfTimerInterval = setInterval(wfTick, 1000);
        wfSetButtons('running');
        showWritingNotification(`⏱️ Writing timer started — ${mins} min!`);
    }

    function wfPause() {
        if (!_wfActive || _wfPaused) return;
        clearInterval(_wfTimerInterval);
        _wfPaused = true;
        wfSetButtons('paused');
        showWritingNotification('⏸ Writing timer paused');
    }

    function wfStop(completed) {
        clearInterval(_wfTimerInterval);
        _wfTimerInterval = null;
        const minutesSpent = Math.round((_wfTotal - _wfRemaining) / 60);
        _wfActive = false;
        _wfPaused = false;
        _wfRemaining = 0;
        const durEl = document.getElementById('writingFocusDuration');
        const mins  = parseInt(durEl ? durEl.value : 25, 10) || 25;
        const display = document.getElementById('writingFocusTimerDisplay');
        if (display) {
            display.textContent = `${String(mins).padStart(2, '0')}:00`;
            display.style.color = 'var(--text-primary)';
        }
        wfSetButtons('idle');
        if (minutesSpent > 0) {
            const minInput = document.getElementById('writingMinutesInput');
            if (minInput && !minInput.value) minInput.value = minutesSpent;
            showWritingNotification(completed
                ? `🎉 Focus session complete! ${minutesSpent} min — now enter your word count!`
                : `⏹ Timer stopped. ${minutesSpent} min auto-filled.`);
        }
    }

    function wfTick() {
        if (_wfRemaining <= 0) { wfStop(true); return; }
        _wfRemaining--;
        wfUpdateDisplay();
    }

    window.writingTimerAction = function (action) {
        if (action === 'start') wfStart();
        if (action === 'pause') wfPause();
        if (action === 'stop')  wfStop(false);
    };

    function bindDurationInput() {
        const durEl = document.getElementById('writingFocusDuration');
        if (!durEl) return;
        durEl.addEventListener('change', function () {
            if (!_wfActive) {
                const mins = parseInt(this.value, 10) || 25;
                const display = document.getElementById('writingFocusTimerDisplay');
                if (display) display.textContent = `${String(mins).padStart(2, '0')}:00`;
            }
        });
    }

    // ── Monster dialogue ─────────────────────────────────────
    function triggerWritingDialogue(words, data) {
        const jerryLevel = window.gameState ? window.gameState.jerryLevel : 0;
        if (jerryLevel < 5) return;

        const streak = calcStreak(data.sessions);
        const pool = [
            '📖 You are literally writing a whole book. That is incredible!',
            '✨ Every word you write is a step closer to finishing your novel!',
            '🔥 Your story deserves to exist in the world. Keep going!',
            '💪 Writers who show up every day are the ones who finish. That\'s you!',
            '🌟 One day someone will read your book and it will change their life!',
            '📚 Another session in the books! (Literally.) Your future readers thank you!',
            '🚀 You are building something amazing, one word at a time!',
            '🎯 Consistency beats inspiration. You just proved that!',
            '✍️ The first draft doesn\'t have to be perfect — it just has to exist!',
            '💡 Every great author started exactly where you are right now!'
        ];

        if (words >= 1000) pool.push(
            `🔥 Over 1,000 words in one session?! You are an absolute machine!`,
            `⚡ ${words.toLocaleString()} words! That is a serious writing session!`
        );
        if (words >= 500) pool.push(
            `💪 ${words.toLocaleString()} words today — that is a solid session!`
        );
        if (streak >= 7) pool.push(
            `🏆 ${streak} days in a row! You are on a legendary streak!`
        );
        if (streak >= 3) pool.push(
            `🔥 ${streak}-day streak! The momentum is real — don\'t stop now!`
        );

        let msg;
        const lastMsg = window._lastWritingDialogue;
        do {
            msg = pool[Math.floor(Math.random() * pool.length)];
        } while (msg === lastMsg && pool.length > 1);
        window._lastWritingDialogue = msg;

        if (typeof showTooltip === 'function') showTooltip(msg);
    }

    // ── Hook into switchToTab ────────────────────────────────
    document.addEventListener('writingTabOpened', function () {
        setTimeout(refreshUI, 80);
    }, true);

    const _origSwitchToTab = window.switchToTab;
    if (typeof _origSwitchToTab === 'function') {
        window.switchToTab = function (tabName) {
            _origSwitchToTab.call(this, tabName);
            if (tabName === 'writing') setTimeout(refreshUI, 80);
        };
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        refreshUI();
        bindDurationInput();
        console.log('[WritingTracker] v3.0 initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }

})();
