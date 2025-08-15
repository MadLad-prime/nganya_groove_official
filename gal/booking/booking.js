document.addEventListener('DOMContentLoaded', () => {
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('Firebase not initialized for booking.js. Make sure firebase-config.js and SDKs are loaded.');
        alert('Booking system is currently unavailable. Firebase not connected.');
        return;
    }
    const db = firebase.firestore();

    const bookingForm = document.getElementById('matatu-booking-form');
    const statusMessageDiv = document.getElementById('booking-status-message'); // Ensure this div exists in booking.html

    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            if (!statusMessageDiv) {
                console.error("Status message div not found.");
                return;
            }

            statusMessageDiv.textContent = 'Submitting your request...';
            statusMessageDiv.style.color = '#FFD700'; // KCM Gold for processing

            const fullName = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const route = document.getElementById('route').value;
            const travelDate = document.getElementById('travelDate').value;
            const passengers = parseInt(document.getElementById('passengers').value, 10);
            const pickupTime = document.getElementById('pickupTime').value;
            const specialRequests = document.getElementById('specialRequests').value.trim();
            const agreeTerms = document.getElementById('agreeTerms').checked;

            if (!agreeTerms) {
                statusMessageDiv.textContent = 'Please agree to the terms before submitting.';
                statusMessageDiv.style.color = '#e74c3c'; // Red for error
                document.getElementById('agreeTerms').focus();
                return;
            }

            if (!fullName || !phone || !route || !travelDate || !passengers) {
                statusMessageDiv.textContent = 'Please fill in all required fields (*).';
                statusMessageDiv.style.color = '#e74c3c';
                return;
            }

            const bookingData = {
                fullName,
                phone,
                email: email || null, // Store null if empty
                route,
                travelDate,
                passengers,
                pickupTime: pickupTime || null, // Store null if empty
                specialRequests: specialRequests || null, // Store null if empty
                submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending' // Initial status
            };

            try {
                await db.collection('bookings').add(bookingData);
                statusMessageDiv.textContent = 'Booking request sent successfully! We will contact you shortly.';
                statusMessageDiv.style.color = '#2ecc71'; // Green for success
                bookingForm.reset();
                // Ensure travelDate min attribute is reset if needed, or simply let it be.
                const travelDateInput = document.getElementById('travelDate');
                if (travelDateInput) {
                    const today = new Date().toISOString().split('T')[0];
                    travelDateInput.setAttribute('min', today);
                }
            } catch (error) {
                console.error('Error submitting booking:', error);
                statusMessageDiv.textContent = `Error submitting request: ${error.message}. Please try again.`;
                statusMessageDiv.style.color = '#e74c3c';
            }
        });
    } else {
        console.error("Booking form not found on this page.");
    }
});