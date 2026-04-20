// frontend/js/app.js
// FitTrack — Main JavaScript (No frameworks, vanilla JS)
// Handles: API calls, rendering workouts, form submission, edit, delete, filters

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────

// The base URL for all API calls
// When running locally, the backend serves on port 5000
const API_BASE = "http://localhost:5000/api";

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────

// Our local in-memory store of workouts (so we don't refetch after every action)
let allWorkouts = [];

// The ID of the workout currently being edited (null = none)
let editingId = null;

// ─────────────────────────────────────────────
// DOM ELEMENTS (cached for convenience)
// ─────────────────────────────────────────────

const logForm       = document.getElementById("log-form");
const workoutsList  = document.getElementById("workouts-list");
const editModal     = document.getElementById("edit-modal");
const editForm      = document.getElementById("edit-form");
const searchInput   = document.getElementById("search-input");
const filterSelect  = document.getElementById("filter-type");

// Stat display elements in the hero
const statTotal     = document.getElementById("stat-total");
const statCals      = document.getElementById("stat-cals");
const statMins      = document.getElementById("stat-mins");

// ─────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────

/**
 * Show a toast message at the top-right of the screen.
 * @param {string} message  - The text to display
 * @param {"success"|"error"} type - Visual style
 */
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : "✕"}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.add("hiding");
    // Remove from DOM after the hide animation completes
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ─────────────────────────────────────────────
// API HELPERS
// ─────────────────────────────────────────────

/**
 * Fetch all workouts from the backend and store them in `allWorkouts`.
 */
async function fetchWorkouts() {
  try {
    showLoading();
    const response = await fetch(`${API_BASE}/workouts`);
    const result   = await response.json();

    if (result.success) {
      allWorkouts = result.data;  // Store fetched workouts
      updateStats();              // Refresh hero stats
      renderWorkouts();           // Re-render the list
    } else {
      showToast("Failed to load workouts.", "error");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    showToast("Cannot connect to server. Is it running?", "error");
    showError();
  }
}

/**
 * Send a POST request to create a new workout.
 * @param {Object} data - Workout fields
 */
async function createWorkout(data) {
  const response = await fetch(`${API_BASE}/workouts`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Send a PUT request to update an existing workout.
 * @param {string} id   - MongoDB document ID
 * @param {Object} data - Updated fields
 */
async function updateWorkout(id, data) {
  const response = await fetch(`${API_BASE}/workouts/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Send a DELETE request to remove a workout.
 * @param {string} id - MongoDB document ID
 */
async function deleteWorkout(id) {
  const response = await fetch(`${API_BASE}/workouts/${id}`, {
    method: "DELETE",
  });
  return await response.json();
}

// ─────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────

/** Show a spinner while loading */
function showLoading() {
  workoutsList.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
    </div>
  `;
}

/** Show an error state */
function showError() {
  workoutsList.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <h3>Connection Error</h3>
      <p>Make sure the backend server is running on port 5000.</p>
    </div>
  `;
}

/**
 * Render the workout cards, applying current search and filter values.
 */
function renderWorkouts() {
  const query  = searchInput.value.toLowerCase().trim();
  const filter = filterSelect.value; // "" means "All"

  // Filter the master list based on search term and type filter
  let filtered = allWorkouts.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(query) ||
                          (w.notes && w.notes.toLowerCase().includes(query));
    const matchesFilter = filter === "" || w.type === filter;
    return matchesSearch && matchesFilter;
  });

  // Show empty state if no results
  if (filtered.length === 0) {
    const message = allWorkouts.length === 0
      ? "Log your first workout above to get started!"
      : "No workouts match your search.";

    workoutsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏋️</div>
        <h3>No Workouts Found</h3>
        <p>${message}</p>
      </div>
    `;
    return;
  }

  // Build the grid of workout cards
  workoutsList.innerHTML = `
    <div class="workouts-grid">
      ${filtered.map(renderCard).join("")}
    </div>
  `;
}

/**
 * Generate HTML for a single workout card.
 * @param {Object} workout - The workout data object
 * @returns {string} - HTML string
 */
function renderCard(workout) {
  // Format the date in a readable way
  const dateFormatted = new Date(workout.date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return `
    <article class="workout-card">
      <div class="workout-card-header">
        <h3 class="workout-name">${escapeHtml(workout.name)}</h3>
        <span class="badge badge-${workout.type}">${workout.type}</span>
      </div>

      <div class="workout-meta">
        <div class="meta-item">
          <span class="meta-icon">⏱</span>
          <strong>${workout.duration}</strong>&nbsp;min
        </div>
        <div class="meta-item">
          <span class="meta-icon">🔥</span>
          <strong>${workout.calories}</strong>&nbsp;kcal
        </div>
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          ${dateFormatted}
        </div>
      </div>

      ${workout.notes ? `<p class="workout-notes">${escapeHtml(workout.notes)}</p>` : ""}

      <div class="workout-actions">
        <button
          class="btn btn-secondary btn-sm"
          onclick="openEditModal('${workout._id}')"
          title="Edit workout"
        >✏️ Edit</button>
        <button
          class="btn btn-danger btn-sm"
          onclick="handleDelete('${workout._id}', '${escapeHtml(workout.name)}')"
          title="Delete workout"
        >🗑 Delete</button>
      </div>
    </article>
  `;
}

/**
 * Update the hero summary statistics.
 */
function updateStats() {
  const totalWorkouts  = allWorkouts.length;
  const totalCalories  = allWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalMinutes   = allWorkouts.reduce((sum, w) => sum + w.duration, 0);

  if (statTotal) statTotal.textContent = totalWorkouts;
  if (statCals)  statCals.textContent  = totalCalories.toLocaleString();
  if (statMins)  statMins.textContent  = totalMinutes.toLocaleString();
}

// ─────────────────────────────────────────────
// FORM: LOG NEW WORKOUT
// ─────────────────────────────────────────────

// Listen for the log form submission
logForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload

  // Collect form field values
  const data = getFormData(logForm);

  // Basic client-side validation
  if (!data.name || !data.type || !data.duration || !data.calories || !data.date) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  // Disable the submit button while waiting
  const submitBtn = logForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    const result = await createWorkout(data);

    if (result.success) {
      showToast(result.message || "Workout logged!", "success");
      logForm.reset();             // Clear the form
      setTodayDate(logForm);       // Reset date to today
      await fetchWorkouts();       // Reload the list
    } else {
      showToast(result.message || "Failed to save workout.", "error");
    }
  } catch (error) {
    console.error("Create error:", error);
    showToast("Server error. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Log Workout";
  }
});

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Confirm and delete a workout.
 * @param {string} id   - MongoDB document ID
 * @param {string} name - Workout name (for confirmation message)
 */
async function handleDelete(id, name) {
  // Ask user to confirm before deleting
  const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    const result = await deleteWorkout(id);

    if (result.success) {
      showToast(result.message || "Workout deleted.", "success");
      // Remove from local list and re-render (avoids a full API fetch)
      allWorkouts = allWorkouts.filter((w) => w._id !== id);
      updateStats();
      renderWorkouts();
    } else {
      showToast(result.message || "Failed to delete.", "error");
    }
  } catch (error) {
    console.error("Delete error:", error);
    showToast("Server error. Please try again.", "error");
  }
}

// ─────────────────────────────────────────────
// EDIT MODAL
// ─────────────────────────────────────────────

/**
 * Open the edit modal and pre-fill it with the workout's current data.
 * @param {string} id - MongoDB document ID
 */
function openEditModal(id) {
  editingId = id;

  // Find the workout in our local list
  const workout = allWorkouts.find((w) => w._id === id);
  if (!workout) return;

  // Pre-fill each form field
  editForm.elements["name"].value     = workout.name;
  editForm.elements["type"].value     = workout.type;
  editForm.elements["duration"].value = workout.duration;
  editForm.elements["calories"].value = workout.calories;
  editForm.elements["notes"].value    = workout.notes || "";

  // Format date for input[type="date"] (YYYY-MM-DD)
  const d = new Date(workout.date);
  editForm.elements["date"].value = d.toISOString().split("T")[0];

  // Show the modal
  editModal.classList.add("open");
  document.body.style.overflow = "hidden"; // Prevent page scroll behind modal
}

/** Close the edit modal */
function closeEditModal() {
  editModal.classList.remove("open");
  document.body.style.overflow = "";
  editingId = null;
  editForm.reset();
}

// Close modal when clicking the overlay background
editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEditModal();
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && editingId) closeEditModal();
});

// Handle edit form submission
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!editingId) return;

  const data = getFormData(editForm);

  const submitBtn = editForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    const result = await updateWorkout(editingId, data);

    if (result.success) {
      showToast(result.message || "Workout updated!", "success");
      closeEditModal();
      await fetchWorkouts(); // Reload
    } else {
      showToast(result.message || "Failed to update.", "error");
    }
  } catch (error) {
    console.error("Update error:", error);
    showToast("Server error. Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Changes";
  }
});

// ─────────────────────────────────────────────
// SEARCH & FILTER
// ─────────────────────────────────────────────

// Re-render whenever the user types in the search box
searchInput.addEventListener("input", renderWorkouts);

// Re-render whenever the filter dropdown changes
filterSelect.addEventListener("change", renderWorkouts);

// ─────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────

const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Close nav when a link is clicked on mobile
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ─────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Read all named inputs/selects/textareas from a form into a plain object.
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function getFormData(form) {
  const fd = new FormData(form);
  const data = {};
  for (const [key, value] of fd.entries()) {
    // Convert numeric fields to numbers
    data[key] = (key === "duration" || key === "calories") ? Number(value) : value;
  }
  return data;
}

/**
 * Set the date input of a given form to today's date (YYYY-MM-DD).
 * @param {HTMLFormElement} form
 */
function setTodayDate(form) {
  const dateInput = form.querySelector('input[name="date"]');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

/**
 * Escape HTML special characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ─────────────────────────────────────────────
// INIT — Run when the page loads
// ─────────────────────────────────────────────

(function init() {
  // Default date fields to today
  setTodayDate(logForm);
  setTodayDate(editForm);

  // Fetch and display all workouts from the database
  fetchWorkouts();
})();
