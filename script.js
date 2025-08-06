/* ---------- 1. list of JSON filenames ---------- */
const jsonFiles = ["rewrite_q1.json", "rewrite_q2.json", "rewrite_q3.json", "rewrite_q4.json", "rewrite_q5.json", "rewrite_q6.json", "rewrite_q7.json", "rewrite_q8.json", "rewrite_q9.json", "rewrite_q10.json", "rewrite_q11.json", "rewrite_q12.json", "rewrite_q13.json", "rewrite_q14.json", "rewrite_q15.json", "rewrite_q16.json", "rewrite_q17.json", "rewrite_q18.json", "rewrite_q19.json", "rewrite_q20.json", "rewrite_q21.json", "rewrite_q22.json", "rewrite_q23.json", "rewrite_q24.json", "rewrite_q25.json", "rewrite_q26.json", "rewrite_q27.json", "rewrite_q28.json", "rewrite_q29.json", "rewrite_q30.json", "rewrite_q31.json", "rewrite_q32.json", "rewrite_q33.json", "rewrite_q35.json", "rewrite_q36.json", "rewrite_q37.json", "rewrite_q38.json", "rewrite_q39.json", "rewrite_q40.json", "rewrite_q41.json", "rewrite_q42.json", "rewrite_q43.json", "rewrite_q44.json", "rewrite_q45.json", "rewrite_q46.json", "rewrite_q47.json", "rewrite_q48.json", "rewrite_q49.json", "rewrite_q50.json", "rewrite_q51.json", "rewrite_q52.json", "rewrite_q53.json", "rewrite_q54.json", "rewrite_q55.json", "rewrite_q56.json", "rewrite_q57.json", "rewrite_q58.json", "rewrite_q59.json", "rewrite_q60.json", "rewrite_q61.json", "rewrite_q63.json", "rewrite_q64.json", "rewrite_q65.json", "rewrite_q66.json", "rewrite_q67.json", "rewrite_q68.json", "rewrite_q69.json", "rewrite_q70.json", "rewrite_q71.json", "rewrite_q72.json", "rewrite_q73.json", "rewrite_q74.json", "rewrite_q75.json", "rewrite_q76.json", "rewrite_q77.json", "rewrite_q78.json", "rewrite_q79.json", "rewrite_q80.json", "rewrite_q81.json", "rewrite_q82.json", "rewrite_q83.json", "rewrite_q84.json", "rewrite_q85.json", "rewrite_q86.json", "rewrite_q87.json", "rewrite_q88.json", "rewrite_q89.json", "rewrite_q90.json", "rewrite_q91.json", "rewrite_q92.json", "rewrite_q93.json", "rewrite_q94.json", "rewrite_q95.json", "rewrite_q96.json", "rewrite_q97.json", "rewrite_q98.json", "rewrite_q99.json", "rewrite_q100.json"];


/* ---------- 2. localStorage helpers ---------- */
function getSolvedList() {
  return JSON.parse(localStorage.getItem("solvedQuestions") || "[]");
}
function setSolvedList(arr) {
  localStorage.setItem("solvedQuestions", JSON.stringify(arr));
}

/* ---------- 3. homepage logic ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("questionTableBody");
  if (!tbody) return;              // on question.html we skip this block

  /* fetch all questions */
  const fetches = jsonFiles.map(f =>
    fetch(`all_question_json/${f}`).then(r => r.json().then(d => ({ ...d, file: f })))
  );

  Promise.all(fetches).then(data => {
    tbody.innerHTML = "";
    let solved = getSolvedList();

    data.forEach((q, i) => {
      const tr = document.createElement("tr");

      const statusTd = document.createElement("td");
      statusTd.className = "status-cell";
      statusTd.dataset.file = q.file;
      statusTd.textContent = solved.includes(q.file) ? "✅" : "▫️";
      tr.appendChild(statusTd);

      tr.innerHTML += `
        <td>${i + 1}</td>
        <td><a href="question.html?q=${encodeURIComponent(q.file)}">${q.title}</a></td>
        <td>${q.topic}</td>
        <td>${q.difficulty}</td>
      `;
      tbody.appendChild(tr);
    });

    /* click to toggle solved */
    tbody.addEventListener("click", e => {
      if (!e.target.classList.contains("status-cell")) return;
      const file = e.target.dataset.file;
      let solved = getSolvedList();
      if (solved.includes(file)) {
        solved = solved.filter(f => f !== file);
        e.target.textContent = "▫️";
      } else {
        solved.push(file);
        e.target.textContent = "✅";
      }
      setSolvedList(solved);
    });
  }).catch(err => {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" style="color:red">Failed to load.</td></tr>`;
  });
});
