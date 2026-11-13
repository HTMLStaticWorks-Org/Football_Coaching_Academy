document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'fca_parent_dashboard_demo_v1';

    const defaultState = {
        parent: {
            name: 'Sarah Jenkins',
            email: 'sarah.jenkins@example.com',
            phone: '+1 (555) 234-5678',
            emergency: 'David Jenkins • +1 (555) 876-5432'
        },
        children: [
            {
                id: 'c1',
                name: 'Leo Jenkins',
                age: 8,
                ageGroup: 'U9 (Ages 7–9)',
                program: 'Junior Footballers',
                batch: 'Tue & Thu • 4:30 PM',
                status: 'Active'
            },
            {
                id: 'c2',
                name: 'Maya Jenkins',
                age: 11,
                ageGroup: 'U11 (Ages 10–12)',
                program: 'Youth Development',
                batch: 'Mon & Wed • 5:30 PM',
                status: 'Active'
            }
        ],
        enrollments: [
            { child: 'Leo Jenkins', program: 'Junior Footballers (Ages 7–9)', batch: 'Tue & Thu • 4:30 PM', status: 'Active' },
            { child: 'Maya Jenkins', program: 'Youth Development (Ages 10–12)', batch: 'Mon & Wed • 5:30 PM', status: 'Active' }
        ],
        attendanceHistory: [
            { date: 'Nov 12, 2026', player: 'Leo Jenkins', session: 'Ball Mastery & 1v1 Drills', status: 'Present' },
            { date: 'Nov 11, 2026', player: 'Maya Jenkins', session: 'Positional Passing & Shape', status: 'Present' },
            { date: 'Nov 10, 2026', player: 'Leo Jenkins', session: 'First Touch & Finishing', status: 'Present' },
            { date: 'Nov 09, 2026', player: 'Maya Jenkins', session: '9v9 Tactical Scrimmage', status: 'Present' },
            { date: 'Nov 07, 2026', player: 'Leo Jenkins', session: 'Weekend 7v7 Festival', status: 'Present' },
            { date: 'Nov 05, 2026', player: 'Leo Jenkins', session: 'Speed & Agility Ladder', status: 'Absent' },
            { date: 'Nov 04, 2026', player: 'Maya Jenkins', session: 'Defensive Pressing Triggers', status: 'Present' }
        ],
        matches: [
            { date: 'Sat, Nov 14', time: '09:30 AM', squad: 'U9 Junior Footballers', opponent: 'Metro Youth FC', venue: 'Academy Pitch 2', status: 'Confirmed' },
            { date: 'Sat, Nov 14', time: '11:15 AM', squad: 'U11 Youth Development', opponent: 'Riverside Rovers', venue: 'Main Stadium Pitch', status: 'Confirmed' },
            { date: 'Sun, Nov 22', time: '10:00 AM', squad: 'U11 Youth Development', opponent: 'City Strikers Academy', venue: 'Eastside Complex', status: 'Pending' },
            { date: 'Sat, Nov 07', time: '09:30 AM', squad: 'U9 Junior Footballers', opponent: 'Harbor Juniors', venue: 'Academy Pitch 1', status: 'Completed' }
        ],
        notifications: [
            { id: 'n1', title: 'Saturday Matchday Kit Reminder', desc: 'Arrive 30 minutes prior to kick-off with shin guards, boots, and academy jersey.', time: '2 hours ago', unread: true },
            { id: 'n2', title: 'Regional Youth Cup Fixtures Posted', desc: 'U9 and U11 weekend match schedules have been updated in Match Schedule.', time: 'Yesterday', unread: true },
            { id: 'n3', title: 'November Attendance Summary', desc: 'Combined family training attendance is currently 92% for November.', time: '3 days ago', unread: true }
        ]
    };

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('Could not read demo state from localStorage', e);
        }
        return JSON.parse(JSON.stringify(defaultState));
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Could not save demo state to localStorage', e);
        }
    }

    let state = loadState();

    // Tab Navigation
    const navLinks = document.querySelectorAll('.dashboard-nav a');
    const sections = document.querySelectorAll('.dashboard-section');

    window.switchDashboardTab = function (targetId) {
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        const matchingLink = document.querySelector(`.dashboard-nav a[href="#${targetId}"]`);
        if (matchingLink) matchingLink.classList.add('active');
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();
            const targetId = href.substring(1);
            window.switchDashboardTab(targetId);

            const sidebar = document.querySelector('.dashboard-sidebar');
            if (window.innerWidth <= 1024 && sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });

    window.quickEnrollProgram = function (programLabel) {
        window.switchDashboardTab('enrollments');
        const select = document.getElementById('enrollProgramSelect');
        if (select) {
            select.value = programLabel;
            select.focus();
        }
    };

    function statusClass(status) {
        const s = status.toLowerCase();
        if (s === 'active' || s === 'confirmed' || s === 'present') return 'status-confirmed';
        if (s === 'pending') return 'status-pending';
        if (s === 'absent') return 'status-absent';
        return 'status-completed';
    }

    function renderOverview() {
        document.getElementById('overviewParentName').textContent = state.parent.name;
        document.getElementById('kpiChildrenCount').textContent = state.children.length;

        const upcomingCount = state.matches.filter(m => m.status !== 'Completed').length;
        document.getElementById('kpiUpcomingMatches').textContent = upcomingCount;

        const uniquePrograms = new Set(state.children.map(c => c.program));
        document.getElementById('kpiActivePrograms').textContent = uniquePrograms.size;

        const nextMatchesContainer = document.getElementById('overviewMatchesList');
        const upcoming = state.matches.filter(m => m.status !== 'Completed').slice(0, 3);
        nextMatchesContainer.innerHTML = upcoming.map(m => `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; padding:14px; background:var(--secondary-bg); border-radius:12px; flex-wrap:wrap;">
                <div>
                    <div style="font-weight:700; font-size:14px; color:var(--text-primary);">${m.squad} vs ${m.opponent}</div>
                    <div style="font-size:12.5px; color:var(--text-secondary); margin-top:2px;">${m.date} &bull; ${m.time} &bull; ${m.venue}</div>
                </div>
                <span class="status-badge ${statusClass(m.status)}">${m.status}</span>
            </div>
        `).join('');
    }

    function renderChildren() {
        const container = document.getElementById('childrenCardsContainer');
        container.innerHTML = state.children.map(c => `
            <div class="card" style="padding: 26px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:16px;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <div style="width:52px; height:52px; border-radius:50%; background:#101D35; color:#C7F000; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:18px; flex-shrink:0;">
                            ${c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h3 style="margin:0 0 4px 0;">${c.name}</h3>
                            <span style="font-size:13px; color:var(--text-secondary);">Age ${c.age} &bull; ${c.ageGroup}</span>
                        </div>
                    </div>
                    <span class="status-badge ${statusClass(c.status)}">${c.status}</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; padding-top:14px; border-top:1px solid var(--border-color); font-size:13.5px;">
                    <div>
                        <div style="color:var(--text-secondary); font-size:12px;">Assigned Program</div>
                        <div style="font-weight:600; color:var(--text-primary); margin-top:2px;">${c.program}</div>
                    </div>
                    <div>
                        <div style="color:var(--text-secondary); font-size:12px;">Training Batch</div>
                        <div style="font-weight:600; color:var(--text-primary); margin-top:2px;">${c.batch}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function renderEnrollments() {
        const tbody = document.getElementById('enrollmentsTableBody');
        tbody.innerHTML = state.enrollments.map(e => `
            <tr>
                <td style="font-weight:600;">${e.child}</td>
                <td>${e.program}</td>
                <td>${e.batch}</td>
                <td><span class="status-badge ${statusClass(e.status)}">${e.status}</span></td>
            </tr>
        `).join('');
    }

    function renderAttendance() {
        const filterVal = document.getElementById('attChildFilter').value;
        const filtered = filterVal === 'all'
            ? state.attendanceHistory
            : state.attendanceHistory.filter(a => a.player === filterVal);

        const presentCount = filtered.filter(a => a.status === 'Present').length;
        const absentCount = filtered.filter(a => a.status === 'Absent').length;
        const total = presentCount + absentCount;
        const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;

        document.getElementById('attPresentCount').textContent = `${presentCount} Days`;
        document.getElementById('attAbsentCount').textContent = `${absentCount} ${absentCount === 1 ? 'Day' : 'Days'}`;
        document.getElementById('attRateValue').textContent = `${pct}%`;
        document.getElementById('kpiAttendancePct').textContent = `${pct}%`;

        const tbody = document.getElementById('attendanceHistoryBody');
        tbody.innerHTML = filtered.map(a => `
            <tr>
                <td style="white-space:nowrap;">${a.date}</td>
                <td style="font-weight:600;">${a.player}</td>
                <td>${a.session}</td>
                <td><span class="status-badge ${statusClass(a.status)}">${a.status}</span></td>
            </tr>
        `).join('');

        // Render November 2026 Calendar
        const calGrid = document.getElementById('attendanceCalendarGrid');
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayMap = {
            2: 'present', 4: 'present', 5: 'absent', 7: 'present',
            9: 'present', 10: 'present', 11: 'present', 12: 'present',
            14: 'upcoming', 16: 'upcoming', 18: 'upcoming', 21: 'upcoming', 25: 'upcoming', 28: 'upcoming'
        };

        let html = weekdays.map(d => `<div class="att-cal-header">${d}</div>`).join('');
        // Nov 1, 2026 is Sunday (0 offset)
        for (let day = 1; day <= 30; day++) {
            const cls = dayMap[day] || '';
            const dotColor = cls === 'present' ? '#18864B' : cls === 'absent' ? '#DC2626' : cls === 'upcoming' ? '#101D35' : 'transparent';
            html += `
                <div class="att-cal-day ${cls}">
                    <span>${day}</span>
                    <span class="att-cal-dot" style="background:${dotColor};"></span>
                </div>
            `;
        }
        calGrid.innerHTML = html;
    }

    function renderMatches() {
        const search = document.getElementById('matchSearchInput').value.trim().toLowerCase();
        const statusFilter = document.getElementById('matchStatusFilter').value;

        const filtered = state.matches.filter(m => {
            const matchesSearch = !search ||
                m.opponent.toLowerCase().includes(search) ||
                m.venue.toLowerCase().includes(search) ||
                m.squad.toLowerCase().includes(search);
            const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        const tbody = document.getElementById('matchScheduleBody');
        const emptyBox = document.getElementById('matchEmptyState');

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            emptyBox.style.display = 'block';
            return;
        }
        emptyBox.style.display = 'none';
        tbody.innerHTML = filtered.map(m => `
            <tr>
                <td style="font-weight:600; white-space:nowrap;">${m.date}</td>
                <td style="white-space:nowrap;">${m.time}</td>
                <td>${m.squad}</td>
                <td style="font-weight:600;">${m.opponent}</td>
                <td>${m.venue}</td>
                <td><span class="status-badge ${statusClass(m.status)}">${m.status}</span></td>
            </tr>
        `).join('');
    }

    function renderNotifications() {
        const list = document.getElementById('notificationsList');
        const unreadCount = state.notifications.filter(n => n.unread).length;
        const badge = document.getElementById('notifBadgeCount');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }

        list.innerHTML = state.notifications.map(n => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; padding:16px; border-radius:12px; background:${n.unread ? 'rgba(199,240,0,0.12)' : 'var(--secondary-bg)'}; border:1px solid ${n.unread ? 'rgba(199,240,0,0.45)' : 'var(--border-color)'};">
                <div>
                    <div style="font-weight:700; font-size:14.5px; color:var(--text-primary);">
                        ${n.unread ? '<span style="display:inline-block; width:8px; height:8px; background:#1759C7; border-radius:50%; margin-right:8px;"></span>' : ''}
                        ${n.title}
                    </div>
                    <p style="margin:4px 0 0; font-size:13.5px; color:var(--text-secondary);">${n.desc}</p>
                </div>
                <span style="font-size:12px; color:var(--text-secondary); white-space:nowrap;">${n.time}</span>
            </div>
        `).join('');
    }

    function populateProfileForm() {
        document.getElementById('profileName').value = state.parent.name;
        document.getElementById('profileEmail').value = state.parent.email;
        document.getElementById('profilePhone').value = state.parent.phone;
        document.getElementById('profileEmergency').value = state.parent.emergency;
    }

    // Event Listeners
    document.getElementById('attChildFilter').addEventListener('change', renderAttendance);
    document.getElementById('matchSearchInput').addEventListener('input', renderMatches);
    document.getElementById('matchStatusFilter').addEventListener('change', renderMatches);

    document.getElementById('enrollmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const childName = document.getElementById('enrollChildName').value.trim();
        const childAge = parseInt(document.getElementById('enrollChildAge').value, 10);
        const program = document.getElementById('enrollProgramSelect').value;
        const batch = document.getElementById('enrollBatchSelect').value;

        if (!childName || isNaN(childAge)) return;

        state.enrollments.unshift({
            child: childName,
            program: program,
            batch: batch,
            status: 'Pending'
        });

        state.children.push({
            id: 'c' + Date.now(),
            name: childName,
            age: childAge,
            ageGroup: `Age ${childAge}`,
            program: program.split(' (')[0],
            batch: batch,
            status: 'Pending'
        });

        saveState();
        renderOverview();
        renderChildren();
        renderEnrollments();

        const fb = document.getElementById('enrollFeedback');
        fb.textContent = `Enrollment request submitted for ${childName} in ${program} (demo preview).`;
        fb.style.display = 'block';
        e.target.reset();
    });

    document.getElementById('markAllReadBtn').addEventListener('click', () => {
        state.notifications.forEach(n => n.unread = false);
        saveState();
        renderNotifications();
    });

    document.getElementById('profileSettingsForm').addEventListener('submit', (e) => {
        e.preventDefault();
        state.parent.name = document.getElementById('profileName').value.trim();
        state.parent.email = document.getElementById('profileEmail').value.trim();
        state.parent.phone = document.getElementById('profilePhone').value.trim();
        state.parent.emergency = document.getElementById('profileEmergency').value.trim();
        saveState();
        renderOverview();
        document.getElementById('profileSaveFeedback').style.display = 'block';
    });

    document.getElementById('resetDemoBtn').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        state = loadState();
        renderAll();
    });

    function renderAll() {
        renderOverview();
        renderChildren();
        renderEnrollments();
        renderAttendance();
        renderMatches();
        renderNotifications();
        populateProfileForm();
    }

    renderAll();
});
