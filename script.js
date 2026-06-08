// ==========================================
// 1. Configuration and Global State
// ==========================================
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
    actividad: "", // NUEVO FILTRO
  },
  viewMode: "table",
  reportEvidences: {
    informacion: [],
    sesion1: [],
    sesion2: [],
    entrega: [],
  },
  currentEvidenceCategory: null,
  informes: [], // Nueva lista de informes generados
  signatureMode: "draw", // 'draw' o 'upload'
  uploadedSignature: null, // Base64 de la imagen subida
};

let signaturePad = null;
let chartInstance = null;

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
  confirmTitle: document.getElementById("confirmTitle"),
  btnAcceptConfirmText: document.getElementById("btnAcceptConfirmText"),
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
  // New Reports Elements
  navReports: document.getElementById("navReports"),
  reportsView: document.getElementById("reportsView"),
  reportModal: document.getElementById("reportModal"),
  modalReportCourse: document.getElementById("modalReportCourse"),
  reportCourseInput: document.getElementById("reportCourseInput"),
  reportDniInput: document.getElementById("reportDniInput"),
  reportDate1Input: document.getElementById("reportDate1Input"),
  reportDate2Input: document.getElementById("reportDate2Input"),
  reportModalTitle: document.getElementById("reportModalTitle"),
  evidenceFileInput: document.getElementById("evidenceFileInput"),
  btnClearSignature: document.getElementById("btnClearSignature"),
  btnGenerateReportSubmit: document.getElementById("btnGenerateReportSubmit"),
  docenteSidebarSection: document.getElementById("docenteSidebarSection"),
  activityFilterContainer: document.getElementById("activityFilterContainer"),
  evidenceModal: document.getElementById("evidenceModal"),
  evidenceModalTitle: document.getElementById("evidenceModalTitle"),
  evidencePasteArea: document.getElementById("evidencePasteArea"),
  evidencePreviewGrid: document.getElementById("evidencePreviewGrid"),
  btnEvidenciaInformacion: document.getElementById("btnEvidenciaInformacion"),
  btnEvidenciaSesion1: document.getElementById("btnEvidenciaSesion1"),
  btnEvidenciaSesion2: document.getElementById("btnEvidenciaSesion2"),
  btnEvidenciaEntrega: document.getElementById("btnEvidenciaEntrega"),
  badgeInformacion: document.getElementById("badge-informacion"),
  badgeSesion1: document.getElementById("badge-sesion1"),
  badgeSesion2: document.getElementById("badge-sesion2"),
  badgeEntrega: document.getElementById("badge-entrega"),
  // Loading Overlay
  loadingOverlay: document.getElementById("loadingOverlay"),
  progressBar: document.getElementById("progressBar"),
  progressText: document.getElementById("progressText"),
  loadingTitle: document.getElementById("loadingTitle"),
  loadingSubtitle: document.getElementById("loadingSubtitle"),
  // New Signature Elements
  btnModeDraw: document.getElementById("btnModeDraw"),
  btnModeUpload: document.getElementById("btnModeUpload"),
  containerSignatureDraw: document.getElementById("containerSignatureDraw"),
  containerSignatureUpload: document.getElementById("containerSignatureUpload"),
  signatureFileInput: document.getElementById("signatureFileInput"),
  signaturePreview: document.getElementById("signaturePreview"),
  signatureUploadPlaceholder: document.getElementById(
    "signatureUploadPlaceholder",
  ),
  signatureHelpText: document.getElementById("signatureHelpText"),
};

// ==========================================
// 2. Classes
// ==========================================
class SimpleSignaturePad {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.hasSignature = false;
    this.points = []; // Para almacenar los puntos y suavizar la curva

    this.setupListeners();
  }

  refreshCtxSettings() {
    this.ctx.lineWidth = 1.5; // Un poco más grueso ayuda a la nitidez
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = "#0A1F44";

    // Antialiasing forzado por navegador (esto ayuda un poco)
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
  }

  setupListeners() {
    const startDrawing = (e) => {
      this.isDrawing = true;
      this.hasSignature = true;
      this.points = []; // Reiniciar puntos
      const pos = this.getPos(e);
      this.points.push(pos);
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      e.preventDefault();
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      const pos = this.getPos(e);
      this.points.push(pos);

      if (this.points.length > 2) {
        // Lógica de suavizado: Calculamos el punto medio entre los dos últimos puntos
        // para crear una curva Bézier cuadrática
        const lastTwoPoints = this.points.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = {
          x: (controlPoint.x + pos.x) / 2,
          y: (controlPoint.y + pos.y) / 2,
        };

        this.ctx.quadraticCurveTo(
          controlPoint.x,
          controlPoint.y,
          endPoint.x,
          endPoint.y,
        );
        this.ctx.stroke();
      }
      e.preventDefault();
    };

    const stopDrawing = () => {
      if (this.isDrawing) {
        this.isDrawing = false;
        this.points = [];
      }
    };

    this.canvas.addEventListener("mousedown", startDrawing);
    this.canvas.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", stopDrawing);

    this.canvas.addEventListener("touchstart", startDrawing, {
      passive: false,
    });
    this.canvas.addEventListener("touchmove", draw, { passive: false });
    this.canvas.addEventListener("touchend", stopDrawing);
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();

    // --- SUPER-SAMPLING ---
    // Forzamos una resolución de x4 para que los pixeles sean invisibles
    // Independientemente de si la pantalla es Retina o no.
    const qualityMultiplier = 4;

    const width = rect.width || 460;
    const height = rect.height || 250;

    // Resolución interna (Muchos más pixeles para nitidez extrema)
    this.canvas.width = width * qualityMultiplier;
    this.canvas.height = height * qualityMultiplier;

    // Tamaño visual (Se mantiene igual en el modal)
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    // Escalar el contexto para que el dibujo coincida con el tamaño visual
    this.ctx.scale(qualityMultiplier, qualityMultiplier);
    this.refreshCtxSettings();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.hasSignature = false;
  }

  isEmpty() {
    return !this.hasSignature;
  }

  toDataURL() {
    // Al exportar, la imagen será de alta resolución,
    // pero el backend de Google Docs la ajustará a los 300px definidos.
    return this.canvas.toDataURL("image/png");
  }
}

// ==========================================
// 3. Initialization
// ==========================================
function init() {
  // Inicializar Firma
  if (!signaturePad) {
    signaturePad = new SimpleSignaturePad("signaturePad");
  }

  if (elements.btnClearSignature) {
    elements.btnClearSignature.onclick = () => signaturePad.clear();
  }

  // Listener para carga de archivos de evidencia
  if (elements.evidenceFileInput) {
    elements.evidenceFileInput.addEventListener("change", function (e) {
      if (!state.currentEvidenceCategory) return;
      handleEvidenceFiles(e.target.files);
      e.target.value = "";
    });
  }

  // Soporte Drag & Drop para Evidencias
  if (elements.evidencePasteArea) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      elements.evidencePasteArea.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false,
      );
    });

    elements.evidencePasteArea.addEventListener("dragover", () => {
      elements.evidencePasteArea.style.borderColor = "var(--primary)";
      elements.evidencePasteArea.style.background = "var(--white)";
    });

    elements.evidencePasteArea.addEventListener("dragleave", () => {
      elements.evidencePasteArea.style.borderColor = "var(--border)";
      elements.evidencePasteArea.style.background = "var(--gray-light)";
    });

    elements.evidencePasteArea.addEventListener("drop", (e) => {
      elements.evidencePasteArea.style.borderColor = "var(--border)";
      elements.evidencePasteArea.style.background = "var(--gray-light)";
      if (!state.currentEvidenceCategory) return;
      handleEvidenceFiles(e.dataTransfer.files);
    });
  }

  // Soporte Drag & Drop para Firma
  if (elements.containerSignatureUpload) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      elements.containerSignatureUpload.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false,
      );
    });

    elements.containerSignatureUpload.addEventListener("dragover", () => {
      elements.containerSignatureUpload.style.borderColor = "var(--primary)";
      elements.containerSignatureUpload.style.background = "var(--white)";
    });

    elements.containerSignatureUpload.addEventListener("dragleave", () => {
      elements.containerSignatureUpload.style.borderColor = "var(--border)";
      elements.containerSignatureUpload.style.background = "var(--gray-light)";
    });

    elements.containerSignatureUpload.addEventListener("drop", (e) => {
      elements.containerSignatureUpload.style.borderColor = "var(--border)";
      elements.containerSignatureUpload.style.background = "var(--gray-light)";
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processSignatureFile(files[0]);
      }
    });
  }

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

  // TIMEOUT EXACTO: 3.5 segundos (3500 ms)
  setTimeout(() => {
    if (splash) {
      splash.classList.add("hidden");
      // Se elimina permanentemente del DOM tras la transición para evitar el bug visual
      setTimeout(() => splash.remove(), 500);

      // Deshabilitar botones de navegación por 2 segundos tras aparecer interfaz
      const navLinks = document.querySelectorAll(".nav-link");
      navLinks.forEach((link) => {
        link.style.pointerEvents = "none";
        link.style.opacity = "0.6";
      });
      setTimeout(() => {
        navLinks.forEach((link) => {
          link.style.pointerEvents = "";
          link.style.opacity = "";
        });
      }, 2000);
    }
  }, 3500);

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

    // NUEVO: Decidir si recargar Panel o Vista de Informes
    if (elements.navReports.classList.contains("active")) {
      renderReportsView();
    } else {
      renderRecords();
    }
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
      // Forzamos a true para que limpie la caché de Parafelix si el usuario lo pide manual
      syncDashboardData(true);
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
  if (elements.navReports) {
    elements.navReports.addEventListener("click", (e) => {
      e.preventDefault();
      showReportsView();
    });
  }

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

// ==========================================
// 4. UI Core & Renderizado
// ==========================================
// --- Renderizado de Registros y Tablas ---
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

    // NUEVO: Filtro por Actividad
    let matchesActividad = true;
    if (state.filters.actividad !== "") {
      const rowActividad = (r.actividad || "Trabajo Final")
        .toString()
        .trim()
        .toLowerCase();
      const filterActividad = state.filters.actividad
        .toString()
        .trim()
        .toLowerCase();
      matchesActividad = rowActividad === filterActividad;
    }

    return (
      matchesTeacher &&
      matchesCourse &&
      matchesStatus &&
      matchesSearch &&
      matchesActividad
    );
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

function createCardElement(record) {
  const estadoLabel = record.estado || "Sin revisar";
  const estadoClass = estadoLabel.toLowerCase().replace(" ", "-");

  // Colores dinámicos para los botones de notas
  let bgBtnColor = "var(--secondary)"; // Default Azul
  if (estadoLabel === "Completado") bgBtnColor = "#2ecc71"; // Verde
  if (estadoLabel === "Enviado") bgBtnColor = "#3498db"; // Celeste

  // CORRECCIÓN: Lógica estricta de visibilidad de checkboxes
  let checkboxHtml = "";
  let showCheckbox = false;

  if (state.user.role === "admin") {
    // Admin: Puede marcar como pendiente los "Sin revisar" o "Completado"
    if (estadoLabel === "Sin revisar" || estadoLabel === "Completado") {
      showCheckbox = true;
    }
  } else if (state.user.role === "docente") {
    // Docente: Puede enviar reporte masivo de los "Completado"
    if (estadoLabel === "Completado") {
      showCheckbox = true;
    }
  }

  if (showCheckbox) {
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

      // CORRECCIÓN: Lógica estricta de visibilidad de checkboxes en la tabla
      let checkboxHtml = "";
      let showCheckbox = false;

      if (state.user.role === "admin") {
        if (estadoLabel === "Sin revisar" || estadoLabel === "Completado") {
          showCheckbox = true;
        }
      } else if (state.user.role === "docente") {
        if (estadoLabel === "Completado") {
          showCheckbox = true;
        }
      }

      if (showCheckbox) {
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

// --- Renderizado de Vistas Específicas ---
function renderReportsView() {
  let targetTeacher = "";
  let sourceCourses = [];

  if (state.user.role === "admin") {
    targetTeacher = state.filters.teacher;
    if (!targetTeacher) {
      // Para Admin "Todos los docentes": Obtiene todos los pares únicos de (curso, docente)
      const pairsMap = new Map();
      state.records.forEach((r) => {
        const c = (r.curso || "").toString().trim();
        const d = (r.docente || "").toString().trim();
        if (c && d) {
          pairsMap.set(d.toLowerCase() + "|||" + c.toLowerCase(), {
            courseName: c,
            teacherName: d,
          });
        }
      });
      sourceCourses = Array.from(pairsMap.values());
    } else {
      // Para Admin un solo docente
      const pairsMap = new Map();
      state.records.forEach((r) => {
        const c = (r.curso || "").toString().trim();
        const d = (r.docente || "").toString().trim();
        if (c && d && d.toLowerCase() === targetTeacher.toLowerCase()) {
          pairsMap.set(c.toLowerCase(), {
            courseName: c,
            teacherName: d,
          });
        }
      });
      sourceCourses = Array.from(pairsMap.values());
    }
  } else {
    targetTeacher = state.user.name;
    // Para Docente: SÓLO obtiene los cursos que ya han sido habilitados (existen en la hoja Informes)
    const pairsMap = new Map();
    state.informes.forEach((inf) => {
      const c = (inf.curso || "").toString().trim();
      const d = (inf.docente || "").toString().trim();
      if (c && d && d.toLowerCase() === targetTeacher.toLowerCase()) {
        pairsMap.set(c.toLowerCase(), {
          courseName: c,
          teacherName: targetTeacher,
        });
      }
    });
    sourceCourses = Array.from(pairsMap.values());
  }

  // 1. Obtener cursos únicos y asignarles ciclo
  const coursesData = sourceCourses.map((item) => {
    let cicloNum = 99;
    let cicloText = "";

    if (item.courseName.includes("-")) {
      const parts = item.courseName.split("-");
      if (parts.length > 1) {
        const firstChar = parts[1].trim().charAt(0);
        if (firstChar && !isNaN(firstChar)) {
          const num = parseInt(firstChar);
          cicloNum = num;
          cicloText = `Ciclo 0${num}`;
        }
      }
    }
    return {
      name: item.courseName,
      teacher: item.teacherName,
      cicloNum,
      cicloText,
    };
  });

  // 2. Ordenar por Docente, Ciclo y nombre
  coursesData.sort((a, b) => {
    const teacherCompare = a.teacher.localeCompare(b.teacher);
    if (teacherCompare !== 0) return teacherCompare;
    if (a.cicloNum !== b.cicloNum) return a.cicloNum - b.cicloNum;
    return a.name.localeCompare(b.name);
  });

  if (coursesData.length === 0) {
    elements.reportsView.innerHTML = `
      <div class="loading-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--border); box-shadow: var(--shadow-sm);">
          <div style="width: 64px; height: 64px; background: rgba(10, 31, 68, 0.05); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <i class="ph ph-folder-open" style="font-size: 32px; color: var(--secondary);"></i>
          </div>
          <h3 style="color: var(--secondary); font-size: 20px; margin-bottom: 8px;">${state.user.role === "admin" ? "No hay cursos registrados" : "No tienes informes habilitados"}</h3>
          <p style="color: var(--text-muted); font-size: 15px;">${state.user.role === "admin" ? "No se encontraron entregas de cursos." : "El administrador aún no ha habilitado informes para tus cursos."}</p>
      </div>
    `;
    return;
  }

  // 3. Lógica de Clasificación de Cursos (Enviados, Completados, Pendientes)
  const groupedCourses = {
    Enviados: [],
    Completados: [],
    Pendientes: [],
  };

  coursesData.forEach((item) => {
    const courseRecords = state.records.filter(
      (r) =>
        (r.curso || "").toString().trim() === item.name &&
        (r.docente || "").toString().trim() === item.teacher,
    );

    let pCount = 0,
      cCount = 0,
      eCount = 0;

    // Ignoramos "sin revisar" para la clasificación
    courseRecords.forEach((r) => {
      const st = (r.estado || "sin revisar").toString().trim().toLowerCase();
      if (st === "pendiente") pCount++;
      else if (st === "completado") cCount++;
      else if (st === "enviado") eCount++;
    });

    let group = "Pendientes"; // Por defecto si hay pendientes, o no hay registros contabilizables aún
    if (pCount > 0) {
      group = "Pendientes";
    } else if (cCount > 0) {
      group = "Completados";
    } else if (eCount > 0) {
      group = "Enviados";
    }

    item.computedGroup = group;
    groupedCourses[group].push(item);
  });

  // 4. Renderizado Agrupado
  let html = "";
  const groupOrder = ["Enviados", "Completados", "Pendientes"];
  const groupColors = {
    Enviados: "#3498db", // Celeste
    Completados: "#2ecc71", // Verde
    Pendientes: "#f15a24", // Naranja
  };

  groupOrder.forEach((groupName) => {
    const items = groupedCourses[groupName];
    if (items.length > 0) {
      html += `
      <div class="report-group-section" style="margin-bottom: 40px; width: 100%;">
        <h2 style="font-size: 18px; color: var(--secondary); margin-bottom: 16px; border-bottom: 2px solid ${groupColors[groupName]}40; padding-bottom: 8px; display: inline-flex; align-items: center;">
          <i class="ph-fill ph-folder-open" style="color: ${groupColors[groupName]}; margin-right: 8px; font-size: 24px;"></i>
          Registros ${groupName} (${items.length})
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; width: 100%;">
      `;

      items.forEach((item) => {
        // Buscar si existe en la hoja Informes (Status del documento Informe)
        const existingReport = state.informes.find(
          (inf) =>
            inf.curso &&
            inf.curso.toString().trim().toLowerCase() ===
              item.name.toLowerCase().trim() &&
            (inf.docente || "").toLowerCase() === item.teacher.toLowerCase(),
        );

        const status = existingReport ? existingReport.estado : "No Habilitado";
        let finalUrl = null;
        if (existingReport && existingReport.url_informe) {
          if (state.user.role === "admin") {
            finalUrl = existingReport.url_informe.replace(
              /\/(preview|viewer).*$/,
              "/edit",
            );
          } else {
            finalUrl = existingReport.url_informe.replace(
              /\/(edit|preview).*$/,
              "/preview",
            );
          }
        }

        html += `
          <div class="student-card report-card">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <i class="ph ph-book-open" style="font-size: 20px; color: var(--primary);"></i>
                ${item.cicloText ? `<span style="font-size: 11px; font-weight: 700; color: var(--primary); background: rgba(241, 90, 36, 0.1); padding: 2px 8px; border-radius: 12px;">${item.cicloText}</span>` : ""}
              </div>
              
              ${
                state.user.role === "docente" && status === "Completado"
                  ? `
                <div style="display: flex; gap: 4px;">
                  <button class="btn-icon" onclick="downloadReportPdf('${finalUrl}')" style="width: 28px; height: 28px; font-size: 14px; background: #fff5f5; border-color: #feb2b2; color: #c53030;" title="Descargar PDF">
                    <i class="ph ph-file-pdf"></i>
                  </button>
                  <button class="btn-icon" onclick="openReportModal('${item.name.replace(/'/g, "\\'")}', true)" style="width: 28px; height: 28px; font-size: 14px; background: white; border-color: var(--border);" title="Editar y Volver a Generar">
                    <i class="ph ph-pencil-simple"></i>
                  </button>
                </div>
              `
                  : ""
              }
              
              ${status !== "Completado" ? `<span class="status-badge status-${status.toLowerCase().replace(" ", "-")}" style="font-size: 10px; padding: 4px 8px;">${status}</span>` : ""}
            </div>
            <div class="card-body">
              <h3>${item.name}</h3>
              <!-- Tag Dinámico de Clasificación -->
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: ${groupColors[item.computedGroup]}; background-color: ${groupColors[item.computedGroup]}15; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; border: 1px solid ${groupColors[item.computedGroup]}30;">
                  <i class="ph-fill ph-circle" style="font-size: 8px;"></i> REGISTROS ${item.computedGroup.toUpperCase()}
              </span>
              ${!targetTeacher ? `<p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;"><i class="ph ph-user"></i> ${item.teacher}</p>` : ""}
            </div>
            <div class="card-footer">
        `;

        // LÓGICA DE BOTONES (ADMIN VS DOCENTE)
        if (state.user.role === "admin") {
          if (status === "No Habilitado") {
            html += `
              <button class="btn btn-primary btn-full" onclick="enableReport('${item.teacher.replace(/'/g, "\\'")}', '${item.name.replace(/'/g, "\\'")}')" style="height: 40px; font-size: 13px;">
                <i class="ph ph-check-circle"></i> Habilitar Informe
              </button>
            `;
          } else if (status === "Pendiente") {
            html += `
              <button class="btn btn-outline btn-full" disabled style="height: 40px; font-size: 13px; opacity: 0.7; cursor: not-allowed; border-style: dashed;">
                <i class="ph ph-hourglass-high"></i> Esperando al Docente
              </button>
            `;
          } else {
            html += `
              <button class="btn btn-outline btn-full" onclick="window.open('${finalUrl}', '_blank')" style="background: white; border-color: var(--primary); color: var(--primary); font-weight: 600; height: 40px; font-size: 13px;">
                <i class="ph ph-eye"></i> Ver Informe Generado
              </button>
            `;
          }
        } else {
          if (status === "Pendiente") {
            html += `
              <button class="btn btn-primary btn-full" onclick="openReportModal('${item.name.replace(/'/g, "\\'")}')" style="height: 40px; font-size: 13px;">
                <i class="ph ph-file-text"></i> Generar Informe Final
              </button>
            `;
          } else if (status === "Completado") {
            html += `
              <button class="btn btn-outline btn-full" onclick="window.open('${finalUrl}', '_blank')" style="background: white; border-color: var(--primary); color: var(--primary); font-weight: 600; height: 40px; font-size: 13px;">
                <i class="ph ph-eye"></i> Ver Informe Generado
              </button>
            `;
          }
        }

        html += `
            </div>
          </div>
        `;
      });

      html += `</div></div>`; // Cierre del grid y sección del grupo
    }
  });

  elements.reportsView.innerHTML = html;
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

function renderActivityTags() {
  const container = document.getElementById("activityFilterContainer");
  if (!container) return;

  // 1. Obtener actividades únicas (Asignar "Trabajo Final" a los vacíos)
  const activities = new Set();
  state.records.forEach((r) => {
    const act = (r.actividad || "Trabajo Final").toString().trim();
    activities.add(act);
  });

  // 2. Construir el HTML
  let html = `<span style="font-weight: 600; color: var(--secondary); display: flex; align-items: center; margin-right: 8px;"><i class="ph ph-funnel" style="margin-right: 4px; font-size: 18px;"></i> Actividad:</span>`;

  html += `<button class="activity-tag ${state.filters.actividad === "" ? "active" : ""}" data-actividad="">Todas</button>`;

  Array.from(activities)
    .sort()
    .forEach((act) => {
      html += `<button class="activity-tag ${state.filters.actividad === act ? "active" : ""}" data-actividad="${act}">${act}</button>`;
    });

  container.innerHTML = html;

  // 3. Agregar Eventos Click
  container.querySelectorAll(".activity-tag").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      state.filters.actividad = e.target.getAttribute("data-actividad");
      renderActivityTags(); // Actualizar clases visuales
      renderRecords(); // Actualizar tabla/cartas
    });
  });
}

function renderEvidencePreviews() {
  if (!elements.evidencePreviewGrid || !state.currentEvidenceCategory) return;
  const images = state.reportEvidences[state.currentEvidenceCategory];

  elements.evidencePreviewGrid.innerHTML = images
    .map(
      (base64, index) => `
    <div style="position: relative; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); aspect-ratio: 16/9;">
      <img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;" />
      <button class="btn-icon" onclick="removeEvidenceImage(${index})" style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; font-size: 14px; background: rgba(255,255,255,0.9); border: none; color: var(--danger);">
        <i class="ph ph-x"></i>
      </button>
    </div>
  `,
    )
    .join("");
}

// --- Estadísticas y Gráficos ---
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

    // NUEVO: Filtro por Actividad
    let matchesActividad = true;
    if (state.filters.actividad !== "") {
      const rowActividad = (r.actividad || "Trabajo Final")
        .toString()
        .trim()
        .toLowerCase();
      const filterActividad = state.filters.actividad
        .toString()
        .trim()
        .toLowerCase();
      matchesActividad = rowActividad === filterActividad;
    }

    return matchesTeacher && matchesCourse && matchesActividad;
  });

  // 1. ACTUALIZAR NOMBRES DE LOS RECUADROS SEGÚN EL ROL Y FILTRO
  if (state.user.role === "admin") {
    if (state.filters.teacher === "") {
      // Vista global: Todos los docentes
      elements.statPending.previousElementSibling.textContent =
        "Docentes con ALGÚN Curso PENDIENTE";
      elements.statCompleted.previousElementSibling.textContent =
        "Docentes con TODAS sus Calificaciones COMPLETADAS";
      elements.statTotal.previousElementSibling.textContent =
        "Docentes con SÓLO Calificaciones ENVIADAS";
    } else {
      // Vista individual: Un docente específico
      elements.statPending.previousElementSibling.textContent =
        "El Docente tiene aún Registros PENDIENTES";
      elements.statCompleted.previousElementSibling.textContent =
        "El Docente tiene TODOS los Registros COMPLETADOS";
      elements.statTotal.previousElementSibling.textContent =
        "El Docente tiene TODOS los Registros ENVIADOS";
    }
  } else {
    // Vista Docente
    elements.statPending.previousElementSibling.textContent =
      "Alumnos PENDIENTES de Calificar";
    elements.statCompleted.previousElementSibling.textContent =
      "Alumnos con Revisiones COMPLETADAS";
    elements.statTotal.previousElementSibling.textContent =
      "Alumnos con Revisiones ENVIADAS";
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

// --- Gestión de Selección Masiva (Batch Selection) ---
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

  // NUEVO: Lógica de visualización del botón "Seleccionar Todo"
  let shouldShowSelectAll = false;
  if (isDashboardActive && allCheckboxes.length > 0) {
    if (state.user.role === "admin") {
      // Admin: Solo muestra seleccionar todo si estamos viendo "Sin revisar" o "Completado" (para marcarlos como Pendientes)
      if (
        state.filters.status === "Sin revisar" ||
        state.filters.status === "Completado"
      ) {
        shouldShowSelectAll = true;
      }
    } else {
      // Docente: Solo muestra seleccionar todo si estamos viendo "Completado" (para enviarlos)
      if (state.filters.status === "Completado") {
        shouldShowSelectAll = true;
      }
    }
  }

  if (shouldShowSelectAll) {
    btnSelectAll.style.display = "flex";
    if (count === allCheckboxes.length && count > 0) {
      spanSelectAll.textContent = "Deseleccionar Todo";
    } else {
      spanSelectAll.textContent = "Seleccionar Todo";
    }
  } else {
    btnSelectAll.style.display = "none";
  }
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

// --- Auxiliares Visuales de Interfaz ---
function updateRemindButtonText() {
  const span = document.getElementById("remindTeacherText");
  if (!span) return;
  if (state.filters.teacher === "") {
    span.textContent = "Notificar a TODOS";
  } else {
    span.textContent = "Notificar Docente";
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

// ==========================================
// 5. Navegation & Views Control
// ==========================================

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
    elements.btnRemindTeacher.style.display = "flex";
    updateRemindButtonText();
  } else {
    state.filters.status = "Pendiente";
    elements.statusSelect.value = "Pendiente";
  }
  syncDashboardData(false);
}

function showDashboardView() {
  if (elements.navReports) elements.navReports.classList.remove("active");
  if (elements.navUsers) elements.navUsers.classList.remove("active");
  elements.navDashboard.classList.add("active");

  if (elements.reportsView) elements.reportsView.style.display = "none";
  elements.userManagementView.style.display = "none";

  document.getElementById("pageTitle").textContent = "Entregas de Alumnos";
  document.getElementById("pageSubtitle").textContent =
    "Gestiona y califica las evidencias recibidas";

  elements.statsBar.style.display = "grid";
  elements.chartContainer.style.display = "block";
  elements.recordsGrid.style.display =
    state.viewMode === "table" ? "block" : "grid";
  elements.searchInput.parentElement.style.display = "flex";
  elements.btnToggleView.style.display = "flex";

  if (elements.activityFilterContainer)
    elements.activityFilterContainer.style.display = "flex";

  if (state.user.role === "admin") {
    elements.adminFiltersSection.style.display = "block";
    document.getElementById("adminCourseFilterGroup").style.display = "block";
    document.getElementById("adminStatusFilterGroup").style.display = "block";
    elements.adminStatusSelect.value = state.filters.status;
    populateAdminCourseSelect();
    elements.btnRemindTeacher.style.display = "flex";
    updateRemindButtonText();
  } else {
    if (elements.docenteSidebarSection)
      elements.docenteSidebarSection.style.display = "block";
    populateTeacherCourseSelectFromMapping();
  }
  renderRecords();
}

function showUserManagementView() {
  elements.navDashboard.classList.remove("active");
  if (elements.navReports) elements.navReports.classList.remove("active");
  elements.navUsers.classList.add("active");
  elements.userManagementView.style.display = "block";
  if (elements.reportsView) elements.reportsView.style.display = "none";

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
  if (elements.activityFilterContainer)
    elements.activityFilterContainer.style.display = "none";

  // Limpiar selecciones previas
  document
    .querySelectorAll(".select-card-checkbox")
    .forEach((cb) => (cb.checked = false));
  const masterUserCb = document.getElementById("selectAllUsersCheckbox");
  if (masterUserCb) masterUserCb.checked = false;

  renderUserTable();
}

function showReportsView() {
  elements.navDashboard.classList.remove("active");
  if (elements.navUsers) elements.navUsers.classList.remove("active");
  elements.navReports.classList.add("active");

  elements.userManagementView.style.display = "none";
  elements.reportsView.style.display = "grid";

  // Títulos dinámicos por Rol
  if (state.user.role === "admin") {
    document.getElementById("pageTitle").textContent = "Gestión de Informes";
    document.getElementById("pageSubtitle").textContent =
      "Habilita y supervisa los informes finales de los docentes";
  } else {
    document.getElementById("pageTitle").textContent = "Mis Informes";
    document.getElementById("pageSubtitle").textContent =
      "Genera informes finales de los cursos habilitados";
  }

  // Ocultar elementos del dashboard principal
  elements.statsBar.style.display = "none";
  elements.chartContainer.style.display = "none";
  elements.recordsGrid.style.display = "none";

  // Manejo de la barra lateral (Ocultar filtros innecesarios del admin)
  if (elements.adminFiltersSection) {
    if (state.user.role === "admin") {
      elements.adminFiltersSection.style.display = "block";
      document.getElementById("adminCourseFilterGroup").style.display = "none";
      document.getElementById("adminStatusFilterGroup").style.display = "none";
    } else {
      elements.adminFiltersSection.style.display = "none";
    }
  }
  if (elements.docenteSidebarSection)
    elements.docenteSidebarSection.style.display = "none";
  if (elements.activityFilterContainer)
    elements.activityFilterContainer.style.display = "none";

  elements.searchInput.parentElement.style.display = "none";
  elements.btnToggleView.style.display = "none";
  document.getElementById("btnSelectAll").style.display = "none";
  elements.batchActionBar.style.display = "none";
  elements.btnRemindTeacher.style.display = "none";

  renderReportsView();
}

// ==========================================
// 6. Lógica de Negocio & API (CRUD)
// ==========================================
// --- Comunicación Base ---
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

// --- Gestión de Datos y Sesión ---
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

async function syncDashboardData(forceRefresh = false) {
  const isReportsView =
    elements.navReports && elements.navReports.classList.contains("active");
  const targetGrid = isReportsView
    ? elements.reportsView
    : elements.recordsGrid;

  // Animación UI
  if (elements.btnRefresh) elements.btnRefresh.classList.add("is-loading");

  // Loaders unificados
  const loadingHtml = `
      <div class="loading-state" style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; background: var(--white); border-radius: var(--radius-md); border: 1px dashed var(--border); box-shadow: var(--shadow-sm);">
          <div class="spinner" style="width: 48px; height: 48px; border-width: 4px; border-color: rgba(241, 90, 36, 0.1); border-top-color: var(--primary); margin-bottom: 24px;"></div>
          <h3 style="color: var(--secondary); font-size: 20px; margin-bottom: 8px;">Sincronizando sistema</h3>
          <p style="color: var(--text-muted); font-size: 15px;" class="loading-dots">Descargando registros y cursos de forma optimizada</p>
      </div>
  `;
  targetGrid.innerHTML = loadingHtml;

  const btnLoadingHtml = `
    <div style="padding: 16px; text-align: center; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.15); border-radius: 8px;">
      <div class="spinner" style="width: 20px; height: 20px; border-width: 2px; border-color: rgba(255,255,255,0.2); border-top-color: white; margin: 0 auto 10px;"></div>
      <span style="font-size: 12px;" class="loading-dots">Cargando</span>
    </div>`;

  if (state.user.role === "admin")
    elements.adminCourseButtonContainer.innerHTML = btnLoadingHtml;
  else elements.courseButtonContainer.innerHTML = btnLoadingHtml;

  try {
    // 1 SOLA LLAMADA AL SERVIDOR en lugar de 3
    const res = await callApi("getDashboardData", {
      email: state.user.name,
      role: state.user.role,
      forceRefresh: forceRefresh,
    });

    if (res.success) {
      // Asignar Data
      state.records = res.records;
      state.informes = res.informes;

      // Asignar Mapping
      if (res.mappingData.success) {
        state.teacherCourseMapping = res.mappingData.mapping;
        if (state.user.role === "admin") {
          populateAdminTeacherSelect(res.mappingData.teachers);
          populateAdminCourseSelect();
        } else {
          populateTeacherCourseSelectFromMapping();
        }
      }

      // Renderizar Vista
      if (isReportsView) {
        renderReportsView();
      } else {
        renderActivityTags();
        renderRecords();
        updateStats();
      }
    }
  } catch (error) {
    showToast("Error al sincronizar datos", "danger");
    targetGrid.innerHTML = `
        <div class="loading-state" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
            <i class="ph ph-warning-circle" style="font-size: 48px; color: var(--danger); margin-bottom: 16px; display: block;"></i>
            <p style="color: var(--danger);">Ocurrió un problema al cargar los datos. Revisa tu conexión.</p>
        </div>
    `;
  } finally {
    if (elements.btnRefresh) elements.btnRefresh.classList.remove("is-loading");
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

async function handleSyncUsers() {
  const confirmed = await showConfirm(
    "¿Deseas sincronizar la lista de docentes desde Parafelix? Se añadirán nuevos docentes y se actualizarán correos existentes (sin afectar contraseñas).",
  );
  if (!confirmed) return;

  const btn = elements.btnSyncUsers;
  btn.disabled = true;
  btn.classList.add("is-loading");

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
    btn.classList.remove("is-loading");
  }
}

// --- Gestión de Usuarios y Estudiantes ---
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

      // --- ACTUALIZACIÓN LOCAL (LIVE UPDATE UI) ---
      if (userData.oldName) {
        // Modo Edición
        const uIndex = state.userList.findIndex(
          (u) => u.name === userData.oldName,
        );
        if (uIndex !== -1) {
          state.userList[uIndex].name = userData.name;
          state.userList[uIndex].password = userData.password;
          state.userList[uIndex].role = userData.role;
          state.userList[uIndex].correo = userData.correo;
        }
      } else {
        // Modo Nuevo Usuario
        state.userList.push({
          name: userData.name,
          password: userData.password,
          role: userData.role,
          correo: userData.correo,
        });
      }

      renderUserTable();
      // --------------------------------------------
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

      // --- ACTUALIZACIÓN LOCAL (LIVE UPDATE UI) ---
      state.userList = state.userList.filter((u) => u.name !== name);
      renderUserTable();
      // --------------------------------------------
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al eliminar usuario", "danger");
  }
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

  // Validar DNI (8 dígitos numéricos)
  const dniRegex = /^\d{8}$/;
  if (!dniRegex.test(updateData.dni)) {
    showToast("El DNI debe tener exactamente 8 números", "warning");
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

      // --- ACTUALIZACIÓN LOCAL (LIVE UPDATE UI) ---
      const recordIndex = state.records.findIndex(
        (r) => r.id_registro.toString() === id.toString(),
      );

      if (recordIndex !== -1) {
        state.records[recordIndex].alumno = updateData.alumno;
        state.records[recordIndex].dni = updateData.dni;
        state.records[recordIndex].estado = updateData.estado;

        if (state.user.role === "docente") {
          state.records[recordIndex].nota = updateData.nota;
          state.records[recordIndex].comentario = updateData.comentario;
        }
      }

      renderRecords();
      // --------------------------------------------
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

// --- Notificaciones y Credenciales ---
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

async function sendUserCredentialsBatch() {
  const checkboxes = document.querySelectorAll(".select-user-checkbox:checked");
  const names = Array.from(checkboxes).map((cb) => cb.value);

  if (names.length === 0) return;

  // NUEVO: Construir lista de correos para el modal
  const recipients = names.map((name) => {
    const u = state.userList.find((user) => user.name === name);
    return { name, email: u && u.correo ? u.correo : "Sin correo" };
  });
  const emailListHtml = recipients
    .map((r) => `• ${r.name} <small>(${r.email})</small>`)
    .join("<br>");

  const msg = `¿Estás seguro de enviar credenciales de acceso a ${names.length} usuario(s)?<br><div style="text-align:left; font-size:15px; margin-top:10px; max-height:150px; overflow-y:auto; background:#f8f9fa; padding:10px; border-radius:8px;">${emailListHtml}</div>`;

  const confirmed = await showConfirm(msg, "Enviar Credenciales", "Enviar");
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

async function handleSendReminders() {
  const targetTeacher = state.filters.teacher;

  // 1. Identificar destinatarios
  const pendingRecords = state.records.filter(
    (r) => (r.estado || "").toLowerCase() === "pendiente",
  );

  let recipients = [];
  let teacherPendingCount = 0; // NUEVO: Para almacenar la cantidad del docente

  if (targetTeacher) {
    const user = state.userList.find(
      (u) => u.name.toLowerCase() === targetTeacher.toLowerCase(),
    );
    if (user && user.correo) {
      recipients.push({ name: targetTeacher, email: user.correo });
    }
    // Calcular cantidad de pendientes del docente seleccionado
    teacherPendingCount = pendingRecords.filter(
      (r) => (r.docente || "").toLowerCase() === targetTeacher.toLowerCase(),
    ).length;
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

  // 2. Construir mensaje de confirmación con lista de correos y cantidad
  const emailListHtml = recipients
    .map((r) => `<br>• ${r.name} (${r.email})`)
    .join("");

  // MODIFICADO: Mensaje diferenciado y detallado
  const msg = targetTeacher
    ? `¿Enviar recordatorio al docente "${targetTeacher}"?<br>Tiene <strong style="color:var(--primary); font-size:16px;">${teacherPendingCount}</strong> registro(s) pendiente(s).<br><small>${recipients[0].email}</small>`
    : `¿Enviar recordatorios a los siguientes docentes?<br><div style="text-align:left; font-size:13px; margin-top:10px; max-height:150px; overflow-y:auto; background:#f8f9fa; padding:10px; border-radius:8px;">${emailListHtml}</div>`;

  const modalTitle = targetTeacher
    ? "Enviar Recordatorio"
    : "Enviar Recordatorios";
  const confirmed = await showConfirm(msg, modalTitle, "Enviar Notificación");

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
    updateRemindButtonText();
  }
}

// --- Flujos de Trabajo Académico ---
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

      // --- ACTUALIZACIÓN LOCAL MASIVA ---
      ids.forEach((id) => {
        const index = state.records.findIndex(
          (r) => r.id_registro.toString() === id.toString(),
        );
        if (index !== -1) {
          state.records[index].estado = "Pendiente";
        }
      });

      renderRecords();
      // ----------------------------------
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

      // --- ACTUALIZACIÓN LOCAL (LIVE UPDATE UI) ---
      // 1. Buscar el registro exacto en la memoria
      const recordIndex = state.records.findIndex(
        (r) => r.id_registro.toString() === id.toString(),
      );

      if (recordIndex !== -1) {
        // 2. Actualizar los datos localmente
        state.records[recordIndex].nota = grade;
        state.records[recordIndex].comentario = comment;
        state.records[recordIndex].estado = "Completado"; // Pasa a completado automáticamente
      }

      // 3. Re-dibujar la interfaz (Cartas, Tablas, Gráficos y Estadísticas) usando la memoria
      renderRecords();
      // --------------------------------------------
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
    "Enviar Reporte",
    "Enviar Ahora",
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

      // --- ACTUALIZACIÓN LOCAL MASIVA ---
      ids.forEach((id) => {
        const index = state.records.findIndex(
          (r) => r.id_registro.toString() === id.toString(),
        );
        if (index !== -1) {
          state.records[index].estado = "Enviado";
        }
      });

      // Desmarcar checkboxes virtuales y re-dibujar
      renderRecords();
      // ----------------------------------
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

async function handleGenerateReportSubmit() {
  const course = elements.reportCourseInput.value;
  const dni = elements.reportDniInput.value.trim();
  const date1 = elements.reportDate1Input.value;
  const date2 = elements.reportDate2Input.value;

  if (!dni || !date1 || !date2) {
    showToast("Por favor, completa los campos de DNI o Periodo", "warning");
    return;
  }

  // Validar longitud y formato del DNI
  const dniRegex = /^\d{8}$/;
  if (!dniRegex.test(dni)) {
    showToast("El DNI del docente debe tener exactamente 8 números", "warning");
    return;
  }

  // Validate evidences
  if (
    state.reportEvidences.informacion.length === 0 ||
    state.reportEvidences.sesion1.length === 0 ||
    state.reportEvidences.sesion2.length === 0 ||
    state.reportEvidences.entrega.length === 0
  ) {
    showToast(
      "Debes añadir al menos 1 imagen por cada tipo de evidencia (Info, Sesión 1, Sesión 2 y Entrega)",
      "warning",
    );
    return;
  }

  // Validar firma
  let firmaBase64 = null;
  if (state.signatureMode === "draw") {
    if (signaturePad && signaturePad.isEmpty()) {
      showToast("Por favor, ingresa tu firma", "warning");
      return;
    }
    firmaBase64 = signaturePad.toDataURL();
  } else {
    if (!state.uploadedSignature) {
      showToast("Por favor, sube una imagen de tu firma", "warning");
      return;
    }
    firmaBase64 = state.uploadedSignature;
  }

  // Mostrar Loading Overlay Fullscreen
  elements.loadingOverlay.style.display = "flex";
  elements.progressBar.style.width = "0%";
  elements.progressText.textContent = "0%";
  elements.loadingTitle.textContent = "Generando Informe...";

  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.random() * 1.5;
      if (progress > 90) progress = 90;
      elements.progressBar.style.width = progress + "%";
      elements.progressText.textContent = Math.floor(progress) + "%";
      // Actualizar revelado de logo
      const logoReveal = document.getElementById("logoReveal");
      if (logoReveal) logoReveal.style.setProperty("--logo-p", progress + "%");
    }
  }, 500);

  try {
    const res = await callApi("generateReport", {
      docente: state.user.name,
      curso: course,
      dni: dni,
      fecha1: date1,
      fecha2: date2,
      evidencias_informacion: state.reportEvidences.informacion,
      evidencias_sesion1: state.reportEvidences.sesion1,
      evidencias_sesion2: state.reportEvidences.sesion2,
      evidencias_entrega: state.reportEvidences.entrega,
      firma: firmaBase64,
    });

    clearInterval(progressInterval);
    elements.progressBar.style.width = "100%";
    elements.progressText.textContent = "100%";
    const logoReveal = document.getElementById("logoReveal");
    if (logoReveal) logoReveal.style.setProperty("--logo-p", "100%");

    if (res.success) {
      showToast("Informe generado exitosamente", "success");
      elements.reportModal.classList.remove("active");

      // --- ACTUALIZACIÓN LOCAL (LIVE UPDATE UI COMPLETADO) ---
      // Transformar arrays de evidencias a string con saltos de línea (como lo lee el sistema)
      const parseEvidencias = (arr) =>
        arr.length > 0 ? arr.join("\n") : "Sin evidencia";
      const combinedSesiones = [
        ...state.reportEvidences.sesion1,
        ...state.reportEvidences.sesion2,
      ];

      const updateData = {
        estado: "Completado",
        url_informe: res.url,
        dni: dni,
        periodo_1: date1,
        periodo_2: date2,
        evidencias_informacion: parseEvidencias(
          state.reportEvidences.informacion,
        ),
        evidencias_sesion: parseEvidencias(combinedSesiones),
        evidencias_entrega: parseEvidencias(state.reportEvidences.entrega),
        firma: firmaBase64,
      };

      const reportIndex = state.informes.findIndex(
        (inf) =>
          inf.curso &&
          inf.curso.toString().trim().toLowerCase() === course.toLowerCase() &&
          (inf.docente || "").toLowerCase() === state.user.name.toLowerCase(),
      );

      if (reportIndex !== -1) {
        Object.assign(state.informes[reportIndex], updateData);
      } else {
        state.informes.push({
          docente: state.user.name,
          curso: course,
          ...updateData,
        });
      }

      renderReportsView();
      // --------------------------------------------

      setTimeout(() => {
        elements.loadingOverlay.style.display = "none";
        showConfirm(
          `¡El informe para ${course} se ha generado correctamente! ¿Deseas abrirlo ahora?`,
          "Informe Final Generado",
          "ABRIR INFORME FINAL",
        ).then((confirmed) => {
          if (confirmed) {
            const viewerUrl = res.url.replace(
              /\/(edit|preview).*$/,
              "/preview",
            );
            window.open(viewerUrl, "_blank");
          }
        });
      }, 500);
    } else {
      elements.loadingOverlay.style.display = "none";
      showToast(res.message, "danger");
    }
  } catch (error) {
    clearInterval(progressInterval);
    elements.loadingOverlay.style.display = "none";
    showToast("Error al generar el informe: " + error.message, "danger");
  }
}

async function enableReport(docente, curso) {
  const confirmed = await showConfirm(
    `¿Habilitar el Informe Final para el curso "${curso}"?\n\nEl docente podrá verlo y generarlo desde su panel de control.`,
    "Habilitar Informe",
    "Habilitar Ahora",
  );
  if (!confirmed) return;

  showToast("Habilitando informe...", "info");
  try {
    const res = await callApi("initReport", { docente, curso });
    if (res.success) {
      showToast(res.message, "success");

      // --- ACTUALIZACIÓN LOCAL (LIVE UPDATE UI) ---
      state.informes.push({
        id: new Date().getTime().toString(),
        docente: docente,
        curso: curso,
        estado: "Pendiente",
      });

      renderReportsView();
      // --------------------------------------------
    } else {
      showToast(res.message, "danger");
    }
  } catch (error) {
    showToast("Error al procesar la habilitación del informe", "danger");
  }
}

// ==========================================
// 7. Helpers, Modals & Events
// ==========================================
// --- Mensajes y Feedback ---
function showConfirm(message, title = "Confirmación", acceptText = "Aceptar") {
  return new Promise((resolve) => {
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.innerHTML = message; // CORRECCIÓN: innerHTML en vez de textContent
    elements.btnAcceptConfirmText.textContent = acceptText;
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

function showToast(message, type = "info") {
  elements.toastMessage.textContent = message;
  elements.toast.className = `toast active toast-${type}`;
  setTimeout(() => {
    elements.toast.classList.remove("active");
  }, 4000);
}

function showLoginError(msg) {
  elements.loginError.textContent = msg;
  elements.loginError.style.display = "block";
}

// --- Gestión de Modales (Abrir/Cerrar) ---
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

function openReportModal(courseName, isEdit = false) {
  elements.modalReportCourse.textContent = courseName;
  elements.reportCourseInput.value = courseName;
  elements.reportDniInput.value = "";
  if (elements.reportDate1Input) elements.reportDate1Input.value = "";
  if (elements.reportDate2Input) elements.reportDate2Input.value = "";

  state.reportEvidences = {
    informacion: [],
    sesion1: [],
    sesion2: [],
    entrega: [],
  };

  let report = null;
  if (isEdit) {
    report = state.informes.find(
      (inf) =>
        inf.curso &&
        inf.curso.toString().trim().toLowerCase() ===
          courseName.toLowerCase().trim(),
    );

    if (report) {
      if (report.dni) elements.reportDniInput.value = report.dni;

      const formatDate = (dateVal) => {
        if (!dateVal) return "";
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
      };

      if (elements.reportDate1Input)
        elements.reportDate1Input.value = formatDate(report.periodo_1);
      if (elements.reportDate2Input)
        elements.reportDate2Input.value = formatDate(report.periodo_2);

      const splitEvidences = (val) => {
        if (!val || val === "Sin evidencia") return [];
        return val
          .toString()
          .split("\n")
          .filter(Boolean)
          .map((url) => {
            const trimmedUrl = url.trim();
            if (trimmedUrl.includes("drive.google.com/file/d/")) {
              const id = trimmedUrl.split("/d/")[1].split("/")[0];
              return `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
            }
            return trimmedUrl;
          });
      };

      state.reportEvidences.informacion = splitEvidences(
        report.evidencias_informacion,
      );
      const sessionEvidences = splitEvidences(report.evidencias_sesion);
      if (sessionEvidences.length > 0)
        state.reportEvidences.sesion1 = [sessionEvidences[0]];
      if (sessionEvidences.length > 1)
        state.reportEvidences.sesion2 = [sessionEvidences[1]];
      state.reportEvidences.entrega = splitEvidences(report.evidencias_entrega);
    }
  }

  updateEvidenceButtonsUI();

  // Activamos el modal primero
  elements.reportModal.classList.add("active");

  // Reset o Recuperar Firma
  if (report && report.firma && report.firma !== "Sin firma") {
    state.signatureMode = "upload";
    state.uploadedSignature = report.firma;
    setSignatureMode("upload");

    let finalFirmaUrl = report.firma;
    if (finalFirmaUrl.includes("drive.google.com/file/d/")) {
      const id = finalFirmaUrl.split("/d/")[1].split("/")[0];
      finalFirmaUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w800`;
    }
    elements.signaturePreview.src = finalFirmaUrl;
    elements.signaturePreview.style.display = "block";
    elements.signatureUploadPlaceholder.style.display = "none";
  } else {
    state.signatureMode = "draw";
    state.uploadedSignature = null;
    setSignatureMode("draw");
    // CRÍTICO: Redimensionar el canvas justo después de que el modal es visible
    if (signaturePad) {
      signaturePad.clear();
      setTimeout(() => {
        signaturePad.resizeCanvas();
      }, 150);
    }
  }

  elements.btnGenerateReportSubmit.onclick = handleGenerateReportSubmit;
}

function openEvidenceModal(category, title) {
  state.currentEvidenceCategory = category;
  if (elements.evidenceModalTitle)
    elements.evidenceModalTitle.textContent = title;
  renderEvidencePreviews();
  if (elements.evidenceModal) elements.evidenceModal.classList.add("active");
  if (elements.evidencePasteArea) elements.evidencePasteArea.focus();
}

function closeModal() {
  elements.gradingModal.classList.remove("active");
  elements.editStudentModal.classList.remove("active");
  if (elements.userModal) elements.userModal.classList.remove("active");
  if (elements.reportModal) elements.reportModal.classList.remove("active");
}

function closeEvidenceModal() {
  if (elements.evidenceModal) elements.evidenceModal.classList.remove("active");
  state.currentEvidenceCategory = null;
  updateEvidenceButtonsUI();
}

// --- Utilidades de Formato y Autenticación ---
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

function logout() {
  localStorage.removeItem("iempresa_user");
  location.reload();
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

// --- Selectores y Filtros de Barra Lateral ---
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
      // NUEVO: Verificar si el curso tiene registros actualmente
      const hasRecords = state.records.some(
        (r) => r.curso === course && r.docente === teacher,
      );
      const opacityStyle = hasRecords
        ? ""
        : "opacity: 0.6; filter: grayscale(1);";
      const iconClass = hasRecords ? "ph-book-bookmark" : "ph-folder";

      const btn = document.createElement("button");
      btn.className = `course-btn ${state.filters.course === course ? "active" : ""}`;
      btn.innerHTML = `<i class="ph ${iconClass}"></i> ${course}`;
      btn.style.cssText = opacityStyle; // Estilo minimalista si está vacío
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
    msg.style.marginBottom = "32px";
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
      // NUEVO: Verificar si el curso tiene registros asignados a este docente
      const hasRecords = state.records.some(
        (r) => r.curso === course && r.docente === teacherName,
      );
      const opacityStyle = hasRecords
        ? ""
        : "opacity: 0.6; filter: grayscale(1);";
      const iconClass = hasRecords ? "ph-book-bookmark" : "ph-folder";

      const btn = document.createElement("button");
      btn.className = `course-btn ${state.filters.course === course ? "active" : ""}`;
      btn.innerHTML = `<i class="ph ${iconClass}"></i> ${course}`;
      btn.style.cssText = opacityStyle; // Estilo minimalista si está vacío
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

// --- Firma Digital ---
function setSignatureMode(mode) {
  state.signatureMode = mode;
  if (mode === "draw") {
    elements.btnModeDraw.classList.add("active");
    elements.btnModeUpload.classList.remove("active");
    elements.containerSignatureDraw.style.display = "block";
    elements.containerSignatureUpload.style.display = "none";
    elements.signatureHelpText.textContent =
      "Usa tu mouse o pantalla táctil para firmar.";
  } else {
    elements.btnModeDraw.classList.remove("active");
    elements.btnModeUpload.classList.add("active");
    elements.containerSignatureDraw.style.display = "none";
    elements.containerSignatureUpload.style.display = "flex";
    elements.signatureHelpText.textContent =
      "Sube una imagen con fondo blanco o transparente. Haz clic en el campo para buscar tu imagen";
  }
}

function handleSignatureFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    processSignatureFile(file);
  }
}

function processSignatureFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Por favor selecciona una imagen válida", "danger");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    state.uploadedSignature = e.target.result;
    elements.signaturePreview.src = e.target.result;
    elements.signaturePreview.style.display = "block";
    elements.signatureUploadPlaceholder.style.display = "none";
  };
  reader.readAsDataURL(file);
}

// --- Gestión de Evidencias ---
function handleEvidenceFiles(filesList) {
  if (!state.currentEvidenceCategory) return;
  const files = Array.from(filesList);
  const limit = state.currentEvidenceCategory.startsWith("sesion") ? 1 : 2;
  const currentCount =
    state.reportEvidences[state.currentEvidenceCategory].length;
  const remaining = limit - currentCount;

  if (remaining <= 0) {
    showToast(`Máximo ${limit} imágenes para esta categoría`, "warning");
    return;
  }

  files.slice(0, remaining).forEach((file) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      state.reportEvidences[state.currentEvidenceCategory].push(
        event.target.result,
      );
      renderEvidencePreviews();
    };
    reader.readAsDataURL(file);
  });
}

function updateEvidenceButtonsUI() {
  const categories = ["informacion", "sesion1", "sesion2", "entrega"];
  categories.forEach((cat) => {
    const count = state.reportEvidences[cat].length;
    // Determinar el límite según la categoría
    const limit = cat.startsWith("sesion") ? 1 : 2;

    const badge =
      elements["badge" + cat.charAt(0).toUpperCase() + cat.slice(1)];
    const btn =
      elements["btnEvidencia" + cat.charAt(0).toUpperCase() + cat.slice(1)];

    if (badge) badge.textContent = `${count}/${limit}`;
    if (btn) {
      if (count > 0) {
        btn.classList.add("btn-success");
        btn.style.borderColor = "var(--success)";
        btn.style.color = "var(--success)";
        badge.style.background = "var(--success)";
        badge.style.color = "white";
      } else {
        btn.classList.remove("btn-success");
        btn.style.borderColor = "var(--border)";
        btn.style.color = "var(--secondary)";
        badge.style.background = "var(--gray-light)";
        badge.style.color = "var(--secondary)";
      }
    }
  });
}

function removeEvidenceImage(index) {
  if (!state.currentEvidenceCategory) return;
  state.reportEvidences[state.currentEvidenceCategory].splice(index, 1);
  renderEvidencePreviews();
}

// --- Manejo de Archivos ---
function downloadReportPdf(url) {
  if (!url) {
    showToast("URL del informe no válida", "warning");
    return;
  }
  // Convertir URL de preview/edit a export PDF
  const pdfUrl = url
    .replace(/\/(edit|preview|viewer).*$/, "/export?format=pdf")
    .replace(/\/view\?usp=drivesdk$/, "/export?format=pdf");

  window.open(pdfUrl, "_blank");
}

// --- Listeners de Eventos Globales ---
document.addEventListener("paste", function (e) {
  if (
    !state.currentEvidenceCategory ||
    !elements.evidenceModal.classList.contains("active")
  )
    return;

  // Determinar el límite según la categoría
  const limit = state.currentEvidenceCategory.startsWith("sesion") ? 1 : 2;

  if (state.reportEvidences[state.currentEvidenceCategory].length >= limit) {
    showToast(`Máximo ${limit} imágenes para esta categoría`, "warning");
    return;
  }

  const items = (e.clipboardData || e.originalEvent.clipboardData).items;
  let imageFound = false;

  for (let index in items) {
    const item = items[index];
    if (item.kind === "file" && item.type.indexOf("image/") !== -1) {
      imageFound = true;
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = function (event) {
        state.reportEvidences[state.currentEvidenceCategory].push(
          event.target.result,
        );
        renderEvidencePreviews();
      };

      reader.readAsDataURL(blob);
      break; // Solo procesar la primera imagen que encuentre
    }
  }

  if (!imageFound) {
    showToast("No se encontró una imagen en el portapapeles", "warning");
  }
});

window.onload = init;
