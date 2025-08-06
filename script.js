// NOTE: All JSON files with questions are stored in the folder "all_question_json".
// Update the array below as you add more problem JSON files.
const jsonFiles = ["rewrite_q1.json", "rewrite_q2.json", "rewrite_q3.json", "rewrite_q4.json", "rewrite_q5.json", "rewrite_q6.json", "rewrite_q7.json", "rewrite_q8.json", "rewrite_q9.json", "rewrite_q10.json", "rewrite_q11.json", "rewrite_q12.json", "rewrite_q13.json", "rewrite_q14.json", "rewrite_q15.json", "rewrite_q16.json", "rewrite_q17.json", "rewrite_q18.json", "rewrite_q19.json", "rewrite_q20.json", "rewrite_q21.json", "rewrite_q22.json", "rewrite_q23.json", "rewrite_q24.json", "rewrite_q25.json", "rewrite_q26.json", "rewrite_q27.json", "rewrite_q28.json", "rewrite_q29.json", "rewrite_q30.json", "rewrite_q31.json", "rewrite_q32.json", "rewrite_q33.json", "rewrite_q35.json", "rewrite_q36.json", "rewrite_q37.json", "rewrite_q38.json", "rewrite_q39.json", "rewrite_q40.json", "rewrite_q41.json", "rewrite_q42.json", "rewrite_q43.json", "rewrite_q44.json", "rewrite_q45.json", "rewrite_q46.json", "rewrite_q47.json", "rewrite_q48.json", "rewrite_q49.json", "rewrite_q50.json", "rewrite_q51.json", "rewrite_q52.json", "rewrite_q53.json", "rewrite_q54.json", "rewrite_q55.json", "rewrite_q56.json", "rewrite_q57.json", "rewrite_q58.json", "rewrite_q59.json", "rewrite_q60.json", "rewrite_q61.json", "rewrite_q63.json", "rewrite_q64.json", "rewrite_q65.json", "rewrite_q66.json", "rewrite_q67.json", "rewrite_q68.json", "rewrite_q69.json", "rewrite_q70.json", "rewrite_q71.json", "rewrite_q72.json", "rewrite_q73.json", "rewrite_q74.json", "rewrite_q75.json", "rewrite_q76.json", "rewrite_q77.json", "rewrite_q78.json", "rewrite_q79.json", "rewrite_q80.json", "rewrite_q81.json", "rewrite_q82.json", "rewrite_q83.json", "rewrite_q84.json", "rewrite_q85.json", "rewrite_q86.json", "rewrite_q87.json", "rewrite_q88.json", "rewrite_q89.json", "rewrite_q90.json", "rewrite_q91.json", "rewrite_q92.json", "rewrite_q93.json", "rewrite_q94.json", "rewrite_q95.json", "rewrite_q96.json", "rewrite_q97.json", "rewrite_q98.json", "rewrite_q99.json", "rewrite_q100.json"];

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById('problems'); 
  container.innerHTML = `<p>Loading problems...</p>`;
  
  // Fetch each JSON file from the "all_question_json" folder
  const fetchPromises = jsonFiles.map(file =>
    fetch(`all_question_json/${file}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Network error while fetching " + file);
        }
        return response.json();
      })
  );
  
  // Once all fetches complete, render all problem cards
  Promise.all(fetchPromises)
    .then(questions => {
      renderProblems(questions);
    })
    .catch(err => {
      container.innerHTML = `<p style="color:red">Failed to load problems.</p>`;
      console.error(err);
    });
  
  // Dark mode toggle button (in header)
  const darkToggle = document.getElementById("darkToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark");
      // Save user's theme preference in localStorage if desired.
    });
  }
});

function renderProblems(questions) {
  const container = document.getElementById('problems');
  container.innerHTML = questions.map(data => createCard(data)).join('') +
                        `<footer>Math rendered with KaTeX · Markdown via marked.js</footer>`;
  
  // Re-render math using custom delimiters to ensure correct inline and display math
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false }
    ]
  });
}

function createCard({ title, stem_md, hints, detailed_solution_md, topic, difficulty }) {
  // Create unique IDs using the title (spaces replaced with underscores) to avoid collisions.
  const safeTitle = title.replace(/\s+/g, '_');
  return `
    <div class="card">
      <div class="header">
        <h1>${title}</h1>
        <div class="badges">
          <span class="badge topic">${topic}</span>
          <span class="badge difficulty">${difficulty}</span>
        </div>
      </div>
      <section id="stem">${marked.parse(stem_md)}</section>
      <div class="buttons">
        ${hints.map((_, i) => `<button onclick="toggle('hint${i}_${safeTitle}')">Show Hint ${i+1}</button>`).join('')}
        <button onclick="toggle('solution_${safeTitle}')">Show Solution</button>
      </div>
      ${hints.map((h, i) => `<div id="hint${i}_${safeTitle}" class="hint">${marked.parse(h)}</div>`).join('')}
      <div id="solution_${safeTitle}" class="solution">${marked.parse(detailed_solution_md)}</div>
    </div>
  `;
}

function toggle(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = (el.style.display === 'block') ? 'none' : 'block';
}