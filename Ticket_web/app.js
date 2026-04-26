const { useState, useEffect } = React;

// --- 1. EventDetails Component ---
function EventDetails({ eventName, department, date, time, venue, ticketPrice, availableTickets }) {
    return (
        <div className="event-details">
            <div className="pill-badge">{department}</div>
            <h1>{eventName}</h1>
            
            <div className="detail-list">
                <div className="detail-item">
                    <span className="detail-label"><i className="far fa-calendar-alt"></i> Date & Time</span>
                    <span className="detail-value">{date} • {time}</span>
                </div>
                
                <div className="detail-item">
                    <span className="detail-label"><i className="fas fa-map-marker-alt"></i> Venue</span>
                    <span className="detail-value">{venue}</span>
                </div>
                
                <div className="detail-item">
                    <span className="detail-label"><i className="fas fa-ticket-alt"></i> Price per Ticket</span>
                    <span className="detail-value">₹{ticketPrice}</span>
                </div>

                <div className="detail-item" style={{ marginTop: '0.5rem' }}>
                    <span className="detail-label"><i className="fas fa-users"></i> Available Tickets</span>
                    <span className={`detail-value ${availableTickets > 0 ? 'highlight-green' : ''}`}>
                        {availableTickets > 0 ? availableTickets : <span style={{color: 'var(--error)'}}>Sold Out</span>}
                    </span>
                </div>
            </div>
        </div>
    );
}

// --- 2. BookingSummary Component ---
function BookingSummary({ summary, onReset }) {
    return (
        <div className="booking-section">
            <div className="success-banner">
                <i className="fas fa-check-circle"></i>
                <div className="title">Booking Confirmed!</div>
            </div>
            
            <div style={{ padding: '0 0.5rem 1.5rem 0.5rem' }}>
                <div className="summary-row">
                    <span className="label">Name</span>
                    <span className="val">{summary.name}</span>
                </div>
                <div className="summary-row">
                    <span className="label">Email</span>
                    <span className="val">{summary.email}</span>
                </div>
                <div className="summary-row">
                    <span className="label">Department</span>
                    <span className="val">{summary.department}</span>
                </div>
                <div className="summary-row">
                    <span className="label">Tickets Booked</span>
                    <span className="val">{summary.qty}</span>
                </div>
                <div className="summary-row total">
                    <span className="label">Total Amount Paid</span>
                    <span className="val">₹{summary.totalAmount}</span>
                </div>
            </div>

            <button className="submit-btn secondary-btn" onClick={onReset}>
                <i className="fas fa-redo-alt"></i> Book Another Ticket
            </button>
        </div>
    );
}

// --- 3. Payment Section Component ---
function PaymentSection({ bookingData, onConfirm, onCancel, isLoading }) {
    return (
        <div className="booking-section">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="spinner large"></div>
                    <h3 style={{color: 'var(--primary)'}}>Processing Payment...</h3>
                </div>
            )}
            
            <h2>Complete Payment</h2>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem'}}>
                Please complete the payment to secure your tickets.
            </div>

            <div className="summary-row" style={{background: 'var(--primary-light)', padding: '1rem', borderRadius: '8px'}}>
                <span className="label" style={{color: 'var(--text-main)', fontWeight: 600}}>Total Amount Due</span>
                <span className="val" style={{color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 700}}>
                    ₹{bookingData.totalAmount}
                </span>
            </div>

            <div className="qr-container">
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dummy@upi&pn=VeltechEvent&am=${bookingData.totalAmount}`} 
                    alt="Payment QR Code" 
                />
                <p style={{marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem'}}>Scan with any UPI app</p>
            </div>

            <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                <button className="submit-btn secondary-btn" onClick={onCancel} disabled={isLoading} style={{flex: 1}}>
                    <i className="fas fa-times"></i> Cancel
                </button>
                <button className="submit-btn" onClick={() => onConfirm(bookingData)} disabled={isLoading} style={{flex: 1}}>
                    {isLoading ? <div className="spinner"></div> : <><i className="fas fa-shield-check"></i> Payment Done</>}
                </button>
            </div>
        </div>
    );
}

// --- 4. BookingForm Component ---
function BookingForm({ ticketPrice, availableTickets, onBook }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '', // default empty for select
        qty: 1
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleQtyChange = (delta) => {
        setFormData(prev => {
            let newQty = prev.qty + delta;
            if (newQty < 1) newQty = 1;
            if (newQty > availableTickets) newQty = availableTickets;
            return { ...prev, qty: newQty };
        });
        if (errors.qty) setErrors(prev => ({ ...prev, qty: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required.";
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.email = "Email is required.";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid format.";

        if (!formData.department) newErrors.department = "Please select a department.";

        if (formData.qty <= 0) newErrors.qty = "Invalid quantity.";
        else if (formData.qty > availableTickets) newErrors.qty = `Max ${availableTickets} tickets.`;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onBook({
                ...formData,
                totalAmount: formData.qty * ticketPrice
            });
        }
    };

    const totalCost = formData.qty * ticketPrice;
    const isSoldOut = availableTickets === 0;

    // Check if form is partially empty to disable button real-time
    const isFormEmpty = !formData.name.trim() || !formData.email.trim() || !formData.department;

    return (
        <div className="booking-section">
            <h2>Book Your Tickets</h2>
            
            {isSoldOut ? (
                <div className="success-banner" style={{background: 'var(--error)', color: 'white', borderColor: 'var(--error)'}}>
                    <i className="fas fa-exclamation-circle"></i>
                    <div className="title">Event Sold Out</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-icon-wrapper">
                            <i className="far fa-user"></i>
                            <input 
                                className="form-input"
                                type="text" name="name" 
                                value={formData.name} onChange={handleChange} 
                                placeholder="Enter full name"
                            />
                        </div>
                        {errors.name && <span className="error-msg">{errors.name}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-icon-wrapper">
                            <i className="far fa-envelope"></i>
                            <input 
                                className="form-input"
                                type="email" name="email" 
                                value={formData.email} onChange={handleChange} 
                                placeholder="you@domain.com"
                            />
                        </div>
                        {errors.email && <span className="error-msg">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Department</label>
                        <div className="input-icon-wrapper">
                            <i className="fas fa-building"></i>
                            <select 
                                className="form-input" 
                                name="department" 
                                value={formData.department} 
                                onChange={handleChange}
                            >
                                <option value="" disabled>Select your department</option>
                                <option value="CSE">Computer Science (CSE)</option>
                                <option value="CSE-AIML">CSE - AI & ML</option>
                                <option value="IT">Information Technology</option>
                                <option value="ECE">Electronics (ECE)</option>
                                <option value="MECH">Mechanical Eng.</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {errors.department && <span className="error-msg">{errors.department}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Number of Tickets</label>
                        <div className="stepper-container">
                            <button type="button" className="stepper-btn" onClick={() => handleQtyChange(-1)} disabled={formData.qty <= 1}>
                                <i className="fas fa-minus"></i>
                            </button>
                            <div className="stepper-value">{formData.qty}</div>
                            <button type="button" className="stepper-btn" onClick={() => handleQtyChange(1)} disabled={formData.qty >= availableTickets}>
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                        {errors.qty && <span className="error-msg">{errors.qty}</span>}
                    </div>

                    <div className="price-calculation">
                        <span className="price-label">Total Cost</span>
                        <span className="price-value">₹{totalCost}</span>
                    </div>

                    <button type="submit" className="submit-btn" disabled={isSoldOut || isFormEmpty}>
                        Confirm Booking <i className="fas fa-arrow-right"></i>
                    </button>
                </form>
            )}
        </div>
    );
}

// --- 5. Main App Component ---
function App() {
    const [availableTickets, setAvailableTickets] = useState(150);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [pendingPayment, setPendingPayment] = useState(null);
    const [isBooking, setIsBooking] = useState(false); // Used for loading spinner

    const eventInfo = {
        eventName: "Veltech Tech Fest 2026",
        department: "Tech Department",
        date: "October 15, 2026",
        time: "10:00 AM - 6:00 PM",
        venue: "Veltech University Auditorium",
        ticketPrice: 500
    };

    const handlePaymentConfirm = (bookingData) => {
        setIsBooking(true);
        
        fetch('book_ticket.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setAvailableTickets(prev => prev - bookingData.qty);
                setBookingSummary(bookingData);
                setPendingPayment(null);
            } else {
                alert("Booking failed: " + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred during booking.");
        })
        .finally(() => {
            setIsBooking(false);
        });
    };

    const handleReset = () => {
        setBookingSummary(null);
        setPendingPayment(null);
    };

    return (
        <div className="app-container">
            <EventDetails 
                {...eventInfo} 
                availableTickets={availableTickets} 
            />

            {bookingSummary ? (
                <BookingSummary 
                    summary={bookingSummary} 
                    onReset={handleReset} 
                />
            ) : pendingPayment ? (
                <PaymentSection 
                    bookingData={pendingPayment} 
                    onConfirm={handlePaymentConfirm} 
                    onCancel={() => setPendingPayment(null)}
                    isLoading={isBooking}
                />
            ) : (
                <BookingForm 
                    ticketPrice={eventInfo.ticketPrice} 
                    availableTickets={availableTickets} 
                    onBook={setPendingPayment} 
                />
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
