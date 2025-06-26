document.addEventListener('DOMContentLoaded', () => {

    // --- Global Helper Function for Messages (used by all forms: login, register, new request, admin forms) ---
    function showMessage(element, message, type) {
        if (element) {
            element.textContent = message;
            element.className = 'message-area'; // Reset classes (e.g., to 'message-area')

            if (type) { // ONLY add the type class (success/error) if 'type' is provided
                element.classList.add(type);
            }

            element.style.display = 'block'; // Make sure it's visible
            setTimeout(() => {
                element.style.display = 'none'; // Hide after some time
                element.textContent = ''; // Clear text
                // element.className = ''; // Optionally, reset class fully here if 'message-area' is not desired when hidden
            }, 5000); // Hide after 5 seconds
        }
    }

    // --- GLOBAL DUMMY DATA STORAGE (using localStorage for persistence) ---
    let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    // Add a default admin user if none exists for easy testing
    if (!users.some(user => user.email === 'admin@example.com')) {
        users.push({
            id: 'USER-ADMIN',
            farmName: 'Admin Panel',
            fullName: 'Administrator',
            email: 'admin@example.com',
            password: 'adminpassword', // In a real app, hash this!
            role: 'admin'
        });
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    let farmerRequests = JSON.parse(localStorage.getItem('farmerRequests')) || [];
    let farmerPayments = JSON.parse(localStorage.getItem('farmerPayments')) || [];

    if (farmerPayments.length === 0) {
        farmerPayments = [
            { id: 'PAY-001', requestId: 'REQ-DEMO-A', amount: 50000, date: '2024-06-01', status: 'Completed', farmerId: 'USER-DEMO-A' },
            { id: 'PAY-002', requestId: 'REQ-DEMO-B', amount: 75000, date: '2024-06-15', status: 'Pending', farmerId: 'USER-DEMO-B' }
        ];
        localStorage.setItem('farmerPayments', JSON.stringify(farmerPayments));
    }

    // --- NEWLY ADDED: Product Data for Products Page & Admin Management ---
    // Products stored in localStorage for persistence and admin management
    let allProducts = JSON.parse(localStorage.getItem('allProducts')) || [
        // Chick Types (initial dummy data)
        { id: 'chick-broiler', category: 'chick-types', image: 'assets/broiler_chicks.jpg', name: 'Broiler Chicks', shortDesc: 'Fast-growing, excellent for meat production. Available in various ages.', price: 'Starting from UGX 2,500/chick', fullDesc: 'Our broiler chicks are sourced from top hatcheries, ensuring rapid growth and high feed conversion rates. Ideal for commercial meat production, they reach market weight quickly. Available as day-olds or vaccinated older chicks.' },
        { id: 'chick-layer', category: 'chick-types', image: 'assets/layer_chicks.jpg', name: 'Layer Chicks', shortDesc: 'High-quality layers for consistent egg production. Various breeds available.', price: 'Starting from UGX 3,000/chick', fullDesc: 'We offer various breeds of layer chicks known for their high egg-laying capacity and strong disease resistance. They are vaccinated and ready to thrive in your farm, providing consistent egg production for years.' },
        { id: 'chick-kuroiler', category: 'chick-types', image: 'assets/kuroiler_chicks.jpg', name: 'Kuroiler Chicks', shortDesc: 'Dual-purpose, hardy and adaptable for both meat and egg production.', price: 'Starting from UGX 3,500/chick', fullDesc: 'Kuroiler chicks are popular for their dual-purpose nature, providing good quality meat and a decent number of eggs. They are highly adaptable to local conditions and backyard farming, making them a favorite among small-scale farmers.' },
        // Poultry Feeds
        { id: 'feed-starter', category: 'feeds', image: 'assets/starter_feed.jpg', name: 'Chick Starter Feed', shortDesc: 'High protein feed for chicks (0-8 weeks) for strong initial growth.', price: 'UGX 50,000/25kg bag', fullDesc: 'Our chick starter feed is specially formulated with high protein content and essential nutrients to ensure rapid initial growth and strong bone development for chicks aged 0-8 weeks. It boosts immunity and prepares them for the next growth stage.' },
        { id: 'feed-grower', category: 'feeds', image: 'assets/grower_feed.jpg', name: 'Poultry Grower Feed', shortDesc: 'Balanced nutrition for growing birds (9-18 weeks) before laying/finishing.', price: 'UGX 48,000/25kg bag', fullDesc: 'The grower feed provides a balanced nutritional profile for birds aged 9-18 weeks, optimizing their development and preparing them for either laying or meat finishing. It supports healthy muscle and skeletal growth.' },
        { id: 'feed-layer-mash', category: 'feeds', image: 'assets/layer_mash.jpg', name: 'Layer Mash/Pellets', shortDesc: 'Optimized feed for consistent and high-quality egg production.', price: 'UGX 45,000/25kg bag', fullDesc: 'Our layer mash/pellets are designed to meet the high nutritional demands of laying hens, ensuring consistent production of high-quality eggs with strong shells. Enriched with calcium and phosphorus for optimal health.' },
        // Vaccines & Supplements
        { id: 'vaccine-mareks', category: 'vaccines', image: 'assets/mareks_vaccine.jpg', name: 'Marek\'s Vaccine', shortDesc: 'Essential vaccine for day-old chicks to prevent Marek\'s disease.', price: 'UGX 10,000/dose (bulk)', fullDesc: 'Marek\'s disease is a common and highly contagious viral disease of chickens. Our Marek\'s vaccine provides crucial protection when administered to day-old chicks, significantly reducing morbidity and mortality.' },
        { id: 'supplement-multivitamin', category: 'vaccines', image: 'assets/multivitamin_supplements.jpg', name: 'Multivitamin Supplements', shortDesc: 'Boost health and immunity, especially during stress periods.', price: 'UGX 15,000/bottle', fullDesc: 'These multivitamin supplements are vital for maintaining overall poultry health, especially during periods of stress, disease recovery, or peak production. They enhance immunity and improve feed utilization.' }
    ];
    // Save initial products to localStorage if it was empty
    if (localStorage.getItem('allProducts') === null) {
        localStorage.setItem('allProducts', JSON.stringify(allProducts));
    }

    // --- Function to render products dynamically on products.html ---
    const renderProducts = () => {
        const chickTypesGrid = document.querySelector('#chick-types .product-grid');
        const feedsGrid = document.querySelector('#feeds .product-grid');
        const vaccinesGrid = document.querySelector('#vaccines .product-grid');

        if (chickTypesGrid) chickTypesGrid.innerHTML = '';
        if (feedsGrid) feedsGrid.innerHTML = '';
        if (vaccinesGrid) vaccinesGrid.innerHTML = '';

        allProducts.forEach(product => {
            const productItem = `
                <div class="product-item" data-product-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p>${product.shortDesc}</p>
                    <p class="price">${product.price}</p>
                    <button class="btn primary view-details-btn">View Details</button>
                </div>
            `;
            if (product.category === 'chick-types' && chickTypesGrid) {
                chickTypesGrid.insertAdjacentHTML('beforeend', productItem);
            } else if (product.category === 'feeds' && feedsGrid) {
                feedsGrid.insertAdjacentHTML('beforeend', productItem);
            } else if (product.category === 'vaccines' && vaccinesGrid) {
                vaccinesGrid.insertAdjacentHTML('beforeend', productItem);
            }
        });
    };

    // --- MODAL RELATED JAVASCRIPT ---
    const productDetailModal = document.getElementById('productDetailModal');
    const closeButton = productDetailModal ? productDetailModal.querySelector('.close-button') : null;

    function openProductModal(product) {
        if (!productDetailModal) {
            console.error('Error: Modal element with ID "productDetailModal" not found!');
            return;
        }
        productDetailModal.querySelector('img').src = product.image;
        productDetailModal.querySelector('img').alt = product.name;
        productDetailModal.querySelector('h3').textContent = product.name;
        productDetailModal.querySelector('.price').textContent = product.price;
        productDetailModal.querySelector('p').textContent = product.fullDesc;
        productDetailModal.style.display = 'flex';
    }

    const setupProductModalListeners = () => {
        document.querySelectorAll('.product-item .view-details-btn').forEach(button => {
            button.removeEventListener('click', handleViewDetailsClick);
            button.addEventListener('click', handleViewDetailsClick);
        });
        if (closeButton) {
            closeButton.removeEventListener('click', closeProductModal);
            closeButton.addEventListener('click', closeProductModal);
        }
        window.removeEventListener('click', closeProductModalOutside);
        window.addEventListener('click', closeProductModalOutside);
    };

    const handleViewDetailsClick = (event) => {
        event.preventDefault();
        const productItemElement = event.target.closest('.product-item');
        if (productItemElement) {
            const productId = productItemElement.dataset.productId;
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                openProductModal(product);
            } else {
                console.error('Product not found for ID:', productId);
            }
        }
    };

    const closeProductModal = () => {
        if (productDetailModal) {
            productDetailModal.style.display = 'none';
        }
    };

    const closeProductModalOutside = (event) => {
        if (event.target === productDetailModal) {
            closeProductModal();
        }
    };
    // --- END MODAL RELATED JAVASCRIPT ---


    // ==========================================================
    // --- LOGIN FORM LOGIC ---
    // ==========================================================
    const loginForm = document.getElementById('loginForm');
    const usernameOrEmailInput = document.getElementById('usernameOrEmail');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            showMessage(loginMessage, '', ''); // Clear any previous messages

            const inputIdentifier = usernameOrEmailInput.value.trim();
            const password = passwordInput.value.trim();

            if (inputIdentifier === '' || password === '') {
                showMessage(loginMessage, 'Please fill in both fields.', 'error');
                return;
            }

            const foundUser = users.find(user =>
                (user.email === inputIdentifier || user.fullName === inputIdentifier) && user.password === password
            );

            if (foundUser) {
                showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
                sessionStorage.setItem('loggedInUser', JSON.stringify(foundUser));

                setTimeout(() => {
                    if (foundUser.role === 'farmer') {
                        window.location.href = 'future/farmer.html'; // Assuming farmer.html is in a 'future' folder
                    } else if (foundUser.role === 'admin') {
                        window.location.href = 'admin.html'; // Redirect to admin dashboard
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showMessage(loginMessage, 'Invalid username/email or password.', 'error');
            }
        });
    }

    // ==========================================================
    // --- REGISTER FORM LOGIC ---
    // ==========================================================
    const registerForm = document.getElementById('registerForm');
    const farmNameInput = document.getElementById('farmName');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const registerPasswordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerMessage = document.getElementById('registerMessage');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            showMessage(registerMessage, '', '');

            const farmName = farmNameInput.value.trim();
            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = registerPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!farmName || !fullName || !email || !password || !confirmPassword) {
                showMessage(registerMessage, 'All fields are required.', 'error');
                return;
            }
            if (!emailRegex.test(email)) {
                showMessage(registerMessage, 'Please enter a valid email address.', 'error');
                return;
            }
            if (password.length < 6) {
                showMessage(registerMessage, 'Password must be at least 6 characters long.', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showMessage(registerMessage, 'Passwords do not match.', 'error');
                return;
            }
            if (users.some(user => user.email === email)) {
                showMessage(registerMessage, 'An account with this email already exists.', 'error');
                return;
            }

            const newUser = {
                id: `USER-${Date.now()}`,
                farmName: farmName,
                fullName: fullName,
                email: email,
                password: password,
                role: 'farmer'
            };

            users.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(users));

            showMessage(registerMessage, 'Registration successful! Redirecting to login...', 'success');
            console.log('Registered new user:', newUser);

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }


    // ==========================================================
    // --- FARMER DASHBOARD JAVASCRIPT LOGIC ---
    // ==========================================================
    const farmerSidebarLinks = document.querySelectorAll('.sidebar-nav ul li a');
    const farmerDashboardSections = document.querySelectorAll('.dashboard-section');
    const farmerUserNameSpan = document.getElementById('farmerUserName');

    const isFarmerDashboard = document.getElementById('dashboard') !== null;

    if (isFarmerDashboard) {
        const showDashboardSection = (sectionId) => {
            farmerDashboardSections.forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        };

        const updateActiveSidebarLink = (activeId) => {
            farmerSidebarLinks.forEach(link => {
                link.classList.remove('sidebar-active');
                if (link.getAttribute('href') === `#${activeId}`) {
                    link.classList.add('sidebar-active');
                }
            });
        };

        const updateDashboardStats = () => {
            const pendingCount = farmerRequests.filter(req => req.status === 'Pending').length;
            const completedCount = farmerRequests.filter(req => req.status === 'Completed').length;
            const totalOrdered = farmerRequests.reduce((sum, req) => sum + req.quantity, 0);

            const pendingRequestsCountElement = document.getElementById('pendingRequestsCount');
            const completedRequestsCountElement = document.getElementById('completedRequestsCount');
            const totalChicksOrderedElement = document.getElementById('totalChicksOrdered');

            if (pendingRequestsCountElement) pendingRequestsCountElement.textContent = pendingCount;
            if (completedRequestsCountElement) completedRequestsCountElement.textContent = completedCount;
            if (totalChicksOrderedElement) totalChicksOrderedElement.textContent = totalOrdered;
        };

        const renderRequestsTable = () => {
            const requestsTableBody = document.getElementById('requestsTableBody');
            if (!requestsTableBody) return;

            requestsTableBody.innerHTML = '';

            if (farmerRequests.length === 0) {
                requestsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No chick requests submitted yet.</td></tr>';
                return;
            }

            // Filter requests by logged-in farmer
            const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
            const currentUserRequests = farmerRequests.filter(req => req.farmerId === loggedInUser.id);


            if (currentUserRequests.length === 0) {
                 requestsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">You have no chick requests submitted yet.</td></tr>';
                 return;
            }


            currentUserRequests.forEach(request => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.date}</td>
                    <td>${request.type}</td>
                    <td>${request.quantity}</td>
                    <td><span class="status-${request.status.toLowerCase()}">${request.status}</span></td>
                    <td>${request.deliveryDate}</td>
                    <td>
                        <button class="btn secondary btn-small" onclick="alert('Viewing details for Request ID: ${request.id}')">View</button>
                        ${request.status === 'Pending' ? `<button class="btn btn-danger btn-small" onclick="cancelRequest('${request.id}')">Cancel</button>` : ''}
                    </td>
                `;
                requestsTableBody.appendChild(row);
            });
        };

        const renderPaymentsTable = () => {
            const paymentsTableBody = document.getElementById('paymentsTableBody');
            if (!paymentsTableBody) return;

            paymentsTableBody.innerHTML = '';

            const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
            const currentUserPayments = farmerPayments.filter(payment => payment.farmerId === loggedInUser.id);

            if (currentUserPayments.length === 0) {
                paymentsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No payment records found.</td></tr>';
                return;
            }

            currentUserPayments.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.date}</td>
                    <td>${payment.id}</td>
                    <td>${payment.requestId}</td>
                    <td>UGX ${payment.amount.toLocaleString()}</td>
                    <td><span class="status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                    <td>
                        <button class="btn secondary btn-small" onclick="alert('Viewing payment proof for ID: ${payment.id}')">View Proof</button>
                    </td>
                `;
                paymentsTableBody.appendChild(row);
            });
        };

        window.cancelRequest = (requestId) => {
            if (confirm(`Are you sure you want to cancel request ID: ${requestId}?`)) {
                farmerRequests = farmerRequests.map(req =>
                    req.id === requestId ? { ...req, status: 'Canceled' } : req
                );
                localStorage.setItem('farmerRequests', JSON.stringify(farmerRequests));
                renderRequestsTable();
                updateDashboardStats();
                showMessage(document.getElementById('requestMessage'), `Request ${requestId} has been canceled.`, 'success');
            }
        };

        if (farmerSidebarLinks.length > 0 && farmerDashboardSections.length > 0) {
            farmerSidebarLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    showDashboardSection(targetId);
                    updateActiveSidebarLink(targetId);
                    if (targetId === 'my-requests') {
                        renderRequestsTable();
                    } else if (targetId === 'payment-history') {
                        renderPaymentsTable();
                    }
                });
            });

            const initialHash = window.location.hash.substring(1);
            if (initialHash && document.getElementById(initialHash)) {
                showDashboardSection(initialHash);
                updateActiveSidebarLink(initialHash);
                if (initialHash === 'my-requests') {
                    renderRequestsTable();
                } else if (initialHash === 'payment-history') {
                    renderPaymentsTable();
                }
            } else {
                showDashboardSection('dashboard');
                updateActiveSidebarLink('dashboard');
            }
        }

        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (loggedInUser && farmerUserNameSpan) {
            farmerUserNameSpan.textContent = loggedInUser.fullName;
            updateDashboardStats();
            renderRequestsTable();
            renderPaymentsTable();
        } else {
            console.warn('No logged in user found in session. Redirecting to login.');
            window.location.href = '../login.html'; // Adjusted path if farmer.html is in future/
        }

        const farmerLogoutBtn = document.getElementById('logoutBtn');
        const farmerSidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');

        const handleFarmerLogout = (event) => {
            if (event) event.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            window.location.href = '../login.html'; // Adjusted path if farmer.html is in future/
        };

        if (farmerLogoutBtn) farmerLogoutBtn.addEventListener('click', handleFarmerLogout);
        if (farmerSidebarLogoutBtn) farmerSidebarLogoutBtn.addEventListener('click', handleFarmerLogout);

        const chickRequestForm = document.getElementById('chickRequestForm');
        const requestMessageDiv = document.getElementById('requestMessage');

        if (chickRequestForm) {
            chickRequestForm.addEventListener('submit', (event) => {
                event.preventDefault();

                showMessage(requestMessageDiv, '', '');

                const chickType = document.getElementById('chickType').value;
                const quantity = parseInt(document.getElementById('quantity').value);
                const deliveryDate = document.getElementById('deliveryDate').value;
                const comments = document.getElementById('comments').value.trim();

                if (!chickType || !quantity || quantity <= 0 || !deliveryDate) {
                    showMessage(requestMessageDiv, 'Please fill in all required fields and ensure quantity is positive.', 'error');
                    return;
                }

                const newRequest = {
                    id: `REQ-${Date.now()}`,
                    date: new Date().toLocaleDateString('en-GB'),
                    type: chickType,
                    quantity: quantity,
                    deliveryDate: deliveryDate,
                    comments: comments,
                    status: 'Pending',
                    farmerId: loggedInUser.id // Associate request with the logged-in farmer
                };

                farmerRequests.push(newRequest);
                localStorage.setItem('farmerRequests', JSON.stringify(farmerRequests));

                showMessage(requestMessageDiv, 'Chick request submitted successfully!', 'success');
                chickRequestForm.reset();

                updateDashboardStats();
                renderRequestsTable();
            });
        }
    } // End of isFarmerDashboard check

    // ==========================================================
    // --- ADMIN DASHBOARD JAVASCRIPT LOGIC ---
    // (This block only runs if admin.html is loaded)
    // ==========================================================
    const adminSidebarLinks = document.querySelectorAll('.sidebar-nav ul li a');
    const adminDashboardSections = document.querySelectorAll('.dashboard-section');
    const adminUserNameSpan = document.getElementById('adminUserName');

    const isAdminDashboard = document.getElementById('admin-overview') !== null;

    if (isAdminDashboard) {
        // Admin Authentication Check
        const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (!loggedInUser || loggedInUser.role !== 'admin') {
            console.warn('Unauthorized access to admin page. Redirecting to login.');
            window.location.href = 'login.html'; // Redirect to login if not admin
            return; // Stop further execution
        }

        // Functions to show/hide sections and update active links (similar to farmer dashboard)
        const showAdminDashboardSection = (sectionId) => {
            adminDashboardSections.forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        };

        const updateActiveAdminSidebarLink = (activeId) => {
            adminSidebarLinks.forEach(link => {
                link.classList.remove('sidebar-active');
                if (link.getAttribute('href') === `#${activeId}`) {
                    link.classList.add('sidebar-active');
                }
            });
        };

        // Admin Dashboard Stats
        const updateAdminDashboardStats = () => {
            const pendingReqCount = farmerRequests.filter(req => req.status === 'Pending').length;
            const completedReqCount = farmerRequests.filter(req => req.status === 'Completed').length;
            const totalFarmersCount = users.filter(user => user.role === 'farmer').length;

            document.getElementById('totalPendingRequests').textContent = pendingReqCount;
            document.getElementById('totalCompletedRequests').textContent = completedReqCount;
            document.getElementById('totalFarmers').textContent = totalFarmersCount;
        };

        // Render Admin Requests Table
        const renderAdminRequestsTable = () => {
            const adminRequestsTableBody = document.getElementById('adminRequestsTableBody');
            if (!adminRequestsTableBody) return;

            adminRequestsTableBody.innerHTML = '';

            if (farmerRequests.length === 0) {
                adminRequestsTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No farmer requests yet.</td></tr>';
                return;
            }

            farmerRequests.forEach(request => {
                const farmer = users.find(u => u.id === request.farmerId);
                const farmerName = farmer ? farmer.fullName : 'N/A';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${request.date}</td>
                    <td>${request.id}</td>
                    <td>${farmerName}</td>
                    <td>${request.type}</td>
                    <td>${request.quantity}</td>
                    <td>${request.deliveryDate}</td>
                    <td><span class="status-${request.status.toLowerCase()}">${request.status}</span></td>
                    <td>
                        <select class="status-select" data-request-id="${request.id}">
                            <option value="Pending" ${request.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Approved" ${request.status === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Completed" ${request.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Canceled" ${request.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
                        </select>
                        <button class="btn secondary btn-small view-request-details" data-request-id="${request.id}">Details</button>
                    </td>
                `;
                adminRequestsTableBody.appendChild(row);
            });

            // Add event listeners for status changes
            adminRequestsTableBody.querySelectorAll('.status-select').forEach(select => {
                select.addEventListener('change', (event) => {
                    const requestId = event.target.dataset.requestId;
                    const newStatus = event.target.value;
                    const requestIndex = farmerRequests.findIndex(req => req.id === requestId);
                    if (requestIndex !== -1) {
                        farmerRequests[requestIndex].status = newStatus;
                        localStorage.setItem('farmerRequests', JSON.stringify(farmerRequests));
                        showMessage(document.getElementById('manage-requests').querySelector('.message-area') || adminUserNameSpan.closest('.dashboard-content').querySelector('.message-area'), `Request ${requestId} status updated to ${newStatus}.`, 'success');
                        updateAdminDashboardStats(); // Update stats after status change
                        renderAdminRequestsTable(); // Re-render for visual update
                    }
                });
            });

            // Add event listeners for view request details (you can implement a modal for this)
            adminRequestsTableBody.querySelectorAll('.view-request-details').forEach(button => {
                button.addEventListener('click', (event) => {
                    const requestId = event.target.dataset.requestId;
                    const request = farmerRequests.find(req => req.id === requestId);
                    if (request) {
                        alert(`Request Details:\nID: ${request.id}\nFarmer: ${users.find(u => u.id === request.farmerId)?.fullName || 'N/A'}\nType: ${request.type}\nQuantity: ${request.quantity}\nDelivery: ${request.deliveryDate}\nStatus: ${request.status}\nComments: ${request.comments || 'None'}`);
                    }
                });
            });
        };

        // Render Admin Payments Table
        const renderAdminPaymentsTable = () => {
            const adminPaymentsTableBody = document.getElementById('adminPaymentsTableBody');
            if (!adminPaymentsTableBody) return;

            adminPaymentsTableBody.innerHTML = '';

            if (farmerPayments.length === 0) {
                adminPaymentsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No payment records yet.</td></tr>';
                return;
            }

            farmerPayments.forEach(payment => {
                const farmer = users.find(u => u.id === payment.farmerId);
                const farmerName = farmer ? farmer.fullName : 'N/A';
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payment.date}</td>
                    <td>${payment.id}</td>
                    <td>${payment.requestId}</td>
                    <td>${farmerName}</td>
                    <td>UGX ${payment.amount.toLocaleString()}</td>
                    <td><span class="status-${payment.status.toLowerCase()}">${payment.status}</span></td>
                    <td>
                        <select class="payment-status-select" data-payment-id="${payment.id}">
                            <option value="Pending" ${payment.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Completed" ${payment.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Failed" ${payment.status === 'Failed' ? 'selected' : ''}>Failed</option>
                        </select>
                        <button class="btn secondary btn-small view-payment-proof" data-payment-id="${payment.id}">Proof</button>
                    </td>
                `;
                adminPaymentsTableBody.appendChild(row);
            });

            // Add event listeners for payment status changes
            adminPaymentsTableBody.querySelectorAll('.payment-status-select').forEach(select => {
                select.addEventListener('change', (event) => {
                    const paymentId = event.target.dataset.paymentId;
                    const newStatus = event.target.value;
                    const paymentIndex = farmerPayments.findIndex(pay => pay.id === paymentId);
                    if (paymentIndex !== -1) {
                        farmerPayments[paymentIndex].status = newStatus;
                        localStorage.setItem('farmerPayments', JSON.stringify(farmerPayments));
                        showMessage(document.getElementById('manage-payments').querySelector('.message-area') || adminUserNameSpan.closest('.dashboard-content').querySelector('.message-area'), `Payment ${paymentId} status updated to ${newStatus}.`, 'success');
                        renderAdminPaymentsTable(); // Re-render for visual update
                    }
                });
            });
            // Add event listeners for view payment proof (simple alert for now)
            adminPaymentsTableBody.querySelectorAll('.view-payment-proof').forEach(button => {
                button.addEventListener('click', (event) => {
                    const paymentId = event.target.dataset.paymentId;
                    alert(`Simulating viewing proof for Payment ID: ${paymentId}. In a real app, this would open an image or PDF.`);
                });
            });
        };

        // Product Management Logic
        const addProductForm = document.getElementById('addProductForm');
        const addProductMessage = document.getElementById('addProductMessage');
        const existingProductsList = document.getElementById('existingProductsList');

        const renderAdminProducts = () => {
            if (!existingProductsList) return;
            existingProductsList.innerHTML = '';

            if (allProducts.length === 0) {
                existingProductsList.innerHTML = '<p>No products added yet.</p>';
                return;
            }

            allProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'admin-product-item'; // Add styling for this in your CSS
                productDiv.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                    <div>
                        <h4>${product.name} (${product.category})</h4>
                        <p>Price: ${product.price}</p>
                        <p>Short Desc: ${product.shortDesc}</p>
                    </div>
                    <div class="actions">
                        <button class="btn btn-danger btn-small delete-product-btn" data-product-id="${product.id}">Delete</button>
                    </div>
                `;
                existingProductsList.appendChild(productDiv);
            });

            // Add event listeners for delete buttons
            existingProductsList.querySelectorAll('.delete-product-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productIdToDelete = event.target.dataset.productId;
                    if (confirm(`Are you sure you want to delete product: ${allProducts.find(p => p.id === productIdToDelete)?.name}?`)) {
                        allProducts = allProducts.filter(p => p.id !== productIdToDelete);
                        localStorage.setItem('allProducts', JSON.stringify(allProducts));
                        showMessage(addProductMessage, 'Product deleted successfully!', 'success');
                        renderAdminProducts(); // Re-render the list
                        renderProducts(); // Re-render products on main products page (if it's open)
                    }
                });
            });
        };

        if (addProductForm) {
            addProductForm.addEventListener('submit', (event) => {
                event.preventDefault();
                showMessage(addProductMessage, '', '');

                const newProductName = document.getElementById('newProductName').value.trim();
                const newProductCategory = document.getElementById('newProductCategory').value;
                const newProductShortDesc = document.getElementById('newProductShortDesc').value.trim();
                const newProductFullDesc = document.getElementById('newProductFullDesc').value.trim();
                const newProductPrice = document.getElementById('newProductPrice').value.trim();
                let newProductImage = document.getElementById('newProductImage').value.trim();

                if (!newProductName || !newProductCategory || !newProductShortDesc || !newProductFullDesc || !newProductPrice) {
                    showMessage(addProductMessage, 'Please fill all required product fields.', 'error');
                    return;
                }

                // Simple check for image path - could be more robust
                if (!newProductImage) {
                    newProductImage = 'assets/placeholder.jpg'; // Default if left empty
                }

                const newProduct = {
                    id: `PROD-${Date.now()}`,
                    name: newProductName,
                    category: newProductCategory,
                    shortDesc: newProductShortDesc,
                    fullDesc: newProductFullDesc,
                    price: newProductPrice,
                    image: newProductImage
                };

                allProducts.push(newProduct);
                localStorage.setItem('allProducts', JSON.stringify(allProducts));
                showMessage(addProductMessage, 'Product added successfully!', 'success');
                addProductForm.reset();
                renderAdminProducts(); // Re-render admin product list
                renderProducts(); // Re-render products on main products page (if it's open)
            });
        }


        // Event Listeners for Admin Dashboard Navigation
        if (adminSidebarLinks.length > 0 && adminDashboardSections.length > 0) {
            adminSidebarLinks.forEach(link => {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    showAdminDashboardSection(targetId);
                    updateActiveAdminSidebarLink(targetId);

                    // Re-render tables/lists when their sections are activated
                    if (targetId === 'manage-requests') {
                        renderAdminRequestsTable();
                    } else if (targetId === 'manage-payments') {
                        renderAdminPaymentsTable();
                    } else if (targetId === 'manage-products') {
                        renderAdminProducts();
                    }
                });
            });

            // Handle initial load: check for URL hash or default to 'admin-overview'
            const initialAdminHash = window.location.hash.substring(1);
            if (initialAdminHash && document.getElementById(initialAdminHash)) {
                showAdminDashboardSection(initialAdminHash);
                updateActiveAdminSidebarLink(initialAdminHash);
                if (initialAdminHash === 'manage-requests') {
                    renderAdminRequestsTable();
                } else if (initialAdminHash === 'manage-payments') {
                    renderAdminPaymentsTable();
                } else if (initialAdminHash === 'manage-products') {
                    renderAdminProducts();
                }
            } else {
                showAdminDashboardSection('admin-overview');
                updateActiveAdminSidebarLink('admin-overview');
            }
        }

        // Initial Admin Dashboard Load
        if (loggedInUser && adminUserNameSpan) {
            adminUserNameSpan.textContent = loggedInUser.fullName;
            updateAdminDashboardStats();
            renderAdminRequestsTable(); // Render requests on initial load (if that's the default active tab)
            renderAdminPaymentsTable(); // Render payments on initial load
            renderAdminProducts(); // Render products on initial load
        }

        // Admin Logout Functionality
        const adminLogoutBtn = document.getElementById('adminLogoutBtn');
        const sidebarAdminLogoutBtn = document.getElementById('sidebarAdminLogoutBtn');

        const handleAdminLogout = (event) => {
            if (event) event.preventDefault();
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html'; // Redirect to login page
        };

        if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleAdminLogout);
        if (sidebarAdminLogoutBtn) sidebarAdminLogoutBtn.addEventListener('click', handleAdminLogout);

    } // End of isAdminDashboard check

    // --- NEWLY ADDED: Call renderProducts() when products page is loaded ---
    if (document.getElementById('chick-types') || document.getElementById('feeds') || document.getElementById('vaccines')) {
        renderProducts();
        setupProductModalListeners();
    }
}); // End of DOMContentLoaded listener