// test/integration/user.api.test.js
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

// Attempt to require the app. If app.js calls listen(), this might be problematic.
// Fallback: const serverUrl = 'http://localhost:3001'; and use chai.request(serverUrl)
let app;
try {
    app = require('../../../app'); // Assumes app.js exports the express app
} catch (e) {
    console.warn("Could not require app directly, ensure server is running independently for integration tests at http://localhost:3001");
    app = 'http://localhost:3001'; // Fallback: Target a running server
}

chai.use(chaiHttp);

describe('User CRUD API - Integration Tests', () => {
    let authToken = '';
    let testUserId = null; 
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const uniqueUsername = `testuser_${Date.now()}`;

    const testUserCredentials = {
        correo: uniqueEmail,
        clave: 'password123',
        usuario: uniqueUsername,
        nombres: 'Test',
        apellidos: 'User',
        tipo_usuario: 1 
    };
    const updatedUserData = {
        nombres: 'Test User Updated',
        telefono: '1234567890'
    };

    before(async function() { // Use function() for this.timeout() if needed
        this.timeout(10000); // Increase timeout for before hook if registration/login is slow
        try {
            const res = await chai.request(app)
                                .post('/auth/registro')
                                .send(testUserCredentials);
            expect(res).to.have.status(201);
            expect(res.body.body).to.have.property('id_usuarios');
            testUserId = res.body.body.id_usuarios;

            const loginRes = await chai.request(app)
                                     .post('/auth/login')
                                     .send({ correo: testUserCredentials.correo, clave: testUserCredentials.clave });
            expect(loginRes).to.have.status(200);
            expect(loginRes.body.body).to.have.property('token');
            authToken = loginRes.body.body.token;
        } catch (err) {
            console.error("Critical error in 'before' hook, tests cannot proceed:", err);
            // If 'app' is a string (server URL), this might indicate the server isn't running.
            if (typeof app === 'string') {
                 console.error(`Ensure the server is running at ${app} before executing integration tests.`);
            }
            throw err; 
        }
    });
    
    after(async function() {
        this.timeout(5000);
        if (authToken && testUserId) {
            try {
                await chai.request(app)
                    .delete(`/api/users/${testUserId}`)
                    .set('access-token', authToken);
            } catch (err) {
                console.warn(`Warning: Could not clean up test user ID ${testUserId}. Error: ${err.message}`);
            }
        }
    });

    describe('GET /api/users', () => {
        it('should return a list of users with valid token', async () => {
            const res = await chai.request(app)
                .get('/api/users')
                .set('access-token', authToken);
            expect(res).to.have.status(200);
            expect(res.body.error).to.be.false;
            expect(res.body.body).to.be.an('array');
            const foundUser = res.body.body.find(user => user.id_usuarios === testUserId);
            expect(foundUser).to.not.be.undefined;
            if (foundUser) { // Add this check to prevent error if undefined
                expect(foundUser.correo).to.equal(testUserCredentials.correo);
            }
        });

        it('should return 401 if no token is provided', async () => {
            const res = await chai.request(app).get('/api/users');
            expect(res).to.have.status(401);
            expect(res.body).to.have.property('mensaje', 'Token no proveída.');
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a specific user with valid token', async () => {
            const res = await chai.request(app)
                .get(`/api/users/${testUserId}`)
                .set('access-token', authToken);
            expect(res).to.have.status(200);
            expect(res.body.error).to.be.false;
            expect(res.body.body).to.be.an('object');
            expect(res.body.body).to.have.property('id_usuarios', testUserId);
            expect(res.body.body).to.have.property('correo', testUserCredentials.correo);
        });

        it('should return 404 for a non-existent user ID', async () => {
            const nonExistentId = 999999;
            const res = await chai.request(app)
                .get(`/api/users/${nonExistentId}`)
                .set('access-token', authToken);
            expect(res).to.have.status(404);
        });
    });

    describe('PUT /api/users/:id', () => {
        it('should update a user with valid token and data', async () => {
            const res = await chai.request(app)
                .put(`/api/users/${testUserId}`)
                .set('access-token', authToken)
                .send(updatedUserData);
            expect(res).to.have.status(200);
            expect(res.body.error).to.be.false;
            expect(res.body.body).to.be.an('object');
            expect(res.body.body).to.have.property('nombres', updatedUserData.nombres);
            expect(res.body.body).to.have.property('telefono', updatedUserData.telefono);

            const verifyRes = await chai.request(app)
                .get(`/api/users/${testUserId}`)
                .set('access-token', authToken);
            expect(verifyRes.body.body).to.have.property('nombres', updatedUserData.nombres);
        });

        it('should return 400 for invalid update data (e.g., invalid email format)', async () => {
            const res = await chai.request(app)
                .put(`/api/users/${testUserId}`)
                .set('access-token', authToken)
                .send({ correo: "notanemailformat" });
            expect(res).to.have.status(400); // Assuming model validation for email
            expect(res.body.error).to.be.true;
            expect(res.body.body).to.contain("Error de validación");
        });
    });

    describe('DELETE /api/users/:id', () => {
        let tempUserIdToDelete = null;
        let tempUserEmail = `delete_me_${Date.now()}@example.com`;
        let tempUserUsername = `delete_me_${Date.now()}`;

        before(async function() { // Use function for this.timeout
            this.timeout(5000);
            const tempUser = { ...testUserCredentials, correo: tempUserEmail, usuario: tempUserUsername };
            const res = await chai.request(app).post('/auth/registro').send(tempUser);
            expect(res).to.have.status(201);
            tempUserIdToDelete = res.body.body.id_usuarios;
        });

        it('should soft delete a user with valid token', async () => {
            const res = await chai.request(app)
                .delete(`/api/users/${tempUserIdToDelete}`)
                .set('access-token', authToken);
            expect(res).to.have.status(200);
            expect(res.body.error).to.be.false;
            expect(res.body.body).to.have.property('message', 'Usuario eliminado correctamente.');

            const verifyRes = await chai.request(app)
                .get(`/api/users/${tempUserIdToDelete}`)
                .set('access-token', authToken);
            expect(verifyRes).to.have.status(404); 
        });

        it('should return 404 when trying to delete a non-existent user', async () => {
            const nonExistentId = 999998; // Ensure this ID is different from any used/created
            const res = await chai.request(app)
                .delete(`/api/users/${nonExistentId}`)
                .set('access-token', authToken);
            expect(res).to.have.status(404);
        });
    });
});
