// ===== Configuration =====
const SHEET_ID = '18XbeUB-U22t4x--tyrmTKaftokaU1GWwFk4VmfNpa90';
const SHEET_NAME = 'Webapp';
const CSV_URL = `https://docs.google.com/spreadsheets/d/18XbeUB-U22t4x--tyrmTKaftokaU1GWwFk4VmfNpa90/export?format=csv`;

let allData = [];
let filteredData = [];

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateLastUpdate();
});

// ===== Load Data from Google Sheets =====
function loadData() {
    fetch(CSV_URL)
        .then(res => res.text())
        .then(csv => {
            parseCSV(csv);
            displayData();
            updateSummary();
        })
        .catch(err => {
            console.error('Error loading data:', err);
            document.getElementById('tableBody').innerHTML = 
                '<tr><td colspan="6" style="text-align: center; color: red;">ไม่สามารถโหลดข้อมูลได้</td></tr>';
        });
}

// ===== Parse CSV =====
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    allData = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        
        allData.push(obj);
    }
    
    filteredData = [...allData];
}

// ===== Display Data =====
function displayData() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">ไม่มีข้อมูล</td></tr>';
        return;
    }
    
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        const imageUrl = item['รูปภาพ/PIC'] || '';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item['วันที่'] || '-'}</td>
            <td>${item['ชื่อ-สกุล'] || '-'}</td>
            <td>${item['เบอร์'] || '-'}</td>
            <td>${item['เลขไมล์'] || '-'}</td>
            <td>
                ${imageUrl ? `<img src="${imageUrl}" onclick="showImage('${imageUrl}')" alt="รูปภาพ" style="cursor: pointer;">` : '-'}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ===== Update Summary =====
function updateSummary() {
    document.getElementById('totalCount').textContent = filteredData.length.toLocaleString('th-TH');
    
    const miles = filteredData
        .map(item => parseInt(item['เลขไมล์'] || 0))
        .filter(m => !isNaN(m));
    
    if (miles.length > 0) {
        const maxMile = Math.max(...miles);
        const avgMile = Math.round(miles.reduce((a, b) => a + b, 0) / miles.length);
        
        document.getElementById('maxMile').textContent = maxMile.toLocaleString('th-TH');
        document.getElementById('avgMile').textContent = avgMile.toLocaleString('th-TH');
    } else {
        document.getElementById('maxMile').textContent = '0';
        document.getElementById('avgMile').textContent = '0';
    }
}

// ===== Apply Filter =====
function applyFilter() {
    const searchName = document.getElementById('searchName').value.toLowerCase();
    const searchPhone = document.getElementById('searchPhone').value.toLowerCase();
    
    filteredData = allData.filter(item => {
        const matchName = !searchName || item['ชื่อ-สกุล'].toLowerCase().includes(searchName);
        const matchPhone = !searchPhone || item['เบอร์'].toLowerCase().includes(searchPhone);
        return matchName && matchPhone;
    });
    
    displayData();
    updateSummary();
}

// ===== Reset Filter =====
function resetFilter() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchPhone').value = '';
    filteredData = [...allData];
    displayData();
    updateSummary();
}

// ===== Show Image Modal =====
function showImage(imageUrl) {
    const modal = document.getElementById('imageModal') || createModal();
    const modalImg = modal.querySelector('img');
    modalImg.src = imageUrl;
    modal.classList.add('show');
}

// ===== Create Modal =====
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            <img src="" alt="รูปภาพ">
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    return modal;
}

// ===== Close Modal =====
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.classList.remove('show');
}

// ===== Update Last Update Time =====
function updateLastUpdate() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    document.getElementById('lastUpdate').textContent = now.toLocaleDateString('th-TH', options);
}

// ===== Auto Refresh (every 5 minutes) =====
setInterval(loadData, 5 * 60 * 1000);
