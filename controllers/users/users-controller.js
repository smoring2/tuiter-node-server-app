import people from './users.js';
let users = people;

const MAX_USERS = 10000;

const UserController = (app) => {
    app.get('/api/users', findUsers);
    app.get('/api/users/:uid', findUserById);
    app.post('/api/users', createUser);
    app.delete('/api/users/:uid', deleteUser);
    app.put('/api/users/:uid', updateUser);
}

const findUsers = (req, res) => {
    const type = req.query.type;
    if(type) {
        const usersOfType = users
            .filter(u => u.type === type)
        res.json(usersOfType);
        return;
    }
    const callerId = req.headers['x-user-id'];
    if (callerId) {
        const ownedUsers = users.filter(u => u.ownerId === callerId);
        return res.json(ownedUsers);
    }
    res.json(users);
}

const findUserById = (req, res) => {
    const userId = req.params.uid;
    const user = users.find(u => u._id === userId);
    res.json(user);
}

const createUser = (req, res) => {
    if (users.length >= MAX_USERS) {
        return res.status(507).json({ error: 'Record limit reached. Cannot create new user.' });
    }
    const newUser = req.body;
    newUser._id = (new Date()).getTime() + '';
    // The ownerId is the record's own _id for self-owned user records,
    // or derived from the caller identity header when present.
    const callerId = req.headers['x-user-id'];
    newUser.ownerId = callerId || newUser._id;
    users.push(newUser);
    res.json(newUser);
}

const deleteUser = (req, res) => {
    const callerId = req.headers['x-user-id'];
    if (!callerId) {
        return res.status(401).json({ error: 'Missing x-user-id header.' });
    }
    const userId = req.params['uid'];
    const user = users.find(usr => usr._id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    if (user.ownerId !== callerId) {
        return res.status(403).json({ error: 'You can only delete your own record.' });
    }
    users = users.filter(usr =>
        usr._id !== userId);
    res.sendStatus(200);
}

const updateUser = (req, res) => {
    const callerId = req.headers['x-user-id'];
    if (!callerId) {
        return res.status(401).json({ error: 'Missing x-user-id header.' });
    }
    const userId = req.params['uid'];
    const user = users.find(usr => usr._id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    if (user.ownerId !== callerId) {
        return res.status(403).json({ error: 'You can only update your own record.' });
    }
    const updates = req.body;
    // Prevent overwriting the immutable owner field
    delete updates.ownerId;
    delete updates._id;
    users = users.map(usr =>
        usr._id === userId ?
            {...usr, ...updates} :
            usr
    );
    res.sendStatus(200);
}


export default UserController;
