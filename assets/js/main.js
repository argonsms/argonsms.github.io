const API_URL = "https://api.argonsms.com/admin/api";
const PRICE_PER_SMS = 15;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

async function login() {
  let id = document.getElementById("id").value;
  let pw = document.getElementById("pw").value;
  if (!id) {
    return alert("아이디를 입력해주세요.");
  } else if (!pw) {
    return alert("비밀번호를 입력해주세요.");
  }
  document.getElementById("id").disabled = true;
  document.getElementById("pw").disabled = true;
  document.getElementById("login_button").disabled = true;
  try {
    let resp = await fetch(API_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        pw: pw,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      setCookie("userId", id, 999);
      location.href = "./superadmin.html";
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
  document.getElementById("id").disabled = false;
  document.getElementById("pw").disabled = false;
  document.getElementById("login_button").disabled = false;
}

async function superadmin() {
  try {
    let resp = await fetch(API_URL + "/superadmin", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      document.getElementById("total-sms-count").innerText =
        json.totalSMSCount + " 개";
      document.getElementById("total-user-count").innerText =
        json.totalUserCount + " 명";
      document.getElementById("api-count").innerText = json.apiCount + " 개";
      document.getElementById("uptime").innerText = json.uptime + " %";
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function acceptCharge(id, name, amount) {
  try {
    let resp = await fetch(API_URL + "/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        name: name,
        amount: amount,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      alert("수락되었습니다.");
      managecharge();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function rejectCharge(id, name, amount) {
  try {
    let resp = await fetch(API_URL + "/charge", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        name: name,
        amount: amount,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      alert("거절되었습니다.");
      managecharge();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function managecharge() {
  try {
    let resp = await fetch(API_URL + "/charge", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      json = json.detail;
      let tbody = document.createElement("tbody");
      for (let i = 0; i < json.length; i++) {
        let tr = document.createElement("tr");
        let id = document.createElement("th");
        id.innerText = json[i].id;
        tr.appendChild(id);
        let name = document.createElement("th");
        name.innerText = json[i].name;
        tr.appendChild(name);
        let amount = document.createElement("th");
        amount.innerText = json[i].amount;
        tr.appendChild(amount);
        let accept = document.createElement("th");
        let acceptBtn = document.createElement("button");
        acceptBtn.className = "btn btn-sm btn-primary";
        acceptBtn.innerText = "수락";
        acceptBtn.addEventListener("click", () => {
          acceptCharge(json[i].id, json[i].name, json[i].amount);
        });
        accept.appendChild(acceptBtn);
        tr.appendChild(accept);
        let reject = document.createElement("th");
        let rejectBtn = document.createElement("button");
        rejectBtn.className = "btn btn-sm btn-danger";
        rejectBtn.innerText = "거부";
        rejectBtn.addEventListener("click", () => {
          rejectCharge(json[i].id, json[i].name, json[i].amount);
        });
        reject.appendChild(rejectBtn);
        tr.appendChild(reject);
        tbody.appendChild(tr);
      }
      document.getElementById("chargeBody").remove();
      tbody.id = "chargeBody";
      document.getElementById("charge").appendChild(tbody);
      let table = $("#charge").DataTable();
      // table.order([0, "desc"]).draw();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function resetPW(id) {
  try {
    let resp = await fetch(API_URL + "/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      swal({
        icon: "success",
        title: "성공",
        text: "비밀번호가 초기화 되었습니다.\n변경된 비밀번호: " + json.pw,
      });
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

function HtmlEncode(s) {
  var el = document.createElement("div");
  el.innerText = el.textContent = s;
  s = el.innerHTML;
  return s;
}

async function editUser(id, cash) {
  let wrapper = document.createElement("div");
  wrapper.innerHTML =
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">아이디:</span><input id="userid" type="text" class="form-control form-control-sm float-right col-sm-9 text-gray-900" disabled value="' +
    HtmlEncode(id) +
    '"/><br/>';
  wrapper.innerHTML +=
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">잔액:</span><input id="cash" type="number" class="form-control form-control-sm float-right col-sm-9 text-gray-900" value="' +
    HtmlEncode(cash) +
    '"/><br/>';
  let isConfirm = await swal({
    html: true,
    title: "유저 수정",
    content: wrapper,
    buttons: ["취소", "확인"],
    closeOnCancel: true,
  });
  if (!isConfirm) return;
  id = document.getElementById("userid").value;
  cash = document.getElementById("cash").value;
  try {
    let resp = await fetch(API_URL + "/user", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        cash: cash,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      swal({
        icon: "success",
        title: "성공",
        text: "성공적으로 유저가 수정되었습니다.",
      });
      manageuser();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function removeUser(id) {
  let isConfirm = await swal({
    title: "유저 삭제",
    text: id + " 유저를 삭제하시겠습니까?",
    buttons: ["취소", "확인"],
    closeOnCancel: true,
  });
  if (!isConfirm) return;
  try {
    let resp = await fetch(API_URL + "/user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      swal({
        icon: "success",
        title: "성공",
        text: "성공적으로 유저가 삭제되었습니다.",
      });
      manageuser();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function manageuser() {
  try {
    let resp = await fetch(API_URL + "/user", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      json = json.detail;
      let tbody = document.createElement("tbody");
      for (let i = 0; i < json.length; i++) {
        let tr = document.createElement("tr");
        let id = document.createElement("th");
        id.innerText = json[i].id;
        tr.appendChild(id);
        let pw = document.createElement("th");
        let pwBtn = document.createElement("button");
        pwBtn.className = "btn btn-sm btn-warning";
        pwBtn.innerText = "초기화";
        pwBtn.addEventListener("click", () => {
          resetPW(json[i].id);
        });
        pw.appendChild(pwBtn);
        tr.appendChild(pw);
        let cash = document.createElement("th");
        cash.innerText = json[i].cash;
        tr.appendChild(cash);
        let edit = document.createElement("th");
        let editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerText = "수정";
        editBtn.addEventListener("click", () => {
          editUser(json[i].id, json[i].cash);
        });
        edit.appendChild(editBtn);
        tr.appendChild(edit);
        let remove = document.createElement("th");
        let removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-sm btn-warning";
        removeBtn.innerText = "삭제";
        removeBtn.addEventListener("click", () => {
          removeUser(json[i].id);
        });
        remove.appendChild(removeBtn);
        tr.appendChild(remove);
        tbody.appendChild(tr);
      }
      document.getElementById("userBody").remove();
      tbody.id = "userBody";
      document.getElementById("user").appendChild(tbody);
      let table = $("#user").DataTable();
      // table.order([0, "desc"]).draw();
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function changePW() {
  let wrapper = document.createElement("div");
  wrapper.innerHTML =
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">기존 비밀번호:</span><input id="oldpw" type="password" class="form-control form-control-sm float-right col-sm-9 text-gray-900"/><br/>';
  wrapper.innerHTML +=
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">새 비밀번호:</span><input id="pw" type="password" class="form-control form-control-sm float-right col-sm-9 text-gray-900"/><br/>';
  wrapper.innerHTML +=
    '<span class="form-control-sm float-left col-sm-3 text-gray-900">비밀번호 확인:</span><input id="repw" type="password" class="form-control form-control-sm float-right col-sm-9 text-gray-900"/><br/>';
  let isConfirm = await swal({
    html: true,
    title: "비밀번호 변경",
    content: wrapper,
    buttons: ["취소", "확인"],
    closeOnCancel: true,
  });
  if (!isConfirm) return;
  let oldpw = document.getElementById("oldpw").value;
  let pw = document.getElementById("pw").value;
  let repw = document.getElementById("repw").value;
  try {
    let resp = await fetch(API_URL + "/changepw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldpw: oldpw,
        pw: pw,
        repw: repw,
      }),
      credentials: "include",
    });
    let json = await resp.json();
    if (json.success) {
      swal({
        icon: "success",
        title: "성공",
        text: "성공적으로 변경되었습니다.",
      });
    } else {
      alert(json.detail);
    }
  } catch (err) {
    alert("서버 오류입니다. 잠시후에 시도해주세요.");
  }
}

async function logout() {
  try {
    await fetch(API_URL + "/logout", {
      method: "GET",
      credentials: "include",
    });
  } finally {
    location.href = "./login.html";
  }
}

async function ping() {
  try {
    let resp = await fetch(API_URL + "/ping", {
      method: "GET",
      credentials: "include",
    });
    let json = await resp.json();
    if (!json.success) {
      location.href = "./login.html";
    }
  } catch (err) {}
}

window.onload = async () => {
  let pathname = new URL(location.href).pathname;
  if (pathname != "/login.html") {
    ping();
    setInterval(ping, 60000);
  }
  let userIdEl = document.getElementById("userId");
  if (userIdEl) {
    userIdEl.innerText = getCookie("userId");
  }
  switch (pathname) {
    case "/login.html":
      // alert("login");
      break;
    case "/superadmin.html":
      await superadmin();
      break;
    case "/managecharge.html":
      await managecharge();
      break;
    case "/manageuser.html":
      await manageuser();
      break;
    default:
      break;
  }
};
