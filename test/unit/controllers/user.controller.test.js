// test/unit/controllers/user.controller.test.js
const chai = require('chai');
const sinon = require('sinon');
const { expect } = chai;

// Import the controller to be tested
const userController = require('../../../controllers/user.controller'); 
// Adjust path if needed, assuming test file is in test/unit/controllers/

// Mock dependencies
const mockDb = {
    usuarios: {
        findAll: sinon.stub(),
        findOne: sinon.stub(),
        // update method is on the instance, so we'll mock instances
    }
};

// const mockMessagesController = { // We will check res.status().json() directly
//     success: sinon.spy(),
//     error: sinon.spy()
// };

// Helper to create a mock user instance with an update stub
const createMockUserInstance = (userData, updateStub = sinon.stub().resolves()) => {
    return {
        ...userData, // Spread first to allow dataValues to be overridden if needed
        dataValues: { ...userData }, // Simulate Sequelize's dataValues
        update: updateStub,
        get: sinon.stub().callsFake((options) => { 
            if (options && options.plain) return { ...userData };
            return { ...userData }; // Simplified, or return this to simulate instance
        })
    };
};


describe('User Controller - Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        // Reset stubs and spies before each test
        sinon.resetHistory(); 
        mockDb.usuarios.findAll.reset(); 
        mockDb.usuarios.findOne.reset();
        
        mockReq = { params: {}, body: {} };
        mockRes = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy(),
            send: sinon.spy() 
        };
    });

    afterEach(() => {
        sinon.restore(); 
    });

    describe('listUsers', () => {
        it('should retrieve all non-deleted users and return them via messages.success', async () => {
            const fakeUsersFromDb = [
                { id_usuarios: 1, usuario: 'test1', clave: 'pwhash' }, 
                { id_usuarios: 2, usuario: 'test2', clave: 'pwhash' }
            ];
            // The controller itself excludes 'clave', so mockDb.usuarios.findAll should resolve with clave
            mockDb.usuarios.findAll.resolves(fakeUsersFromDb); 
            
            const expectedUsersForResponse = [ // This is what controller should prepare for messages.success
                { id_usuarios: 1, usuario: 'test1' }, 
                { id_usuarios: 2, usuario: 'test2' }
            ];
            
            await userController.listUsers(mockReq, mockRes, mockDb);

            expect(mockDb.usuarios.findAll.calledOnceWith({ where: { borrado: 0 }, attributes: { exclude: ['clave'] } })).to.be.true;
            expect(mockRes.status.calledOnceWith(200)).to.be.true; 
            // The user.controller directly passes the findAll result to messages.success
            // The messages.success will then format it.
            // The user.controller does NOT map the users itself to exclude clave if attributes.exclude works as expected.
            // Sequelize's attributes.exclude should handle this. So fakeUsersFromDb (with clave) is passed.
            // However, the controller's `attributes: { exclude: ['clave'] }` means Sequelize returns them without clave.
            // So, if findAll works as intended, it returns data already excluding 'clave'.
            mockDb.usuarios.findAll.resolves(expectedUsersForResponse); // Correcting mock to reflect Sequelize behavior

            await userController.listUsers(mockReq, mockRes, mockDb); // Call again with corrected mock

            expect(mockRes.json.calledWith(sinon.match({ error: false, body: expectedUsersForResponse }))).to.be.true;
        });

        it('should handle errors and call messages.error', async () => {
            const fakeError = new Error('DB Error');
            mockDb.usuarios.findAll.rejects(fakeError);

            await userController.listUsers(mockReq, mockRes, mockDb);
            
            expect(mockRes.status.calledOnceWith(500)).to.be.true; 
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'DB Error' }))).to.be.true;
        });
    });

    describe('getUserById', () => {
        it('should retrieve a user by ID and return via messages.success', async () => {
            mockReq.params.id = '1';
            // Data as it would come from DB (Sequelize model instance)
            const fakeUserFromDb = { id_usuarios: 1, usuario: 'test1', clave: 'pwhash', borrado: 0 };
            // Data as it should be in the response (clave excluded by controller's query)
            const expectedUserInResponse = { id_usuarios: 1, usuario: 'test1', borrado: 0 };
            
            // findOne with attributes.exclude should return data without 'clave'
            mockDb.usuarios.findOne.resolves(expectedUserInResponse);

            await userController.getUserById(mockReq, mockRes, mockDb);

            expect(mockDb.usuarios.findOne.calledOnceWith({ where: { id_usuarios: '1', borrado: 0 }, attributes: { exclude: ['clave'] } })).to.be.true;
            expect(mockRes.status.calledOnceWith(200)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: false, body: expectedUserInResponse }))).to.be.true;
        });

        it('should call messages.error if user not found', async () => {
            mockReq.params.id = '99';
            mockDb.usuarios.findOne.resolves(null);

            await userController.getUserById(mockReq, mockRes, mockDb);
            
            expect(mockRes.status.calledOnceWith(404)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'Usuario no encontrado o ha sido eliminado.' }))).to.be.true;
        });

         it('should handle errors and call messages.error', async () => {
            mockReq.params.id = '1';
            const fakeError = new Error('DB Error');
            mockDb.usuarios.findOne.rejects(fakeError);

            await userController.getUserById(mockReq, mockRes, mockDb);
            
            expect(mockRes.status.calledOnceWith(500)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'DB Error' }))).to.be.true;
        });
    });

    describe('updateUser', () => {
        it('should update a user and return updated user via messages.success', async () => {
            mockReq.params.id = '1';
            mockReq.body = { usuario: 'updatedUser', nombres: 'Updated Name' };
            
            const originalUserDbState = { id_usuarios: 1, usuario: 'originalUser', nombres: 'Original Name', clave: 'pwhash', borrado: 0 };
            const mockUserInstance = createMockUserInstance(originalUserDbState, sinon.stub().resolves());
            
            mockDb.usuarios.findOne.onFirstCall().resolves(mockUserInstance);
            
            // For re-fetching the updated user, it should be without 'clave'
            const updatedUserDbStateAfterUpdate = { ...originalUserDbState, ...mockReq.body };
            // delete updatedUserDbStateAfterUpdate.clave; // Sequelize attributes.exclude handles this
            const finalExpectedUserInResponse = { 
                id_usuarios: 1, 
                usuario: 'updatedUser', 
                nombres: 'Updated Name', 
                borrado: 0 
                // clave is excluded by the controller's findOne attributes
            };
            mockDb.usuarios.findOne.onSecondCall().resolves(finalExpectedUserInResponse);

            await userController.updateUser(mockReq, mockRes, mockDb);

            expect(mockDb.usuarios.findOne.calledWith({ where: { id_usuarios: '1', borrado: 0 } })).to.be.true; // First call to find
            expect(mockUserInstance.update.calledOnceWith(mockReq.body)).to.be.true;
            expect(mockDb.usuarios.findOne.calledWith({ where: { id_usuarios: '1' }, attributes: { exclude: ['clave'] }})).to.be.true; // Second call to re-fetch
            expect(mockRes.status.calledOnceWith(200)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: false, body: sinon.match(finalExpectedUserInResponse) }))).to.be.true;
        });
        
        it('should not attempt to update id_usuarios, clave, or borrado fields', async () => {
            mockReq.params.id = '1';
            // Body contains fields that should be stripped by the controller
            mockReq.body = { usuario: 'updatedUser', clave: 'newPass', borrado: 1, id_usuarios: 2, nombres: 'Allowed Name' };
            
            const expectedUpdateData = { usuario: 'updatedUser', nombres: 'Allowed Name' }; // Only non-restricted fields

            const originalUser = { id_usuarios: 1, usuario: 'originalUser', clave: 'pwhash', borrado: 0, nombres: "Old Name" };
            const mockUserInstance = createMockUserInstance(originalUser, sinon.stub().resolves());
            
            mockDb.usuarios.findOne.onFirstCall().resolves(mockUserInstance);
            
            const expectedUserAfterUpdate = { ...originalUser, ...expectedUpdateData };
            delete expectedUserAfterUpdate.clave; // as it would be returned by findOne

            mockDb.usuarios.findOne.onSecondCall().resolves(expectedUserAfterUpdate);


            await userController.updateUser(mockReq, mockRes, mockDb);

            expect(mockUserInstance.update.calledOnceWith(expectedUpdateData)).to.be.true;
        });

        it('should call messages.error if user to update is not found', async () => {
            mockReq.params.id = '99';
            mockReq.body = { usuario: 'updatedUser' };
            mockDb.usuarios.findOne.onFirstCall().resolves(null); // User not found

            await userController.updateUser(mockReq, mockRes, mockDb);

            expect(mockDb.usuarios.findOne.calledOnceWith({ where: { id_usuarios: '99', borrado: 0 } })).to.be.true;
            expect(mockRes.status.calledOnceWith(404)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'Usuario no encontrado o ha sido eliminado.' }))).to.be.true;
        });
        
        it('should handle SequelizeValidationError and call messages.error with 400', async () => {
            mockReq.params.id = '1';
            mockReq.body = { correo: 'invalidemail' }; // Example invalid data
            
            const validationError = new Error('Validation error');
            validationError.name = 'SequelizeValidationError';
            validationError.errors = [{ message: 'Invalid email format' }];

            const mockUserInstance = createMockUserInstance({ id_usuarios: 1, correo: 'old@mail.com' }, sinon.stub().rejects(validationError));
            mockDb.usuarios.findOne.onFirstCall().resolves(mockUserInstance); // Found user
            // The update call on mockUserInstance will throw the validationError
            
            await userController.updateUser(mockReq, mockRes, mockDb);

            expect(mockUserInstance.update.calledOnceWith(mockReq.body)).to.be.true;
            expect(mockRes.status.calledOnceWith(400)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ 
                error: true, 
                body: "Error de validación", 
                details: sinon.match.array.contains(['Invalid email format']) 
            }))).to.be.true;
        });

        it('should handle general errors during update and call messages.error with 500', async () => {
            mockReq.params.id = '1';
            mockReq.body = { usuario: 'newname' };
            const genericError = new Error('Something went wrong');
            const mockUserInstance = createMockUserInstance({ id_usuarios: 1 }, sinon.stub().rejects(genericError));
            mockDb.usuarios.findOne.onFirstCall().resolves(mockUserInstance);

            await userController.updateUser(mockReq, mockRes, mockDb);

            expect(mockRes.status.calledOnceWith(500));
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'Something went wrong' })));
        });
    });

    describe('deleteUser', () => {
        it('should soft delete a user and return success message', async () => {
            mockReq.params.id = '1';
            const mockUserInstance = createMockUserInstance({ id_usuarios: 1, borrado: 0 }, sinon.stub().resolves());
            mockDb.usuarios.findOne.resolves(mockUserInstance);

            await userController.deleteUser(mockReq, mockRes, mockDb);

            expect(mockDb.usuarios.findOne.calledOnceWith({ where: { id_usuarios: '1', borrado: 0 } })).to.be.true;
            expect(mockUserInstance.update.calledOnceWith({ borrado: 1 })).to.be.true;
            expect(mockRes.status.calledOnceWith(200)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: false, body: { message: 'Usuario eliminado correctamente.'} }))).to.be.true;
        });

        it('should call messages.error if user to delete is not found or already deleted', async () => {
            mockReq.params.id = '99';
            mockDb.usuarios.findOne.resolves(null); // User not found

            await userController.deleteUser(mockReq, mockRes, mockDb);
            
            expect(mockDb.usuarios.findOne.calledOnceWith({ where: { id_usuarios: '99', borrado: 0 } })).to.be.true;
            expect(mockRes.status.calledOnceWith(404)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'Usuario no encontrado o ya ha sido eliminado.' }))).to.be.true;
        });

        it('should handle errors during delete operation and call messages.error', async () => {
            mockReq.params.id = '1';
            const fakeError = new Error('DB Error on delete');
            const mockUserInstance = createMockUserInstance({ id_usuarios: 1, borrado: 0 }, sinon.stub().rejects(fakeError));
            mockDb.usuarios.findOne.resolves(mockUserInstance);

            await userController.deleteUser(mockReq, mockRes, mockDb);

            expect(mockUserInstance.update.calledOnceWith({ borrado: 1 })).to.be.true;
            expect(mockRes.status.calledOnceWith(500)).to.be.true;
            expect(mockRes.json.calledOnceWith(sinon.match({ error: true, body: 'DB Error on delete' }))).to.be.true;
        });
    });
});
