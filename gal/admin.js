// admin.js (Fully Corrected and Completed)

document.addEventListener('DOMContentLoaded', () => {
    // --- BASIC SETUP & FIREBASE CHECK ---
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('Firebase not initialized. Make sure firebase-config.js is loaded and configured correctly.');
        const authErrorDiv = document.getElementById('auth-error');
        if (authErrorDiv) {
            authErrorDiv.textContent = 'Firebase is not connected. Please check configuration.';
            authErrorDiv.style.display = 'block';
        }
        return;
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    // --- DOM ELEMENT SELECTORS ---
    // Auth
    const authContainer = document.getElementById('auth-container');
    const signInButton = document.getElementById('sign-in-button');
    const signOutButtonSidebar = document.getElementById('sign-out-button-sidebar');
    const dashboardContainer = document.querySelector('.dashboard-container');
    const userInfoDisplay = document.getElementById('user-info-display');
    const authErrorDiv = document.getElementById('auth-error');

    // Dashboard & Navigation
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    // Gallery
    const galleryUploadButton = document.getElementById('gallery-upload-button');
    const galleryStatusDiv = document.getElementById('status');

    // Blog
    const blogTitleInput = document.getElementById('blog-title');
    const blogContentInput = document.getElementById('blog-content');
    const blogCoverUploadButton = document.getElementById('blog-cover-upload-button');
    const blogCoverPreview = document.getElementById('blog-cover-preview');
    const publishBlogButton = document.getElementById('publish-blog-button');
    const blogStatusDiv = document.getElementById('blog-status');
    let blogCoverImageUrl = null;

    // Products
    const productNameInput = document.getElementById('product-name');
    const productDescriptionInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productImageUploadButton = document.getElementById('product-image-upload-button');
    const productImagePreview = document.getElementById('product-image-preview');
    const publishProductButton = document.getElementById('publish-product-button');
    const adminProductStatusDiv = document.getElementById('admin-product-status');
    let productImageUrl = null;
    
    // Bookings
    const bookingListContainer = document.getElementById('booking-list-container');
    const adminBookingStatusDiv = document.getElementById('admin-booking-status');

    // Orders
    const orderListContainer = document.getElementById('order-list-container');
    const adminOrderStatusDiv = document.getElementById('admin-order-status');

    // --- AUTHENTICATION LOGIC ---
    const googleProvider = new firebase.auth.GoogleAuthProvider();

    if (signInButton) {
        signInButton.addEventListener('click', () => {
            auth.signInWithRedirect(googleProvider);
        });
    }

    if (signOutButtonSidebar) {
        signOutButtonSidebar.addEventListener('click', () => auth.signOut());
    }

    auth.getRedirectResult().catch(error => console.error("Redirect Sign-In Error:", error));

    auth.onAuthStateChanged(user => {
        if (user) {
            authContainer.style.display = 'none';
            dashboardContainer.style.display = 'flex';
            sidebarToggle.style.display = 'block';

            userInfoDisplay.innerHTML = `
                ${user.photoURL ? `<img src="${user.photoURL}" alt="User Photo">` : ''}
                <strong>${user.displayName || 'Admin User'}</strong>
                <small>${user.email}</small>
            `;
            initializeDashboardFunctionality();
        } else {
            authContainer.style.display = 'flex';
            dashboardContainer.style.display = 'none';
            sidebarToggle.style.display = 'none';
            userInfoDisplay.innerHTML = '';
        }
    });

    // --- DASHBOARD INITIALIZATION & CORE FUNCTIONALITY ---
    function initializeDashboardFunctionality() {
        // Sidebar Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href').substring(1);
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    navLinks.forEach(l => l.classList.remove('active'));
                    contentSections.forEach(section => section.classList.toggle('active', section.id === targetId));
                    link.classList.add('active');

                    // Load content for the active section
                    if (targetId === 'booking-management') loadBookings();
                    if (targetId === 'order-management') loadOrders();

                    if (window.innerWidth <= 900 && !sidebar.classList.contains('closed')) {
                        sidebar.classList.add('closed');
                        sidebarToggle.innerHTML = '☰';
                    }
                }
            });
        });

        const defaultLink = document.querySelector('.sidebar nav a[href="#gallery-management"]');
        if (defaultLink) defaultLink.click();

        // Sidebar Toggle
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('closed');
            sidebarToggle.innerHTML = sidebar.classList.contains('closed') ? '☰' : '×';
        });

        // --- CLOUDINARY WIDGETS ---
        const galleryUploadWidget = cloudinary.createUploadWidget({
            cloudName: 'drw1cqjsf', uploadPreset: 'beef555', tags: ['nuno-gallery'], multiple: true
        }, (error, result) => {
            if (!error && result.event === 'success') {
                galleryStatusDiv.innerHTML = `Uploaded: <strong>${result.info.original_filename}</strong>`;
                galleryStatusDiv.className = 'success';
            } else if (error) {
                galleryStatusDiv.innerHTML = 'Gallery upload error.';
                galleryStatusDiv.className = 'error';
            }
        });

        const blogCoverWidget = cloudinary.createUploadWidget({
            cloudName: 'drw1cqjsf', uploadPreset: 'beef555', tags: ['nuno-covers'], cropping: true, croppingAspectRatio: 16/9
        }, (error, result) => {
            if (!error && result.event === 'success') {
                blogCoverImageUrl = result.info.secure_url;
                blogCoverPreview.src = blogCoverImageUrl;
                blogCoverPreview.style.display = 'block';
                blogStatusDiv.innerHTML = `Image selected: <strong>${result.info.original_filename}</strong>`;
                blogStatusDiv.className = 'success';
            }
        });

        const productImageWidget = cloudinary.createUploadWidget({
            cloudName: 'drw1cqjsf', uploadPreset: 'beef555', tags: ['nuno-images'], cropping: true, croppingAspectRatio: 1
        }, (error, result) => {
            if (!error && result.event === 'success') {
                productImageUrl = result.info.secure_url;
                productImagePreview.src = productImageUrl;
                productImagePreview.style.display = 'block';
                adminProductStatusDiv.innerHTML = `Image selected: <strong>${result.info.original_filename}</strong>`;
                adminProductStatusDiv.className = 'success';
            }
        });

        // Attach widgets to their buttons
        if (galleryUploadButton) galleryUploadButton.addEventListener('click', () => galleryUploadWidget.open());
        if (blogCoverUploadButton) blogCoverUploadButton.addEventListener('click', () => blogCoverWidget.open());
        if (productImageUploadButton) productImageUploadButton.addEventListener('click', () => productImageWidget.open());

        // --- BLOG MANAGEMENT LOGIC ---
        if (publishBlogButton) {
            publishBlogButton.addEventListener('click', async () => {
                const user = auth.currentUser;
                const title = blogTitleInput.value.trim();
                const content = blogContentInput.value.trim();
                if (!user || !title || !content) {
                    blogStatusDiv.textContent = 'Title and Content fields are required.';
                    blogStatusDiv.className = 'error';
                    return;
                }

                try {
                    await db.collection('blogPosts').add({
                        title, content,
                        coverImageUrl: blogCoverImageUrl || null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        authorId: user.uid,
                        authorName: user.displayName || user.email
                    });
                    blogStatusDiv.textContent = 'Published successfully!';
                    blogStatusDiv.className = 'success';
                    blogTitleInput.value = ''; blogContentInput.value = '';
                    blogCoverPreview.style.display = 'none'; blogCoverImageUrl = null;
                } catch (error) {
                    blogStatusDiv.textContent = `Publish error: ${error.message}`;
                    blogStatusDiv.className = 'error';
                }
            });
        }

        // --- PRODUCT MANAGEMENT LOGIC ---
        if (publishProductButton) {
            publishProductButton.addEventListener('click', async () => {
                const name = productNameInput.value.trim();
                const description = productDescriptionInput.value.trim();
                const price = parseFloat(productPriceInput.value);

                if (!name || !description || !price || !productImageUrl) {
                    adminProductStatusDiv.textContent = 'All fields, including image, are required.';
                    adminProductStatusDiv.className = 'error';
                    return;
                }
                
                try {
                    await db.collection('products').add({
                        name, description, price,
                        imageUrl: productImageUrl,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    adminProductStatusDiv.textContent = 'Product published successfully!';
                    adminProductStatusDiv.className = 'success';
                    productNameInput.value = ''; productDescriptionInput.value = ''; productPriceInput.value = '';
                    productImagePreview.style.display = 'none'; productImageUrl = null;
                } catch (error) {
                    adminProductStatusDiv.textContent = `Error: ${error.message}`;
                    adminProductStatusDiv.className = 'error';
                }
            });
        }

        // --- BOOKING MANAGEMENT LOGIC ---
        async function loadBookings() {
            if (!bookingListContainer) return;
            bookingListContainer.innerHTML = '<p class="loading-bookings">Loading bookings...</p>';
            try {
                const snapshot = await db.collection('bookings').orderBy('submittedAt', 'desc').get();
                if (snapshot.empty) {
                    bookingListContainer.innerHTML = '<p class="no-bookings">No new bookings found.</p>';
                    return;
                }
                let output = '';
                snapshot.forEach(doc => {
                    const b = doc.data();
                    const id = doc.id;
                    const submitted = b.submittedAt?.toDate().toLocaleString() || 'N/A';
                    const travel = new Date(b.travelDate + 'T00:00:00').toLocaleDateString();

                    output += `
                        <div class="booking-card" id="booking-${id}">
                            <h4>${b.fullName} <small>${submitted}</small></h4>
                            <p><strong>Phone:</strong> ${b.phone}</p>
                            <p><strong>Email:</strong> ${b.email || 'N/A'}</p>
                            <p><strong>Route:</strong> ${b.route}</p>
                            <p><strong>Date:</strong> ${travel}</p>
                            <p><strong>Passengers:</strong> ${b.passengers}</p>
                            <p><strong>Time:</strong> ${b.pickupTime || 'N/A'}</p>
                            <p><strong>Requests:</strong> ${b.specialRequests || 'None'}</p>
                            <div class="booking-meta">
                                <strong>Status:</strong> <span id="status-${id}">${b.status || 'pending'}</span>
                            </div>
                            <div class="booking-actions">
                                <button onclick="updateBookingStatus('${id}', 'confirmed')">Confirm</button>
                                <button onclick="updateBookingStatus('${id}', 'contacted')">Contacted</button>
                                <button onclick="updateBookingStatus('${id}', 'cancelled')">Cancel</button>
                                <button onclick="deleteBooking('${id}')" class="delete-booking">Delete</button>
                            </div>
                        </div>`;
                });
                bookingListContainer.innerHTML = output;
            } catch (err) {
                bookingListContainer.innerHTML = '<p class="no-bookings">Error loading bookings.</p>';
                console.error("Error loading bookings:", err);
            }
        }
        
        window.updateBookingStatus = async (id, status) => {
            try {
                await db.collection('bookings').doc(id).update({ status });
                document.getElementById(`status-${id}`).textContent = status;
                adminBookingStatusDiv.textContent = `Booking ${id} updated to ${status}.`;
            } catch (err) {
                adminBookingStatusDiv.textContent = `Status update error: ${err.message}`;
            }
        };

        window.deleteBooking = async (id) => {
            if (!confirm('Are you sure you want to delete this booking?')) return;
            try {
                await db.collection('bookings').doc(id).delete();
                document.getElementById(`booking-${id}`).remove();
                adminBookingStatusDiv.textContent = `Booking ${id} deleted.`;
            } catch (err) {
                adminBookingStatusDiv.textContent = `Delete error: ${err.message}`;
            }
        };

        // --- ORDER MANAGEMENT LOGIC ---
        async function loadOrders() {
            if (!orderListContainer) return;
            orderListContainer.innerHTML = '<p class="loading-orders">Loading orders...</p>';
            try {
                const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
                if (snapshot.empty) {
                    orderListContainer.innerHTML = '<p class="no-orders">No merchandise orders found.</p>';
                    return;
                }
                let output = '';
                snapshot.forEach(doc => {
                    const order = doc.data();
                    const id = doc.id;
                    const created = order.createdAt?.toDate().toLocaleString() || 'N/A';
                    const itemsHtml = order.items.map(item => `<li><strong>${item.quantity}x</strong> ${item.name}</li>`).join('');
                    output += `
                        <div class="order-card" id="order-${id}">
                            <h4>${order.orderId} <small>${created}</small></h4>
                            <ul class="order-items-list">${itemsHtml}</ul>
                            <p class="order-total">Total: <strong>Ksh ${order.totalAmount.toLocaleString()}</strong></p>
                            <div class="order-meta">
                                <strong>Status:</strong> <span id="status-order-${id}" class="status-badge status-${order.status || 'new'}">${order.status || 'new'}</span>
                            </div>
                            <div class="order-actions">
                                <button onclick="updateOrderStatus('${id}', 'processing')">Processing</button>
                                <button onclick="updateOrderStatus('${id}', 'shipped')">Shipped</button>
                                <button onclick="updateOrderStatus('${id}', 'completed')">Completed</button>
                                <button onclick="deleteOrder('${id}')" class="delete-order">Delete</button>
                            </div>
                        </div>`;
                });
                orderListContainer.innerHTML = output;
            } catch (err) {
                orderListContainer.innerHTML = '<p class="no-orders">Error loading orders. Check console.</p>';
                console.error("Error loading orders: ", err);
            }
        }

        window.updateOrderStatus = async (id, status) => {
            try {
                await db.collection('orders').doc(id).update({ status });
                const statusEl = document.getElementById(`status-order-${id}`);
                if (statusEl) {
                    statusEl.textContent = status;
                    statusEl.className = `status-badge status-${status}`;
                }
                adminOrderStatusDiv.textContent = `Order ${id} updated to ${status}.`;
            } catch (err) {
                adminOrderStatusDiv.textContent = `Status update error: ${err.message}`;
            }
        };

        window.deleteOrder = async (id) => {
            if (!confirm(`Are you sure you want to permanently delete order ${id}?`)) return;
            try {
                await db.collection('orders').doc(id).delete();
                document.getElementById(`order-${id}`).remove();
                adminOrderStatusDiv.textContent = `Order ${id} deleted successfully.`;
            } catch (err) {
                adminOrderStatusDiv.textContent = `Delete error: ${err.message}`;
            }
        };
    }

    // --- PRELOADER HIDE ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => preloader.style.display = 'none', 500);
        }
    });
});