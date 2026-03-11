/**
 * Gallery Data Manager
 * Uses localStorage for browser-based image management.
 * Admin creates albums (mandap types) and uploads images to them.
 */

const defaultGallery = { folders: [] };

// ===== GALLERY STORAGE ENGINE =====
const GalleryStore = {
  STORAGE_KEY: 'ambika_gallery',

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { folders: [] };
    } catch {
      return { folders: [] };
    }
  },

  _save(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  createFolder(name, description) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const data = this.getAll();
    if (data.folders.find(f => f.slug === slug)) return { error: 'Album already exists' };

    data.folders.push({ name, slug, description: description || '', images: [] });
    this._save(data);
    return { success: true, slug };
  },

  deleteFolder(slug) {
    const data = this.getAll();
    data.folders = data.folders.filter(f => f.slug !== slug);
    this._save(data);
    return { success: true };
  },

  addImages(folderSlug, images) {
    const data = this.getAll();
    const folder = data.folders.find(f => f.slug === folderSlug);
    if (!folder) return { error: 'Album not found' };

    images.forEach(img => {
      folder.images.push({
        filename: img.filename,
        path: img.data,
        isUploaded: true
      });
    });

    this._save(data);
    return { success: true };
  },

  deleteImage(folderSlug, filename) {
    const data = this.getAll();
    const folder = data.folders.find(f => f.slug === folderSlug);
    if (folder) {
      folder.images = folder.images.filter(i => i.filename !== filename);
      this._save(data);
    }
    return { success: true };
  }
};

// ===== HERO IMAGE STORAGE =====
const HeroStore = {
  STORAGE_KEY: 'ambika_hero',

  getImages() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addImage(filename, dataUrl) {
    const images = this.getImages();
    images.push({ filename, path: dataUrl });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  },

  deleteImage(filename) {
    let images = this.getImages();
    images = images.filter(i => i.filename !== filename);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  }
};
