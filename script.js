/* ===== filenames (extend as needed) ===== */
const jsonFiles = ["rewrite_q1.json", "rewrite_q2.json", "rewrite_q3.json", "rewrite_q4.json", "rewrite_q5.json", "rewrite_q6.json", "rewrite_q7.json", "rewrite_q8.json", "rewrite_q9.json", "rewrite_q10.json", "rewrite_q11.json", "rewrite_q12.json", "rewrite_q13.json", "rewrite_q14.json", "rewrite_q15.json", "rewrite_q16.json", "rewrite_q17.json", "rewrite_q18.json", "rewrite_q19.json", "rewrite_q20.json", "rewrite_q21.json", "rewrite_q22.json", "rewrite_q23.json", "rewrite_q24.json", "rewrite_q25.json", "rewrite_q26.json", "rewrite_q27.json", "rewrite_q28.json", "rewrite_q29.json", "rewrite_q30.json", "rewrite_q31.json", "rewrite_q32.json", "rewrite_q33.json", "rewrite_q35.json", "rewrite_q36.json", "rewrite_q37.json", "rewrite_q38.json", "rewrite_q39.json", "rewrite_q40.json", "rewrite_q41.json", "rewrite_q42.json", "rewrite_q43.json", "rewrite_q44.json", "rewrite_q45.json", "rewrite_q46.json", "rewrite_q47.json", "rewrite_q48.json", "rewrite_q49.json", "rewrite_q50.json", "rewrite_q51.json", "rewrite_q52.json", "rewrite_q53.json", "rewrite_q54.json", "rewrite_q55.json", "rewrite_q56.json", "rewrite_q57.json", "rewrite_q58.json", "rewrite_q59.json", "rewrite_q60.json", "rewrite_q61.json", "rewrite_q63.json", "rewrite_q64.json", "rewrite_q65.json", "rewrite_q66.json", "rewrite_q67.json", "rewrite_q68.json", "rewrite_q69.json", "rewrite_q70.json", "rewrite_q71.json", "rewrite_q72.json", "rewrite_q73.json", "rewrite_q74.json", "rewrite_q75.json", "rewrite_q76.json", "rewrite_q77.json", "rewrite_q78.json", "rewrite_q79.json", "rewrite_q80.json", "rewrite_q81.json", "rewrite_q82.json", "rewrite_q83.json", "rewrite_q84.json", "rewrite_q85.json", "rewrite_q86.json", "rewrite_q87.json", "rewrite_q88.json", "rewrite_q89.json", "rewrite_q90.json", "rewrite_q91.json", "rewrite_q92.json", "rewrite_q93.json", "rewrite_q94.json", "rewrite_q95.json", "rewrite_q96.json", "rewrite_q97.json", "rewrite_q98.json", "rewrite_q99.json", "rewrite_q100.json"];

/* ===== localStorage helpers ===== */
const LS = (k,def)=>JSON.parse(localStorage.getItem(k)||JSON.stringify(def));
const S  = (k,v)=>localStorage.setItem(k,JSON.stringify(v));

/* ===== DOM ===== */
const tbody      = document.getElementById("questionTableBody");
const topicSel   = document.getElementById("topicFilter");
const diffSel    = document.getElementById("diffFilter");
const searchInp  = document.getElementById("searchInput");
const qotdBox    = document.getElementById("qotdHolder");
const emptyState = document.getElementById("emptyState");
const coachText  = document.getElementById("coachText");
const pulseUsers = document.getElementById("pulseUsers");
const ctx        = document.getElementById("progressChart").getContext("2d");
let   chart;

/* ===== boot ===== */
document.addEventListener("DOMContentLoaded", async () => {
  if (!tbody) return;

  // Fake "active users" pulse to feel alive (no backend)
  const base = 12 + (new Date().getMinutes() % 7) * 3;
  if (pulseUsers) pulseUsers.textContent = base;

  // Tips / nudges rotation
  rotateCoachText();

  // Load data
  const data = await Promise.all(
    jsonFiles.map(f => fetch(`all_question_json/${f}`).then(r=>r.json()).then(d=>({...d,file:f})))
  );
  buildTable(data);
  addTopicOptions(data);
  renderQOTD(data);
  renderProgress(data);
  attachFilters();        // also sets initial empty state
  document.querySelectorAll(".fade").forEach(el=>el.classList.add("appear"));
});

/* ===== table ===== */
function buildTable(data){
  tbody.innerHTML = "";
  const solved  = new Set(LS("solved",[]));
  const visited = new Set(LS("visited",[]));

  data.forEach((q,i)=>{
    let icon="▫️", cls="status-new";
    if(visited.has(q.file)) { icon="🔵"; cls="status-open"; }
    if(solved .has(q.file)) { icon="✅"; cls="status-done"; }

    const href = `question.html?q=${encodeURIComponent(q.file)}`;
    tbody.insertAdjacentHTML("beforeend", `
      <tr data-topic="${q.topic}" data-diff="${q.difficulty.toLowerCase()}" data-file="${q.file}" data-href="${href}">
        <td class="status-cell ${cls}" data-file="${q.file}">${icon}</td>
        <td>${i+1}</td>
        <td><a class="title-link" href="${href}">${q.title}</a></td>
        <td>${q.topic}</td>
        <td>${q.difficulty}</td>
      </tr>
    `);
  });

  // Single delegated click handler
  tbody.addEventListener("click", (e)=>{
    const statusCell = e.target.closest(".status-cell");
    if (statusCell) { toggleSolved(statusCell); return; }

    const link = e.target.closest(".title-link");
    const row  = e.target.closest("tr");
    if (!row) return;

    // Always mark visited when opening
    markVisited(row);

    // If they actually clicked the link, let default happen
    if (link) return;

    // Otherwise, clicking the row navigates
    const url = row.dataset.href;
    if (url) window.location.href = url;
  });
}

/* ===== visited + pulse ===== */
function markVisited(row){
  const file=row.dataset.file;
  const visited=new Set(LS("visited",[]));
  if(!visited.has(file)){
    visited.add(file); S("visited",[...visited]);
    const cell=row.querySelector(".status-cell");
    if(!cell.classList.contains("status-done")){
      cell.textContent="🔵"; cell.className="status-cell status-open";
      pulse(cell);
    }
  }
}
function pulse(cell){
  // Gentle infinite pulse until solved
  const anim = cell.animate(
    [{transform:"scale(1)"},{transform:"scale(1.08)"},{transform:"scale(1)"}],
    {duration:900,iterations:Infinity,easing:"ease-in-out"}
  );
  // stop later when solved via toggleSolved
}

/* ===== solved toggle ===== */
function toggleSolved(cell){
  const file=cell.dataset.file;
  const solved = new Set(LS("solved",[]));
  const visited= new Set(LS("visited",[])); visited.add(file);

  if(solved.has(file)){
    solved.delete(file); cell.textContent="🔵"; cell.className="status-cell status-open";
  }else{
    solved.add(file);    cell.textContent="✅"; cell.className="status-cell status-done";
    cell.getAnimations().forEach(a=>a.cancel());
  }
  S("solved",[...solved]); S("visited",[...visited]);
  updateProgressFromRows();
}

/* ===== filters (no page jump thanks to min-height & overlay) ===== */
function attachFilters(){
  const apply=()=>{
    const txt  = searchInp.value.toLowerCase();
    const top  = topicSel.value;
    const diff = diffSel.value;

    let visibleCount = 0;
    Array.from(tbody.rows).forEach(r=>{
      const match =
        (txt==="" || r.cells[2].innerText.toLowerCase().includes(txt)) &&
        (top==="all" || r.dataset.topic === top) &&
        (diff==="all"|| r.dataset.diff  === diff);
      r.style.display = match ? "" : "none";
      if (match) visibleCount++;
    });

    // Empty overlay inside fixed-height wrap → no layout shift
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  };

  // Initial pass (so empty state reflects immediately)
  apply();

  searchInp.addEventListener("input",  apply);
  topicSel .addEventListener("change", apply);
  diffSel  .addEventListener("change", apply);
}

/* ===== topics ===== */
function addTopicOptions(data){
  [...new Set(data.map(q=>q.topic))].sort()
    .forEach(t=>topicSel.insertAdjacentHTML("beforeend",`<option value="${t}">${t}</option>`));
}

/* ===== QOTD ===== */
function renderQOTD(data){
  const today = new Date().toISOString().slice(0,10);
  let q = LS("qotd",{});
  if(q.date !== today){
    const pick = data[Math.floor(Math.random()*data.length)];
    q = { date: today, file: pick.file, title: pick.title };
    S("qotd", q);
  }
  qotdBox.innerHTML = `
    <div class="qotd-card">
      <div><strong>Question of the Day</strong><small>Fresh daily</small></div>
      <a href="question.html?q=${encodeURIComponent(q.file)}">${q.title}</a>
    </div>`;
}

/* ===== progress chart ===== */
function renderProgress(data){
  const solved=new Set(LS("solved",[]));
  let e=0,m=0,h=0; data.forEach(q=>{
    if(solved.has(q.file)){
      const d=q.difficulty.toLowerCase();
      if(d==="easy")e++; if(d==="medium")m++; if(d==="hard")h++;
    }
  });
  drawChart(data.length, solved.size, e, m, h);
}
function updateProgressFromRows(){
  const rows=[...tbody.rows];
  const total=rows.length;
  const solvedSet = new Set(LS("solved",[]));
  let e=0,m=0,h=0;
  rows.forEach(r=>{
    const file=r.dataset.file;
    if(solvedSet.has(file)){
      const d=r.dataset.diff; if(d==="easy")e++; if(d==="medium")m++; if(d==="hard")h++;
    }
  });
  drawChart(total, solvedSet.size, e, m, h);
}
function drawChart(total, done, easy, med, hard){
  const pct = total ? ((done/total)*100).toFixed(0) : 0;
  const data=[easy,med,hard,total-done];
  const colors=["#93C5FD","#A78BFA","#F472B6","#D1D5DB"]; // calm blue / violet / pink / gray
  if(chart){ chart.data.datasets[0].data=data; chart.update(); }
  else{
    chart=new Chart(ctx,{type:"doughnut",
      data:{labels:["Easy","Medium","Hard","Unsolved"],
        datasets:[{data,backgroundColor:colors,borderColor:"#fff",borderWidth:2}]},
      options:{plugins:{legend:{display:false}},cutout:"62%"}});
  }
  document.getElementById("chartLabel").innerHTML =
    `<strong>${pct}%</strong><div>done</div>`;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.addEventListener("DOMContentLoaded", async () => {
  // ... your existing code ...

  // Update the pulseUsers span with a random integer
  const pulseUsersSpan = document.getElementById("pulseUsers");
  if (pulseUsersSpan) {
    pulseUsersSpan.textContent = getRandomInt(1, 100);
  }
});

/* ===== tiny human nudges ===== */
function rotateCoachText(){
  if(!coachText) return;
  const tips = [
    "Breathe. Two deep breaths can reset your brain’s working memory.",
    "Tip: sketch the sample space first; algebra later.",
    "Hydrate. A sip of water improves focus more than you think.",
    "Stuck? Change the representation: table → tree → simulation idea.",
    "Micro-goal: 20 minutes focused → 3 minutes stretch → repeat.",
    "Compare to a simpler case n=2 or p=1/2; then generalize.",
    "You're not alone — thousands struggle with the same few ideas. Keep going.",
    "Edge cases win offers. Ask: zero, one, infinite, boundary values?",
    "Name your hunch out loud; it reduces cognitive load."
  ];
  let i = Math.floor(Math.random()*tips.length);
  coachText.textContent = tips[i];
  setInterval(()=>{
    i = (i+1) % tips.length;
    coachText.textContent = tips[i];
  }, 12000);
}
