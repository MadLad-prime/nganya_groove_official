document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const CLOUDINARY_CONFIG = {
        cloudName: 'drw1cqjsf', // <-- ⚠️  REPLACE WITH YOUR CLOUD NAME ⚠️
        tag: 'my-gallery'       // The tag for your gallery images
    };

    // --- DOM ELEMENTS ---
    const galleryContainer = document.getElementById('image-gallery');
    const loader = document.getElementById('loader');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // --- STATE ---
    let allImages = [];
    let currentIndex = 0;

    // --- GUARD CLAUSES ---
    // If essential elements aren't on the page, don't run the script.
    if (!galleryContainer || !lightbox || !lightboxImg || !closeBtn || !prevBtn || !nextBtn) {
        console.warn('Gallery script could not run. One or more essential DOM elements are missing.');
        if(loader) loader.style.display = 'none';
        return;
    }

    // --- FUNCTIONS ---

    /**
     * Fetches image data from your Cloudinary account based on the configured tag.
     */
    async function fetchImages() {
        loader.style.display = 'block';
        galleryContainer.style.visibility = 'hidden';
        try {
            const response = await fetch(`https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/list/${CLOUDINARY_CONFIG.tag}.json?max_results=100`);
            if (!response.ok) {
                 throw new Error(`Could not fetch image list. The tag endpoint might be disabled on your Cloudinary account.`);
            }
            const data = await response.json();
            
            if (data.resources && data.resources.length > 0) {
                // Sort images by creation date, newest first
                allImages = data.resources.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                renderGallery(allImages);
            } else {
                displayMessage("No images found with the specified tag.");
            }

        } catch (error) {
            console.error('Error fetching images:', error);
            displayMessage(`Sorry, could not load images. ${error.message}`);
        } finally {
            loader.style.display = 'none';
            galleryContainer.style.visibility = 'visible';
        }
    }

    /**
     * Renders the fetched images into the gallery container and attaches event listeners.
     * @param {Array} images - The array of image objects from Cloudinary.
     */
    function renderGallery(images) {
        galleryContainer.innerHTML = '';
        images.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';

            const thumbnailUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/c_fill,g_auto,ar_1:1,w_400,q_auto,f_auto/${image.public_id}.${image.format}`;
            const highResUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_1200,h_1200,c_limit,q_auto,f_auto/${image.public_id}.${image.format}`;

            const img = document.createElement('img');
            img.src = thumbnailUrl;
            img.alt = image.public_id || 'Gallery image';
            img.loading = 'lazy'; // Improve performance by lazy loading images
            
            galleryItem.setAttribute('data-src', highResUrl);
            galleryItem.setAttribute('data-index', index); // Store index for quick lookup

            galleryItem.appendChild(img);
            galleryContainer.appendChild(galleryItem);

            // Add click listener to each item to open the lightbox
            galleryItem.addEventListener('click', () => {
                currentIndex = parseInt(item.getAttribute('data-index'), 10);
                openLightbox(highResUrl);
            });
        });
    }
    
    /**
     * Displays a message in the gallery container (e.g., for errors or no images).
     * @param {string} message - The message to display.
     */
    function displayMessage(message) {
        galleryContainer.innerHTML = `<p class="gallery-message">${message}</p>`;
    }

    /**
     * Opens the lightbox with a specific image.
     * @param {string} imageUrl - The URL of the high-resolution image to display.
     */
    function openLightbox(imageUrl) {
        lightboxImg.src = imageUrl;
        lightbox.classList.add('is-active');
        document.body.classList.add('no-scroll'); // Prevents background scrolling
    }

    /**
     * Closes the lightbox.
     */
    function closeLightbox() {
        lightbox.classList.remove('is-active');
        document.body.classList.remove('no-scroll');
        lightboxImg.src = ''; // Clear src to stop image loading
    }
    
    /**
     * Shows the next image in the sequence.
     */
    function showNextImage() {
        currentIndex = (currentIndex + 1) % allImages.length; // Loop back to the start
        const nextImage = allImages[currentIndex];
        const highResUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_1200,h_1200,c_limit,q_auto,f_auto/${nextImage.public_id}.${nextImage.format}`;
        openLightbox(highResUrl);
    }
    
    /**
     * Shows the previous image in the sequence.
     */
    function showPrevImage() {
        currentIndex = (currentIndex - 1 + allImages.length) % allImages.length; // Loop back to the end
        const prevImage = allImages[currentIndex];
        const highResUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_1200,h_1200,c_limit,q_auto,f_auto/${prevImage.public_id}.${prevImage.format}`;
        openLightbox(highResUrl);
    }

    // --- GLOBAL EVENT LISTENERS ---
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNextImage);
    prevBtn.addEventListener('click', showPrevImage);

    // Close lightbox by clicking on the background overlay
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // --- INITIALIZE ---
    fetchImages();
});