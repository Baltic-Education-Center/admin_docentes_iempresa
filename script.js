// URL de la Web App de Google Apps Script
const WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwJhXZI7WtD06lSryKqhxOJA6gc-HE6kfc1z60xMp4kO4sk7AHWpuGZFCjFRL51Pm1b/exec";

// --- State Management ---
let state = {
  user: null,
  userList: [],
  records: [],
  courses: [],
  teacherCourseMapping: {},
  filters: {
    course: "",
    search: "",
    teacher: "",
    status: "Pendiente",
  },
  viewMode: "table", // MODO TABLA POR DEFECTO
};

// --- DOM Elements ---
const elements = {
  loginOverlay: document.getElementById("loginOverlay"),
  appContainer: document.getElementById("appContainer"),
  loginForm: document.getElementById("loginForm"),
  loginUsername: document.getElementById("loginUsername"),
  userSuggestions: document.getElementById("userSuggestions"),
  loginPassword: document.getElementById("loginPassword"),
  loginError: document.getElementById("loginError"),
  userName: document.getElementById("userName"),
  userRole: document.getElementById("userRole"),
  courseButtonContainer: document.getElementById("courseButtonContainer"),
  statusSelect: document.getElementById("statusSelect"),
  adminTeacherSelect: document.getElementById("adminTeacherSelect"),
  adminCourseButtonContainer: document.getElementById(
    "adminCourseButtonContainer",
  ),
  adminStatusSelect: document.getElementById("adminStatusSelect"),
  recordsGrid: document.getElementById("recordsGrid"),
  searchInput: document.getElementById("searchInput"),
  statPending: document.getElementById("statPending"),
  statCompleted: document.getElementById("statCompleted"),
  statTotal: document.getElementById("statTotal"),
  dashboardChart: document.getElementById("dashboardChart"),
  batchActionBar: document.getElementById("batchActionBar"),
  batchCountText: document.getElementById("batchCountText"),
  gradingModal: document.getElementById("gradingModal"),
  editStudentModal: document.getElementById("editStudentModal"),
  btnRefresh: document.getElementById("btnRefresh"),
  btnBatchAction: document.getElementById("btnBatchAction"),
  batchActionIcon: document.getElementById("batchActionIcon"),
  batchActionText: document.getElementById("batchActionText"),
  btnLogout: document.getElementById("btnLogout"),
  btnSaveEdit: document.getElementById("btnSaveEdit"),
  infoDocente: document.getElementById("infoDocente"),
  infoCurso: document.getElementById("infoCurso"),
  editFileLink: document.getElementById("editFileLink"),
  editEstado: document.getElementById("editEstado"),
  editNota: document.getElementById("editNota"),
  editComentario: document.getElementById("editComentario"),
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage"),
  confirmModal: document.getElementById("confirmModal"),
  confirmMessage: document.getElementById("confirmMessage"),
  btnAcceptConfirm: document.getElementById("btnAcceptConfirm"),
  btnCancelConfirm: document.getElementById("btnCancelConfirm"),
  // New User Management Elements
  navDashboard: document.getElementById("navDashboard"),
  navUsers: document.getElementById("navUsers"),
  userManagementView: document.getElementById("userManagementView"),
  statsBar: document.getElementById("statsBar"),
  chartContainer: document.getElementById("chartContainer"),
  adminFiltersSection: document.getElementById("adminFiltersSection"),
  userTableBody: document.getElementById("userTableBody"),
  userSearchInput: document.getElementById("userSearchInput"),
  btnAddUser: document.getElementById("btnAddUser"),
  userModal: document.getElementById("userModal"),
  userModalTitle: document.getElementById("userModalTitle"),
  userNameInput: document.getElementById("userNameInput"),
  userPasswordInput: document.getElementById("userPasswordInput"),
  userRoleInput: document.getElementById("userRoleInput"),
  userEmailInput: document.getElementById("userEmailInput"),
  oldUserName: document.getElementById("oldUserName"),
  btnSaveUser: document.getElementById("btnSaveUser"),
  btnToggleView: document.getElementById("btnToggleView"),
  iconToggleView: document.getElementById("iconToggleView"),
  btnRemindTeacher: document.getElementById("btnRemindTeacher"),
  remindTeacherText: document.getElementById("remindTeacherText"),
  btnSyncUsers: document.getElementById("btnSyncUsers"),
};

// --- Initialization ---
function init() {
  const savedUser = localStorage.getItem("iempresa_user");
  const splash = document.getElementById("splashScreen");
  const splashText = document.getElementById("splashText");

  if (savedUser) {
    state.user = JSON.parse(savedUser);
    // Cambia el mensaje si detecta que el usuario ya estaba logueado
    if (splashText)
      splashText.textContent = `Bienvenido de nuevo, ${state.user.name}...`;
    showDashboard();
  }

  const cachedUsers = localStorage.getItem("iempresa_user_list");
  if (cachedUsers) {
    state.userList = JSON.parse(cachedUsers);
  }

  // Lanzamos el fetch en segundo plano (no bloquea el tiempo del splash)
  fetchUserList().catch((err) =>
    console.error("Error al cargar usuarios:", err),
  );

  // TIMEOUT EXACTO: 2 segundos (2000 ms)
  setTimeout(() => {
    if (splash) {
      splash.classList.add("hidden");
      // Se elimina permanentemente del DOM tras la transición para evitar el bug visual
      setTimeout(() => splash.remove(), 500);
    }
  }, 3000);

  // Eventos de Autenticación
  elements.loginForm.addEventListener("submit", handleLoginSubmit);
  elements.btnLogout.addEventListener("click", logout);

  // Lógica de Autocompletado
  elements.loginUsername.addEventListener("input", handleUsernameInput);
  document.addEventListener("click", (e) => {
    if (
      !elements.loginUsername.contains(e.target) &&
      !elements.userSuggestions.contains(e.target)
    ) {
      elements.userSuggestions.style.display = "none";
    }
  });

  // Filtros Docente
  elements.statusSelect.addEventListener("change", (e) => {
    state.filters.status = e.target.value;
    renderRecords();
  });

  // Evento para el nuevo botón de recordatorios
  elements.btnRemindTeacher.addEventListener("click", handleSendReminders);

  // Filtros Admin
  elements.adminTeacherSelect.addEventListener("change", (e) => {
    state.filters.teacher = e.target.value;
    state.filters.course = "";
    populateAdminCourseSelect();
    renderRecords();
    updateRemindButtonText(); // NUEVO
  });

  elements.adminStatusSelect.addEventListener("change", (e) => {
    state.filters.status = e.target.value;
    renderRecords();
  });

  // Búsqueda Universal
  elements.searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value.toLowerCase();
    renderRecords();
  });

  // Acciones de Utilidad
  elements.btnRefresh.addEventListener("click", () => {
    if (elements.navUsers.classList.contains("active")) {
      showToast("Sincronizando lista de usuarios...");
      fetchUserList().then(() => renderUserTable());
    } else {
      showToast("Sincronizando con la base de datos...");
      loadData();
      loadMappingData();
    }
  });

  // Navegación
  elements.navDashboard.addEventListener("click", (e) => {
    e.preventDefault();
    showDashboardView();
  });
  elements.navUsers.addEventListener("click", (e) => {
    e.preventDefault();
    showUserManagementView();
  });

  // Gestión de Usuarios
  elements.btnAddUser.addEventListener("click", () => openUserModal());
  elements.btnSaveUser.addEventListener("click", handleSaveUser);
  elements.btnSyncUsers.addEventListener("click", handleSyncUsers);
  elements.userSearchInput.addEventListener("input", renderUserTable);

  elements.btnToggleView.addEventListener("click", () => {
    state.viewMode = state.viewMode === "cards" ? "table" : "cards";
    elements.iconToggleView.className =
      state.viewMode === "cards" ? "ph ph-list-dashes" : "ph ph-squares-four";
    renderRecords();
  });

  document.querySelectorAll(".btn-close-modal").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });
}

// --- Custom Confirm Modal ---
function showConfirm(message) {
  return new Promise((resolve) => {
    elements.confirmMessage.textContent = message;
    elements.confirmModal.classList.add("active");

    const cleanup = () => {
      elements.confirmModal.classList.remove("active");
      elements.btnAcceptConfirm.removeEventListener("click", onAccept);
      elements.btnCancelConfirm.removeEventListener("click", onCancel);
    };

    const onAccept = () => {
      cleanup();
      resolve(true);
    };
    const onCancel = () => {
      cleanup();
      resolve(false);
    };

    elements.btnAcceptConfirm.addEventListener("click", onAccept);
    elements.btnCancelConfirm.addEventListener("click", onCancel);
  });
}

// --- API Helpers ---
async function callApi(action, data = {}) {
  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({ action, data }),
    });
    const result = await response.json();
    if (result.status === "error") throw new Error(result.message);
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// --- Authentication ---

async function fetchUserList() {
  try {
    const response = await callApi("getUserList");
    if (response.success) {
      state.userList = response.users;
      localStorage.setItem(
        "iempresa_user_list",
        JSON.stringify(response.users),
      );
    }
  } catch (error) {
    console.error("Could not fetch user list for autocomplete");
  }
}

function handleUsernameInput(e) {
  const value = e.target.value.toLowerCase().trim();
  if (!value) {
    elements.userSuggestions.style.display = "none";
    return;
  }

  // If list is not loaded yet, show loading feedback
  if (state.userList.length === 0) {
    elements.userSuggestions.innerHTML = `
      <div class="suggestion-item" style="cursor: default; opacity: 0.7;">
        <div class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
        <span>Buscando usuarios...</span>
      </div>
    `;
    elements.userSuggestions.style.display = "block";
    return;
  }

  const matches = state.userList.filter((u) =>
    u.name.toLowerCase().includes(value),
  );

  if (matches.length > 0) {
    elements.userSuggestions.innerHTML = "";
    matches.forEach((u) => {
      const div = document.createElement("div");
      div.className = "suggestion-item";
      div.innerHTML = `<i class="ph ph-user"></i> <span>${u.name}</span>`;
      div.onclick = () => {
        elements.loginUsername.value = u.name;
        elements.userSuggestions.style.display = "none";
        elements.loginPassword.focus();
      };
      elements.userSuggestions.appendChild(div);
    });
    elements.userSuggestions.style.display = "block";
  } else {
    elements.userSuggestions.style.display = "none";
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const username = elements.loginUsername.value.trim();
  const password = elements.loginPassword.value;
  const submitBtn = elements.loginForm.querySelector('button[type="submit"]');

  submitBtn.disabled = true;
  submitBtn.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div>
        <span style="margin-left:8px;" class="loading-dots">Validando</span>
    `;

  try {
    const response = await callApi("login", {
      name: username,
      password: password,
    });
    if (response.success) {
      state.user = response.user;
      localStorage.setItem("iempresa_user", JSON.stringify(state.user));
      showDashboard();
    } else {
      showLoginError(response.message);
    }
  } catch (err) {
    showLoginError(err.message || "Error al autenticar");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<span>Iniciar Sesión</span> <i class="ph ph-arrow-right"></i>';
  }
}

function showLoginError(msg) {
  elements.loginError.textContent = msg;
  elements.loginError.style.display = "block";
}

function showDashboard() {
  elements.loginOverlay.style.display = "none";
  elements.appContainer.style.display = "grid";
  document.body.className = `role-${state.user.role}`;
  elements.userName.textContent = state.user.name;
  elements.userRole.textContent =
    state.user.role === "admin" ? "Administrador" : "Docente";

  if (state.user.role === "admin") {
    state.filters.status = "Sin revisar";
    elements.adminStatusSelect.value = "Sin revisar";
  } else {
    state.filters.status = "Pendiente";
    elements.statusSelect.value = "Pendiente";
  }

  loadMappingData();
  loadData();
}

function logout() {
  localStorage.removeItem("iempresa_user");
  location.reload();
}

// --- Mapping Logic ---
async function loadMappingData() {
  const loadingHtml = `
    <div style="padding: 16px; text-align: center; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.15); border-radius: 8px;">
      <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; border-color: rgba(255,255,255,0.2); border-top-color: white; margin: 0 auto 10px;"></div>
      <span style="font-size: 12px;" class="loading-dots">Cargando cursos</span>
    </div>
  `;

  if (state.user.role === "admin") {
    elements.adminCourseButtonContainer.innerHTML = loadingHtml;
  } else {
    elements.courseButtonContainer.innerHTML = loadingHtml;
  }

  try {
    const res = await callApi("getTeachersAndCourses");
    if (res.success) {
      state.teacherCourseMapping = res.mapping;

      if (state.user.role === "admin") {
        populateAdminTeacherSelect(res.teachers);
        populateAdminCourseSelect(); // SOLUCION: Esto limpia el loading inicial
      } else {
        populateTeacherCourseSelectFromMapping();
      }
    }
  } catch (error) {
    console.error("Error loading mapping data:", error);
    const errorHtml = `<div style="color: #e74c3c; font-size: 12px; text-align: center;">Error al cargar cursos</div>`;
    if (state.user.role === "admin")
      elements.adminCourseButtonContainer.innerHTML = errorHtml;
    else elements.courseButtonContainer.innerHTML = errorHtml;
  }
}

function populateAdminTeacherSelect(teachers) {
  const currentVal = elements.adminTeacherSelect.value;
  elements.adminTeacherSelect.innerHTML =
    '<option value="">Todos los docentes</option>';
  teachers.forEach((teacher) => {
    const option = document.createElement("option");
    option.value = teacher;
    option.textContent = teacher;
    elements.adminTeacherSelect.appendChild(option);
  });
  elements.adminTeacherSelect.value = currentVal;
}

function populateAdminCourseSelect() {
  const teacher = state.filters.teacher;
  elements.adminCourseButtonContainer.innerHTML = "";

  if (teacher && state.teacherCourseMapping[teacher]) {
    // "All Courses" button
    const btnAll = document.createElement("button");
    btnAll.className = `course-btn ${state.filters.course === "" ? "active" : ""}`;
    btnAll.innerHTML = `<i class="ph ph-squares-four"></i> Todos los cursos`;
    btnAll.onclick = () => {
      state.filters.course = "";
      updateAdminCourseButtonsState();
      renderRecords();
    };
    elements.adminCourseButtonContainer.appendChild(btnAll);

    state.teacherCourseMapping[teacher].forEach((course) => {
      const btn = document.createElement("button");
      btn.className = `course-btn ${state.filters.course === course ? "active" : ""}`;
      btn.innerHTML = `<i class="ph ph-book-bookmark"></i> ${course}`;
      btn.onclick = () => {
        state.filters.course = course;
        updateAdminCourseButtonsState();
        renderRecords();
      };
      elements.adminCourseButtonContainer.appendChild(btn);
    });
  } else {
    const msg = document.createElement("div");
    msg.style.color = "rgba(255,255,255,0.6)";
    msg.style.fontSize = "13px";
    msg.style.marginBottom = "32px"; // SOLUCION: Espaciado inferior agregado
    msg.textContent = "Selecciona un docente para ver sus cursos.";
    elements.adminCourseButtonContainer.appendChild(msg);
  }
}

function updateAdminCourseButtonsState() {
  const buttons =
    elements.adminCourseButtonContainer.querySelectorAll(".course-btn");
  buttons.forEach((btn) => {
    const isAll =
      btn.textContent.includes("Todos los cursos") &&
      state.filters.course === "";
    const isCourse =
      state.filters.course !== "" &&
      btn.textContent.includes(state.filters.course);
    if (isAll || isCourse) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function populateTeacherCourseSelectFromMapping() {
  const teacherName = state.user.name;
  elements.courseButtonContainer.innerHTML = "";

  // "All Courses" button
  const btnAll = document.createElement("button");
  btnAll.className = `course-btn ${state.filters.course === "" ? "active" : ""}`;
  btnAll.innerHTML = `<i class="ph ph-squares-four"></i> Todos mis cursos`;
  btnAll.onclick = () => {
    state.filters.course = "";
    updateCourseButtonsState();
    renderRecords();
  };
  elements.courseButtonContainer.appendChild(btnAll);

  if (state.teacherCourseMapping[teacherName]) {
    state.teacherCourseMapping[teacherName].forEach((course) => {
      const btn = document.createElement("button");
      btn.className = `course-btn ${state.filters.course === course ? "active" : ""}`;
      btn.innerHTML = `<i class="ph ph-book-bookmark"></i> ${course}`;
      btn.onclick = () => {
        state.filters.course = course;
        updateCourseButtonsState();
        renderRecords();
      };
      elements.courseButtonContainer.appendChild(btn);
    });
  }
}

function updateCourseButtonsState() {
  const buttons =
    elements.courseButtonContainer.querySelectorAll(".course-btn");
  buttons.forEach((btn) => {
    const isAll =
      btn.textContent.includes("Todos mis cursos") &&
      state.filters.course === "";
    const isCourse =
      state.filters.course !== "" &&
      btn.textContent.includes(state.filters.course);
    if (isAll || isCourse) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// --- Data Operations ---
async function loadData() {
  // Diseño de carga más profesional y centrado
  elements.recordsGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--border); box-shadow: var(--shadow-sm);">
            <div class="spinner" style="width: 48px; height: 48px; border-width: 4px; border-color: rgba(241, 90, 36, 0.1); border-top-color: var(--primary); margin-bottom: 24px;"></div>
            <h3 style="color: var(--secondary); font-size: 20px; margin-bottom: 8px;">Sincronizando con el servidor</h3>
            <p style="color: var(--text-muted); font-size: 15px;" class="loading-dots">Obteniendo los últimos registros y actualizaciones</p>
        </div>
    `;

  try {
    const records = await callApi("getData", {
      email: state.user.name,
      role: state.user.role,
    });
    state.records = records;
    renderRecords();
    updateStats();
  } catch (error) {
    showToast("Error al sincronizar datos", "danger");
    // Limpiar estado de carga en caso de error
    elements.recordsGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
            <i class="ph ph-warning-circle" style="font-size: 48px; color: var(--danger); margin-bottom: 16px; display: block;"></i>
            <p style="color: var(--danger);">Ocurrió un problema al cargar los datos.</p>
        </div>
    `;
  }
}

// --- UI Rendering ---
function renderRecords() {
  updateStats();

  // 1. FILTRADO
  const filtered = state.records.filter((r) => {
    let matchesTeacher = true;
    if (state.user.role === "admin" && state.filters.teacher !== "") {
      const rowDocente = (r.docente || "").toString().trim().toLowerCase();
      const filterDocente = state.filters.teacher
        .toString()
        .trim()
        .toLowerCase();
      matchesTeacher = rowDocente === filterDocente;
    }

    let matchesCourse = true;
    if (state.filters.course !== "") {
      const rowCourse = (r.curso || "").toString().trim().toLowerCase();
      const filterCourse = state.filters.course.toString().trim().toLowerCase();
      matchesCourse =
        rowCourse.includes(filterCourse) || filterCourse.includes(rowCourse);
    }

    let rowStatus = (r.estado || "").toString().trim().toLowerCase();
    if (rowStatus === "") rowStatus = "sin revisar";

    let matchesStatus = true;
    if (state.user.role === "docente") {
      if (
        rowStatus !== "pendiente" &&
        rowStatus !== "completado" &&
        rowStatus !== "enviado"
      ) {
        return false;
      }
      if (state.filters.status !== "") {
        matchesStatus =
          rowStatus === state.filters.status.toString().trim().toLowerCase();
      }
    } else {
      if (state.filters.status !== "") {
        matchesStatus =
          rowStatus === state.filters.status.toString().trim().toLowerCase();
      }
    }

    const searchStr = (state.filters.search || "").toLowerCase();
    const matchesSearch =
      (r.alumno || "").toLowerCase().includes(searchStr) ||
      (r.dni || "").toString().includes(searchStr);

    return matchesTeacher && matchesCourse && matchesStatus && matchesSearch;
  });

  // 2. ORDENAMIENTO (El ID es un timestamp, nos sirve para fechas)
  // Siempre ordenar del más actual al más antiguo (ID Descendente)
  filtered.sort(
    (a, b) => Number(b.id_registro || 0) - Number(a.id_registro || 0),
  );

  // 3. RENDERIZADO
  elements.recordsGrid.innerHTML = "";

  // NUEVO: Verificamos si realmente estamos en el Dashboard antes de mostrar
  const isDashboardActive = elements.navDashboard.classList.contains("active");

  if (filtered.length === 0) {
    if (isDashboardActive) elements.recordsGrid.style.display = "grid";

    elements.recordsGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--border); box-shadow: var(--shadow-sm);">
            <div style="width: 64px; height: 64px; background: rgba(10, 31, 68, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <i class="ph ph-folder-open" style="font-size: 32px; color: var(--secondary);"></i>
            </div>
            <h3 style="color: var(--secondary); font-size: 20px; margin-bottom: 8px;">No hay evidencias para mostrar</h3>
            <p style="color: var(--text-muted); font-size: 15px;">Intenta modificar los filtros de búsqueda o el estado seleccionado.</p>
        </div>
    `;
    updateBatchActionBar();
    return;
  }

  if (state.viewMode === "cards") {
    if (isDashboardActive) elements.recordsGrid.style.display = "grid";
    filtered.forEach((record) => {
      elements.recordsGrid.appendChild(createCardElement(record));
    });
  } else {
    if (isDashboardActive) elements.recordsGrid.style.display = "block";
    elements.recordsGrid.appendChild(createTableElement(filtered));
  }

  updateBatchActionBar();
}

// Sub-función para Cartas
function createCardElement(record) {
  const estadoLabel = record.estado || "Sin revisar";
  const estadoClass = estadoLabel.toLowerCase().replace(" ", "-");

  // Colores dinámicos para los botones de notas
  let bgBtnColor = "var(--secondary)"; // Default Azul
  if (estadoLabel === "Completado") bgBtnColor = "#2ecc71"; // Verde
  if (estadoLabel === "Enviado") bgBtnColor = "#3498db"; // Celeste

  let checkboxHtml = "";
  if (
    state.user.role === "admin" ||
    (state.user.role === "docente" && estadoLabel === "Completado")
  ) {
    checkboxHtml = `<input type="checkbox" class="select-card-checkbox" value="${record.id_registro}" onchange="updateBatchActionBar()">`;
  }

  const card = document.createElement("div");
  card.className = "student-card";
  card.innerHTML = `
        <div class="card-header" style="align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                ${checkboxHtml}
                <span class="status-badge status-${estadoClass}">● ${estadoLabel}</span>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                <button class="btn-icon" onclick="openEditModal('${record.id_registro}')" title="Editar datos" style="padding: 4px; border: none; background: none; color: var(--text-muted); cursor: pointer; height: auto; width: auto;">
                    <i class="ph ph-note-pencil" style="font-size: 20px;"></i>
                </button>
                <span class="small-id" style="font-size: 11px;">#${record.id_registro}</span>
            </div>
        </div>
        <div class="card-body">
            <h3>${record.alumno}</h3>
            <div class="card-info">
                <span><i class="ph ph-identification-card"></i><strong>DNI:</strong> ${record.dni}</span>
                <span><i class="ph ph-calendar"></i><strong>Fecha:</strong> <br>${formatDate(record.fecha_y_hora)}</span>
                <span><i class="ph ph-book-open"></i><strong>Curso:</strong> ${record.curso}</span>
                <span><i class="ph ph-file-text"></i><strong>Actividad:</strong> <span style="color:var(--primary); font-weight:700;">${record.actividad || "Trabajo Final"}</span></span>
                ${state.user.role === "admin" ? `<span><i class="ph ph-user-focus"></i><strong>Docente:</strong> ${record.docente}</span>` : ""}
            </div>
        </div>
        <div class="card-footer" style="margin-top: 10px;">
            ${
              state.user.role === "admin"
                ? ""
                : estadoLabel === "Pendiente"
                  ? `<button class="btn btn-primary btn-full" onclick="openGradingModal('${record.id_registro}')">
                    <i class="ph ph-pencil-line"></i> Calificar Entrega
                </button>`
                  : `<button class="btn btn-full" style="background-color: ${bgBtnColor}; color: white; border: none; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onclick="viewGrade('${record.id_registro}')">
                    <i class="ph ph-seal-check" style="font-size: 18px;"></i> 
                    <span>Nota Final: <strong style="font-size: 16px; margin-left: 4px;">${record.nota}</strong></span>
                </button>`
            }
        </div>
    `;
  return card;
}

// Sub-función para la Tabla
function createTableElement(filteredRecords) {
  const tableContainer = document.createElement("div");
  tableContainer.className = "user-list-card";
  tableContainer.style.padding = "0";

  let rowsHtml = filteredRecords
    .map((record) => {
      const estadoLabel = record.estado || "Sin revisar";
      const estadoClass = estadoLabel.toLowerCase().replace(" ", "-");

      let bgBtnColor = "var(--secondary)";
      if (estadoLabel === "Completado") bgBtnColor = "#2ecc71";
      if (estadoLabel === "Enviado") bgBtnColor = "#3498db";

      let checkboxHtml = "";
      if (
        state.user.role === "admin" ||
        (state.user.role === "docente" && estadoLabel === "Completado")
      ) {
        checkboxHtml = `<input type="checkbox" class="select-card-checkbox" value="${record.id_registro}" onchange="updateBatchActionBar()">`;
      }

      // Diseño del botón (más ancho, centrado y paddings más grandes)
      let actionHtml = `<button class="btn-icon" style="width:40px;height:40px;font-size:20px; margin: 0 auto;" onclick="event.stopPropagation(); openEditModal('${record.id_registro}')"><i class="ph ph-pencil"></i></button>`;

      if (state.user.role === "docente") {
        if (estadoLabel === "Pendiente") {
          actionHtml = `<button class="btn btn-primary" style="padding: 10px 20px; font-size: 14px; margin: 0 auto; width: 100%; max-width: 130px;" onclick="event.stopPropagation(); openGradingModal('${record.id_registro}')"><i class="ph ph-pencil-line"></i> Calificar</button>`;
        } else {
          actionHtml = `<button class="btn" style="background-color: ${bgBtnColor}; color: white; padding: 10px 20px; font-size: 14px; border:none; margin: 0 auto; width: 100%; max-width: 130px;" onclick="event.stopPropagation(); viewGrade('${record.id_registro}')">Nota: <strong style="font-size:16px; margin-left:4px;">${record.nota}</strong></button>`;
        }
      }

      // Lógica de clic sobre toda la fila
      let rowClickAction =
        state.user.role === "admin"
          ? `openEditModal('${record.id_registro}')`
          : estadoLabel === "Pendiente"
            ? `openGradingModal('${record.id_registro}')`
            : `viewGrade('${record.id_registro}')`;

      return `
            <tr class="clickable-row" onclick="if(event.target.tagName !== 'INPUT' && !event.target.closest('button')) { ${rowClickAction} }">
                <td style="width: 40px; text-align:center;" onclick="event.stopPropagation();">${checkboxHtml}</td>
                <td><span class="status-badge status-${estadoClass}" style="font-size:10px; padding: 4px 8px;">${estadoLabel}</span></td>
                <td style="font-size: 13px; color: var(--text-muted);">${formatDate(record.fecha_y_hora)}</td>
                <td style="font-weight: 600;">${record.alumno}</td>
                
                <td>${record.curso}<br><small style="color:var(--primary); font-weight:bold;">${record.actividad || "Trabajo Final"}</small></td>
                
                <td style="text-align:center; font-weight:bold; color:var(--primary); font-size:15px;">${record.nota || "-"}</td>
                <td style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; color: var(--text-muted);">${record.comentario || "-"}</td>
                <td style="text-align: center; vertical-align: middle;">${actionHtml}</td>
            </tr>
        `;
    })
    .join("");

  tableContainer.innerHTML = `
        <div class="table-responsive">
            <table class="user-table">
                <thead>
                    <tr>
                        <th style="width: 40px;"></th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Estudiante</th>
                        <th>Curso</th>
                        <th style="text-align:center;">Nota</th>
                        <th>Comentario</th>
                        <th style="text-align: center;">${state.user.role === "admin" ? "Editar" : "Calificar"}</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;
  return tableContainer;
}

function updateStats() {
  // Filtro base por Docente y Curso para el contexto actual
  const filteredForStats = state.records.filter((r) => {
    let matchesTeacher = true;
    if (state.user.role === "admin" && state.filters.teacher !== "") {
      const rowDocente = (r.docente || "").toString().trim().toLowerCase();
      const filterDocente = state.filters.teacher
        .toString()
        .trim()
        .toLowerCase();
      matchesTeacher = rowDocente === filterDocente;
    }

    let matchesCourse = true;
    if (state.filters.course !== "") {
      const rowCourse = (r.curso || "").toString().trim().toLowerCase();
      const filterCourse = state.filters.course.toString().trim().toLowerCase();
      matchesCourse =
        rowCourse.includes(filterCourse) || filterCourse.includes(rowCourse);
    }

    return matchesTeacher && matchesCourse;
  });

  // 1. ACTUALIZAR NOMBRES DE LOS RECUADROS SEGÚN EL ROL Y FILTRO
  if (state.user.role === "admin") {
    if (state.filters.teacher === "") {
      // Vista global: Todos los docentes
      elements.statPending.previousElementSibling.textContent =
        "Docentes con Cursos Pendientes";
      elements.statCompleted.previousElementSibling.textContent =
        "Docentes con Calificaciones Completadas";
      elements.statTotal.previousElementSibling.textContent =
        "Docentes con Calificaciones Enviadas";
    } else {
      // Vista individual: Un docente específico
      elements.statPending.previousElementSibling.textContent =
        "El Docente tiene aún Registros Pendientes";
      elements.statCompleted.previousElementSibling.textContent =
        "El Docente tiene aún Registros Completados";
      elements.statTotal.previousElementSibling.textContent =
        "El Docente tiene todos los Registros Enviados";
    }
  } else {
    // Vista Docente
    elements.statPending.previousElementSibling.textContent =
      "Alumnos Pendientes de Calificar";
    elements.statCompleted.previousElementSibling.textContent =
      "Alumnos con Revisiones Completadas";
    elements.statTotal.previousElementSibling.textContent =
      "Alumnos con Registros Reportados";
  }

  // 2. LÓGICA DE CONTEO
  let pendingCount = 0;
  let completedCount = 0;
  let totalCount = 0;

  if (state.user.role === "admin") {
    // Agrupar registros por docente (Excluyendo "Sin revisar")
    const teacherStates = {};

    filteredForStats.forEach((r) => {
      const st = (r.estado || "").toString().trim().toLowerCase();
      if (!["pendiente", "completado", "enviado"].includes(st)) return; // Ignorar otros estados

      const t = (r.docente || "").toString().trim();
      if (!t) return;

      if (!teacherStates[t])
        teacherStates[t] = { pendiente: 0, completado: 0, enviado: 0 };
      teacherStates[t][st]++;
    });

    // Evaluar la situación de cada docente
    for (const t in teacherStates) {
      const counts = teacherStates[t];

      if (counts.pendiente > 0) {
        // Si tiene al menos 1 pendiente, entra aquí (incluso si tiene completados o enviados)
        pendingCount++;
      } else if (counts.completado > 0) {
        // Si NO tiene pendientes, pero tiene al menos 1 completado
        completedCount++;
      } else if (counts.enviado > 0) {
        // Si NO tiene pendientes, NO tiene completados, y solo tiene enviados
        totalCount++;
      }
    }
  } else {
    // Lógica para Docentes: Conteo directo de alumnos por cada estado
    const visibleRecords = filteredForStats.filter((r) => {
      const st = (r.estado || "").toString().trim().toLowerCase();
      return ["pendiente", "completado", "enviado"].includes(st);
    });

    pendingCount = visibleRecords.filter(
      (r) => (r.estado || "").toString().trim().toLowerCase() === "pendiente",
    ).length;

    completedCount = visibleRecords.filter(
      (r) => (r.estado || "").toString().trim().toLowerCase() === "completado",
    ).length;

    // CORRECCIÓN: Ahora solo cuenta estrictamente los que tienen estado "Enviado"
    totalCount = visibleRecords.filter(
      (r) => (r.estado || "").toString().trim().toLowerCase() === "enviado",
    ).length;
  }

  // 3. IMPRIMIR VALORES (CON LÓGICA DE "SÍ / NO" PARA ADMIN ESPECÍFICO)
  if (state.user.role === "admin" && state.filters.teacher !== "") {
    elements.statPending.textContent = pendingCount > 0 ? "Sí" : "No";
    elements.statCompleted.textContent = completedCount > 0 ? "Sí" : "No";
    elements.statTotal.textContent = totalCount > 0 ? "Sí" : "No";
  } else {
    elements.statPending.textContent = pendingCount;
    elements.statCompleted.textContent = completedCount;
    elements.statTotal.textContent = totalCount;
  }

  // Actualizar gráficos
  updateChart(filteredForStats);
}

let chartInstance = null;

function updateChart(records) {
  const ctx = elements.dashboardChart.getContext("2d");

  // Define states we care about
  const states = ["Sin revisar", "Pendiente", "Completado", "Enviado"];
  const stateColors = {
    "Sin revisar": "rgba(108, 117, 125, 0.7)",
    Pendiente: "rgba(241, 90, 36, 0.7)",
    Completado: "rgba(46, 204, 113, 0.7)",
    Enviado: "rgba(52, 152, 219, 0.7)",
  };

  let labels = [];
  let datasets = [];

  const role = state.user.role;
  const filterCourse = state.filters.course;
  const filterTeacher = state.filters.teacher;

  if (role === "admin") {
    if (!filterTeacher) {
      // "Todos los docentes" -> X: Teachers, Y: 4 States
      const teachers = [
        ...new Set(records.map((r) => r.docente || "Desconocido")),
      ].sort();
      labels = teachers;
      datasets = states.map((st) => ({
        label: st,
        backgroundColor: stateColors[st],
        data: teachers.map(
          (t) =>
            records.filter(
              (r) =>
                (r.docente || "Desconocido") === t &&
                (r.estado || "Sin revisar").toLowerCase() === st.toLowerCase(),
            ).length,
        ),
      }));
    } else if (!filterCourse) {
      // Specific teacher, "Todos los cursos" -> X: Courses, Y: 4 States
      const courses = [
        ...new Set(records.map((r) => r.curso || "Sin curso")),
      ].sort();
      labels = courses;
      datasets = states.map((st) => ({
        label: st,
        backgroundColor: stateColors[st],
        data: courses.map(
          (c) =>
            records.filter(
              (r) =>
                (r.curso || "Sin curso") === c &&
                (r.estado || "Sin revisar").toLowerCase() === st.toLowerCase(),
            ).length,
        ),
      }));
    } else {
      // Specific teacher, specific course -> X: 4 states, Y: count
      labels = states;
      datasets = [
        {
          label: "Registros",
          backgroundColor: states.map((st) => stateColors[st]),
          data: states.map(
            (st) =>
              records.filter(
                (r) =>
                  (r.estado || "Sin revisar").toLowerCase() ===
                  st.toLowerCase(),
              ).length,
          ),
        },
      ];
    }
  } else {
    // Docente view -> Don't show "Sin revisar"
    const docStates = ["Pendiente", "Completado", "Enviado"];

    if (!filterCourse) {
      // "Todos mis cursos" -> X: Courses, Y: 3 States
      const courses = [
        ...new Set(records.map((r) => r.curso || "Sin curso")),
      ].sort();
      labels = courses;
      datasets = docStates.map((st) => ({
        label: st,
        backgroundColor: stateColors[st],
        data: courses.map(
          (c) =>
            records.filter(
              (r) =>
                (r.curso || "Sin curso") === c &&
                (r.estado || "Sin revisar").toLowerCase() === st.toLowerCase(),
            ).length,
        ),
      }));
    } else {
      // Specific course -> X: 3 states, Y: count
      labels = docStates;
      datasets = [
        {
          label: "Registros",
          backgroundColor: docStates.map((st) => stateColors[st]),
          data: docStates.map(
            (st) =>
              records.filter(
                (r) =>
                  (r.estado || "Sin revisar").toLowerCase() ===
                  st.toLowerCase(),
              ).length,
          ),
        },
      ];
    }
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: false,
          grid: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
      },
      plugins: {
        legend: {
          display: datasets.length > 1, // Hide legend if X axis is the states itself
          position: "bottom",
        },
      },
    },
  });
}

// --- Modals & Actions ---

function openGradingModal(id) {
  const record = state.records.find(
    (r) => r.id_registro.toString() === id.toString(),
  );
  if (!record) return;

  document.getElementById("modalStudentName").textContent = record.alumno;
  document.getElementById("modalStudentDni").textContent = `DNI: ${record.dni}`;
  document.getElementById("modalFileLink").href = record.archivo_adjunto;
  document.getElementById("gradeInput").value = "";
  document.getElementById("commentInput").value = "";

  elements.gradingModal.classList.add("active");
  document.getElementById("btnSaveGrade").onclick = () => saveGrade(id);
}

function openEditModal(id) {
  const record = state.records.find(
    (r) => r.id_registro.toString() === id.toString(),
  );
  if (!record) return;

  document.getElementById("editAlumno").value = record.alumno;
  document.getElementById("editDni").value = record.dni;
  elements.editEstado.value = record.estado || "Pendiente";

  if (state.user.role === "admin") {
    elements.infoDocente.textContent = record.docente;
    elements.infoCurso.textContent = record.curso;
    elements.editFileLink.href = record.archivo_adjunto;
  }

  if (state.user.role === "docente") {
    elements.editNota.value = record.nota || "";
    elements.editComentario.value = record.comentario || "";
  }

  elements.editStudentModal.classList.add("active");
  elements.btnSaveEdit.onclick = () => saveStudentEdit(id);
}

async function saveStudentEdit(id) {
  const record = state.records.find(
    (r) => r.id_registro.toString() === id.toString(),
  );

  const updateData = {
    alumno: document.getElementById("editAlumno").value, // Nombre unificado
    dni: document.getElementById("editDni").value,
    estado: elements.editEstado.value,
    docente: record.docente,
    curso: record.curso,
    nota: state.user.role === "docente" ? elements.editNota.value : record.nota,
    comentario:
      state.user.role === "docente"
        ? elements.editComentario.value
        : record.comentario,
  };

  if (!updateData.alumno || !updateData.dni) {
    showToast("El nombre y DNI son obligatorios", "warning");
    return;
  }

  elements.btnSaveEdit.disabled = true;
  elements.btnSaveEdit.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div>
        <span style="margin-left:8px;" class="loading-dots">Guardando</span>
    `;

  try {
    const res = await callApi("updateStudentData", { id, updateData });
    if (res.success) {
      showToast("Registro actualizado correctamente", "success");
      elements.editStudentModal.classList.remove("active");
      loadData();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al actualizar datos", "danger");
  } finally {
    elements.btnSaveEdit.disabled = false;
    elements.btnSaveEdit.innerHTML =
      '<i class="ph ph-floppy-disk"></i> Guardar Cambios';
  }
}

function closeModal() {
  elements.gradingModal.classList.remove("active");
  elements.editStudentModal.classList.remove("active");
  elements.userModal.classList.remove("active");
}

// --- Batch Actions ---
function updateBatchActionBar() {
  const allCheckboxes = document.querySelectorAll(".select-card-checkbox");
  const checkedBoxes = Array.from(allCheckboxes).filter((cb) => cb.checked);
  const count = checkedBoxes.length;

  // Pintar las cartas o filas seleccionadas dependiendo del modo de vista
  allCheckboxes.forEach((cb) => {
    const card = cb.closest(".student-card"); // Busca carta (Modo Cartas)
    const row = cb.closest(".clickable-row"); // Busca fila (Modo Tabla)

    if (cb.checked) {
      if (card) card.classList.add("selected-card");
      if (row) row.classList.add("selected-row");
    } else {
      if (card) card.classList.remove("selected-card");
      if (row) row.classList.remove("selected-row");
    }
  });

  // Mostrar u ocultar la barra flotante inferior
  if (count > 0) {
    const countSpan = document.getElementById("batchCountText");
    const actionIcon = document.getElementById("batchActionIcon");
    const actionText = document.getElementById("batchActionText");

    if (countSpan)
      countSpan.textContent = `${count} registro${count > 1 ? "s" : ""} seleccionado${count > 1 ? "s" : ""}`;

    if (state.user.role === "admin") {
      if (actionIcon) actionIcon.className = "ph ph-list-checks";
      if (actionText) actionText.textContent = "Marcar como Pendiente";
      elements.btnBatchAction.onclick = markSelectedAsPending;
    } else {
      if (actionIcon) actionIcon.className = "ph ph-paper-plane-tilt";
      if (actionText) actionText.textContent = "Enviar Reporte";
      elements.btnBatchAction.onclick = sendTeacherReport;
    }
    elements.batchActionBar.style.display = "flex";
  } else {
    elements.batchActionBar.style.display = "none";
  }

  // Manejar visibilidad y texto del botón "Seleccionar Todo" superior
  const btnSelectAll = document.getElementById("btnSelectAll");
  const spanSelectAll = document.getElementById("selectAllText");
  const isDashboardActive = elements.navDashboard.classList.contains("active");

  if (allCheckboxes.length > 0 && isDashboardActive) {
    btnSelectAll.style.display = "flex";
    if (count === allCheckboxes.length) {
      spanSelectAll.textContent = "Deseleccionar Todo";
    } else {
      spanSelectAll.textContent = "Seleccionar Todo";
    }
  } else {
    btnSelectAll.style.display = "none";
  }
}

function toggleSelectAll() {
  const checkboxes = document.querySelectorAll(".select-card-checkbox");
  if (checkboxes.length === 0) return;

  // Evaluamos si todos están marcados para saber si debemos marcar o desmarcar
  const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
  checkboxes.forEach((cb) => {
    cb.checked = !allChecked;
  });

  updateBatchActionBar(); // Esto disparará los colores y contadores
}

async function markSelectedAsPending() {
  const checkboxes = document.querySelectorAll(".select-card-checkbox:checked");
  const ids = Array.from(checkboxes).map((cb) => cb.value);

  if (ids.length === 0) return;

  const confirmed = await showConfirm(
    `¿Estás seguro de marcar ${ids.length} registro(s) como Pendiente?`,
  );
  if (!confirmed) return;

  const btn = elements.batchActionBar.querySelector(".btn-primary");
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div>
        <span style="margin-left:8px;" class="loading-dots">Actualizando</span>
    `;

  try {
    const res = await callApi("batchUpdateState", {
      ids: ids,
      newState: "Pendiente",
    });
    if (res.success) {
      showToast(
        `${ids.length} registro(s) actualizado(s) correctamente`,
        "success",
      );
      elements.batchActionBar.style.display = "none";
      loadData();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al procesar actualización masiva", "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

async function saveGrade(id) {
  const grade = document.getElementById("gradeInput").value;
  const comment = document.getElementById("commentInput").value;

  if (!grade || grade < 0 || grade > 20) {
    showToast("Ingresa una nota válida (0-20)", "warning");
    return;
  }

  const saveBtn = document.getElementById("btnSaveGrade");
  saveBtn.disabled = true;
  saveBtn.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div>
        <span style="margin-left:8px;" class="loading-dots">Guardando</span>
    `;

  try {
    const res = await callApi("updateRecord", {
      id,
      updateData: { nota: grade, comentario: comment },
    });
    if (res.success) {
      showToast("Calificación guardada con éxito", "success");
      closeModal();
      loadData();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al procesar la calificación", "danger");
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML =
      '<i class="ph ph-floppy-disk"></i> Guardar Calificación';
  }
}

async function sendTeacherReport() {
  const checkboxes = document.querySelectorAll(".select-card-checkbox:checked");
  const ids = Array.from(checkboxes).map((cb) => cb.value);

  if (ids.length === 0) return;

  const confirmed = await showConfirm(
    `¿Estás seguro de enviar el reporte por correo de ${ids.length} estudiante(s)? Los estudiantes pasarán a estado "Enviado".`,
  );
  if (!confirmed) return;

  const originalHtml = elements.btnBatchAction.innerHTML;
  elements.btnBatchAction.disabled = true;
  elements.btnBatchAction.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div>
        <span style="margin-left:8px;" class="loading-dots">Enviando</span>
    `;

  try {
    const res = await callApi("sendTeacherReportBatch", {
      ids: ids,
      docenteNombre: state.user.name,
    });
    if (res.success) {
      showToast(res.message, "success");
      elements.batchActionBar.style.display = "none";
      loadData();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al enviar el reporte", "danger");
  } finally {
    elements.btnBatchAction.disabled = false;
    elements.btnBatchAction.innerHTML = originalHtml;
  }
}

function viewGrade(id) {
  const record = state.records.find(
    (r) => r.id_registro.toString() === id.toString(),
  );
  if (!record) return;
  showToast(
    `Calificación: ${record.nota} | ${record.comentario || "Sin observaciones"}`,
    "success",
  );
}

// --- User Management Logic ---

/**
 * Vista del Dashboard Principal
 * Restaura la visualización de estadísticas, gráficos y registros
 */
function showDashboardView() {
  elements.navDashboard.classList.add("active");
  elements.navUsers.classList.remove("active");
  elements.userManagementView.style.display = "none";

  // Restaurar títulos y controles de búsqueda
  document.getElementById("pageTitle").textContent = "Entregas de Alumnos";
  document.getElementById("pageSubtitle").textContent =
    "Gestiona y califica las evidencias recibidas";

  // Mostrar elementos del dashboard
  elements.statsBar.style.display = "grid";
  elements.chartContainer.style.display = "block";
  elements.recordsGrid.style.display = "grid";
  elements.searchInput.parentElement.style.display = "flex";
  elements.btnToggleView.style.display = "flex";

  if (state.user.role === "admin") {
    elements.adminFiltersSection.style.display = "block";
    elements.btnRemindTeacher.style.display = "flex";
    updateRemindButtonText();
  }

  // Si estamos en modo tabla, asegurar que el display sea correcto
  if (state.viewMode === "table") {
    elements.recordsGrid.style.display = "block";
  }

  renderRecords();
}

function showDashboard() {
  elements.loginOverlay.style.display = "none";
  elements.appContainer.style.display = "grid";
  document.body.className = `role-${state.user.role}`;
  elements.userName.textContent = state.user.name;
  elements.userRole.textContent =
    state.user.role === "admin" ? "Administrador" : "Docente";

  if (state.user.role === "admin") {
    state.filters.status = "Sin revisar";
    elements.adminStatusSelect.value = "Sin revisar";

    // CORRECCIÓN: Forzamos la visibilidad del botón y la actualización de su texto
    // apenas el administrador se loguea o recarga la página.
    elements.btnRemindTeacher.style.display = "flex";
    updateRemindButtonText();
  } else {
    state.filters.status = "Pendiente";
    elements.statusSelect.value = "Pendiente";
  }

  loadMappingData();
  loadData();
}

function showUserManagementView() {
  elements.navDashboard.classList.remove("active");
  elements.navUsers.classList.add("active");
  elements.userManagementView.style.display = "block";

  // Set users titles
  document.getElementById("pageTitle").textContent = "Gestión de Usuarios";
  document.getElementById("pageSubtitle").textContent =
    "Administra los accesos y roles del sistema";

  // Hide dashboard elements
  elements.statsBar.style.display = "none";
  elements.chartContainer.style.display = "none";
  elements.recordsGrid.style.display = "none";
  elements.adminFiltersSection.style.display = "none";
  elements.searchInput.parentElement.style.display = "none";
  elements.btnToggleView.style.display = "none";
  document.getElementById("btnSelectAll").style.display = "none";
  elements.batchActionBar.style.display = "none";
  elements.btnRemindTeacher.style.display = "none";

  // Limpiar selecciones previas
  document
    .querySelectorAll(".select-card-checkbox")
    .forEach((cb) => (cb.checked = false));
  const masterUserCb = document.getElementById("selectAllUsersCheckbox");
  if (masterUserCb) masterUserCb.checked = false;

  renderUserTable();
}

function renderUserTable() {
  const search = elements.userSearchInput.value.toLowerCase();
  const filtered = state.userList.filter(
    (u) =>
      u.name.toLowerCase().includes(search) ||
      (u.correo && u.correo.toLowerCase().includes(search)),
  );

  elements.userTableBody.innerHTML = "";
  filtered.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;">
        <input type="checkbox" class="select-user-checkbox" value="${u.name}" onchange="updateUserBatchActionBar()">
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="user-avatar" style="width: 32px; height: 32px; font-size: 14px;">${u.name.charAt(0)}</div>
          <span style="font-weight: 600;">${u.name}</span>
        </div>
      </td>
      <td><span class="user-badge badge-${u.role}">${u.role}</span></td>
      <td style="color: var(--text-muted); font-size: 13px;">${u.correo || "---"}</td>
      <td style="text-align: right;">
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn-icon" style="width: 32px; height: 32px; font-size: 16px;" onclick="sendUserCredentials('${u.name}')" title="Enviar credenciales por correo">
            <i class="ph ph-paper-plane-tilt"></i>
          </button>
          <button class="btn-icon" style="width: 32px; height: 32px; font-size: 16px;" onclick="openUserModal('${u.name}')">
            <i class="ph ph-pencil"></i>
          </button>
          <button class="btn-icon" style="width: 32px; height: 32px; font-size: 16px; color: var(--danger);" onclick="deleteUser('${u.name}')">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      </td>
    `;
    elements.userTableBody.appendChild(tr);
  });
}

function openUserModal(name = null) {
  if (name) {
    const user = state.userList.find((u) => u.name === name);
    elements.userModalTitle.textContent = "Editar Usuario";
    elements.oldUserName.value = user.name;
    elements.userNameInput.value = user.name;
    elements.userPasswordInput.value = user.password || "";
    elements.userRoleInput.value = user.role;
    elements.userEmailInput.value = user.correo || "";
  } else {
    elements.userModalTitle.textContent = "Nuevo Usuario";
    elements.oldUserName.value = "";
    elements.userNameInput.value = "";
    elements.userPasswordInput.value = "";
    elements.userRoleInput.value = "docente";
    elements.userEmailInput.value = "";
  }
  elements.userModal.classList.add("active");
}

async function handleSaveUser() {
  const userData = {
    oldName: elements.oldUserName.value,
    name: elements.userNameInput.value.trim(),
    password: elements.userPasswordInput.value.trim(),
    role: elements.userRoleInput.value,
    correo: elements.userEmailInput.value.trim(),
  };

  if (!userData.name || !userData.password) {
    showToast("Nombre y contraseña son obligatorios", "warning");
    return;
  }

  elements.btnSaveUser.disabled = true;
  elements.btnSaveUser.innerHTML =
    '<div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div><span style="margin-left:8px;" class="loading-dots">Guardando</span>';

  try {
    const res = await callApi("saveUser", userData);
    if (res.success) {
      showToast(res.message, "success");
      elements.userModal.classList.remove("active");
      await fetchUserList();
      renderUserTable();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al procesar usuario", "danger");
  } finally {
    elements.btnSaveUser.disabled = false;
    elements.btnSaveUser.innerHTML =
      '<i class="ph ph-floppy-disk"></i> Guardar Usuario';
  }
}

async function deleteUser(name) {
  const confirmed = await showConfirm(
    `¿Estás seguro de eliminar al usuario "${name}"?`,
  );
  if (!confirmed) return;

  try {
    const res = await callApi("deleteUser", { name });
    if (res.success) {
      showToast(res.message, "success");
      await fetchUserList();
      renderUserTable();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al eliminar usuario", "danger");
  }
}

async function sendUserCredentials(name) {
  const confirmed = await showConfirm(
    `¿Estás seguro de enviar las credenciales de acceso al correo del usuario "${name}"?`,
  );
  if (!confirmed) return;

  showToast(`Enviando credenciales a ${name}...`);

  try {
    const res = await callApi("sendUserCredentials", { name });
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al enviar credenciales", "danger");
  }
}

function toggleSelectAllUsers() {
  const masterCheckbox = document.getElementById("selectAllUsersCheckbox");
  if (!masterCheckbox) return;
  const isChecked = masterCheckbox.checked;
  const checkboxes = document.querySelectorAll(".select-user-checkbox");
  checkboxes.forEach((cb) => {
    cb.checked = isChecked;
  });
  updateUserBatchActionBar();
}

function updateUserBatchActionBar() {
  const allCheckboxes = document.querySelectorAll(".select-user-checkbox");
  const checkedBoxes = Array.from(allCheckboxes).filter((cb) => cb.checked);
  const count = checkedBoxes.length;

  const masterCheckbox = document.getElementById("selectAllUsersCheckbox");
  if (masterCheckbox && allCheckboxes.length > 0) {
    masterCheckbox.checked = count === allCheckboxes.length;
  }

  if (count > 0) {
    const countSpan = document.getElementById("batchCountText");
    const actionIcon = document.getElementById("batchActionIcon");
    const actionText = document.getElementById("batchActionText");

    if (countSpan)
      countSpan.textContent = `${count} usuario${count > 1 ? "s" : ""} seleccionado${count > 1 ? "s" : ""}`;

    if (actionIcon) actionIcon.className = "ph ph-paper-plane-tilt";
    if (actionText) actionText.textContent = "Enviar Credenciales";

    elements.btnBatchAction.onclick = sendUserCredentialsBatch;
    elements.batchActionBar.style.display = "flex";
  } else {
    elements.batchActionBar.style.display = "none";
  }
}

async function sendUserCredentialsBatch() {
  const checkboxes = document.querySelectorAll(".select-user-checkbox:checked");
  const names = Array.from(checkboxes).map((cb) => cb.value);

  if (names.length === 0) return;

  const confirmed = await showConfirm(
    `¿Estás seguro de enviar credenciales de acceso a ${names.length} usuario(s)?`,
  );
  if (!confirmed) return;

  const originalHtml = elements.btnBatchAction.innerHTML;
  elements.btnBatchAction.disabled = true;
  elements.btnBatchAction.innerHTML = `
        <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle;"></div>
        <span style="margin-left:8px;" class="loading-dots">Enviando</span>
    `;

  try {
    const res = await callApi("sendUserCredentialsBatch", { names: names });
    if (res.success) {
      showToast(res.message, "success");
      // Desmarcar todo
      checkboxes.forEach((cb) => (cb.checked = false));
      document.getElementById("selectAllUsersCheckbox").checked = false;
      updateUserBatchActionBar();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al enviar credenciales", "danger");
  } finally {
    elements.btnBatchAction.disabled = false;
    elements.btnBatchAction.innerHTML = originalHtml;
  }
}

// --- Toast System ---
function showToast(message, type = "info") {
  elements.toastMessage.textContent = message;
  elements.toast.className = `toast active toast-${type}`;
  setTimeout(() => {
    elements.toast.classList.remove("active");
  }, 4000);
}

// --- Helpers ---
function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // fallback
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Oct",
      "Nov",
      "Dic",
    ];
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${day}.${month}.${year}<br>${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return dateString;
  }
}

// --- Lógica de Notificaciones a Docentes ---
function updateRemindButtonText() {
  const span = document.getElementById("remindTeacherText");
  if (!span) return;
  if (state.filters.teacher === "") {
    span.textContent = "Notificar a Todos";
  } else {
    span.textContent = "Notificar Docente";
  }
}

async function handleSendReminders() {
  const targetTeacher = state.filters.teacher;

  // 1. Identificar destinatarios
  const pendingRecords = state.records.filter(
    (r) => (r.estado || "").toLowerCase() === "pendiente",
  );

  let recipients = [];
  if (targetTeacher) {
    const user = state.userList.find(
      (u) => u.name.toLowerCase() === targetTeacher.toLowerCase(),
    );
    if (user && user.correo) {
      recipients.push({ name: targetTeacher, email: user.correo });
    }
  } else {
    const teacherNames = [...new Set(pendingRecords.map((r) => r.docente))];
    recipients = teacherNames
      .map((name) => {
        const user = state.userList.find(
          (u) => u.name.toLowerCase() === name.toLowerCase(),
        );
        return { name, email: user ? user.correo : null };
      })
      .filter((t) => t.email);
  }

  if (recipients.length === 0) {
    showToast("No hay docentes con pendientes y correo válido.", "warning");
    return;
  }

  // 2. Construir mensaje de confirmación con lista de correos
  const emailListHtml = recipients
    .map((r) => `<br>• ${r.name} (${r.email})`)
    .join("");

  const msg = targetTeacher
    ? `¿Enviar recordatorio al docente "${targetTeacher}"? <br><small>${recipients[0].email}</small>`
    : `¿Enviar recordatorios a los siguientes docentes?<br><div style="text-align:left; font-size:13px; margin-top:10px; max-height:150px; overflow-y:auto; background:#f8f9fa; padding:10px; border-radius:8px;">${emailListHtml}</div>`;

  // Usamos un modal más grande o inyectamos el HTML en el mensaje
  elements.confirmMessage.innerHTML = msg;
  elements.confirmModal.classList.add("active");

  const confirmed = await new Promise((resolve) => {
    const onAccept = () => {
      elements.confirmModal.classList.remove("active");
      resolve(true);
    };
    const onCancel = () => {
      elements.confirmModal.classList.remove("active");
      resolve(false);
    };
    elements.btnAcceptConfirm.onclick = onAccept;
    elements.btnCancelConfirm.onclick = onCancel;
  });

  if (!confirmed) return;

  const originalHtml = elements.btnRemindTeacher.innerHTML;
  elements.btnRemindTeacher.disabled = true;
  elements.btnRemindTeacher.innerHTML = `
    <div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle; border-top-color: var(--primary);"></div>
    <span style="margin-left:8px;" class="loading-dots">Enviando</span>
  `;

  try {
    const res = await callApi("sendReminders", { targetTeacher });
    if (res.success) {
      showToast(res.message, "success");
    } else {
      showToast(res.message, "warning");
    }
  } catch (error) {
    showToast("Error al enviar recordatorios", "danger");
  } finally {
    elements.btnRemindTeacher.disabled = false;
    elements.btnRemindTeacher.innerHTML = originalHtml;
    // Forzamos la actualización del texto después de restaurar el HTML
    updateRemindButtonText();
  }
}

async function handleSyncUsers() {
  const confirmed = await showConfirm(
    "¿Deseas sincronizar la lista de docentes desde Parafelix? Se añadirán nuevos docentes y se actualizarán correos existentes (sin afectar contraseñas).",
  );
  if (!confirmed) return;

  const btn = elements.btnSyncUsers;
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;margin:0;display:inline-block;vertical-align:middle; border-top-color: var(--primary);"></div> <span style="margin-left:8px;" class="loading-dots">Sincronizando</span>`;

  try {
    const res = await callApi("syncUsers");
    if (res.success) {
      showToast(res.message, "success");
      await fetchUserList();
      renderUserTable();
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al sincronizar usuarios", "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

window.onload = init;
