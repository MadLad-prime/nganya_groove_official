// --- START OF FILE blog.js ---

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SETUP & ELEMENT SELECTORS ---
    // Check for Firebase
    if (typeof firebase === 'undefined' || typeof db === 'undefined') {
        console.error('Firebase not initialized.');
        // Handle error display
        return;
    }

    // Selectors for Firebase functionality
    const postsListContainer = document.getElementById('blog-posts-list');
    const loader = document.getElementById('blog-loader');

    // Selectors for KCM Lightbox functionality
    const lightbox = document.getElementById('blog-lightbox');
    const lightboxContentScrollable = lightbox.querySelector('.lightbox-content-scrollable');
    const body = document.body;

    // Cache to hold posts after fetching
    let allBlogPosts = [];

    // --- 2. DATA FETCHING (FROM YOUR ORIGINAL FILE - UNCHANGED) ---
    async function fetchBlogPosts() {
        if (loader) loader.style.display = 'block';
        if (postsListContainer) postsListContainer.innerHTML = '';

        try {
            const snapshot = await db.collection('blogPosts')
                                     .orderBy('createdAt', 'desc')
                                     .get();
            
            allBlogPosts = [];
            if (snapshot.empty) {
                if (postsListContainer) postsListContainer.innerHTML = '<p style="text-align: center;">No blog posts found yet.</p>';
                if (loader) loader.style.display = 'none';
                return;
            }

            snapshot.forEach(doc => {
                allBlogPosts.push({ id: doc.id, ...doc.data() });
            });

            renderBlogPostsList(allBlogPosts);

        } catch (error) {
            console.error("Error fetching blog posts: ", error);
            if (postsListContainer) postsListContainer.innerHTML = `<p style="color: red; text-align: center;">Could not load blog posts.</p>`;
        } finally {
            if (loader) loader.style.display = 'none';
        }
    }

    // --- 3. DYNAMIC HTML RENDERING (ADAPTED FOR KCM THEME) ---
    function renderBlogPostsList(posts) {
        if (!postsListContainer) return;
        postsListContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = document.createElement('div');
            // Use the classes from the KCM theme for styling and animation
            postElement.className = 'blog-preview-card animate-on-scroll';
            postElement.setAttribute('data-animation', 'fadeInUp-scroll');
            
            // Set the blog ID so we can find it on click
            postElement.setAttribute('data-blog-id', post.id);

            const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date N/A';
            const plainTextContent = stripHtml(post.content);
            const excerpt = plainTextContent.substring(0, 150) + (plainTextContent.length > 150 ? '...' : '');

            // This HTML structure matches the KCM theme exactly
            postElement.innerHTML = `
                <div class="card-image-container">
                    ${post.coverImageUrl ? `<img src="${post.coverImageUrl}" alt="${post.title}">` : ''}
                    <span class="card-category">Community</span> <!-- Category can be dynamic if available in your data -->
                </div>
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-excerpt">${excerpt}</p>
                    <span class="card-date">${date}</span>
                    <button class="card-read-more">Read Full Story</button>
                </div>
            `;
            postsListContainer.appendChild(postElement);

            // Add click listener to the whole card
            postElement.addEventListener('click', () => showFullPostInLightbox(post.id));
        });

        // After rendering, activate the scroll animations
        initializeScrollObserver();
    }

    function stripHtml(html) {
       let tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }
    
    // --- 4. LIGHTBOX FUNCTIONALITY (REPLACES YOUR OLD DIV SWAP) ---
    function showFullPostInLightbox(postId) {
        const post = allBlogPosts.find(p => p.id === postId);
        if (!post || !lightbox) return;

        const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date N/A';
        
        // Build the HTML to be injected into the lightbox
        const fullPostHtml = `
            ${post.coverImageUrl ? `<img src="${post.coverImageUrl}" alt="${post.title}" class="full-post-image">` : ''}
            <h1 class="full-post-title">${post.title}</h1>
            <p class="full-post-meta">By Nganya Groove Team | ${date} </p>
            <div>${post.content.replace(/\n/g, '<br>')}</div>
        `;

        // Inject the content and show the lightbox
        lightboxContentScrollable.innerHTML = fullPostHtml;
        lightbox.setAttribute('aria-hidden', 'false');
        lightbox.classList.add('is-active');
        body.classList.add('no-scroll'); // Prevent background scrolling
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.setAttribute('aria-hidden', 'true');
        lightbox.classList.remove('is-active');
        body.classList.remove('no-scroll');
        lightboxContentScrollable.innerHTML = ''; // Clear content
    }

    // Event listeners for closing the lightbox
    lightbox.addEventListener('click', function(event) {
        if (event.target.matches('[data-close-lightbox]')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && lightbox.classList.contains('is-active')) {
            closeLightbox();
        }
    });

    // --- 5. KCM ANIMATION & FOOTER SCRIPT ---
    function initializeScrollObserver() {
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // We can unobserve after first animation if we want
                    // observer.unobserve(entry.target);
                }
            });
        };
        const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            scrollObserver.observe(el);
        });
    }
    
    // For the footer year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // --- 6. INITIAL LOAD ---
    fetchBlogPosts();
});