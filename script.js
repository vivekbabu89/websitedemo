// script.js
const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthsDisplay = {
  jan: "JANUARY", feb: "FEBRUARY", mar: "MARCH", apr: "APRIL", may: "MAY", jun: "JUNE",
  jul: "JULY", aug: "AUGUST", sep: "SEPTEMBER", oct: "OCTOBER", nov: "NOVEMBER", dec: "DECEMBER"
};
const structuredMonthsDisplay = {
  jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
  jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December"
};

let activePrintRowIndex = null;
const tbody = document.getElementById('ledgerBody');
let nextSerial = 1;
let currentMonth = 'jan';

function getClassOptions(selectedValue) {
  const classes = [
    "Play Class", "Pre-Nursery", "LKG", "UKG",
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
    "Grade 11", "Grade 12"
  ];
  return classes.map(c => `<option value="${c}" ${selectedValue === c ? 'selected' : ''}>${c}</option>`).join('');
}

function renderHeader() {
  const thead = document.getElementById('tableHeader');
  thead.innerHTML = `
    <tr>
      <th rowspan="2" style="width: 40px;">#</th>
      <th rowspan="2" style="min-width: 260px; text-align: left; padding-left: 12px;">Student Name</th>
      <th rowspan="2" style="min-width: 160px;">Phone Number</th>
      <th rowspan="2" style="min-width: 140px;">Class</th>
      <th rowspan="2" style="min-width: 120px;">Section</th>
      <th rowspan="2" style="min-width: 140px;">Total Fee</th>
      <th colspan="2" style="min-width: 220px;">${monthsDisplay[currentMonth]}</th>
      <th class="color-paid" style="min-width: 180px;">💰 PAID STACK</th>
      <th class="color-balance" style="min-width: 180px;">⚖️ BALANCE STACK</th>
      <th class="color-action" rowspan="2" style="min-width: 480px;">Action</th>
    </tr>
    <tr class="subheader-row">
      <th>DATE</th>
      <th>AMOUNT</th>
    </tr>
  `;
}

function createStudentRow(serial, data = null) {
  const tr = document.createElement('tr');
  tr.className = 'ledger-row';
  const defaultClass = data ? data.class : (document.getElementById('headerClassFilter').value !== 'all' ? document.getElementById('headerClassFilter').value : 'Play Class');
  const defaultSection = data ? data.section : (document.getElementById('headerSecFilter').value !== 'all' ? document.getElementById('headerSecFilter').value : 'Section A');

  const currentMonthData = data?.months?.[currentMonth] || { date: '', amt: '' };
  const dateVal = currentMonthData.date || '';
  const amtVal = currentMonthData.amt || '';

  let htmlStr = `
    <td style="font-weight: bold; background-color: #f8fafc; color: #475569; font-size: 14px;">${serial}</td>
    <td><input type="text" class="text-left-input student-name" placeholder="Enter Student Name..." data-serial="${serial}"></td>
    <td><input type="tel" class="student-phone" placeholder="Phone (eg: 919876543210)"></td>
    <td><select class="student-class">${getClassOptions(defaultClass)}</select></td>
    <td><select class="student-section">
        <option value="Section A" ${defaultSection === 'Section A' ? 'selected' : ''}>Section A</option>
        <option value="Section B" ${defaultSection === 'Section B' ? 'selected' : ''}>Section B</option>
        <option value="Section C" ${defaultSection === 'Section C' ? 'selected' : ''}>Section C</option>
      </select></td>
    <td><input type="number" class="total-fee" placeholder="0.00" min="0" value="${data?.totalFee || ''}"></td>
    <td><input type="date" class="month-date" value="${dateVal}"></td>
    <td><input type="number" class="month-amount monthly-amount" placeholder="0" min="0" value="${amtVal}"></td>
    <td class="bg-stack-paid">
      <div class="dual-stack-container" id="paid-stack-${serial}">
        <div class="stack-sub-column left-paid"></div>
        <div class="stack-sub-column right-paid"></div>
      </div>
    </td>
    <td class="bg-stack-balance">
      <div class="dual-stack-container" id="bal-stack-${serial}">
        <div class="stack-sub-column left-bal"></div>
        <div class="stack-sub-column right-bal"></div>
      </div>
    </td>
    <td>
      <div class="action-cell-flex">
        <button class="btn-action-base btn-save" onclick="saveRowData(${serial})">💾 Save</button>
        <button class="btn-action-base btn-receipt" onclick="openReceiptManager(${serial})">🖨️ Receipt</button>
        <button class="btn-action-base btn-whatsapp" onclick="sendWhatsAppReceipt(${serial})">
          <svg viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
          Send WhatsApp
        </button>
        <button class="btn-action-base btn-delete" onclick="deleteRow(${serial})">🗑️ Delete</button>
      </div>
    </td>
  `;
  tr.innerHTML = htmlStr;
  tr.id = `row-${serial}`;
  return tr;
}

function addStudentRow(data = null) {
  const serial = nextSerial++;
  const newRow = createStudentRow(serial, data);
  tbody.appendChild(newRow);
  const totalRow = document.getElementById('total-summary-row');
  if (totalRow) tbody.appendChild(totalRow);
  attachRowEvents(newRow);
  if (data) {
    const row = document.getElementById(`row-${serial}`);
    if (row) {
      row.querySelector('.student-name').value = data.name || '';
      row.querySelector('.student-phone').value = data.phone || '';
      row.querySelector('.student-class').value = data.class || 'Play Class';
      row.querySelector('.student-section').value = data.section || 'Section A';
      row.querySelector('.total-fee').value = data.totalFee || '';
      calculateRowMath(serial);
    }
  }
  executeLedgerSearch();
}

function deleteRow(serial) {
  if (confirm(`Delete student #${serial}? This cannot be undone.`)) {
    const row = document.getElementById(`row-${serial}`);
    if (row) row.remove();
    localStorage.removeItem(`ledger_student_row_${serial}`);
    calculateGrandTotals();
    executeLedgerSearch();
  }
}

function attachRowEvents(rowElement) {
  rowElement.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', (e) => {
      const rowId = rowElement.id.split('-')[1];
      calculateRowMath(parseInt(rowId));
      executeLedgerSearch();
    });
    if (el.tagName === 'SELECT') {
      el.addEventListener('change', () => {
        const rowId = rowElement.id.split('-')[1];
        calculateRowMath(parseInt(rowId));
        executeLedgerSearch();
      });
    }
  });
}

function calculateRowMath(serial) {
  const row = document.getElementById(`row-${serial}`);
  if (!row) return;
  const totalFee = parseFloat(row.querySelector('.total-fee').value) || 0;
  let cumulativePaid = 0;
  const paidHistory = [];
  const balanceHistory = [];

  const stored = localStorage.getItem(`ledger_student_row_${serial}`);
  let monthsData = {};
  if (stored) {
    const data = JSON.parse(stored);
    monthsData = data.months || {};
  } else {
    monthsList.forEach(month => {
      if (month === currentMonth) {
        monthsData[month] = { amt: parseFloat(row.querySelector('.month-amount').value) || 0 };
      } else {
        monthsData[month] = { amt: 0 };
      }
    });
  }

  monthsList.forEach(month => {
    const amtVal = monthsData[month]?.amt || 0;
    if (amtVal > 0) {
      cumulativePaid += amtVal;
      paidHistory.push(cumulativePaid);
      balanceHistory.push(Math.max(totalFee - cumulativePaid, 0));
    }
  });
  if (paidHistory.length === 0 && totalFee > 0) {
    balanceHistory.push(totalFee);
  }
  renderStackDOM(`paid-stack-${serial}`, paidHistory, '#16a34a');
  renderStackDOM(`bal-stack-${serial}`, balanceHistory, '#dc2626');
  calculateGrandTotals();
}

function renderStackDOM(containerId, historyArr, activeColor) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const leftCol = container.querySelector('.left-paid, .left-bal');
  const rightCol = container.querySelector('.right-paid, .right-bal');
  if (!leftCol || !rightCol) return;
  leftCol.innerHTML = '';
  rightCol.innerHTML = '';
  for(let index = 0; index < 12; index++) {
    const targetColumn = (index < 6) ? leftCol : rightCol;
    const stackLine = document.createElement('div');
    stackLine.className = 'stack-line';
    if (index < historyArr.length) {
      const val = historyArr[index];
      stackLine.textContent = val;
      if (index < historyArr.length - 1) stackLine.classList.add('strikethrough');
      else { stackLine.style.color = activeColor; stackLine.style.fontSize = '14px'; }
    } else {
      stackLine.textContent = '--';
    }
    targetColumn.appendChild(stackLine);
  }
}

function calculateGrandTotals() {
  let globalPaid = 0, globalBalance = 0;
  const allRows = document.querySelectorAll('#ledgerBody .ledger-row');
  for (const row of allRows) {
    if (row.classList.contains('search-filtered-out')) continue;
    const totalFee = parseFloat(row.querySelector('.total-fee').value) || 0;
    const rowId = row.id.split('-')[1];
    let rowPaid = 0;
    const stored = localStorage.getItem(`ledger_student_row_${rowId}`);
    if (stored) {
      const data = JSON.parse(stored);
      monthsList.forEach(m => {
        rowPaid += parseFloat(data.months?.[m]?.amt) || 0;
      });
    } else {
      rowPaid = parseFloat(row.querySelector('.month-amount').value) || 0;
    }
    let rowBal = Math.max(totalFee - rowPaid, 0);
    if(rowPaid === 0 && totalFee > 0) rowBal = totalFee;
    globalPaid += rowPaid;
    globalBalance += rowBal;
  }
  const grandPaidSpan = document.getElementById('grand-paid');
  const grandBalSpan = document.getElementById('grand-bal');
  if (grandPaidSpan) grandPaidSpan.textContent = globalPaid.toFixed(2);
  if (grandBalSpan) grandBalSpan.textContent = globalBalance.toFixed(2);
}

function executeLedgerSearch() {
  const searchKeyword = document.getElementById('ledgerSearchBox').value.toLowerCase().trim();
  const filterClass = document.getElementById('headerClassFilter').value;
  const filterSection = document.getElementById('headerSecFilter').value;
  const rows = document.querySelectorAll('#ledgerBody .ledger-row');
  for (const row of rows) {
    const name = (row.querySelector('.student-name')?.value || '').toLowerCase();
    const phone = (row.querySelector('.student-phone')?.value || '').toLowerCase();
    const studentClass = row.querySelector('.student-class')?.value || '';
    const studentSection = row.querySelector('.student-section')?.value || '';
    let passesSearch = (searchKeyword === '') || name.includes(searchKeyword) || phone.includes(searchKeyword);
    let passesClass = (filterClass === 'all') || (studentClass === filterClass);
    let passesSection = (filterSection === 'all') || (studentSection === filterSection);
    if (passesSearch && passesClass && passesSection) {
      row.classList.remove('search-filtered-out');
    } else {
      row.classList.add('search-filtered-out');
    }
  }
  calculateGrandTotals();
}

function saveRowData(serial) {
  const row = document.getElementById(`row-${serial}`);
  if (!row) return;
  let existingData = {};
  const stored = localStorage.getItem(`ledger_student_row_${serial}`);
  if (stored) {
    existingData = JSON.parse(stored);
  }
  existingData.name = row.querySelector('.student-name').value;
  existingData.phone = row.querySelector('.student-phone').value;
  existingData.class = row.querySelector('.student-class').value;
  existingData.section = row.querySelector('.student-section').value;
  existingData.totalFee = row.querySelector('.total-fee').value;
  if (!existingData.months) existingData.months = {};
  existingData.months[currentMonth] = {
    date: row.querySelector('.month-date').value,
    amt: row.querySelector('.month-amount').value
  };
  localStorage.setItem(`ledger_student_row_${serial}`, JSON.stringify(existingData));
  alert(`🎉 Student #${serial} (${existingData.name || 'Unnamed'}) saved!`);
  calculateRowMath(serial);
}

function loadAllRowsFromDatabase() {
  const keys = Object.keys(localStorage);
  const rowIds = keys.filter(k => k.startsWith('ledger_student_row_')).map(k => parseInt(k.split('_').pop())).sort((a,b)=>a-b);
  for (let id of rowIds) {
    const stored = localStorage.getItem(`ledger_student_row_${id}`);
    if (stored) {
      const data = JSON.parse(stored);
      if (!document.getElementById(`row-${id}`)) {
        if (id >= nextSerial) nextSerial = id + 1;
        addStudentRow(data);
      } else {
        const row = document.getElementById(`row-${id}`);
        if (row) {
          row.querySelector('.student-name').value = data.name || '';
          row.querySelector('.student-phone').value = data.phone || '';
          row.querySelector('.student-class').value = data.class || 'Play Class';
          row.querySelector('.student-section').value = data.section || 'Section A';
          row.querySelector('.total-fee').value = data.totalFee || '';
          const monthData = data.months?.[currentMonth] || { date: '', amt: '' };
          row.querySelector('.month-date').value = monthData.date || '';
          row.querySelector('.month-amount').value = monthData.amt || '';
          calculateRowMath(id);
        }
      }
    }
  }
  if (!document.getElementById('total-summary-row')) {
    const totalTr = document.createElement('tr');
    totalTr.id = 'total-summary-row';
    totalTr.className = 'total-row';
    totalTr.innerHTML = `
      <td colspan="7" style="text-align:right; padding-right:25px; font-weight:800; font-size: 16px;">CLASS TOTALS:</td>
      <td colspan="1"></td>
      <td style="background-color: #ecfdf5 !important; color: #047857;" id="grand-paid" class="total-summary-box">0.00</td>
      <td style="background-color: #fff7ed !important; color: #c2410c;" id="grand-bal" class="total-summary-box">0.00</td>
      <td></td>
    `;
    tbody.appendChild(totalTr);
  }
  calculateGrandTotals();
  executeLedgerSearch();
}

function refreshMonth() {
  const allRows = document.querySelectorAll('#ledgerBody .ledger-row');
  for (let row of allRows) {
    if (row.id && row.id !== 'total-summary-row') {
      const serial = parseInt(row.id.split('-')[1]);
      const stored = localStorage.getItem(`ledger_student_row_${serial}`);
      if (stored) {
        const data = JSON.parse(stored);
        row.querySelector('.student-name').value = data.name || '';
        row.querySelector('.student-phone').value = data.phone || '';
        row.querySelector('.student-class').value = data.class || 'Play Class';
        row.querySelector('.student-section').value = data.section || 'Section A';
        row.querySelector('.total-fee').value = data.totalFee || '';
        const monthData = data.months?.[currentMonth] || { date: '', amt: '' };
        row.querySelector('.month-date').value = monthData.date || '';
        row.querySelector('.month-amount').value = monthData.amt || '';
        calculateRowMath(serial);
      }
    }
  }
  calculateGrandTotals();
  executeLedgerSearch();
}

function backupData() {
  const allBackup = {};
  const keys = Object.keys(localStorage);
  const studentKeys = keys.filter(k => k.startsWith('ledger_student_row_'));
  for (let key of studentKeys) {
    allBackup[key] = localStorage.getItem(key);
  }
  const backupStr = JSON.stringify(allBackup, null, 2);
  const blob = new Blob([backupStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-');
  a.download = `fee_ledger_backup_${timestamp}.json`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
  alert(`✅ Backup created with ${studentKeys.length} student records. File saved to your downloads folder.`);
}

function openReceiptManager(serial) {
  activePrintRowIndex = serial;
  const row = document.getElementById(`row-${serial}`);
  if (!row) return;
  const studentName = row.querySelector('.student-name').value.trim() || `Student #${serial}`;
  const studentPhone = row.querySelector('.student-phone').value.trim() || 'N/A';
  const totalFee = parseFloat(row.querySelector('.total-fee').value) || 0;
  let paidMonthsCount = 0, computedTotalPaid = 0;
  const dropdownSelect = document.getElementById('targetMonthSelect');
  dropdownSelect.innerHTML = '';
  const stored = localStorage.getItem(`ledger_student_row_${serial}`);
  let monthsData = {};
  if (stored) {
    monthsData = JSON.parse(stored).months || {};
  }
  monthsList.forEach(month => {
    const amt = parseFloat(monthsData[month]?.amt) || 0;
    if (amt > 0) { paidMonthsCount++; computedTotalPaid += amt; }
    const opt = document.createElement('option');
    opt.value = month;
    opt.textContent = `${structuredMonthsDisplay[month]} ${amt > 0 ? '(💰 Paid: '+amt+')' : '(⏳ Unpaid)'}`;
    dropdownSelect.appendChild(opt);
  });
  const outstandingBalance = Math.max(totalFee - computedTotalPaid, 0);
  document.getElementById('modalStudentName').textContent = studentName;
  document.getElementById('modalStudentPhone').textContent = studentPhone;
  document.getElementById('modalPaidMonths').textContent = paidMonthsCount;
  document.getElementById('modalTotalPaid').textContent = computedTotalPaid.toFixed(2);
  document.getElementById('modalTotalBal').textContent = outstandingBalance.toFixed(2);
  document.getElementById('modalUnpaidMonths').textContent = 12 - paidMonthsCount;
  document.getElementById('receiptModal').style.display = 'flex';
}

function closeReceiptModal() { document.getElementById('receiptModal').style.display = 'none'; activePrintRowIndex = null; }

function triggerPrintRoutine() {
  if (!activePrintRowIndex) return;
  const row = document.getElementById(`row-${activePrintRowIndex}`);
  const selectedMonthKey = document.getElementById('targetMonthSelect').value;
  const studentName = row.querySelector('.student-name').value.trim() || `#${activePrintRowIndex}`;
  const studentPhone = row.querySelector('.student-phone').value.trim() || 'N/A';
  const totalFee = parseFloat(row.querySelector('.total-fee').value) || 0;
  const stored = localStorage.getItem(`ledger_student_row_${activePrintRowIndex}`);
  let monthData = { date: '', amt: 0 };
  if (stored) {
    const data = JSON.parse(stored);
    monthData = data.months?.[selectedMonthKey] || { date: '', amt: 0 };
  }
  const targetedMonthAmt = parseFloat(monthData.amt) || 0;
  const targetedMonthDate = monthData.date || 'N/A';
  let totalPaid=0, paidCount=0;
  if (stored) {
    const data = JSON.parse(stored);
    monthsList.forEach(m => {
      const amt = parseFloat(data.months?.[m]?.amt) || 0;
      if(amt>0){ totalPaid+=amt; paidCount++; }
    });
  }
  const balanceDue = Math.max(totalFee - totalPaid,0);
  document.getElementById('slipAcademicYear').textContent = document.getElementById('headerYear').value;
  document.getElementById('slipPrintDate').textContent = new Date().toISOString().split('T')[0];
  const studentClass = row.querySelector('.student-class').value;
  const studentSection = row.querySelector('.student-section').value;
  document.getElementById('slipClassInfo').textContent = `${studentClass} - ${studentSection}`;
  document.getElementById('slipStudentName').textContent = studentName;
  document.getElementById('slipStudentPhone').textContent = studentPhone;
  document.getElementById('slipTargetMonth').textContent = structuredMonthsDisplay[selectedMonthKey].toUpperCase();
  document.getElementById('slipMonthAmount').textContent = targetedMonthAmt.toFixed(2);
  document.getElementById('slipMonthDate').textContent = targetedMonthDate;
  document.getElementById('slipTotalFees').textContent = totalFee.toFixed(2);
  document.getElementById('slipTotalPaid').textContent = totalPaid.toFixed(2);
  document.getElementById('slipTotalBalance').textContent = balanceDue.toFixed(2);
  document.getElementById('slipCountPaid').textContent = `${paidCount} Month(s)`;
  document.getElementById('slipCountRemain').textContent = `${12-paidCount} Month(s)`;
  closeReceiptModal();
  window.print();
}

function sendWhatsAppReceipt(serial) {
  const row = document.getElementById(`row-${serial}`);
  if (!row) return;
  const studentName = row.querySelector('.student-name').value.trim() || `Student #${serial}`;
  let rawPhone = row.querySelector('.student-phone').value.trim();
  const totalFee = parseFloat(row.querySelector('.total-fee').value) || 0;
  if(!rawPhone) { alert("⚠️ Phone field empty!"); return; }
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const stored = localStorage.getItem(`ledger_student_row_${serial}`);
  let totalPaidTillDate = 0, paidMonthsArray = [];
  if (stored) {
    const data = JSON.parse(stored);
    monthsList.forEach(m => {
      const amt = parseFloat(data.months?.[m]?.amt) || 0;
      if(amt > 0) { totalPaidTillDate += amt; paidMonthsArray.push(structuredMonthsDisplay[m]); }
    });
  }
  const outstandingBalance = Math.max(totalFee - totalPaidTillDate, 0);
  const dateToday = new Date().toISOString().split('T')[0];
  const classSelection = row.querySelector('.student-class').value;
  const sectionSelection = row.querySelector('.student-section').value;
  let messageText = `*📚 FEE PAYMENT RECEIPT* \n---------------------------------------\n*Date Issued:* ${dateToday}\n*Class:* ${classSelection} (${sectionSelection})\n*Student Name:* ${studentName}\n---------------------------------------\n*Total Structural Fees:* ${totalFee.toFixed(2)}\n*Total Amount Paid:* ${totalPaidTillDate.toFixed(2)}\n*Outstanding Balance:* ${outstandingBalance.toFixed(2)}\n---------------------------------------\n*Paid Months:* ${paidMonthsArray.join(', ') || 'None'}\nThank you.`;
  window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`, '_blank');
}

// Event listeners
document.getElementById('headerClassFilter').addEventListener('change', executeLedgerSearch);
document.getElementById('headerSecFilter').addEventListener('change', executeLedgerSearch);
document.getElementById('addStudentBtn').addEventListener('click', () => addStudentRow());
document.getElementById('backupBtn').addEventListener('click', backupData);
const monthSelector = document.getElementById('monthSelector');
monthSelector.addEventListener('change', (e) => {
  currentMonth = e.target.value;
  renderHeader();
  refreshMonth();
});

document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  loadAllRowsFromDatabase();
  if (document.querySelectorAll('#ledgerBody .ledger-row').length === 0) {
    addStudentRow();
  }
});