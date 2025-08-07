/* ---------- 1. JSON filenames ---------- */
const jsonFiles = ["rewrite_q1.json", "rewrite_q2.json", "rewrite_q3.json", "rewrite_q4.json", "rewrite_q5.json", "rewrite_q6.json", "rewrite_q7.json", "rewrite_q8.json", "rewrite_q9.json", "rewrite_q10.json", "rewrite_q11.json", "rewrite_q12.json", "rewrite_q13.json", "rewrite_q14.json", "rewrite_q15.json", "rewrite_q16.json", "rewrite_q17.json", "rewrite_q18.json", "rewrite_q19.json", "rewrite_q20.json", "rewrite_q21.json", "rewrite_q22.json", "rewrite_q23.json", "rewrite_q24.json", "rewrite_q25.json", "rewrite_q26.json", "rewrite_q27.json", "rewrite_q28.json", "rewrite_q29.json", "rewrite_q30.json", "rewrite_q31.json", "rewrite_q32.json", "rewrite_q33.json", "rewrite_q35.json", "rewrite_q36.json", "rewrite_q37.json", "rewrite_q38.json", "rewrite_q39.json", "rewrite_q40.json", "rewrite_q41.json", "rewrite_q42.json", "rewrite_q43.json", "rewrite_q44.json", "rewrite_q45.json", "rewrite_q46.json", "rewrite_q47.json", "rewrite_q48.json", "rewrite_q49.json", "rewrite_q50.json", "rewrite_q51.json", "rewrite_q52.json", "rewrite_q53.json", "rewrite_q54.json", "rewrite_q55.json", "rewrite_q56.json", "rewrite_q57.json", "rewrite_q58.json", "rewrite_q59.json", "rewrite_q60.json", "rewrite_q61.json", "rewrite_q63.json", "rewrite_q64.json", "rewrite_q65.json", "rewrite_q66.json", "rewrite_q67.json", "rewrite_q68.json", "rewrite_q69.json", "rewrite_q70.json", "rewrite_q71.json", "rewrite_q72.json", "rewrite_q73.json", "rewrite_q74.json", "rewrite_q75.json", "rewrite_q76.json", "rewrite_q77.json", "rewrite_q78.json", "rewrite_q79.json", "rewrite_q80.json", "rewrite_q81.json", "rewrite_q82.json", "rewrite_q83.json", "rewrite_q84.json", "rewrite_q85.json", "rewrite_q86.json", "rewrite_q87.json", "rewrite_q88.json", "rewrite_q89.json", "rewrite_q90.json", "rewrite_q91.json", "rewrite_q92.json", "rewrite_q93.json", "rewrite_q94.json", "rewrite_q95.json", "rewrite_q96.json", "rewrite_q97.json", "rewrite_q98.json", "rewrite_q99.json", "rewrite_q100.json"];


/* ------------ 2. localStorage helpers ------------ */
const getSolved = () =>
  JSON.parse(localStorage.getItem("solvedQuestions") || "[]");
const setSolved = arr =>
  localStorage.setItem("solvedQuestions", JSON.stringify(arr));

/* ------------ 3. DOM refs ------------ */
const tbody       = document.getElementById("questionTableBody");
const topicSel    = document.getElementById("topicFilter");
const diffSel     = document.getElementById("diffFilter");
const searchInp   = document.getElementById("searchInput");
const banner      = document.getElementById("progressBanner");
const qotdHolder  = document.getElementById("qotdHolder");

/* ------------ 4. Load & bootstrap ------------ */
document.addEventListener("DOMContentLoaded", () => {
  if (!tbody) return;                                // skip on question.html

  Promise.all(jsonFiles.map(f =>
      fetch(`all_question_json/${f}`).then(r=>r.json().then(d=>({...d,file:f})))
  ))
  .then(data => {
    buildRows(data);
    populateTopicOptions(data);
    renderProgress(data);
    renderQOTD(data);
    attachFilters(data);
  })
  .catch(err=>{
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" style="color:red">Load failed.</td></tr>`;
  });
});

/* ------------ 5. Build table rows ------------ */
function buildRows(data){
  tbody.innerHTML = "";
  const solvedSet = new Set(getSolved());

  data.forEach((q,i)=>{
    const solved = solvedSet.has(q.file);
    tbody.insertAdjacentHTML("beforeend", `
      <tr data-topic="${q.topic}" data-diff="${q.difficulty.toLowerCase()}">
        <td class="status-cell" data-file="${q.file}">${solved ? "✅" : "▫️"}</td>
        <td>${i+1}</td>
        <td><a href="question.html?q=${encodeURIComponent(q.file)}">${q.title}</a></td>
        <td>${q.topic}</td>
        <td>${q.difficulty}</td>
      </tr>
    `);
  });

  /* toggle solved */
  tbody.addEventListener("click", e=>{
    if(!e.target.classList.contains("status-cell")) return;
    const file   = e.target.dataset.file;
    const solved = new Set(getSolved());
    if(solved.has(file)){
      solved.delete(file);
      e.target.textContent = "▫️";
    }else{
      solved.add(file);
      e.target.textContent = "✅";
    }
    setSolved([...solved]);
    renderProgress(data);
  });
}

/* ------------ 6. Topic dropdown ------------ */
function populateTopicOptions(data){
  const topics = [...new Set(data.map(q=>q.topic))].sort();
  topics.forEach(t=>{
    const opt=document.createElement("option");
    opt.value=t; opt.textContent=t;
    topicSel.appendChild(opt);
  });
}

/* ------------ 7. Progress banner ------------ */
function renderProgress(data){
  const solvedSet = new Set(getSolved());
  const total     = data.length;
  let easy=0, med=0, hard=0;

  data.forEach(q=>{
    if(!solvedSet.has(q.file)) return;
    const diff = q.difficulty.trim().toLowerCase();
    if(diff==="easy")   easy++;
    if(diff==="medium") med++;
    if(diff==="hard")   hard++;
  });

  const solved = solvedSet.size;
  const pct    = ((solved/total)*100).toFixed(0);
  banner.textContent =
    `Solved ${solved}/${total} (${pct}%) · Easy ${easy} · Medium ${med} · Hard ${hard}`;
}

/* ------------ 8. Question-of-the-Day ------------ */
function renderQOTD(data){
  const today = new Date().toISOString().slice(0,10);
  let qotd    = JSON.parse(localStorage.getItem("qotd") || "{}");

  if(qotd.date !== today){
    const pick = data[Math.floor(Math.random()*data.length)];
    qotd = { date: today, file: pick.file, title: pick.title };
    localStorage.setItem("qotd", JSON.stringify(qotd));
  }

  qotdHolder.innerHTML = `
    <div class="qotd-card">
      <div>
        <strong>Question of the Day</strong>
        <small>Don’t miss it ✨</small>
      </div>
      <a href="question.html?q=${encodeURIComponent(qotd.file)}">${qotd.title}</a>
    </div>
  `;
}

/* ------------ 9. Search + filters ------------ */
function attachFilters(data){
  const apply = () => {
    const txt  = searchInp.value.toLowerCase();
    const top  = topicSel.value;
    const diff = diffSel.value;

    Array.from(tbody.rows).forEach(r=>{
      const match =
        (txt  === ""    || r.cells[2].innerText.toLowerCase().includes(txt)) &&
        (top  === "all" || r.dataset.topic === top) &&
        (diff === "all" || r.dataset.diff  === diff);

      r.style.display = match ? "" : "none";
    });
  };

  searchInp .addEventListener("input",  apply);
  topicSel  .addEventListener("change", apply);
  diffSel   .addEventListener("change", apply);
}
