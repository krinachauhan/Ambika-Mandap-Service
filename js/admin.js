// ===== Static Credentials =====
const ADMIN_USER = 'ambika';
const ADMIN_PASS = 'ambika@2024';

// ===== Elements =====
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const createFolderForm = document.getElementById('createFolderForm');
const foldersList = document.getElementById('foldersList');
const uploadModal = document.getElementById('uploadModal');
const modalClose = document.getElementById('modalClose');
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const uploadBtn = document.getElementById('uploadBtn');

let selectedFiles = [];
let currentUploadFolder = '';

// ===== Auth =====
function checkAuth() {
  if (sessionStorage.getItem('ambika_admin') === 'true') {
    showDashboard();
  }
}

function showDashboard() {
  loginScreen.style.display = 'none';
  adminDashboard.style.display = 'block';
  loadHeroImages();
  loadFolders();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem('ambika_admin', 'true');
    showDashboard();
  } else {
    loginError.textContent = 'Invalid credentials';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('ambika_admin');
  loginScreen.style.display = 'flex';
  adminDashboard.style.display = 'none';
  loginForm.reset();
});

// ===== Hero Images =====
const heroUploadZone = document.getElementById('heroUploadZone');
const heroFileInput = document.getElementById('heroFileInput');
const heroImagesList = document.getElementById('heroImagesList');

if (heroUploadZone) {
  heroUploadZone.addEventListener('click', () => heroFileInput.click());
}

if (heroFileInput) {
  heroFileInput.addEventListener('change', async () => {
    const file = heroFileInput.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    heroFileInput.value = '';

    try {
      const dataUrl = await compressImage(file, 1400, 0.75);
      const filename = Date.now() + '-' + Math.round(Math.random() * 1e6) + '.jpg';
      HeroStore.addImage(filename, dataUrl);
      loadHeroImages();
    } catch (err) {
      alert('Error processing image');
    }
  });
}

function loadHeroImages() {
  if (!heroImagesList) return;
  const images = HeroStore.getImages();

  if (images.length === 0) {
    heroImagesList.innerHTML = '<p style="color:#888;font-size:0.85rem;padding:10px;">No hero images yet. Add photos to show a slideshow on the homepage.</p>';
    return;
  }

  heroImagesList.innerHTML = images.map(img =>
    '<div class="hero-img-item">' +
      '<img src="' + img.path + '" alt="">' +
      '<button class="hero-img-delete" onclick="deleteHeroImage(\'' + img.filename + '\')" title="Delete"><i class="fas fa-times"></i></button>' +
    '</div>'
  ).join('');
}

function deleteHeroImage(filename) {
  if (!confirm('Delete this hero image?')) return;
  HeroStore.deleteImage(filename);
  loadHeroImages();
}

// ===== Folders =====
function loadFolders() {
  const data = GalleryStore.getAll();
  renderFolders(data.folders);
}

function renderFolders(folders) {
  if (folders.length === 0) {
    foldersList.innerHTML =
      '<div style="text-align:center;padding:60px;color:#888;">' +
      '<i class="fas fa-folder-open" style="font-size:3rem;margin-bottom:15px;display:block;color:#ddd;"></i>' +
      '<p>No albums yet. Create your first album above!</p></div>';
    return;
  }

  foldersList.innerHTML = folders.map(folder => {
    return '<div class="folder-card" data-slug="' + folder.slug + '">' +
      '<div class="folder-header" onclick="toggleFolder(\'' + folder.slug + '\')">' +
        '<div class="folder-info">' +
          '<i class="fas fa-folder"></i>' +
          '<h4>' + escapeHtml(folder.name) + '</h4>' +
          '<span>' + folder.images.length + ' image' + (folder.images.length !== 1 ? 's' : '') + '</span>' +
        '</div>' +
        '<div class="folder-actions">' +
          '<button class="btn-icon btn-upload-trigger" onclick="event.stopPropagation(); openUploadModal(\'' + folder.slug + '\')" title="Add Images">' +
            '<i class="fas fa-cloud-upload-alt"></i>' +
          '</button>' +
          '<button class="btn-icon btn-delete" onclick="event.stopPropagation(); deleteFolder(\'' + folder.slug + '\', \'' + escapeHtml(folder.name).replace(/'/g, "\\'") + '\')" title="Delete Album"><i class="fas fa-trash-alt"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="folder-body" id="body-' + folder.slug + '">' +
        (folder.description ? '<p class="folder-desc">' + escapeHtml(folder.description) + '</p>' : '') +
        (folder.images.length === 0 ?
          '<div class="folder-empty"><i class="fas fa-image"></i><p>No images yet. Click upload to add.</p></div>' :
          '<div class="folder-images">' +
            folder.images.map(img =>
              '<div class="folder-image">' +
                '<img src="' + img.path + '" alt="" loading="lazy">' +
                (img.isUploaded ? '<button class="img-delete" onclick="deleteImage(\'' + folder.slug + '\', \'' + img.filename + '\')" title="Delete"><i class="fas fa-times"></i></button>' : '') +
              '</div>'
            ).join('') +
          '</div>'
        ) +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleFolder(slug) {
  const body = document.getElementById('body-' + slug);
  if (body) body.classList.toggle('open');
}

// Create folder
createFolderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('folderName').value.trim();
  const desc = document.getElementById('folderDesc').value.trim();
  if (!name) return;

  const result = GalleryStore.createFolder(name, desc);
  if (result.error) {
    alert(result.error);
  } else {
    createFolderForm.reset();
    loadFolders();
  }
});

// Delete folder
function deleteFolder(slug, name) {
  if (!confirm('Delete album "' + name + '" and all its images? This cannot be undone.')) return;
  GalleryStore.deleteFolder(slug);
  loadFolders();
}

// Delete image
function deleteImage(folder, filename) {
  if (!confirm('Delete this image?')) return;
  GalleryStore.deleteImage(folder, filename);
  loadFolders();
}

// ===== Upload Modal =====
function openUploadModal(folder) {
  currentUploadFolder = folder;
  selectedFiles = [];
  uploadPreview.innerHTML = '';
  uploadBtn.disabled = true;
  uploadModal.style.display = 'flex';
}

modalClose.addEventListener('click', () => {
  uploadModal.style.display = 'none';
  selectedFiles = [];
});

uploadModal.addEventListener('click', (e) => {
  if (e.target === uploadModal) {
    uploadModal.style.display = 'none';
    selectedFiles = [];
  }
});

// File handling
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => {
  handleFiles(fileInput.files);
  fileInput.value = '';
});

function handleFiles(files) {
  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  selectedFiles.push(...imageFiles);
  uploadBtn.disabled = selectedFiles.length === 0;
  renderPreviews();
}

function renderPreviews() {
  uploadPreview.innerHTML = selectedFiles.map((file, idx) => {
    const url = URL.createObjectURL(file);
    return '<div class="preview-item">' +
      '<img src="' + url + '" alt="">' +
      '<button class="preview-remove" onclick="removeFile(' + idx + ')"><i class="fas fa-times"></i></button>' +
    '</div>';
  }).join('');
}

function removeFile(idx) {
  selectedFiles.splice(idx, 1);
  uploadBtn.disabled = selectedFiles.length === 0;
  renderPreviews();
}

// Compress and save images
uploadBtn.addEventListener('click', async () => {
  if (selectedFiles.length === 0 || !currentUploadFolder) return;
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  const images = [];
  for (const file of selectedFiles) {
    try {
      const dataUrl = await compressImage(file, 800, 0.7);
      images.push({
        filename: Date.now() + '-' + Math.round(Math.random() * 1e6) + '.jpg',
        data: dataUrl
      });
    } catch (err) {
      console.error('Error processing', file.name, err);
    }
  }

  if (images.length > 0) {
    const result = GalleryStore.addImages(currentUploadFolder, images);
    if (result.error) {
      alert(result.error);
    }
  }

  uploadModal.style.display = 'none';
  selectedFiles = [];
  uploadBtn.innerHTML = '<i class="fas fa-save"></i> Save Images';
  uploadBtn.disabled = false;
  loadFolders();
});

// Image compression
function compressImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round(h * maxSize / w);
            w = maxSize;
          } else {
            w = Math.round(w * maxSize / h);
            h = maxSize;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Utility
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Init
checkAuth();
