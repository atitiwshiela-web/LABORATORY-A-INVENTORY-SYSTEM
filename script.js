let inactivityTimer;

window.onload = () => {
    checkAuth();
    initSessionTimer();
    if (document.getElementById('pcGrid')) initInventory();
    if (document.getElementById('historyBody')) loadHistory();
    if (document.getElementById('signupForm')) initSignupLogic();
    if (document.getElementById('loginForm')) initLoginLogic();
};

const checkAuth = () => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const path = window.location.pathname;
    if (!isLoggedIn && !path.includes('index.html') && !path.includes('signup.html')) {
        window.location.href = 'index.html';
    }
};

const initInventory = () => {
    const grid = document.getElementById('pcGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for(let i=1; i<=24; i++){
        const stationId = i < 10 ? '0'+i : i;
        grid.innerHTML += `
            <div class="pc-card" id="card-${i}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <span class="text-cyan" style="font-weight:bold;">STATION ${stationId}</span>
                    <i class="fa-solid fa-desktop"></i>
                </div>
                <div style="font-size:0.85rem; display:flex; flex-direction:column; gap:8px;">
                     <label><input type="checkbox" class="monitor" checked onchange="updateStatusSummary()"> Monitor</label>
                    <label><input type="checkbox" class="mouse" checked onchange="updateStatusSummary()"> Mouse</label>
                    <label><input type="checkbox" class="kbd" checked onchange="updateStatusSummary()"> Keyboard</label>
                    <label><input type="checkbox" class="sys" checked onchange="updateStatusSummary()"> System Unit</label>
                </div>
                <input type="text" class="pc-note" placeholder="Add note..." style="width:100%; font-size:0.7rem; margin-top:1rem; padding:5px;">
            </div>`;
    }
    updateStatusSummary();
};

const updateStatusSummary = () => {
    let issueTotal = 0;
    const cards = document.querySelectorAll('.pc-card');
    cards.forEach(card => {
        const checks = card.querySelectorAll('input[type="checkbox"]');
        const hasError = Array.from(checks).some(c => !c.checked);
        if (hasError) {
            issueTotal++;
            card.classList.add('warning');
        } else {
            card.classList.remove('warning');
        }
    });
    const issueDisplay = document.getElementById('issueCount');
    if (issueDisplay) issueDisplay.innerText = issueTotal;
};

const saveInventory = () => {
    const dateInput = document.getElementById('setupDate').value;
    const records = JSON.parse(localStorage.getItem('labHistory') || '[]');
    
    document.querySelectorAll('.pc-card').forEach((card, index) => {
        records.push({
            id: Date.now() + index,
            date: dateInput.toUpperCase(),
            pc: `STATION ${index + 1}`,
            monitor: card.querySelector('.monitor').checked ? '✔' : '✖',
            mouse: card.querySelector('.mouse').checked ? '✔' : '✖',
            keyboard: card.querySelector('.kbd').checked ? '✔' : '✖',
            unit: card.querySelector('.sys').checked ? '✔' : '✖',
            note: card.querySelector('.pc-note').value || "N/A"
        });
    });
    
    localStorage.setItem('labHistory', JSON.stringify(records));
    alert('SYSTEM LOGS UPDATED');
    window.location.href = 'history.html';
};

const clearAllHistory = () => {
    if (confirm("WARNING: PERMANENTLY ERASE ALL ARCHIVED LOGS?")) {
        localStorage.removeItem('labHistory');
        loadHistory();
    }
};

const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem('labHistory') || '[]');
    renderTable(data);
};

const renderTable = (data) => {
    const body = document.getElementById('historyBody');
    if (!body) return;
    
    if (data.length === 0) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px; color:#444;">DATABASE EMPTY</td></tr>`;
        return;
    }

    body.innerHTML = data.map(r => `
        <tr style="border-bottom: 1px solid #1a1d23; font-size: 0.85rem;">
            <td style="padding: 15px; color: #000000;">${r.date}</td>
            <td style="color: #8f6000; font-weight: bold;">${r.pc}</td>
             <td style="text-align: center;">${r.monitor === '✔' ? '✔' : '<span style="color:#ff0055">✖</span>'}</td>
            <td style="text-align: center;">${r.mouse === '✔' ? '✔' : '<span style="color:#ff0055">✖</span>'}</td>
            <td style="text-align: center;">${r.keyboard === '✔' ? '✔' : '<span style="color:#ff0055">✖</span>'}</td>
            <td style="text-align: center;">${r.unit === '✔' ? '✔' : '<span style="color:#ff0055">✖</span>'}</td>
            <td style="color: #888; font-size: 0.75rem; max-width: auto;">${r.note || "N/A"}</td>
            <td>
                <button class="action-btn btn-danger" 
                        style="padding: 2px 10px; font-size: 0.7rem; border-color: #000000; color: #53ab00;" 
                        onclick="deleteHistory(${r.id})">
                    DEL
                </button>
            </td>
        </tr>`).join('');
};

const filterHistory = () => {
    const query = document.getElementById('historySearch').value.toUpperCase();
    const records = JSON.parse(localStorage.getItem('labHistory') || '[]');
    renderTable(records.filter(r => r.date.includes(query) || r.pc.includes(query)));
};

const deleteHistory = (id) => {
    let records = JSON.parse(localStorage.getItem('labHistory') || '[]');
    localStorage.setItem('labHistory', JSON.stringify(records.filter(r => r.id !== id)));
    loadHistory();
};

const manualLogout = () => {
    if(confirm("TERMINATE SESSION AND LOGOUT?")) {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }
};

const initSignupLogic = () => {
    document.getElementById('signupForm').onsubmit = (e) => {
        e.preventDefault();
        const user = document.getElementById('user').value;
        const pass = document.getElementById('pass').value;
        const confirmPass = document.getElementById('confirmPass').value;
        
        if (pass !== confirmPass) return alert("PASSWORDS DO NOT MATCH");
        
        localStorage.setItem('sysUser', JSON.stringify({ user, pass }));
        alert("REGISTRATION SUCCESSFUL");
        window.location.href = 'index.html';
    };
};

const initLoginLogic = () => {
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        const stored = JSON.parse(localStorage.getItem('sysUser'));
        const inputUser = document.getElementById('loginUser').value;
        const inputPass = document.getElementById('loginPass').value;
        
        if (stored && inputUser === stored.user && inputPass === stored.pass) {
            sessionStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            alert("ACCESS DENIED: INVALID CREDENTIALS");
        }
    };
};


const initSessionTimer = () => {
    if (!window.location.pathname.includes('index.html')) {
        window.onmousemove = resetTimer;
        window.onkeypress = resetTimer;
        resetTimer();
    }
};

const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'index.html';
    }, 600000);
};