const API_URL = "https://script.google.com/macros/s/AKfycbxIhrKPAHbn3c0qoW2k4OOToFu_u0VCbRbf9sVApDvbIYMvjdfJhyOGAyCDkpACQBZA0w/exec";

let currentAdminPassword = "";

async function api(action, data = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action, data })
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "처리 중 오류가 발생했습니다.");
  }

  return json.data;
}

function setLoading(id, text) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.dataset.original = btn.textContent;
  btn.textContent = text;
  btn.classList.add("loading");
  btn.disabled = true;
}

function clearLoading(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.textContent = btn.dataset.original || "확인";
  btn.classList.remove("loading");
  btn.disabled = false;
}

function goAdmin() {
  window.location.href = "./admin.html?v=4";
}

function goHome() {
  window.location.href = "./index.html?v=4";
}

function showTab(id, btn) {
  document.querySelectorAll(".card").forEach(el => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".tab").forEach(el => el.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function autoUsedDays() {
  const type = document.getElementById("leaveType").value;
  const used = document.getElementById("usedDays");

  if (type === "오전 반차" || type === "오후 반차") {
    used.value = "0.5";
  } else if ((type === "연차" || type === "월차") && !used.value) {
    used.value = "1";
  }
}

async function submitLeave() {
  setLoading("submitBtn", "신청 중...");
  autoUsedDays();

  try {
    const data = {
      name: applyName.value.trim(),
      phone: applyPhone.value.trim(),
      type: leaveType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      usedDays: usedDays.value,
      reason: reason.value.trim()
    };

    const msg = await api("submitLeave", data);
    alert(msg || "신청 완료");

    leaveType.value = "";
    startDate.value = "";
    endDate.value = "";
    usedDays.value = "";
    reason.value = "";
  } catch (e) {
    alert(e.message);
  } finally {
    clearLoading("submitBtn");
  }
}

async function registerEmployee() {
  setLoading("regBtn", "등록 중...");

  try {
    const data = {
      name: regName.value.trim(),
      phone: regPhone.value.trim(),
      joinDate: joinDate.value,
      baseLeave: baseLeave.value
    };

    const msg = await api("registerEmployee", data);
    alert(msg || "등록 완료");

    regName.value = "";
    regPhone.value = "";
    joinDate.value = "";
    baseLeave.value = "15";
  } catch (e) {
    alert(e.message);
  } finally {
    clearLoading("regBtn");
  }
}

async function loadMyHistory() {
  setLoading("historyBtn", "조회 중...");

  try {
    const list = await api("getMyHistory", {
      name: historyName.value.trim(),
      phone: historyPhone.value.trim()
    });

    historyResult.innerHTML = "";

    if (!list.length) {
      historyResult.innerHTML = "<div class='item'>조회된 내역이 없습니다.</div>";
      return;
    }

    list.forEach(item => {
      historyResult.innerHTML += `
        <div class="item">
          <div><strong>${item.type}</strong> <span class="badge">${item.status}</span></div>
          <div>기간: ${item.startDate} ~ ${item.endDate}</div>
          <div>사용일수: ${item.usedDays}</div>
          <div>사유: ${item.reason || "-"}</div>
          <div>신청일: ${item.applyDate}</div>
        </div>
      `;
    });
  } catch (e) {
    alert(e.message);
  } finally {
    clearLoading("historyBtn");
  }
}

async function checkBalance() {
  setLoading("balanceBtn", "확인 중...");

  try {
    const item = await api("getMyBalance", {
      name: balanceName.value.trim(),
      phone: balancePhone.value.trim()
    });

    balanceResult.innerHTML = `
      <div class="balance-box">
        <div><strong>${item.name}</strong></div>
        <div>입사일: ${item.joinDate}</div>
        <div>기본연차: ${item.baseLeave}일</div>
        <div>사용연차: ${item.usedLeave}일</div>
        <div><strong>잔여연차: ${item.remainLeave}일</strong></div>
      </div>
    `;
  } catch (e) {
    alert(e.message);
  } finally {
    clearLoading("balanceBtn");
  }
}

async function loadAdminList() {
  setLoading("adminBtn", "조회 중...");

  try {
    currentAdminPassword = adminPw.value;

    const list = await api("getAdminList", {
      password: currentAdminPassword
    });

    adminResult.innerHTML = "";

    if (!list.length) {
      adminResult.innerHTML = "<div class='item'>신청 내역이 없습니다.</div>";
      return;
    }

    list.forEach(item => {
      const cls = item.status === "승인" ? "ok" : item.status === "반려" ? "no" : "";

      adminResult.innerHTML += `
        <div class="item">
          <div><strong>${item.name}</strong> / ${item.phone}</div>
          <div>${item.type} <span class="badge ${cls}">${item.status}</span></div>
          <div>기간: ${item.startDate} ~ ${item.endDate}</div>
          <div>사용일수: ${item.usedDays}</div>
          <div>사유: ${item.reason || "-"}</div>
          <div>신청일: ${item.applyDate}</div>
          <div>처리일: ${item.processedAt || "-"}</div>
          <div class="admin-buttons">
            <button class="approve" onclick="changeStatus(${item.rowNumber}, '승인')">승인</button>
            <button class="reject" onclick="changeStatus(${item.rowNumber}, '반려')">반려</button>
          </div>
        </div>
      `;
    });
  } catch (e) {
    alert(e.message);
  } finally {
    clearLoading("adminBtn");
  }
}

async function changeStatus(rowNumber, status) {
  try {
    const msg = await api("updateLeaveStatus", {
      rowNumber,
      status,
      password: currentAdminPassword
    });

    alert(msg || "처리되었습니다.");
    loadAdminList();
  } catch (e) {
    alert(e.message);
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js?v=4");
}