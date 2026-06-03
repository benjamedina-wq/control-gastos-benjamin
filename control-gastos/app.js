const STORAGE_KEY = "control-gastos:v1";
const BUDGET_STORAGE_KEY = "control-gastos:budgets:v1";
const RECURRING_STORAGE_KEY = "control-gastos:recurring:v1";
const DEBT_STORAGE_KEY = "control-gastos:debts:v1";
const CARD_STORAGE_KEY = "control-gastos:cards:v1";
const PIN_STORAGE_KEY = "control-gastos:pin:v1";
const ONLINE_CONFIG_STORAGE_KEY = "control-gastos:online-config:v1";
const ONLINE_SESSION_STORAGE_KEY = "control-gastos:online-session:v1";
const ONLINE_LAST_SYNC_STORAGE_KEY = "control-gastos:online-last-sync:v1";
const SAFETY_BACKUPS_STORAGE_KEY = "control-gastos:safety-backups:v1";
const DEFAULT_SUPABASE_URL = "https://dcwfzymlyyuoifufsdou.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_mJPeYuUUu0R9ljycjxxdLw_QujYaj7L";
const EXPENSE_CATEGORIES = ["Comida", "Transporte", "Servicios", "Casa", "Salud", "Ocio", "Educacion", "Otros"];
const INCOME_CATEGORIES = ["Sueldo", "Ventas", "Transferencia", "Alquiler", "Intereses", "Otros"];
const PAYMENT_METHODS = ["Efectivo", "Transferencia", "Tarjeta", "Visa", "Mastercard"];
const SPEND_MODES = ["Fijo", "Variable", "Necesario", "Extra", "Cuotas", "Inversion"];
const INCOME_MODES = ["Sueldo", "Venta", "Cobro", "Ahorro", "Inversion", "Otro"];
const ACCOUNTS = ["Efectivo", "Banco", "Mercado Pago", "Visa", "Mastercard"];
const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});
const usdCurrency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const state = {
  expenses: loadExpenses(),
  budgets: loadBudgets(),
  recurring: loadRecurring(),
  debts: loadDebts(),
  cards: loadCards(),
  onlineConfig: loadOnlineConfig(),
  onlineSession: loadOnlineSession(),
  pin: localStorage.getItem(PIN_STORAGE_KEY) || "",
  month: monthKey(new Date()),
  category: "Todas",
  type: "Todos",
  payment: "Todos",
  spendMode: "Todos",
  account: "Todas",
  scope: "Todos",
  search: "",
  startDate: "",
  endDate: "",
  editingId: "",
};

let tesseractLoader;
let currentReceiptImage = "";
let onlineSyncTimer;
let onlinePollTimer;
let applyingOnlineSnapshot = false;
let hasPendingOnlinePush = false;

const elements = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector(".app-shell"),
  authEmailInput: document.querySelector("#authEmailInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  authLoginButton: document.querySelector("#authLoginButton"),
  authRegisterButton: document.querySelector("#authRegisterButton"),
  authStatus: document.querySelector("#authStatus"),
  form: document.querySelector("#expenseForm"),
  tabs: Array.from(document.querySelectorAll("[data-tab]")),
  tabPanels: Array.from(document.querySelectorAll("[data-panel]")),
  lockScreen: document.querySelector("#lockScreen"),
  unlockPinInput: document.querySelector("#unlockPinInput"),
  unlockButton: document.querySelector("#unlockButton"),
  lockStatus: document.querySelector("#lockStatus"),
  monthFilter: document.querySelector("#monthFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  typeFilter: document.querySelector("#typeFilter"),
  paymentFilter: document.querySelector("#paymentFilter"),
  spendModeFilter: document.querySelector("#spendModeFilter"),
  accountFilter: document.querySelector("#accountFilter"),
  scopeFilter: document.querySelector("#scopeFilter"),
  searchInput: document.querySelector("#searchInput"),
  startDateFilter: document.querySelector("#startDateFilter"),
  endDateFilter: document.querySelector("#endDateFilter"),
  typeInput: document.querySelector("#typeInput"),
  scopeInput: document.querySelector("#scopeInput"),
  accountInput: document.querySelector("#accountInput"),
  paymentInput: document.querySelector("#paymentInput"),
  spendModeInput: document.querySelector("#spendModeInput"),
  dateInput: document.querySelector("#dateInput"),
  categoryInput: document.querySelector("#categoryInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  amountInput: document.querySelector("#amountInput"),
  tagsInput: document.querySelector("#tagsInput"),
  dueDateInput: document.querySelector("#dueDateInput"),
  notesInput: document.querySelector("#notesInput"),
  balanceTotal: document.querySelector("#balanceTotal"),
  incomeTotal: document.querySelector("#incomeTotal"),
  expenseTotal: document.querySelector("#expenseTotal"),
  expenseCount: document.querySelector("#expenseCount"),
  savingRate: document.querySelector("#savingRate"),
  monthCompare: document.querySelector("#monthCompare"),
  largestExpense: document.querySelector("#largestExpense"),
  topPayment: document.querySelector("#topPayment"),
  expenseTable: document.querySelector("#expenseTable"),
  emptyState: document.querySelector("#emptyState"),
  chart: document.querySelector("#categoryChart"),
  exportButton: document.querySelector("#exportButton"),
  excelButton: document.querySelector("#excelButton"),
  reportButton: document.querySelector("#reportButton"),
  mailButton: document.querySelector("#mailButton"),
  seedButton: document.querySelector("#seedButton"),
  scanPickButton: document.querySelector("#scanPickButton"),
  receiptInput: document.querySelector("#receiptInput"),
  scanStatus: document.querySelector("#scanStatus"),
  receiptPreview: document.querySelector("#receiptPreview"),
  formStatus: document.querySelector("#formStatus"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  budgetCategoryInput: document.querySelector("#budgetCategoryInput"),
  budgetAmountInput: document.querySelector("#budgetAmountInput"),
  budgetSaveButton: document.querySelector("#budgetSaveButton"),
  budgetList: document.querySelector("#budgetList"),
  recurringDayInput: document.querySelector("#recurringDayInput"),
  recurringSaveButton: document.querySelector("#recurringSaveButton"),
  recurringApplyButton: document.querySelector("#recurringApplyButton"),
  recurringList: document.querySelector("#recurringList"),
  backupButton: document.querySelector("#backupButton"),
  restorePickButton: document.querySelector("#restorePickButton"),
  restoreInput: document.querySelector("#restoreInput"),
  dataStatus: document.querySelector("#dataStatus"),
  onlineUrlInput: document.querySelector("#onlineUrlInput"),
  onlineKeyInput: document.querySelector("#onlineKeyInput"),
  onlineEmailInput: document.querySelector("#onlineEmailInput"),
  onlinePasswordInput: document.querySelector("#onlinePasswordInput"),
  onlineSaveButton: document.querySelector("#onlineSaveButton"),
  onlineRegisterButton: document.querySelector("#onlineRegisterButton"),
  onlineLoginButton: document.querySelector("#onlineLoginButton"),
  onlineLogoutButton: document.querySelector("#onlineLogoutButton"),
  onlinePushButton: document.querySelector("#onlinePushButton"),
  onlinePullButton: document.querySelector("#onlinePullButton"),
  onlineUserStatus: document.querySelector("#onlineUserStatus"),
  onlineStatus: document.querySelector("#onlineStatus"),
  debtDirectionInput: document.querySelector("#debtDirectionInput"),
  debtPersonInput: document.querySelector("#debtPersonInput"),
  debtAmountInput: document.querySelector("#debtAmountInput"),
  debtCurrencyInput: document.querySelector("#debtCurrencyInput"),
  debtDueInput: document.querySelector("#debtDueInput"),
  debtSaveButton: document.querySelector("#debtSaveButton"),
  debtList: document.querySelector("#debtList"),
  cardNameInput: document.querySelector("#cardNameInput"),
  cardCloseInput: document.querySelector("#cardCloseInput"),
  cardDueInput: document.querySelector("#cardDueInput"),
  cardSaveButton: document.querySelector("#cardSaveButton"),
  cardList: document.querySelector("#cardList"),
  annualPanel: document.querySelector("#annualPanel"),
  pinInput: document.querySelector("#pinInput"),
  pinSaveButton: document.querySelector("#pinSaveButton"),
  pinClearButton: document.querySelector("#pinClearButton"),
};

const colors = ["#0f766e", "#14b8a6", "#22c55e", "#0ea5e9", "#6366f1", "#f59e0b", "#ef4444", "#334155"];

if (state.pin && state.onlineSession?.access_token) {
  elements.lockScreen.classList.remove("hidden");
}

elements.monthFilter.value = state.month;
elements.dateInput.value = todayKey();
elements.onlineUrlInput.value = state.onlineConfig.url || DEFAULT_SUPABASE_URL;
elements.onlineKeyInput.value = state.onlineConfig.key || DEFAULT_SUPABASE_KEY;
elements.onlineEmailInput.value = state.onlineSession?.user?.email || "";
elements.authEmailInput.value = state.onlineSession?.user?.email || "";
renderAuthGate();
renderOnlineUserStatus();
startOnlinePolling();
populateCategoryInput();
populateCategoryFilter();
populateBudgetCategoryInput();
populatePaymentFilter();
populateSpendModeFilter();
populateAccountFilter();
populateSpendModeInput();

elements.typeInput.addEventListener("change", () => {
  populateCategoryInput();
  populateSpendModeInput();
});

elements.tabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

window.addEventListener("focus", () => {
  syncPullOnline(true);
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncPullOnline(true);
});

window.addEventListener("online", () => {
  scheduleOnlineSync();
  syncPullOnline(true);
});

elements.unlockButton.addEventListener("click", () => {
  if (elements.unlockPinInput.value === state.pin) {
    elements.lockScreen.classList.add("hidden");
    elements.unlockPinInput.value = "";
    elements.lockStatus.textContent = "";
  } else {
    elements.lockStatus.textContent = "PIN incorrecto.";
  }
});

elements.searchInput.addEventListener("input", () => {
  state.search = elements.searchInput.value.trim().toLowerCase();
  render();
});

elements.startDateFilter.addEventListener("change", () => {
  state.startDate = elements.startDateFilter.value;
  render();
});

elements.endDateFilter.addEventListener("change", () => {
  state.endDate = elements.endDateFilter.value;
  render();
});

elements.scanPickButton.addEventListener("click", () => {
  elements.receiptInput.click();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  setFormStatus("");

  const amount = parseInputAmount(elements.amountInput.value);
  const expense = {
    id: state.editingId || createId(),
    type: elements.typeInput.value,
    date: elements.dateInput.value,
    dueDate: elements.dueDateInput.value,
    scope: elements.scopeInput.value,
    account: elements.accountInput.value,
    category: elements.categoryInput.value,
    paymentMethod: elements.paymentInput.value,
    spendMode: elements.spendModeInput.value,
    description: elements.descriptionInput.value.trim(),
    tags: parseTags(elements.tagsInput.value),
    notes: elements.notesInput.value.trim(),
    amount,
    receiptImage: currentReceiptImage || existingReceiptImage(state.editingId),
  };

  if (!expense.date) {
    setFormStatus("Elegi una fecha.");
    return;
  }

  if (!expense.description) {
    setFormStatus("Escribi una descripcion.");
    return;
  }

  if (!expense.amount || expense.amount <= 0) {
    setFormStatus("Ingresa un monto valido. Ejemplo: 12500 o 12500,50.");
    return;
  }

  const wasEditing = Boolean(state.editingId);
  if (state.editingId) {
    state.expenses = state.expenses.map((item) => (item.id === state.editingId ? expense : item));
  } else {
    state.expenses.unshift(expense);
  }
  state.month = expense.date.slice(0, 7);
  elements.monthFilter.value = state.month;

  if (!persist()) return;

  resetForm();
  setFormStatus(wasEditing ? "Movimiento actualizado." : expense.type === "income" ? "Ingreso agregado." : "Gasto agregado.", "success");
  render();
});

elements.monthFilter.addEventListener("change", () => {
  state.month = elements.monthFilter.value || monthKey(new Date());
  render();
});

elements.categoryFilter.addEventListener("change", () => {
  state.category = elements.categoryFilter.value;
  render();
});

elements.typeFilter.addEventListener("change", () => {
  state.type = elements.typeFilter.value;
  populateCategoryFilter();
  populateSpendModeFilter();
  render();
});

elements.accountFilter.addEventListener("change", () => {
  state.account = elements.accountFilter.value;
  render();
});

elements.scopeFilter.addEventListener("change", () => {
  state.scope = elements.scopeFilter.value;
  render();
});

elements.paymentFilter.addEventListener("change", () => {
  state.payment = elements.paymentFilter.value;
  render();
});

elements.spendModeFilter.addEventListener("change", () => {
  state.spendMode = elements.spendModeFilter.value;
  render();
});

elements.budgetSaveButton.addEventListener("click", () => {
  const category = elements.budgetCategoryInput.value;
  const amount = parseInputAmount(elements.budgetAmountInput.value);
  if (!category || !amount || amount <= 0) {
    setDataStatus("Ingresa una categoria y un limite valido.");
    return;
  }
  state.budgets[category] = amount;
  elements.budgetAmountInput.value = "";
  persistSettings();
  setDataStatus("Presupuesto guardado.", "success");
  render();
});

elements.budgetList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-budget-delete]");
  if (!button) return;
  delete state.budgets[button.dataset.budgetDelete];
  persistSettings();
  render();
});

elements.recurringSaveButton.addEventListener("click", () => {
  const amount = parseInputAmount(elements.amountInput.value);
  const description = elements.descriptionInput.value.trim();
  if (!description || !amount || amount <= 0) {
    setDataStatus("Completa descripcion y monto antes de guardar un recurrente.");
    return;
  }
  const day = elements.recurringDayInput.value === "same" ? Number(elements.dateInput.value.slice(8, 10)) || 1 : Number(elements.recurringDayInput.value);
  state.recurring.unshift({
    id: createId(),
    type: elements.typeInput.value,
    account: elements.accountInput.value,
    scope: elements.scopeInput.value,
    category: elements.categoryInput.value,
    paymentMethod: elements.paymentInput.value,
    spendMode: elements.spendModeInput.value,
    description,
    amount,
    tags: parseTags(elements.tagsInput.value),
    notes: elements.notesInput.value.trim(),
    dueDate: elements.dueDateInput.value,
    day,
  });
  persistSettings();
  setDataStatus("Recurrente guardado.", "success");
  render();
});

elements.recurringApplyButton.addEventListener("click", () => {
  const created = applyRecurringForMonth(state.month);
  if (created) {
    persist();
    setDataStatus(`Se generaron ${created} movimientos recurrentes.`, "success");
  } else {
    setDataStatus("No habia recurrentes nuevos para este mes.");
  }
  render();
});

elements.recurringList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-recurring-delete]");
  if (!button) return;
  state.recurring = state.recurring.filter((item) => item.id !== button.dataset.recurringDelete);
  persistSettings();
  render();
});

elements.backupButton.addEventListener("click", () => {
  downloadBackup();
});

elements.excelButton.addEventListener("click", () => {
  exportExcel();
});

elements.restorePickButton.addEventListener("click", () => {
  elements.restoreInput.click();
});

elements.restoreInput.addEventListener("change", () => {
  restoreBackup(elements.restoreInput.files[0]);
});

elements.onlineSaveButton.addEventListener("click", () => {
  state.onlineConfig = readOnlineConfigFromForm();
  localStorage.setItem(ONLINE_CONFIG_STORAGE_KEY, JSON.stringify(state.onlineConfig));
  startOnlinePolling();
  setOnlineStatus("Conexion guardada. Ahora registra o entra con tu usuario.", "success");
});

elements.onlineRegisterButton.addEventListener("click", () => {
  registerOnlineUser();
});

elements.onlineLoginButton.addEventListener("click", () => {
  loginOnlineUser();
});

elements.authRegisterButton.addEventListener("click", () => {
  registerOnlineUser();
});

elements.authLoginButton.addEventListener("click", () => {
  loginOnlineUser();
});

elements.onlineLogoutButton.addEventListener("click", () => {
  logoutOnlineUser();
});

elements.onlinePushButton.addEventListener("click", () => {
  syncPushOnline();
});

elements.onlinePullButton.addEventListener("click", () => {
  syncPullOnline();
});

elements.cancelEditButton.addEventListener("click", () => {
  resetForm();
  setFormStatus("Edicion cancelada.");
});

elements.debtSaveButton.addEventListener("click", () => {
  const person = elements.debtPersonInput.value.trim();
  const amount = parseInputAmount(elements.debtAmountInput.value);
  if (!person || !amount || amount <= 0) {
    setDataStatus("Completa persona y monto de la deuda.");
    return;
  }
  state.debts.unshift({
    id: createId(),
    direction: elements.debtDirectionInput.value,
    person,
    amount,
    currency: elements.debtCurrencyInput.value,
    dueDate: elements.debtDueInput.value,
    status: "pending",
  });
  elements.debtPersonInput.value = "";
  elements.debtAmountInput.value = "";
  elements.debtDueInput.value = "";
  persistSettings();
  render();
});

elements.debtList.addEventListener("click", (event) => {
  const paidButton = event.target.closest("[data-debt-paid]");
  const deleteButton = event.target.closest("[data-debt-delete]");
  if (paidButton) {
    state.debts = state.debts.map((debt) => debt.id === paidButton.dataset.debtPaid ? { ...debt, status: debt.status === "paid" ? "pending" : "paid" } : debt);
  }
  if (deleteButton) {
    state.debts = state.debts.filter((debt) => debt.id !== deleteButton.dataset.debtDelete);
  }
  persistSettings();
  render();
});

elements.cardSaveButton.addEventListener("click", () => {
  const name = elements.cardNameInput.value;
  const closeDay = clampDay(elements.cardCloseInput.value);
  const dueDay = clampDay(elements.cardDueInput.value);
  state.cards[name] = { closeDay, dueDay };
  persistSettings();
  render();
});

elements.pinSaveButton.addEventListener("click", () => {
  const value = elements.pinInput.value.trim();
  if (value.length < 4) {
    setDataStatus("El PIN debe tener al menos 4 numeros.");
    return;
  }
  state.pin = value;
  localStorage.setItem(PIN_STORAGE_KEY, value);
  elements.pinInput.value = "";
  setDataStatus("PIN guardado.", "success");
});

elements.pinClearButton.addEventListener("click", () => {
  state.pin = "";
  localStorage.removeItem(PIN_STORAGE_KEY);
  setDataStatus("PIN quitado.", "success");
});

elements.receiptInput.addEventListener("change", async () => {
  const file = elements.receiptInput.files[0];
  if (!file) return;

  try {
    setScanStatus("Foto seleccionada. Guardando copia local...");
    currentReceiptImage = await compressReceiptImage(file);
    elements.receiptPreview.src = currentReceiptImage;
    elements.receiptPreview.classList.add("visible");
  } catch {
    currentReceiptImage = "";
    setScanStatus("No pude guardar la foto. Proba con otra imagen.");
    return;
  }

  try {
    setScanStatus("Preparando lector OCR...");
    const tesseract = await loadTesseract();
    setScanStatus("Leyendo factura...");

    const result = await tesseract.recognize(file, "spa+eng", {
      logger: (progress) => {
        if (progress.status === "recognizing text") {
          setScanStatus(`Leyendo texto: <strong>${Math.round(progress.progress * 100)}%</strong>`);
        }
      },
    });

    applyReceiptData(parseReceiptText(result.data.text));
  } catch (error) {
    console.error(error);
    setScanStatus("La foto quedo guardada, pero no pude leer el texto. Carga los datos manualmente.");
  }
});

elements.exportButton.addEventListener("click", () => {
  const rows = filteredExpenses();
  if (!rows.length) return;

  const csv = [
    ["Fecha", "Vencimiento", "Tipo", "Ambito", "Cuenta", "Categoria", "Tipo de pago", "Modo de gasto o ingreso", "Descripcion", "Etiquetas", "Notas", "Monto"],
    ...rows.map((expense) => [
      expense.date,
      expense.dueDate || "",
      movementType(expense) === "income" ? "Ingreso" : "Gasto",
      scopeName(expense),
      accountName(expense),
      expense.category,
      paymentMethod(expense),
      spendMode(expense),
      expense.description,
      tagsText(expense),
      expense.notes || "",
      movementType(expense) === "income" ? expense.amount : -expense.amount,
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `movimientos-${state.month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

function exportExcel() {
  const rows = filteredExpenses();
  if (!rows.length) return;
  const htmlRows = rows
    .map(
      (expense) => `<tr><td>${escapeHtml(expense.date)}</td><td>${escapeHtml(expense.dueDate || "")}</td><td>${movementType(expense) === "income" ? "Ingreso" : "Gasto"}</td><td>${escapeHtml(scopeName(expense))}</td><td>${escapeHtml(accountName(expense))}</td><td>${escapeHtml(expense.category)}</td><td>${escapeHtml(paymentMethod(expense))}</td><td>${escapeHtml(spendMode(expense))}</td><td>${escapeHtml(expense.description)}</td><td>${escapeHtml(tagsText(expense))}</td><td>${escapeHtml(expense.notes || "")}</td><td>${movementType(expense) === "income" ? expense.amount : -expense.amount}</td></tr>`
    )
    .join("");
  const html = `<table><thead><tr><th>Fecha</th><th>Vencimiento</th><th>Tipo</th><th>Ambito</th><th>Cuenta</th><th>Categoria</th><th>Pago</th><th>Modo</th><th>Descripcion</th><th>Etiquetas</th><th>Notas</th><th>Monto</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `movimientos-${state.month}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

elements.reportButton.addEventListener("click", () => {
  openMonthlyReport();
});

elements.mailButton.addEventListener("click", () => {
  sendMonthlyReportByEmail();
});

elements.seedButton.addEventListener("click", () => {
  const baseMonth = state.month || monthKey(new Date());
  const samples = [
    ["income", "Personal", "Banco", "Sueldo", "Sueldo mensual", 420000, "Transferencia", "Sueldo", "trabajo", "01"],
    ["income", "Negocio", "Efectivo", "Ventas", "Venta particular", 85000, "Efectivo", "Venta", "extra", "15"],
    ["expense", "Personal", "Visa", "Comida", "Supermercado", 38500, "Visa", "Necesario", "casa", "03"],
    ["expense", "Personal", "Mastercard", "Transporte", "Combustible", 23000, "Mastercard", "Variable", "auto", "06"],
    ["expense", "Personal", "Banco", "Servicios", "Internet", 18000, "Transferencia", "Fijo", "casa", "10"],
    ["expense", "Personal", "Efectivo", "Casa", "Limpieza", 9400, "Efectivo", "Necesario", "casa", "12"],
    ["expense", "Personal", "Visa", "Ocio", "Cena", 16500, "Tarjeta", "Extra", "salidas", "18"],
  ];

  const newItems = samples.map(([type, scope, account, category, description, amount, paymentMethod, spendMode, tags, day]) => ({
    id: createId(),
    type,
    scope,
    date: `${baseMonth}-${day}`,
    dueDate: "",
    account,
    category,
    paymentMethod,
    spendMode,
    description,
    tags: parseTags(tags),
    notes: "",
    amount,
    receiptImage: "",
  }));

  state.expenses = [...newItems, ...state.expenses];
  persist();
  render();
});

elements.expenseTable.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    state.expenses = state.expenses.filter((expense) => expense.id !== deleteButton.dataset.deleteId);
    persist();
    render();
    return;
  }

  const editButton = event.target.closest("[data-edit-id]");
  if (editButton) {
    startEdit(editButton.dataset.editId);
  }
});

render();
window.receiptScanner = { parseReceiptText };
registerServiceWorker();

function render() {
  const rows = filteredExpenses();
  const monthRows = expensesForMonth();
  const expenseRows = monthRows.filter((expense) => movementType(expense) === "expense");
  const incomeRows = monthRows.filter((expense) => movementType(expense) === "income");
  const totals = totalsByCategory(expenseRows);
  const accountTotals = totalsByField(monthRows, accountName);
  const paymentTotals = totalsByField(monthRows, paymentMethod);
  const spendModeTotals = totalsByField(monthRows, spendMode);
  const totalExpenses = expenseRows.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = incomeRows.reduce((sum, expense) => sum + expense.amount, 0);
  const totalMovement = totalIncome + totalExpenses;
  const balance = totalIncome - totalExpenses;
  const largest = expenseRows.sort((a, b) => b.amount - a.amount)[0];
  const topPayment = Object.entries(paymentTotals).sort((a, b) => b[1] - a[1])[0];
  const previousExpenseTotal = expensesForMonth(previousMonthKey(state.month))
    .filter((expense) => movementType(expense) === "expense")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const comparePercent = previousExpenseTotal ? Math.round(((totalExpenses - previousExpenseTotal) / previousExpenseTotal) * 100) : 0;

  elements.balanceTotal.textContent = currency.format(balance);
  elements.balanceTotal.classList.toggle("positive", balance >= 0);
  elements.balanceTotal.classList.toggle("negative", balance < 0);
  elements.incomeTotal.textContent = currency.format(totalIncome);
  elements.expenseTotal.textContent = currency.format(totalExpenses);
  elements.expenseCount.textContent = String(monthRows.length);
  elements.savingRate.textContent = totalIncome ? `${Math.round((balance / totalIncome) * 100)}%` : "0%";
  elements.savingRate.classList.toggle("positive", balance >= 0);
  elements.savingRate.classList.toggle("negative", balance < 0);
  elements.monthCompare.textContent = previousExpenseTotal ? `${comparePercent > 0 ? "+" : ""}${comparePercent}%` : "-";
  elements.monthCompare.classList.toggle("negative", comparePercent > 0);
  elements.monthCompare.classList.toggle("positive", comparePercent <= 0 && previousExpenseTotal > 0);
  elements.largestExpense.textContent = largest ? currency.format(largest.amount) : "$0";
  elements.topPayment.textContent = topPayment ? topPayment[0] : "-";
  renderBudgets(expenseRows);
  renderRecurring();
  renderDebts();
  renderCards(monthRows);
  renderAnnualPanel();

  elements.expenseTable.innerHTML = rows
    .map(
      (expense) => `
        <tr>
          <td>${formatDate(expense.date)}</td>
          <td>${typePillMarkup(expense)}</td>
          <td>${metaPillMarkup(accountName(expense))}</td>
          <td>${metaPillMarkup(scopeName(expense))}</td>
          <td><span class="category-pill">${escapeHtml(expense.category)}</span></td>
          <td>${metaPillMarkup(paymentMethod(expense))}</td>
          <td>${metaPillMarkup(spendMode(expense))}</td>
          <td>${escapeHtml(expense.description)}</td>
          <td>${receiptImageMarkup(expense.receiptImage)}</td>
          <td class="amount-col ${movementType(expense) === "income" ? "positive" : "negative"}">${signedCurrency(expense)}</td>
          <td>${escapeHtml(tagsText(expense) || "-")}</td>
          <td>${expense.dueDate ? formatDate(expense.dueDate) : "-"}</td>
          <td class="delete-col">
            <button class="edit-button" type="button" data-edit-id="${expense.id}" title="Editar" aria-label="Editar movimiento">e</button>
            <button class="delete-button" type="button" data-delete-id="${expense.id}" title="Borrar" aria-label="Borrar movimiento">x</button>
          </td>
        </tr>
      `
    )
    .join("");

  elements.emptyState.classList.toggle("visible", rows.length === 0);
  drawChart(totals);
}

function filteredExpenses() {
  return expensesForMonth()
    .filter((expense) => !state.startDate || expense.date >= state.startDate)
    .filter((expense) => !state.endDate || expense.date <= state.endDate)
    .filter((expense) => state.type === "Todos" || movementType(expense) === state.type)
    .filter((expense) => state.account === "Todas" || accountName(expense) === state.account)
    .filter((expense) => state.scope === "Todos" || scopeName(expense) === state.scope)
    .filter((expense) => state.category === "Todas" || expense.category === state.category)
    .filter((expense) => state.payment === "Todos" || paymentMethod(expense) === state.payment)
    .filter((expense) => state.spendMode === "Todos" || spendMode(expense) === state.spendMode)
    .filter((expense) => !state.search || searchableText(expense).includes(state.search))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function expensesForMonth(month = state.month) {
  return state.expenses.filter((expense) => expense.date && expense.date.startsWith(month));
}

function movementType(expense) {
  return expense.type === "income" ? "income" : "expense";
}

function accountName(expense) {
  if (expense.account) return expense.account;
  const method = paymentMethod(expense);
  return ACCOUNTS.includes(method) ? method : "Efectivo";
}

function scopeName(expense) {
  return expense.scope || "Personal";
}

function paymentMethod(expense) {
  return expense.paymentMethod || "Sin especificar";
}

function spendMode(expense) {
  if (expense.spendMode) return expense.spendMode === "Ingreso" ? "Otro" : expense.spendMode;
  return movementType(expense) === "income" ? "Otro" : "Variable";
}

function modesForType(type) {
  if (type === "income") return INCOME_MODES;
  if (type === "expense") return SPEND_MODES;
  return [...new Set([...SPEND_MODES, ...INCOME_MODES])];
}

function categoriesForType(type) {
  if (type === "income") return INCOME_CATEGORIES;
  if (type === "expense") return EXPENSE_CATEGORIES;
  return [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES, ...state.expenses.map((expense) => expense.category).filter(Boolean)])];
}

function tagsText(expense) {
  return Array.isArray(expense.tags) ? expense.tags.join(", ") : expense.tags || "";
}

function parseTags(value) {
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function searchableText(expense) {
  return [
    expense.date,
    expense.dueDate,
    movementType(expense) === "income" ? "ingreso" : "gasto",
    scopeName(expense),
    accountName(expense),
    expense.category,
    paymentMethod(expense),
    spendMode(expense),
    expense.description,
    tagsText(expense),
    expense.notes,
  ]
    .join(" ")
    .toLowerCase();
}

function populateCategoryInput(selected = "") {
  const categories = categoriesForType(elements.typeInput.value);
  const active = selected && categories.includes(selected) ? selected : categories[0];
  elements.categoryInput.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  elements.categoryInput.value = active;
}

function populateBudgetCategoryInput() {
  elements.budgetCategoryInput.innerHTML = EXPENSE_CATEGORIES.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
}

function populateCategoryFilter() {
  const categories = categoriesForType(state.type);
  const selected = categories.includes(state.category) ? state.category : "Todas";
  elements.categoryFilter.innerHTML = [
    '<option value="Todas">Todas</option>',
    ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`),
  ].join("");
  elements.categoryFilter.value = selected;
  state.category = selected;
}

function populateAccountFilter() {
  const accounts = [...new Set([...ACCOUNTS, ...state.expenses.map(accountName).filter(Boolean)])];
  elements.accountFilter.innerHTML = [
    '<option value="Todas">Todas las cuentas</option>',
    ...accounts.map((account) => `<option value="${escapeHtml(account)}">${escapeHtml(account)}</option>`),
  ].join("");
  elements.accountFilter.value = accounts.includes(state.account) ? state.account : "Todas";
  state.account = elements.accountFilter.value;
}

function populatePaymentFilter() {
  const methods = [...new Set([...PAYMENT_METHODS, ...state.expenses.map(paymentMethod).filter(Boolean)])];
  elements.paymentFilter.innerHTML = [
    '<option value="Todos">Todos los pagos</option>',
    ...methods.map((method) => `<option value="${escapeHtml(method)}">${escapeHtml(method)}</option>`),
  ].join("");
  elements.paymentFilter.value = methods.includes(state.payment) ? state.payment : "Todos";
  state.payment = elements.paymentFilter.value;
}

function populateSpendModeFilter() {
  const baseModes = modesForType(state.type);
  const savedModes = state.expenses
    .filter((expense) => state.type === "Todos" || movementType(expense) === state.type)
    .map(spendMode)
    .filter(Boolean);
  const modes = [...new Set([...baseModes, ...savedModes])];
  elements.spendModeFilter.innerHTML = [
    '<option value="Todos">Todos los modos</option>',
    ...modes.map((mode) => `<option value="${escapeHtml(mode)}">${escapeHtml(mode)}</option>`),
  ].join("");
  elements.spendModeFilter.value = modes.includes(state.spendMode) ? state.spendMode : "Todos";
  state.spendMode = elements.spendModeFilter.value;
}

function populateSpendModeInput(selected = "") {
  const modes = modesForType(elements.typeInput.value);
  const active = selected && modes.includes(selected) ? selected : modes[0];
  elements.spendModeInput.innerHTML = modes.map((mode) => `<option value="${escapeHtml(mode)}">${escapeHtml(mode)}</option>`).join("");
  elements.spendModeInput.value = active;
}

function typePillMarkup(expense) {
  const type = movementType(expense);
  const label = type === "income" ? "Ingreso" : "Gasto";
  return `<span class="type-pill ${type}">${label}</span>`;
}

function metaPillMarkup(label) {
  return `<span class="meta-pill">${escapeHtml(label)}</span>`;
}

function signedCurrency(expense) {
  const sign = movementType(expense) === "income" ? "+" : "-";
  return `${sign} ${currency.format(expense.amount)}`;
}

function totalsByCategory(expenses) {
  return expenses.reduce((result, expense) => {
    result[expense.category] = (result[expense.category] || 0) + expense.amount;
    return result;
  }, {});
}

function totalsByField(expenses, getter) {
  return expenses.reduce((result, expense) => {
    const key = getter(expense);
    result[key] = (result[key] || 0) + expense.amount;
    return result;
  }, {});
}

function renderBudgets(expenseRows) {
  const entries = Object.entries(state.budgets);
  if (!entries.length) {
    elements.budgetList.innerHTML = '<div class="stack-item">Sin presupuestos cargados.</div>';
    return;
  }

  const totals = totalsByCategory(expenseRows);
  elements.budgetList.innerHTML = entries
    .map(([category, limit]) => {
      const spent = totals[category] || 0;
      const percent = limit ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
      const warning = spent > limit ? " warning" : "";
      return `
        <div class="stack-item">
          <strong>${escapeHtml(category)}</strong>
          <span>${currency.format(spent)} de ${currency.format(limit)} (${percent}%)</span>
          <div class="progress-bar"><div class="progress-fill${warning}" style="--progress: ${percent}%"></div></div>
          <button class="secondary-button" type="button" data-budget-delete="${escapeHtml(category)}">Borrar</button>
        </div>
      `;
    })
    .join("");
}

function renderRecurring() {
  if (!state.recurring.length) {
    elements.recurringList.innerHTML = '<div class="stack-item">Sin recurrentes cargados.</div>';
    return;
  }

  elements.recurringList.innerHTML = state.recurring
    .slice(0, 6)
    .map(
      (item) => `
        <div class="stack-item">
          <strong>${escapeHtml(item.description)}</strong>
          <span>${item.day} de cada mes - ${item.type === "income" ? "Ingreso" : "Gasto"} - ${currency.format(item.amount)}</span>
          <button class="secondary-button" type="button" data-recurring-delete="${item.id}">Borrar</button>
        </div>
      `
    )
    .join("");
}

function renderDebts() {
  if (!state.debts.length) {
    elements.debtList.innerHTML = '<div class="stack-item">Sin deudas cargadas.</div>';
    return;
  }

  const pending = state.debts.filter((debt) => debt.status !== "paid");
  const totals = pending.reduce(
    (result, debt) => {
      const side = debt.direction === "owed_to_me" ? "receivable" : "payable";
      const debtCurrency = debt.currency || "ARS";
      result[side][debtCurrency] = (result[side][debtCurrency] || 0) + debt.amount;
      return result;
    },
    { receivable: {}, payable: {} }
  );
  const summary = `
    <div class="stack-item">
      <strong>Totales pendientes</strong>
      <span>Me deben: ${formatDebtAmount(totals.receivable.ARS || 0, "ARS")} / ${formatDebtAmount(totals.receivable.USD || 0, "USD")}</span>
      <span>Debo: ${formatDebtAmount(totals.payable.ARS || 0, "ARS")} / ${formatDebtAmount(totals.payable.USD || 0, "USD")}</span>
    </div>
  `;

  elements.debtList.innerHTML = summary + state.debts
    .slice(0, 8)
    .map((debt) => {
      const label = debt.direction === "owed_to_me" ? "Me deben" : "Debo";
      const debtCurrency = debt.currency || "ARS";
      return `
        <div class="stack-item">
          <strong>${label}: ${escapeHtml(debt.person)}</strong>
          <span>${formatDebtAmount(debt.amount, debtCurrency)}${debt.dueDate ? ` - vence ${formatDate(debt.dueDate)}` : ""} - ${debt.status === "paid" ? "pagado" : "pendiente"}</span>
          <button class="secondary-button" type="button" data-debt-paid="${debt.id}">${debt.status === "paid" ? "Marcar pendiente" : "Marcar pagado"}</button>
          <button class="secondary-button" type="button" data-debt-delete="${debt.id}">Borrar</button>
        </div>
      `;
    })
    .join("");
}

function formatDebtAmount(amount, debtCurrency) {
  return debtCurrency === "USD" ? usdCurrency.format(amount) : currency.format(amount);
}

function renderCards(monthRows) {
  const cardNames = ["Visa", "Mastercard"];
  elements.cardList.innerHTML = cardNames
    .map((name) => {
      const config = state.cards[name] || {};
      const amount = monthRows
        .filter((expense) => movementType(expense) === "expense" && (accountName(expense) === name || paymentMethod(expense) === name))
        .reduce((sum, expense) => sum + expense.amount, 0);
      const closeDay = config.closeDay || "-";
      const dueDay = config.dueDay || "-";
      return `
        <div class="stack-item">
          <strong>${name}: ${currency.format(amount)}</strong>
          <span>Cierre: ${closeDay} - Vencimiento: ${dueDay}</span>
        </div>
      `;
    })
    .join("");
}

function renderAnnualPanel() {
  const year = Number(state.month.slice(0, 4));
  const lines = Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`;
    const rows = expensesForMonth(month);
    const income = rows.filter((expense) => movementType(expense) === "income").reduce((sum, expense) => sum + expense.amount, 0);
    const expense = rows.filter((item) => movementType(item) === "expense").reduce((sum, item) => sum + item.amount, 0);
    return { month, balance: income - expense };
  });
  const total = lines.reduce((sum, item) => sum + item.balance, 0);
  const average = total / 12;
  elements.annualPanel.innerHTML = [
    `<div class="stack-item"><strong>Ahorro anual</strong><span>${currency.format(total)}</span></div>`,
    `<div class="stack-item"><strong>Promedio mensual</strong><span>${currency.format(average)}</span></div>`,
    ...lines
      .filter((item) => item.balance !== 0)
      .slice(-6)
      .map((item) => `<div class="stack-item"><strong>${item.month}</strong><span>${currency.format(item.balance)}</span></div>`),
  ].join("");
}

function applyRecurringForMonth(month) {
  let created = 0;
  state.recurring.forEach((item) => {
    const day = String(Math.min(Number(item.day) || 1, daysInMonth(month))).padStart(2, "0");
    const date = `${month}-${day}`;
    const recurringKey = `${item.id}:${month}`;
    const exists = state.expenses.some((expense) => expense.recurringKey === recurringKey);
    if (exists) return;

    state.expenses.unshift({
      ...item,
      id: createId(),
      date,
      receiptImage: "",
      recurringKey,
    });
    created += 1;
  });
  return created;
}

function drawChart(totals) {
  const canvas = elements.chart;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = 220 * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, 220);

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    ctx.fillStyle = "#776464";
    ctx.font = "14px Arial";
    ctx.fillText("Sin datos para graficar", 18, 42);
    return;
  }

  const max = Math.max(...entries.map((entry) => entry[1]));
  const barHeight = 24;
  const gap = 13;
  const labelWidth = 112;
  const chartWidth = Math.max(80, rect.width - labelWidth - 84);

  entries.forEach(([label, value], index) => {
    const y = 22 + index * (barHeight + gap);
    const width = (value / max) * chartWidth;

    ctx.fillStyle = "#776464";
    ctx.font = "13px Arial";
    ctx.fillText(label, 0, y + 17);

    ctx.fillStyle = "#ecfdf5";
    roundRect(ctx, labelWidth, y, chartWidth, barHeight, 6);
    ctx.fill();

    ctx.fillStyle = colors[index % colors.length];
    roundRect(ctx, labelWidth, y, width, barHeight, 6);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Arial";
    ctx.fillText(currency.format(value), labelWidth + width + 10, y + 17);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return saved.map((expense) => ({
      ...expense,
      type: movementType(expense),
      scope: scopeName(expense),
      account: accountName(expense),
      paymentMethod: paymentMethod(expense),
      spendMode: spendMode(expense),
      tags: parseTags(tagsText(expense)),
      notes: expense.notes || "",
      dueDate: expense.dueDate || "",
    }));
  } catch {
    return [];
  }
}

function loadBudgets() {
  return loadJson(BUDGET_STORAGE_KEY, {});
}

function loadRecurring() {
  return loadJson(RECURRING_STORAGE_KEY, []);
}

function loadDebts() {
  return loadJson(DEBT_STORAGE_KEY, []);
}

function loadCards() {
  return loadJson(CARD_STORAGE_KEY, {});
}

function loadOnlineConfig() {
  const saved = loadJson(ONLINE_CONFIG_STORAGE_KEY, {});
  return {
    url: saved.url || DEFAULT_SUPABASE_URL,
    key: saved.key || DEFAULT_SUPABASE_KEY,
  };
}

function loadOnlineSession() {
  return loadJson(ONLINE_SESSION_STORAGE_KEY, null);
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
    scheduleOnlineSync();
    return true;
  } catch {
    setFormStatus("No pude guardar. Hay demasiadas fotos guardadas; borra alguna factura o carga el gasto sin foto.");
    return false;
  }
}

function persistSettings() {
  localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(state.budgets));
  localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(state.recurring));
  localStorage.setItem(DEBT_STORAGE_KEY, JSON.stringify(state.debts));
  localStorage.setItem(CARD_STORAGE_KEY, JSON.stringify(state.cards));
  scheduleOnlineSync();
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function daysInSelectedMonth() {
  const [year, month] = state.month.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function daysInMonth(monthKeyValue) {
  const [year, month] = monthKeyValue.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function previousMonthKey(value) {
  const [year, month] = value.split("-").map(Number);
  return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
}

function clampDay(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.max(1, Math.min(31, Math.round(number)));
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(year, month - 1, day)
  );
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setScanStatus(message) {
  elements.scanStatus.innerHTML = message;
}

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractLoader) return tesseractLoader;

  tesseractLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error("No se pudo cargar Tesseract"));
    document.head.appendChild(script);
  });

  return tesseractLoader;
}

function applyReceiptData(parsed) {
  if (parsed.date) {
    elements.dateInput.value = parsed.date;
  }

  if (parsed.amount) {
    elements.amountInput.value = parsed.amount.toFixed(2).replace(".", ",");
  }

  if (parsed.description) {
    elements.descriptionInput.value = parsed.description.slice(0, 60);
  }

  const found = [
    parsed.date ? "fecha" : "",
    parsed.amount ? "monto" : "",
    parsed.description ? "descripcion" : "",
  ].filter(Boolean);

  if (found.length) {
    setScanStatus(`Foto guardada. Datos detectados: <strong>${found.join(", ")}</strong>. Revisalos antes de agregar.`);
  } else {
    setScanStatus("Foto guardada. No encontre fecha ni total; carga los datos manualmente.");
  }
}

function parseReceiptText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    date: findReceiptDate(text),
    amount: findReceiptAmount(lines),
    description: findReceiptDescription(lines),
  };
}

function findReceiptDate(text) {
  const match = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (!match) return "";

  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += 2000;

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function findReceiptAmount(lines) {
  const totalWords = /(total|importe|pagar|pagado|monto|subtotal|debito|credito)/i;
  const candidates = [];

  lines.forEach((line, index) => {
    const amounts = line.match(/(?:\$|\b)?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})\b|\b\d+[.,]\d{2}\b/g) || [];
    amounts.forEach((rawAmount) => {
      const value = parseLocalizedAmount(rawAmount);
      if (!value || value <= 0) return;
      candidates.push({
        value,
        score: totalWords.test(line) ? 3 : index / Math.max(lines.length, 1),
      });
    });
  });

  if (!candidates.length) return 0;
  return candidates.sort((a, b) => b.score - a.score || b.value - a.value)[0].value;
}

function parseLocalizedAmount(value) {
  const cleaned = String(value).replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const decimalIndex = Math.max(lastComma, lastDot);

  if (decimalIndex === -1) return Number(cleaned);

  const separator = cleaned[decimalIndex];
  const decimalPartRaw = cleaned.slice(decimalIndex + 1).replace(/[^\d]/g, "");
  const onlyOneSeparator = cleaned.indexOf(separator) === decimalIndex;

  if (onlyOneSeparator && decimalPartRaw.length === 3) {
    return Number(cleaned.replace(/[^\d]/g, ""));
  }

  const integerPart = cleaned.slice(0, decimalIndex).replace(/[^\d]/g, "");
  const decimalPart = decimalPartRaw.slice(0, 2);
  return Number(`${integerPart}.${decimalPart.padEnd(2, "0")}`);
}

function parseInputAmount(value) {
  return parseLocalizedAmount(value);
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function setFormStatus(message, type = "") {
  elements.formStatus.textContent = message;
  elements.formStatus.classList.toggle("success", type === "success");
}

function setAuthStatus(message, type = "") {
  elements.authStatus.textContent = message;
  elements.authStatus.classList.toggle("success", type === "success");
}

function setDataStatus(message, type = "") {
  elements.dataStatus.textContent = message;
  elements.dataStatus.classList.toggle("success", type === "success");
}

function setOnlineStatus(message, type = "") {
  elements.onlineStatus.textContent = message;
  elements.onlineStatus.classList.toggle("success", type === "success");
}

function setActiveTab(tabName) {
  elements.tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

function resetForm() {
  state.editingId = "";
  elements.form.reset();
  elements.dateInput.value = todayKey();
  elements.dueDateInput.value = "";
  elements.typeInput.value = "expense";
  elements.scopeInput.value = "Personal";
  populateCategoryInput();
  populateSpendModeInput();
  currentReceiptImage = "";
  elements.notesInput.value = "";
  elements.receiptPreview.removeAttribute("src");
  elements.receiptPreview.classList.remove("visible");
  elements.cancelEditButton.classList.add("hidden");
  elements.form.querySelector(".primary-button").textContent = "Agregar movimiento";
  setScanStatus("");
}

function existingReceiptImage(id) {
  if (!id) return "";
  return state.expenses.find((expense) => expense.id === id)?.receiptImage || "";
}

function startEdit(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;

  state.editingId = id;
  elements.typeInput.value = movementType(expense);
  elements.scopeInput.value = scopeName(expense);
  populateCategoryInput(expense.category);
  populateSpendModeInput(spendMode(expense));
  elements.dateInput.value = expense.date;
  elements.dueDateInput.value = expense.dueDate || "";
  elements.accountInput.value = accountName(expense);
  elements.paymentInput.value = paymentMethod(expense);
  elements.descriptionInput.value = expense.description;
  elements.amountInput.value = String(expense.amount).replace(".", ",");
  elements.tagsInput.value = tagsText(expense);
  elements.notesInput.value = expense.notes || "";
  currentReceiptImage = expense.receiptImage || "";
  if (currentReceiptImage) {
    elements.receiptPreview.src = currentReceiptImage;
    elements.receiptPreview.classList.add("visible");
  } else {
    elements.receiptPreview.removeAttribute("src");
    elements.receiptPreview.classList.remove("visible");
  }
  elements.cancelEditButton.classList.remove("hidden");
  elements.form.querySelector(".primary-button").textContent = "Guardar cambios";
  setFormStatus("Editando movimiento.");
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadBackup() {
  const data = createDataSnapshot();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `backup-finanzas-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setDataStatus("Copia de seguridad descargada.", "success");
}

function createDataSnapshot() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    expenses: state.expenses,
    budgets: state.budgets,
    recurring: state.recurring,
    debts: state.debts,
    cards: state.cards,
  };
}

function snapshotHasContent(snapshot) {
  if (!snapshot) return false;
  return Boolean(
    (Array.isArray(snapshot.expenses) && snapshot.expenses.length) ||
      (snapshot.budgets && Object.keys(snapshot.budgets).length) ||
      (Array.isArray(snapshot.recurring) && snapshot.recurring.length) ||
      (Array.isArray(snapshot.debts) && snapshot.debts.length) ||
      (snapshot.cards && Object.keys(snapshot.cards).length)
  );
}

function saveSafetyBackup(reason) {
  const snapshot = createDataSnapshot();
  if (!snapshotHasContent(snapshot)) return;
  const backups = loadJson(SAFETY_BACKUPS_STORAGE_KEY, []);
  backups.unshift({
    owner: "Benjamin Medina",
    reason,
    createdAt: new Date().toISOString(),
    snapshot,
  });
  localStorage.setItem(SAFETY_BACKUPS_STORAGE_KEY, JSON.stringify(backups.slice(0, 5)));
}

function restoreBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      saveSafetyBackup("antes-de-restaurar-archivo");
      applyDataSnapshot(JSON.parse(reader.result));
      setDataStatus("Copia de seguridad restaurada.", "success");
    } catch {
      setDataStatus("No pude restaurar ese archivo.");
    }
  };
  reader.readAsText(file);
  elements.restoreInput.value = "";
}

function applyDataSnapshot(data) {
  applyingOnlineSnapshot = true;
  try {
    state.expenses = Array.isArray(data.expenses) ? data.expenses : [];
    state.budgets = data.budgets && typeof data.budgets === "object" ? data.budgets : {};
    state.recurring = Array.isArray(data.recurring) ? data.recurring : [];
    state.debts = Array.isArray(data.debts) ? data.debts : [];
    state.cards = data.cards && typeof data.cards === "object" ? data.cards : {};
    persist();
    persistSettings();
  } finally {
    applyingOnlineSnapshot = false;
  }
  populateCategoryFilter();
  populateAccountFilter();
  populatePaymentFilter();
  populateSpendModeFilter();
  render();
}

function scheduleOnlineSync() {
  if (applyingOnlineSnapshot) return;
  const config = state.onlineConfig || {};
  if (!config.url || !config.key || !state.onlineSession?.access_token) return;
  hasPendingOnlinePush = true;
  clearTimeout(onlineSyncTimer);
  onlineSyncTimer = setTimeout(() => {
    syncPushOnline(true);
  }, 500);
}

function startOnlinePolling() {
  clearInterval(onlinePollTimer);
  const config = state.onlineConfig || {};
  if (!config.url || !config.key || !state.onlineSession?.access_token) return;
  setTimeout(() => {
    syncPullOnline(true);
  }, 1000);
  onlinePollTimer = setInterval(() => {
    syncPullOnline(true);
  }, 8000);
}

function renderAuthGate() {
  const isConnected = Boolean(state.onlineSession?.access_token);
  elements.authScreen.classList.toggle("hidden", isConnected);
  elements.appShell.classList.toggle("hidden", !isConnected);
}

function readOnlineConfigFromForm() {
  return {
    url: (elements.onlineUrlInput.value.trim() || DEFAULT_SUPABASE_URL).replace(/\/$/, ""),
    key: elements.onlineKeyInput.value.trim() || DEFAULT_SUPABASE_KEY,
  };
}

function requireOnlineConfig(silent = false) {
  const config = readOnlineConfigFromForm();
  if (!config.url || !config.key) {
    if (!silent) setOnlineStatus("Completa la URL de Supabase y la clave publica anonima.");
    return null;
  }
  state.onlineConfig = config;
  localStorage.setItem(ONLINE_CONFIG_STORAGE_KEY, JSON.stringify(config));
  return config;
}

function onlineEndpoint(config) {
  return `${config.url}/rest/v1/finance_profiles?on_conflict=user_id`;
}

function authEndpoint(config, path) {
  return `${config.url}/auth/v1/${path}`;
}

function authHeaders(config) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
  };
}

function readOnlineCredentials() {
  const authEmail = elements.authEmailInput.value.trim();
  const authPassword = elements.authPasswordInput.value;
  return {
    email: authEmail || elements.onlineEmailInput.value.trim(),
    password: authPassword || elements.onlinePasswordInput.value,
  };
}

function requireOnlineSession(silent = false) {
  if (!state.onlineSession?.access_token) {
    if (!silent) setOnlineStatus("Primero entra con tu usuario.");
    return null;
  }
  return state.onlineSession;
}

function saveOnlineSession(session) {
  state.onlineSession = session;
  localStorage.setItem(ONLINE_SESSION_STORAGE_KEY, JSON.stringify(session));
  elements.authEmailInput.value = session.user?.email || elements.authEmailInput.value;
  elements.onlineEmailInput.value = session.user?.email || elements.onlineEmailInput.value;
  elements.authPasswordInput.value = "";
  elements.onlinePasswordInput.value = "";
  renderAuthGate();
  renderOnlineUserStatus();
  startOnlinePolling();
}

function renderOnlineUserStatus() {
  const email = state.onlineSession?.user?.email;
  elements.onlineUserStatus.innerHTML = email
    ? `<div class="stack-item"><strong>Usuario conectado</strong><span>${escapeHtml(email)}</span></div>`
    : '<div class="stack-item"><strong>Sin usuario conectado</strong><span>Registra o entra para sincronizar datos por usuario.</span></div>';
}

async function registerOnlineUser() {
  const config = requireOnlineConfig();
  if (!config) return;
  const credentials = readOnlineCredentials();
  if (!credentials.email || credentials.password.length < 6) {
    setAuthStatus("Completa correo y contrasena de al menos 6 caracteres.");
    setOnlineStatus("Completa correo y contrasena de al menos 6 caracteres.");
    return;
  }
  setAuthStatus("Creando cuenta...");
  setOnlineStatus("Registrando usuario...");
  try {
    const response = await fetch(authEndpoint(config, "signup"), {
      method: "POST",
      headers: authHeaders(config),
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || data.error_description || "No se pudo registrar");
    if (data.access_token) {
      saveOnlineSession(data);
      await syncPushOnline(true);
      setAuthStatus("Cuenta creada. Sincronizacion automatica activa.", "success");
      setOnlineStatus("Usuario registrado y sistema sincronizado.", "success");
    } else {
      setAuthStatus("Cuenta creada. Revisa tu correo si pide confirmacion.", "success");
      setOnlineStatus("Usuario registrado. Revisa el correo si Supabase pide confirmacion, luego entra.", "success");
    }
  } catch (error) {
    console.error(error);
    const message = error.message || "Revisa correo, contrasena o configuracion de Supabase.";
    setAuthStatus(`No pude crear la cuenta: ${message}`);
    setOnlineStatus(`No pude registrar el usuario: ${message}`);
  }
}

async function loginOnlineUser() {
  const config = requireOnlineConfig();
  if (!config) return;
  const credentials = readOnlineCredentials();
  if (!credentials.email || !credentials.password) {
    setAuthStatus("Completa correo y contrasena.");
    setOnlineStatus("Completa correo y contrasena.");
    return;
  }
  setAuthStatus("Entrando...");
  setOnlineStatus("Entrando...");
  try {
    const response = await fetch(authEndpoint(config, "token?grant_type=password"), {
      method: "POST",
      headers: authHeaders(config),
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || data.msg || "No se pudo entrar");
    saveOnlineSession(data);
    await syncPullOnline(false);
    setAuthStatus("Listo. Sincronizacion automatica activa.", "success");
    setOnlineStatus("Usuario conectado. Sincronizacion automatica activa.", "success");
  } catch (error) {
    console.error(error);
    const message = error.message || "Revisa correo, contrasena o confirmacion de correo.";
    setAuthStatus(`No pude entrar: ${message}`);
    setOnlineStatus(`No pude entrar: ${message}`);
  }
}

function logoutOnlineUser() {
  state.onlineSession = null;
  localStorage.removeItem(ONLINE_SESSION_STORAGE_KEY);
  localStorage.removeItem(ONLINE_LAST_SYNC_STORAGE_KEY);
  clearInterval(onlinePollTimer);
  renderAuthGate();
  renderOnlineUserStatus();
  setAuthStatus("Sesion cerrada.");
  setOnlineStatus("Usuario desconectado.", "success");
}

async function syncPushOnline(isAutomatic = false) {
  const config = requireOnlineConfig(isAutomatic);
  if (!config) return;
  const session = requireOnlineSession(isAutomatic);
  if (!session) return;
  setOnlineStatus(isAutomatic ? "Guardando en la nube..." : "Subiendo datos...");
  try {
    const response = await fetch(onlineEndpoint(config), {
      method: "POST",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        payload: createDataSnapshot(),
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    localStorage.setItem(ONLINE_LAST_SYNC_STORAGE_KEY, new Date().toISOString());
    hasPendingOnlinePush = false;
    setOnlineStatus(isAutomatic ? "Cambio guardado en la nube al instante." : "Sistema completo actualizado en la nube desde esta compu.", "success");
  } catch (error) {
    console.error(error);
    setOnlineStatus("No pude actualizar el sistema completo. Revisa la conexion, el usuario o la tabla finance_profiles.");
  }
}

async function syncPullOnline(isAutomatic = false) {
  const config = requireOnlineConfig(isAutomatic);
  if (!config) return;
  const session = requireOnlineSession(isAutomatic);
  if (!session) return;
  if (isAutomatic && hasPendingOnlinePush) return;
  if (!isAutomatic) setOnlineStatus("Descargando datos...");
  try {
    const url = `${config.url}/rest/v1/finance_profiles?select=payload,updated_at`;
    const response = await fetch(url, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    if (!response.ok) throw new Error(await response.text());
    const rows = await response.json();
    if (!rows.length || !rows[0].payload) {
      if (!isAutomatic) setOnlineStatus("No hay copia en la nube para este usuario.");
      return;
    }
    const remoteUpdatedAt = rows[0].updated_at || "";
    const lastSync = localStorage.getItem(ONLINE_LAST_SYNC_STORAGE_KEY) || "";
    if (isAutomatic && remoteUpdatedAt && lastSync && new Date(remoteUpdatedAt) <= new Date(lastSync)) {
      return;
    }
    saveSafetyBackup("antes-de-descargar-desde-la-nube");
    applyDataSnapshot(rows[0].payload);
    if (remoteUpdatedAt) localStorage.setItem(ONLINE_LAST_SYNC_STORAGE_KEY, remoteUpdatedAt);
    setOnlineStatus(isAutomatic ? `Cambios de la nube recibidos: ${new Date().toLocaleTimeString("es-AR")}.` : `Sistema completo traido a este dispositivo. Ultima copia: ${remoteUpdatedAt ? new Date(remoteUpdatedAt).toLocaleString("es-AR") : "-"}.`, "success");
  } catch (error) {
    console.error(error);
    if (!isAutomatic) setOnlineStatus("No pude descargar. Revisa la conexion, el usuario o la tabla finance_profiles.");
  }
}

function receiptImageMarkup(image) {
  if (!image) return '<span class="receipt-empty">-</span>';
  return `<a href="${image}" target="_blank" rel="noopener" title="Ver factura"><img class="receipt-thumb" src="${image}" alt="Factura guardada" /></a>`;
}

function compressReceiptImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function findReceiptDescription(lines) {
  const ignored = /(consumidor|factura|ticket|iva|cuit|total|importe|fecha|hora|original|duplicado|codigo|cod\.?)/i;
  return (
    lines.find((line) => {
      const hasLetters = /[a-zA-Z]{3}/.test(line);
      const mostlyNumbers = line.replace(/\D/g, "").length > line.length / 2;
      return hasLetters && !mostlyNumbers && !ignored.test(line) && line.length <= 60;
    }) || "Factura escaneada"
  );
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error) => {
      console.warn("No se pudo activar el modo instalable.", error);
    });
  });
}

function openMonthlyReport() {
  const rows = filteredExpenses();
  const monthRows = expensesForMonth();
  const expenseRows = monthRows.filter((expense) => movementType(expense) === "expense");
  const incomeRows = monthRows.filter((expense) => movementType(expense) === "income");
  const totals = totalsByCategory(expenseRows);
  const accountTotals = totalsByField(monthRows, accountName);
  const paymentTotals = totalsByField(monthRows, paymentMethod);
  const spendModeTotals = totalsByField(monthRows, spendMode);
  const totalExpenses = expenseRows.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = incomeRows.reduce((sum, expense) => sum + expense.amount, 0);
  const totalMovement = totalIncome + totalExpenses;
  const balance = totalIncome - totalExpenses;
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const reportText = buildMonthlyReportText();
  const reportWindow = window.open("", "_blank");

  if (!reportWindow) {
    alert("No pude abrir el reporte. Habilita ventanas emergentes para esta app.");
    return;
  }

  const categoryRows = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([category, amount]) => `
        <tr>
          <td>${escapeHtml(category)}</td>
          <td>${currency.format(amount)}</td>
          <td>${totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0}%</td>
        </tr>
      `
    )
    .join("");

  const paymentRows = Object.entries(paymentTotals)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([method, amount]) => `
        <tr>
          <td>${escapeHtml(method)}</td>
          <td>${currency.format(amount)}</td>
        </tr>
      `
    )
    .join("");

  const accountRows = Object.entries(accountTotals)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([account, amount]) => `
        <tr>
          <td>${escapeHtml(account)}</td>
          <td>${currency.format(amount)}</td>
        </tr>
      `
    )
    .join("");

  const spendModeRows = Object.entries(spendModeTotals)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([mode, amount]) => `
        <tr>
          <td>${escapeHtml(mode)}</td>
          <td>${currency.format(amount)}</td>
          <td>${totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0}%</td>
        </tr>
      `
    )
    .join("");

  const detailRows = rows
    .map(
      (expense) => `
        <tr>
          <td>${formatDate(expense.date)}</td>
          <td>${expense.dueDate ? formatDate(expense.dueDate) : "-"}</td>
          <td>${movementType(expense) === "income" ? "Ingreso" : "Gasto"}</td>
          <td>${escapeHtml(scopeName(expense))}</td>
          <td>${escapeHtml(accountName(expense))}</td>
          <td>${escapeHtml(expense.category)}</td>
          <td>${escapeHtml(paymentMethod(expense))}</td>
          <td>${escapeHtml(spendMode(expense))}</td>
          <td>${escapeHtml(expense.description)}</td>
          <td>${expense.receiptImage ? "Si" : "-"}</td>
          <td class="amount ${movementType(expense) === "income" ? "positive" : "negative"}">${signedCurrency(expense)}</td>
          <td>${escapeHtml(tagsText(expense) || "-")}</td>
          <td>${escapeHtml(expense.notes || "-")}</td>
        </tr>
      `
    )
    .join("");

  reportWindow.document.write(`<!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reporte de gastos e ingresos ${escapeHtml(state.month)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #0f172a; font-family: Arial, Helvetica, sans-serif; background: #f6f8fb; }
          main { width: min(960px, calc(100% - 28px)); margin: 0 auto; padding: 28px 0; }
          header { display: flex; justify-content: space-between; gap: 16px; align-items: start; border-bottom: 4px solid #0f766e; padding-bottom: 16px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { margin: 24px 0 10px; font-size: 18px; }
          .muted { color: #776464; margin: 6px 0 0; }
          .actions { display: flex; gap: 8px; flex-wrap: wrap; }
          .print { border: 0; border-radius: 8px; background: #0f766e; color: white; font-weight: 700; padding: 10px 14px; cursor: pointer; text-decoration: none; display: inline-block; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px; }
          .metric { background: white; border: 1px solid #f0d2d2; border-radius: 8px; padding: 14px; }
          .metric span { display: block; color: #776464; font-size: 12px; margin-bottom: 8px; }
          .metric strong { display: block; font-size: 20px; }
          .positive { color: #147a3f; }
          .negative { color: #b00020; }
          table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #f0d2d2; }
          th, td { padding: 10px 12px; border-bottom: 1px solid #f0d2d2; text-align: left; }
          th { background: #0f766e; color: white; font-size: 12px; text-transform: uppercase; }
          .amount { text-align: right; font-weight: 700; }
          .empty { background: white; border: 1px solid #f0d2d2; border-radius: 8px; padding: 18px; color: #776464; }
          @media print {
            body { background: white; }
            main { width: 100%; padding: 0; }
            .print { display: none; }
            .metric, table, .empty { break-inside: avoid; }
          }
          @media (max-width: 720px) {
            header { flex-direction: column; }
            .grid { grid-template-columns: repeat(2, 1fr); }
          }
        </style>
      </head>
      <body>
        <main>
          <header>
            <div>
          <h1>Reporte de gastos e ingresos</h1>
              <p class="muted">Mes ${escapeHtml(state.month)} - Generado el ${formatDate(todayKey())}</p>
            </div>
            <div class="actions">
              <a class="print" href="${emailReportHref(reportText)}">Enviar correo</a>
              <button class="print" onclick="window.print()">Imprimir / PDF</button>
            </div>
          </header>

          <section class="grid">
            <article class="metric"><span>Balance del mes</span><strong class="${balance >= 0 ? "positive" : "negative"}">${currency.format(balance)}</strong></article>
            <article class="metric"><span>Ingresos</span><strong class="positive">${currency.format(totalIncome)}</strong></article>
            <article class="metric"><span>Gastos</span><strong class="negative">${currency.format(totalExpenses)}</strong></article>
            <article class="metric"><span>Mayor categoria</span><strong>${top ? escapeHtml(top[0]) : "-"}</strong></article>
          </section>

          <h2>Gasto por categoria</h2>
          ${
            categoryRows
              ? `<table><thead><tr><th>Categoria</th><th>Monto</th><th>Participacion</th></tr></thead><tbody>${categoryRows}</tbody></table>`
              : `<div class="empty">No hay gastos cargados para este mes.</div>`
          }

          <h2>Movimientos por modo</h2>
          ${
            spendModeRows
              ? `<table><thead><tr><th>Modo</th><th>Monto</th><th>Participacion</th></tr></thead><tbody>${spendModeRows}</tbody></table>`
              : `<div class="empty">No hay movimientos para clasificar por modo.</div>`
          }

          <h2>Movimientos por tipo de pago</h2>
          ${
            paymentRows
              ? `<table><thead><tr><th>Tipo de pago</th><th>Monto</th></tr></thead><tbody>${paymentRows}</tbody></table>`
              : `<div class="empty">No hay movimientos para clasificar por pago.</div>`
          }

          <h2>Movimientos por cuenta</h2>
          ${
            accountRows
              ? `<table><thead><tr><th>Cuenta</th><th>Monto</th></tr></thead><tbody>${accountRows}</tbody></table>`
              : `<div class="empty">No hay movimientos para clasificar por cuenta.</div>`
          }

          <h2>Detalle de movimientos</h2>
          ${
            detailRows
              ? `<table><thead><tr><th>Fecha</th><th>Vence</th><th>Tipo</th><th>Ambito</th><th>Cuenta</th><th>Categoria</th><th>Pago</th><th>Modo</th><th>Descripcion</th><th>Factura</th><th class="amount">Monto</th><th>Etiquetas</th><th>Notas</th></tr></thead><tbody>${detailRows}</tbody></table>`
              : `<div class="empty">No hay movimientos para mostrar.</div>`
          }
        </main>
      </body>
    </html>`);
  reportWindow.document.close();
}

function sendMonthlyReportByEmail() {
  window.location.href = emailReportHref(buildMonthlyReportText());
}

function emailReportHref(reportText) {
  const subject = `Reporte de gastos e ingresos ${state.month}`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportText)}`;
}

function buildMonthlyReportText() {
  const rows = filteredExpenses();
  const monthRows = expensesForMonth();
  const expenseRows = monthRows.filter((expense) => movementType(expense) === "expense");
  const incomeRows = monthRows.filter((expense) => movementType(expense) === "income");
  const totals = totalsByCategory(expenseRows);
  const totalExpenses = expenseRows.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = incomeRows.reduce((sum, expense) => sum + expense.amount, 0);
  const totalMovement = totalIncome + totalExpenses;
  const balance = totalIncome - totalExpenses;
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const categoryLines = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => `- ${category}: ${currency.format(amount)} (${totalExpenses ? Math.round((amount / totalExpenses) * 100) : 0}%)`)
    .join("\n");
  const spendModeLines = Object.entries(spendModeTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([mode, amount]) => `- ${mode}: ${currency.format(amount)} (${totalMovement ? Math.round((amount / totalMovement) * 100) : 0}%)`)
    .join("\n");
  const paymentLines = Object.entries(paymentTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([method, amount]) => `- ${method}: ${currency.format(amount)}`)
    .join("\n");
  const accountLines = Object.entries(accountTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([account, amount]) => `- ${account}: ${currency.format(amount)}`)
    .join("\n");
  const detailLines = rows
    .slice(0, 40)
    .map((expense) => `- ${formatDate(expense.date)}${expense.dueDate ? ` vence ${formatDate(expense.dueDate)}` : ""} | ${movementType(expense) === "income" ? "Ingreso" : "Gasto"} | ${scopeName(expense)} | ${accountName(expense)} | ${expense.category} | ${paymentMethod(expense)} | ${spendMode(expense)} | ${expense.description} | ${signedCurrency(expense)}${tagsText(expense) ? ` | ${tagsText(expense)}` : ""}${expense.notes ? ` | notas: ${expense.notes}` : ""}${expense.receiptImage ? " | con factura" : ""}`)
    .join("\n");
  const omitted = rows.length > 40 ? `\n\nSe omitieron ${rows.length - 40} movimientos por limite del correo. Exporta CSV para el detalle completo.` : "";

  return [
    `Reporte de gastos e ingresos - ${state.month}`,
    `Generado el ${formatDate(todayKey())}`,
    "",
    `Balance del mes: ${currency.format(balance)}`,
    `Ingresos: ${currency.format(totalIncome)}`,
    `Gastos: ${currency.format(totalExpenses)}`,
    `Mayor categoria de gasto: ${top ? top[0] : "-"}`,
    `Cantidad de movimientos: ${monthRows.length}`,
    "",
    "Gasto por categoria:",
    categoryLines || "No hay gastos cargados para este mes.",
    "",
    "Movimientos por modo:",
    spendModeLines || "No hay movimientos para clasificar por modo.",
    "",
    "Movimientos por tipo de pago:",
    paymentLines || "No hay movimientos para clasificar por pago.",
    "",
    "Movimientos por cuenta:",
    accountLines || "No hay movimientos para clasificar por cuenta.",
    "",
    "Detalle de movimientos:",
    detailLines || "No hay movimientos para mostrar.",
    omitted,
  ].join("\n");
}
