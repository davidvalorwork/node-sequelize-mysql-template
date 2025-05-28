// script.js
document.addEventListener('DOMContentLoaded', () => {
    // CONFIGURATION - User must set this URL
    const API_BASE_URL = 'http://localhost:3001'; // Example: 'http://localhost:3001' or 'https://your-backend.com'
                                                // IMPORTANT: This needs to match the running backend.

    // --- DOM Elements ---
    const messageArea = document.getElementById('messageArea');
    const authSection = document.getElementById('authSection');
    const userDataSection = document.getElementById('userDataSection');
    
    const loginForm = document.getElementById('loginForm');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    
    const registrationForm = document.getElementById('registrationForm');
    
    const loggedInUserEmailSpan = document.getElementById('loggedInUserEmail');
    const logoutButton = document.getElementById('logoutButton');
    
    const refreshUsersButton = document.getElementById('refreshUsersButton');
    const userListBody = document.getElementById('userListBody');
    
    const updateUserFormArea = document.getElementById('updateUserFormArea');
    const updateUserForm = document.getElementById('updateUserForm');
    const cancelUpdateButton = document.getElementById('cancelUpdateButton');

    let authToken = localStorage.getItem('authToken');

    // --- Utility Functions ---
    function showMessage(message, isError = false) {
        messageArea.textContent = message;
        messageArea.className = isError ? 'error' : 'success';
        setTimeout(() => { messageArea.textContent = ''; messageArea.className = ''; }, 5000);
    }

    function updateUIVisibility() {
        if (authToken) {
            authSection.style.display = 'none';
            userDataSection.style.display = 'block';
            fetchUsers(); // Load users when logged in
        } else {
            authSection.style.display = 'block';
            userDataSection.style.display = 'none';
            updateUserFormArea.style.display = 'none';
        }
    }

    // --- API Call Function ---
    async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = true) {
        const headers = { 'Content-Type': 'application/json' };
        if (requiresAuth && authToken) {
            headers['access-token'] = authToken;
        }

        const config = {
            method: method,
            headers: headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const responseData = await response.json();

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status}`;
                if (responseData && responseData.body) { // Using new message controller structure
                    errorMessage = typeof responseData.body === 'string' ? responseData.body : (responseData.body.message || JSON.stringify(responseData.body));
                    if (responseData.body.errors) {
                         errorMessage += ": " + responseData.body.errors.join(", ");
                    }
                } else if (responseData && responseData.message) {
                    errorMessage = responseData.message;
                } else if (responseData && responseData.mensaje) { // For token errors
                    errorMessage = responseData.mensaje;
                }
                throw new Error(errorMessage);
            }
            return responseData.body; // Assuming backend sends { error:false, status:200, body: ... }
        } catch (error) {
            console.error('API Request Error:', error);
            showMessage(error.message || 'Network error or backend unavailable.', true);
            if (error.message.includes('Token inválida') || error.message.includes('Token no proveída')) {
                logout(); // Force logout on token errors
            }
            throw error; // Re-throw to be caught by calling function if needed
        }
    }

    // --- Authentication Functions ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const data = await apiRequest('/auth/login', 'POST', {
                correo: loginEmailInput.value,
                clave: loginPasswordInput.value
            }, false);
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            loggedInUserEmailSpan.textContent = loginEmailInput.value; // Or fetch user details
            updateUIVisibility();
            showMessage('Login successful!', false);
            loginForm.reset();
        } catch (error) {
            // showMessage is called by apiRequest
        }
    });

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        const userData = {};
        formData.forEach((value, key) => {
            const input = registrationForm.elements[key];
            if (input.type === 'number') userData[key] = Number(value);
            else if (value) userData[key] = value; // Only include if value is not empty
        });
        // Map frontend ID to backend expected ID (regTipoUsuario -> tipo_usuario)
        if (userData.regTipoUsuario !== undefined) {
            userData.tipo_usuario = userData.regTipoUsuario;
            delete userData.regTipoUsuario;
        }
         // Map other fields
        if (userData.regUsuario !== undefined) {
            userData.usuario = userData.regUsuario;
            delete userData.regUsuario;
        }
        if (userData.regEmail !== undefined) {
            userData.correo = userData.regEmail;
            delete userData.regEmail;
        }
        if (userData.regPassword !== undefined) {
            userData.clave = userData.regPassword;
            delete userData.regPassword;
        }
        if (userData.regNombres !== undefined) {
            userData.nombres = userData.regNombres;
            delete userData.regNombres;
        }
        if (userData.regApellidos !== undefined) {
            userData.apellidos = userData.regApellidos;
            delete userData.regApellidos;
        }
        if (userData.regRut !== undefined) userData.rut = userData.regRut; delete userData.regRut;
        if (userData.regTelefono !== undefined) userData.telefono = userData.regTelefono; delete userData.regTelefono;
        if (userData.regRazonSocial !== undefined) userData.razon_social = userData.regRazonSocial; delete userData.regRazonSocial;
        if (userData.regGiro !== undefined) userData.giro = userData.regGiro; delete userData.regGiro;
        if (userData.regNombreFantasia !== undefined) userData.nombre_fantasia = userData.regNombreFantasia; delete userData.regNombreFantasia;


        try {
            await apiRequest('/auth/registro', 'POST', userData, false);
            showMessage('Registration successful! Please login.', false);
            registrationForm.reset();
        } catch (error) {
            // showMessage is called by apiRequest
        }
    });

    logoutButton.addEventListener('click', () => {
        logout();
    });
    
    function logout() {
        authToken = null;
        localStorage.removeItem('authToken');
        loggedInUserEmailSpan.textContent = 'User';
        updateUIVisibility();
        userListBody.innerHTML = ''; // Clear user list
        showMessage('Logged out.', false);
    }

    // --- User CRUD Functions ---
    async function fetchUsers() {
        if (!authToken) return;
        try {
            const users = await apiRequest('/api/users', 'GET');
            userListBody.innerHTML = ''; // Clear existing list
            if (users && users.length > 0) {
                users.forEach(user => {
                    const row = userListBody.insertRow();
                    row.insertCell().textContent = user.id_usuarios;
                    row.insertCell().textContent = user.usuario;
                    row.insertCell().textContent = user.correo;
                    row.insertCell().textContent = user.nombres;
                    row.insertCell().textContent = user.apellidos;
                    row.insertCell().textContent = user.tiposUsuarioIdTiposUsuarios; // Display the ID
                    
                    const actionsCell = row.insertCell();
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.classList.add('edit-btn');
                    editButton.dataset.userId = user.id_usuarios;
                    actionsCell.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete-btn');
                    deleteButton.dataset.userId = user.id_usuarios;
                    actionsCell.appendChild(deleteButton);
                });
            } else {
                userListBody.innerHTML = '<tr><td colspan="7">No users found.</td></tr>';
            }
        } catch (error) {
             userListBody.innerHTML = '<tr><td colspan="7" class="error">Failed to load users.</td></tr>';
        }
    }

    refreshUsersButton.addEventListener('click', fetchUsers);

    userListBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const userId = e.target.dataset.userId;
            populateUpdateForm(userId);
        }
        if (e.target.classList.contains('delete-btn')) {
            const userId = e.target.dataset.userId;
            if (confirm(`Are you sure you want to delete user ID ${userId}?`)) {
                try {
                    await apiRequest(`/api/users/${userId}`, 'DELETE');
                    showMessage('User deleted successfully.', false);
                    fetchUsers(); // Refresh list
                } catch (error) {
                    // showMessage is called by apiRequest
                }
            }
        }
    });

    async function populateUpdateForm(userId) {
        try {
            const user = await apiRequest(`/api/users/${userId}`, 'GET');
            updateUserForm.updateUserId.value = user.id_usuarios;
            updateUserForm.updateUsuario.value = user.usuario || '';
            updateUserForm.updateEmail.value = user.correo || '';
            updateUserForm.updateNombres.value = user.nombres || '';
            updateUserForm.updateApellidos.value = user.apellidos || '';
            updateUserForm.updateTipoUsuario.value = user.tiposUsuarioIdTiposUsuarios || '';
            updateUserForm.updateRut.value = user.rut || '';
            updateUserForm.updateTelefono.value = user.telefono || '';
            // Clear other optional fields if not present or handle them
            updateUserFormArea.style.display = 'block';
        } catch (error) {
            showMessage('Failed to fetch user details for update.', true);
        }
    }

    updateUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = updateUserForm.updateUserId.value;
        const formData = new FormData(updateUserForm);
        const userData = {};
        // Only include fields that have a value, to allow partial updates
        formData.forEach((value, key) => {
            if (key === 'updateUserId') return; // Don't send this in body
            const formKey = key.replace('update', ''); // maps updateNombres to Nombres
            const backendKey = formKey.charAt(0).toLowerCase() + formKey.slice(1); // Nombres to nombres
            if (value !== null && value.trim() !== '') { // Only include non-empty fields
                 if (updateUserForm.elements[key].type === 'number') {
                    userData[backendKey] = Number(value);
                 } else {
                    userData[backendKey] = value;
                 }
            }
        });
         // Ensure tipoUsuario is mapped correctly
        if (userData.tipoUsuario !== undefined) {
            userData.tiposUsuarioIdTiposUsuarios = userData.tipoUsuario;
            delete userData.tipoUsuario;
        }


        if (Object.keys(userData).length === 0) {
            showMessage('No changes to update.', true);
            return;
        }

        try {
            await apiRequest(`/api/users/${userId}`, 'PUT', userData);
            showMessage('User updated successfully!', false);
            fetchUsers(); // Refresh list
            updateUserFormArea.style.display = 'none';
            updateUserForm.reset();
        } catch (error) {
            // showMessage is called by apiRequest
        }
    });
    
    cancelUpdateButton.addEventListener('click', () => {
        updateUserFormArea.style.display = 'none';
        updateUserForm.reset();
    });

    // --- Initial Page Load ---
    updateUIVisibility();
});
