
function normalizeSpace(str) {
  return str == null ? '' : String(str).replace(/\s+/g, ' ').trim();
}

function parseDate(dStr) {
  if (!dStr) return null;
  if (dStr instanceof Date) return dStr;
  const s = String(dStr).replace(/,/g, '');
  const serialNum = parseFloat(s);
  if (!isNaN(serialNum) && serialNum > 1000 && serialNum < 100000) {
    const excelEpoch = new Date(1899, 11, 30);
    const days = Math.floor(serialNum);
    const fracDay = serialNum - days;
    const ms = excelEpoch.getTime() + days * 86400000 + Math.round(fracDay * 86400000);
    return new Date(ms);
  }
  let d = Date.parse(s);
  if (!isNaN(d)) return new Date(d);
  const p = s.split(/[\/\s:]+/);
  if (p.length >= 3) {
    let day = parseInt(p[0]), month = parseInt(p[1]), year = parseInt(p[2]);
    if (year < 1000) year += 2000;
    if (month > 12) [day, month] = [month, day];
    return new Date(year, month - 1, day);
  }
  return new Date(dStr);
}

function formatDate(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return '-';
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const mm = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}


function initIndexPage() {
    window.addEventListener('scroll', () => {
        const section = document.getElementById('mainSection');
        if (window.scrollY > window.innerHeight * 0.2) {
            section.classList.add('is-scrolled');
        } else {
            section.classList.remove('is-scrolled');
        }
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const startTime = performance.now();
            function animate(time) {
                const p = Math.min((time - startTime) / 200, 1);
                window.scrollTo(0, scrollHeight * (p * (2 - p)));
                if (p < 1) requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }, 800);
    });
}


function initLoginPage() {
    const SHEET_ID = '19aDh5DCRpV0FJzxa7Yw6teAhnRwHOCP-zS3g8-YA_sg';
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxwVV9yK9Kb4z2ayGbhW4k_UXtkcdhMTClxlyloBCTQJHn5mgV7hkkPY1brrbjDgz_V/exec';

    let pendingData = null;

    function showSwal(icon, title, text) {
        const isChoice = title.includes("TIDAK DITEMUKAN") || title.includes("AKUN SUDAH ADA");

        let variant, emoji;
        if (icon === 'error') {
            variant = 'destructive'; emoji = '⛔';
        } else if (icon === 'warning') {
            variant = 'warning'; emoji = '⚠️';
        } else if (icon === 'success') {
            variant = 'success'; emoji = '✅';
        } else {
            variant = 'default'; emoji = 'ℹ️';
        }

        return new Promise((resolve) => {
            const box = document.getElementById('neoAlertBox');
            const overlay = document.getElementById('neoAlertOverlay');
            const iconEl = document.getElementById('neoAlertIcon');
            const btns = document.getElementById('neoAlertBtns');

            document.getElementById('neoAlertTitle').innerText = title;
            document.getElementById('neoAlertText').innerText = text;
            iconEl.innerHTML = emoji;

            box.className = `neo-alert ${isChoice ? 'choice' : 'notif'} ${variant}`;
            btns.style.display = isChoice ? 'flex' : 'none';
            overlay.style.display = isChoice ? 'flex' : 'none';
            box.style.display = 'flex';

            document.getElementById('neoBtnOk').onclick = () => {
                box.style.display = 'none';
                overlay.style.display = 'none';
                resolve({ isConfirmed: true });
            };

            document.getElementById('neoBtnCancel').onclick = () => {
                box.style.display = 'none';
                overlay.style.display = 'none';
                resolve({ isConfirmed: false });
            };

            if (!isChoice) {
                setTimeout(() => { box.style.display = 'none'; }, 3500);
            }
        });
    }

    window.toggleForm = function(type) {
        const login = document.getElementById('loginBox');
        const reg = document.getElementById('registerBox');
        const otp = document.getElementById('otpBox');
        const sub = document.getElementById('mainSub');
        const tabLogin = document.getElementById('tabLogin');
        const tabRegister = document.getElementById('tabRegister');
        const tabsList = document.getElementById('tabsList');

        login.classList.add('hidden');
        reg.classList.add('hidden');
        otp.classList.add('hidden');
        
        if(tabLogin) tabLogin.classList.remove('active');
        if(tabRegister) tabRegister.classList.remove('active');
        if(tabsList) tabsList.classList.remove('hidden');

        if (type === 'login') {
            login.classList.remove('hidden');
            if(tabLogin) tabLogin.classList.add('active');
            sub.innerText = "Silakan masuk ke akun Anda";
        } else if (type === 'reg' || type === 'register') {
            reg.classList.remove('hidden');
            if(tabRegister) tabRegister.classList.add('active');
            sub.innerText = "Silakan buat akun baru";
        } else if (type === 'otp') {
            otp.classList.remove('hidden');
            if(tabsList) tabsList.classList.add('hidden');
        }
    };

    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) {
                e.target.value = e.target.value.slice(0, 1);
            }
            if (e.target.value !== '' && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            checkAutoSubmit();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
            if (pastedData.length > 0) {
                otpInputs.forEach((inp, i) => {
                    if (pastedData[i]) inp.value = pastedData[i];
                });
                const focusIndex = Math.min(pastedData.length, 6) - 1;
                otpInputs[focusIndex].focus();
                checkAutoSubmit();
            }
        });
    });

    async function checkAutoSubmit() {
        const code = Array.from(otpInputs).map(inp => inp.value).join('');
        if (code.length === 6) {
            otpInputs.forEach(inp => inp.disabled = true);
            for (let i = 0; i < otpInputs.length; i++) {
                otpInputs[i].classList.add('otp-flip');
                await new Promise(r => setTimeout(r, 100));
            }
            await new Promise(r => setTimeout(r, 500)); 
            verifyOTPServer(code);
        }
    }

    async function verifyOTPServer(code) {
        try {
            const res = await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({
                    type: "VERIFY_AND_SAVE",
                    otpInput: code,
                    ...pendingData
                })
            });
            const result = await res.json();
            otpInputs.forEach(inp => inp.classList.remove('otp-flip'));

            if (result.success) {
                otpInputs.forEach(inp => inp.classList.add('otp-success'));
                setTimeout(() => {
                    Swal.fire({
                        title: "PENDAFTARAN BERHASIL!",
                        text: "Selamat Datang! Silakan Login.",
                        width: 600,
                        padding: "3em",
                        color: "#716add",
                        background: "#fff url(https://sweetalert2.github.io/images/trees.png)",
                        backdrop: `rgba(0,0,123,0.4) url("https://sweetalert2.github.io/images/nyan-cat.gif") left top no-repeat`,
                        showConfirmButton: false,
                        timer: 2500
                    }).then(() => location.reload());
                }, 500);
            } else {
                otpInputs.forEach(inp => {
                    inp.classList.add('otp-error');
                    inp.disabled = false;
                });
                setTimeout(() => {
                    otpInputs.forEach(inp => {
                        inp.classList.remove('otp-error');
                        inp.value = '';
                    });
                    otpInputs[0].focus();
                }, 500);
            }
        } catch (err) {
            showSwal('error', 'Gagal memverifikasi', 'Terjadi kesalahan sistem.');
            otpInputs.forEach(inp => {
                inp.disabled = false;
                inp.classList.remove('otp-flip');
            });
        }
    }

    window.cancelOTP = function() {
        document.getElementById('registerForm').reset();
        pendingData = null;
        document.getElementById('userStatusIcon').style.display = 'none';
        document.getElementById('userFeedback').style.display = 'none';
        otpInputs.forEach(inp => {
            inp.value = ''; inp.disabled = false;
            inp.classList.remove('otp-flip', 'otp-error', 'otp-success');
        });
        toggleForm('reg');
    };

    window.resendOTP = async function() {
        if (!pendingData) return;
        const linkBtn = document.querySelector('#otpBox .toggle-link');
        linkBtn.textContent = 'Mengirim ulang...';
        linkBtn.style.pointerEvents = 'none';
        try {
            await fetch(WEB_APP_URL, {
                method: 'POST',
                body: JSON.stringify({ type: "SIGN_UP_OTP", email: pendingData.email })
            });
            setTimeout(() => {
                showSwal('success', 'BERHASIL!', 'Kode baru terkirim!');
                linkBtn.textContent = 'Kirim Ulang';
                linkBtn.style.pointerEvents = 'auto';
            }, 1000);
        } catch (err) {
            showSwal('error', 'GAGAL!', 'Gagal mengirim ulang.');
            linkBtn.textContent = 'Kirim Ulang';
            linkBtn.style.pointerEvents = 'auto';
        }
    };

    document.getElementById('regUser').addEventListener('input', async function(e) {
        const user = e.target.value.trim();
        const icon = document.getElementById('userStatusIcon');
        const fb = document.getElementById('userFeedback');
        if (user.length < 3) {
            icon.style.display = 'none'; fb.style.display = 'none'; return;
        }
        try {
            const res = await fetch(WEB_APP_URL, {
                method: 'POST', body: JSON.stringify({ type: "CHECK_USER", username: user })
            });
            const result = await res.json();
            icon.style.display = 'block'; fb.style.display = 'block';
            if (result.userExists) {
                icon.innerText = '✖'; icon.className = 'status-icon text-danger-custom';
                fb.innerText = 'Username sudah ada!'; fb.className = 'small mt-1 text-danger-custom fw-bold';
            } else {
                icon.innerText = '✔'; icon.className = 'status-icon text-success-custom';
                fb.innerText = 'Username tersedia!'; fb.className = 'small mt-1 text-success-custom fw-bold';
            }
        } catch (err) {}
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnDaftar');
        const email = document.getElementById('regEmail').value;
        const user = document.getElementById('regUser').value;
        btn.disabled = true; btn.innerText = "Mengecek Data...";
        try {
            const checkRes = await fetch(WEB_APP_URL, {
                method: 'POST', body: JSON.stringify({ type: "CHECK_USER", email: email, username: user })
            });
            const check = await checkRes.json();
            if (check.emailExists) {
                const res = await showSwal('info', 'AKUN SUDAH ADA!', 'Email ini sudah terdaftar. Silakan login.');
                if (res.isConfirmed) toggleForm('login');
                btn.disabled = false; btn.innerText = "DAFTAR"; return;
            }
            if (check.userExists) {
                showSwal('error', 'GAGAL!', 'Username sudah dipakai!');
                btn.disabled = false; btn.innerText = "DAFTAR"; return;
            }
            pendingData = {
                nama: document.getElementById('regNama').value,
                email: email, username: user,
                password: document.getElementById('regPass').value
            };
            await fetch(WEB_APP_URL, {
                method: 'POST', body: JSON.stringify({ type: "SIGN_UP_OTP", email: email })
            });
            document.getElementById('otpEmailDisplay').innerText = email;
            toggleForm('otp');
            setTimeout(() => { otpInputs[0].focus(); }, 100);
        } catch (err) {
            showSwal('error', 'Gagal memproses data.', 'DATABASE ERROR.');
        } finally {
            btn.disabled = false; btn.innerText = "DAFTAR";
        }
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = document.getElementById('user').value.trim();
        const p = document.getElementById('pass').value.trim();
        const btn = document.getElementById('btnLogin');
        btn.disabled = true; btn.innerText = "Verifikasi...";
        try {
            const res = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=UserSiswa&headers=1`);
            const text = await res.text();
            const json = JSON.parse(text.substr(47).slice(0, -2));
            const rows = json.table.rows;
            const accFound = rows.find(r => r.c[0] && normalizeSpace(r.c[0].v) == normalizeSpace(u));
            if (!accFound) {
                const res = await showSwal('warning', 'AKUN TIDAK DITEMUKAN!', 'Username belum terdaftar.');
                if (res.isConfirmed) toggleForm('reg');
                btn.disabled = false; btn.innerText = "MASUK";
            } else {
                if (accFound.c[1] && normalizeSpace(accFound.c[1].v) == normalizeSpace(p)) {
                    localStorage.setItem('siswaLogin', normalizeSpace(u));
                    localStorage.setItem('namaLengkap', normalizeSpace(accFound.c[2].v));
                    window.location.href = 'dashboard-siswa.html';
                } else {
                    showSwal('error', 'AKSES DITOLAK!', 'Password yang Anda masukkan salah.');
                    btn.disabled = false; btn.innerText = "MASUK";
                }
            }
        } catch (err) {
            showSwal('error', 'DATABASE ERROR!', 'Gagal terhubung ke server.');
            btn.disabled = false; btn.innerText = "MASUK";
        }
    });
}


function initDashboardPage() {
    const SHEET_ID = '19aDh5DCRpV0FJzxa7Yw6teAhnRwHOCP-zS3g8-YA_sg';
    const user = localStorage.getItem('siswaLogin');
    const namaLengkap = localStorage.getItem('namaLengkap');

    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('namaSiswa').innerText = namaLengkap;
    document.getElementById('namaSiswaProfile').innerText = namaLengkap;
    muatDataTabel();

    window.switchTab = function(type) {
        const dataContent  = document.getElementById('dataContent');
        const statsContent = document.getElementById('statsContent');
        const tabData      = document.getElementById('tabData');
        const tabStats     = document.getElementById('tabStats');

        const isStats = type === 'stats';
        const current = isStats ? dataContent : statsContent;
        const next    = isStats ? statsContent : dataContent;

        tabData.classList.toggle('active', !isStats);
        tabStats.classList.toggle('active', isStats);

        current.style.display = 'none';

        next.style.opacity = '0';
        next.style.display = 'block';

        if (isStats) renderChart();

        setTimeout(() => {
            next.style.opacity = '';
            next.classList.remove('tab-animate');
            void next.offsetWidth;
            next.classList.add('tab-animate');
        }, 50);
    };

    async function muatDataTabel() {
        const stripAll = s => String(s).replace(/\s+/g, '').toLowerCase();
        const matchUser = stripAll(user);
        const matchName = stripAll(namaLengkap);
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Data%20Pelanggar&headers=1`;

        try {
            const res      = await fetch(url);
            const text     = await res.text();
            const jsonData = JSON.parse(text.substring(47).slice(0, -2));
            const allRows  = jsonData.table.rows || [];
            const rows     = allRows.filter(r => {
                if (!r.c[0] || !r.c[0].v) return false;
                const nama = stripAll(r.c[0].v);
                return nama.includes(matchUser) || nama.includes(matchName) || matchUser.includes(nama) || matchName.includes(nama);
            });

            document.getElementById('loadingMsg').style.display    = 'none';
            document.getElementById('summarySection').style.display = 'flex';
            document.getElementById('dataContent').style.display   = 'block';

            if (!rows || rows.length === 0) {
                document.getElementById('totalPelanggaran').innerText  = '0';
                document.getElementById('statusText').innerText        = 'SANGAT BAIK 🌟';
                document.getElementById('statusText').style.color      = '#16a34a';
                document.getElementById('dataContent').innerHTML       = `<div class="p-5 text-center fw-bold">Catatan bersih! Pertahankan prestasimu.</div>`;
            } else {
                document.getElementById('totalPelanggaran').innerText = rows.length;
                const counts = { Ringan: 0, Sedang: 0, Berat: 0 };

                const sT = document.getElementById('statusText');
                if (rows.length <= 2) { sT.innerText = 'PERLU PERHATIAN ⚠️'; sT.style.color = '#d97706'; }
                else                  { sT.innerText = 'BAHAYA (SP) 🚨';     sT.style.color = '#dc2626'; }

                const parsedRows = rows.map(row => {
                    const pTeks = row.c[3] ? row.c[3].v : 'Ringan';
                    const rawDate = row.c[4] ? (row.c[4].f || row.c[4].v) : null;
                    const dateObj = parseDate(rawDate);
                    const tglStr = (dateObj && !isNaN(dateObj.getTime())) ? formatDate(dateObj) : (rawDate || '-');
                    return {
                        hal: row.c[2] ? row.c[2].v : '-',
                        poin: pTeks,
                        status: (row.c[5] && row.c[5].v) ? row.c[5].v : 'Belum Ditangani',
                        tgl: tglStr,
                        date: dateObj,
                        timestamp: dateObj ? dateObj.getTime() : 0
                    };
                });

                parsedRows.sort((a, b) => b.timestamp - a.timestamp);

                let htmlTbody = '';
                parsedRows.forEach(r => {
                    counts[r.poin]++;
                    const warna = r.poin === 'Ringan' ? 'bg-ringan' : (r.poin === 'Sedang' ? 'bg-sedang' : 'bg-berat');
                    let statusClass = 'status-belum';
                    if (r.status.toLowerCase().includes('sedang')) statusClass = 'status-sedang';
                    else if (r.status.toLowerCase().includes('sudah')) statusClass = 'status-sudah';
                    htmlTbody += `
                        <tr>
                            <td>${r.hal}</td>
                            <td class="text-center"><span class="badge-custom ${warna}">${r.poin}</span></td>
                            <td class="text-center"><span class="badge-status ${statusClass}">${r.status}</span></td>
                            <td class="text-center text-muted">${r.tgl}</td>
                        </tr>`;
                });
                document.getElementById('tabelKonten').innerHTML = htmlTbody;
                window.statsData = counts;
            }
        } catch (err) { console.error(err); }
    }

    function renderChart() {
        const data   = window.statsData || { Ringan: 0, Sedang: 0, Berat: 0 };
        const COLORS = { Ringan: '#4ade80', Sedang: '#fbbf24', Berat: '#f87171' };
        const BORDER = '#000';

        const barCtx = document.getElementById('barChart').getContext('2d');
        if (window.barChartInstance) window.barChartInstance.destroy();
        window.barChartInstance = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Ringan', 'Sedang', 'Berat'],
                datasets: [{
                    label: 'Jumlah Kasus',
                    data: [data.Ringan, data.Sedang, data.Berat],
                    backgroundColor: [COLORS.Ringan, COLORS.Sedang, COLORS.Berat],
                    borderColor: BORDER,
                    borderWidth: 2,
                    borderRadius: 0,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: { label: ctx => ` ${ctx.parsed.y} kasus` },
                        backgroundColor: '#fff',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#000',
                        borderWidth: 2,
                        padding: 10,
                        titleFont: { weight: '900' },
                        bodyFont: { weight: '700' }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { color: '#000', width: 2 },
                        ticks: { color: '#000', font: { weight: '800', size: 13 } }
                    },
                    y: {
                        grid: { color: '#e5e7eb' },
                        border: { color: '#000', width: 2 },
                        ticks: { color: '#000', font: { weight: '700' }, stepSize: 1, precision: 0 },
                        beginAtZero: true
                    }
                }
            },
            animation: { duration: 700, easing: 'easeOutQuart' }
        });

        const donutCtx = document.getElementById('donutChart').getContext('2d');
        if (window.donutChartInstance) window.donutChartInstance.destroy();
        const total = data.Ringan + data.Sedang + data.Berat;
        window.donutChartInstance = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Ringan', 'Sedang', 'Berat'],
                datasets: [{
                    data: [data.Ringan, data.Sedang, data.Berat],
                    backgroundColor: [COLORS.Ringan, COLORS.Sedang, COLORS.Berat],
                    borderColor: BORDER,
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                cutout: '62%',
                animation: { animateRotate: true, animateScale: true, duration: 700, easing: 'easeOutQuart' },
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#000',
                            font: { weight: '800', size: 12, family: 'Lexend, sans-serif' },
                            padding: 14,
                            boxWidth: 14,
                            boxHeight: 14,
                            usePointStyle: false,
                        }
                    },
                    tooltip: {
                        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} kasus` },
                        backgroundColor: '#fff',
                        titleColor: '#000',
                        bodyColor: '#000',
                        borderColor: '#000',
                        borderWidth: 2,
                        padding: 10,
                        titleFont: { weight: '900' },
                        bodyFont: { weight: '700' }
                    }
                }
            },
            plugins: [{
                id: 'centerText',
                afterDraw(chart) {
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;
                    const cx = (chartArea.left + chartArea.right) / 2;
                    const cy = (chartArea.top + chartArea.bottom) / 2;
                    ctx.save();
                    ctx.font = 'bold 26px Lexend, sans-serif';
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(total, cx, cy - 9);
                    ctx.font = '700 10px Lexend, sans-serif';
                    ctx.fillStyle = '#6b7280';
                    ctx.fillText('TOTAL KASUS', cx, cy + 11);
                    ctx.restore();
                }
            }]
        });
        document.getElementById('donutTotal').innerText = total === 0 ? 'Catatan bersih! 🌟' : `${total} pelanggaran tercatat`;
    }

    window.logout = function() { localStorage.clear(); window.location.href = 'login.html'; };
}


document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    if (body.classList.contains('page-index')) {
        initIndexPage();
    } else if (body.classList.contains('page-login')) {
        initLoginPage();
    } else if (body.classList.contains('page-dashboard')) {
        initDashboardPage();
    }
});
