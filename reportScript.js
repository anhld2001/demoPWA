const apiBaseUrl = 'http://localhost:7187/api/Reports'; // Thay đổi URL theo backend của bạn

let reports = [];

// Function để lấy danh sách báo cáo từ API
async function fetchReports() {
  try {
    const response = await fetch(apiBaseUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    reports = await response.json();
    renderReports();
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    alert('Không thể tải danh sách báo cáo. Vui lòng thử lại sau.');
  }
}

// Gọi hàm fetchReports khi tải trang
window.addEventListener('load', fetchReports);

// Render danh sách báo cáo
function renderReports() {
  const reportList = document.getElementById('report-list');
  reportList.innerHTML = '';
  reports.forEach((report, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${report.title}</strong>
        <p>${report.content}</p>
      </div>
      <button onclick="editReport(${report.id})">Edit</button>
    `;
    reportList.appendChild(li);
  });
}

// Show modal để thêm/sửa báo cáo
const modal = document.getElementById('report-modal');
const modalTitle = document.getElementById('modal-title');
const reportTitle = document.getElementById('report-title');
const reportContent = document.getElementById('report-content');
const saveButton = document.getElementById('save-report-btn');

let editingId = null;

document.getElementById('add-report-btn').addEventListener('click', () => {
  editingId = null;
  modalTitle.textContent = 'Add Report';
  reportTitle.value = '';
  reportContent.value = '';
  modal.classList.remove('hidden');
});

saveButton.addEventListener('click', async () => {
  const title = reportTitle.value.trim();
  const content = reportContent.value.trim();

  if (!title || !content) {
    alert('Please fill in all fields.');
    return;
  }

  const reportData = { title, content };

  try {
    if (editingId === null) {
      // Thêm mới báo cáo
      const response = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error('Failed to add report');
      }

      const newReport = await response.json();
      reports.push(newReport);
    } else {
      // Sửa báo cáo
      const response = await fetch(`${apiBaseUrl}/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error('Failed to update report');
      }

      const index = reports.findIndex(r => r.id === editingId);
      if (index !== -1) {
        reports[index].title = title;
        reports[index].content = content;
      }
    }

    modal.classList.add('hidden');
    renderReports();
  } catch (error) {
    console.error(error);
    alert('Có lỗi xảy ra. Vui lòng thử lại.');
  }
});

document.getElementById('close-modal-btn').addEventListener('click', () => {
  modal.classList.add('hidden');
});

function editReport(id) {
  const report = reports.find(r => r.id === id);
  if (!report) return;

  editingId = id;
  modalTitle.textContent = 'Edit Report';
  reportTitle.value = report.title;
  reportContent.value = report.content;
  modal.classList.remove('hidden');
}
