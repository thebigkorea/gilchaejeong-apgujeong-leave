const API_URL="https://script.google.com/macros/s/AKfycbxIhrKPAHbn3c0qoW2k4OOToFu_u0VCbRbf9sVApDvbIYMvjdfJhyOGAyCDkpACQBZA0w/exec";

function goAdmin(){
location.href="./admin.html?v=1";
}

function goHome(){
location.href="./index.html?v=1";
}

function showTab(id,btn){

document.querySelectorAll(".card").forEach(el=>el.classList.add("hidden"));
document.getElementById(id).classList.remove("hidden");

document.querySelectorAll(".tab").forEach(el=>el.classList.remove("active"));
btn.classList.add("active");

}

function autoUsedDays(){

const type=document.getElementById("leaveType").value;
const used=document.getElementById("usedDays");

if(type==="오전 반차"||type==="오후 반차") used.value="0.5";
else if(type==="연차"||type==="월차") used.value="1";

}

async function api(action,data){

const res=await fetch(API_URL,{
method:"POST",
body:JSON.stringify({action,data})
});

const json=await res.json();

if(!json.success) throw new Error(json.message);

return json.data;

}

async function submitLeave(){

try{

await api("submitLeave",{

name:applyName.value,
phone:applyPhone.value,
type:leaveType.value,
startDate:startDate.value,
endDate:endDate.value,
usedDays:usedDays.value,
reason:reason.value

});

alert("신청 완료");

}catch(e){alert(e.message)}

}

async function registerEmployee(){

try{

await api("registerEmployee",{

name:regName.value,
phone:regPhone.value,
joinDate:joinDate.value,
baseLeave:baseLeave.value

});

alert("등록 완료");

}catch(e){alert(e.message)}

}

async function loadMyHistory(){

const list=await api("getMyHistory",{

name:historyName.value,
phone:historyPhone.value

});

historyResult.innerHTML=JSON.stringify(list,null,2);

}

async function checkBalance(){

const item=await api("getMyBalance",{

name:balanceName.value,
phone:balancePhone.value

});

balanceResult.innerHTML=`잔여연차: ${item.remainLeave}일`;

}

async function loadAdminList(){

const list=await api("getAdminList",{

password:adminPw.value

});

adminResult.innerHTML=JSON.stringify(list,null,2);

}

if("serviceWorker"in navigator){

navigator.serviceWorker.register("service-worker.js?v=1");

}