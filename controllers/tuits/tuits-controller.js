import posts from "./tuits.js";
let tuits = posts;

const MAX_TUITS = 10000;

const createTuit = (req, res) => {
    if (tuits.length >= MAX_TUITS) {
        return res.status(507).json({ error: 'Record limit reached. Cannot create new tuit.' });
    }
    const ownerId = req.headers['x-user-id'];
    if (!ownerId) {
        return res.status(401).json({ error: 'Missing x-user-id header.' });
    }
    const newTuit = req.body;
    newTuit._id = new Date().getTime();
    newTuit.likes = 0;
    newTuit.liked = false;
    newTuit.dislikes = 0;
    newTuit.ownerId = ownerId;
    tuits.push(newTuit);
    res.json(newTuit);
}

const findTuits = (req, res) => {
    const ownerId = req.query.ownerId;
    if (ownerId) {
        return res.json(tuits.filter(t => t.ownerId === ownerId));
    }
    res.json(tuits);
}

const updateTuit = (req, res) => {
    const callerId = req.headers['x-user-id'];
    if (!callerId) {
        return res.status(401).json({ error: 'Missing x-user-id header.' });
    }
    const tuitdIdToUpdate = parseInt(req.params.tid);
    const tuitIndex = tuits.findIndex(
        (t) => t._id === tuitdIdToUpdate);
    if (tuitIndex === -1) {
        return res.status(404).json({ error: 'Tuit not found.' });
    }
    if (tuits[tuitIndex].ownerId !== callerId) {
        return res.status(403).json({ error: 'You can only update your own tuits.' });
    }
    const updates = req.body;
    // Prevent overwriting the immutable owner field
    delete updates.ownerId;
    delete updates._id;
    tuits[tuitIndex] =
        {...tuits[tuitIndex], ...updates};
    res.sendStatus(200);
}

const deleteTuit = (req, res) => {
    const callerId = req.headers['x-user-id'];
    if (!callerId) {
        return res.status(401).json({ error: 'Missing x-user-id header.' });
    }
    const tuitdIdToDelete = parseInt(req.params.tid);
    const tuit = tuits.find(t => t._id === tuitdIdToDelete);
    if (!tuit) {
        return res.status(404).json({ error: 'Tuit not found.' });
    }
    if (tuit.ownerId !== callerId) {
        return res.status(403).json({ error: 'You can only delete your own tuits.' });
    }
    tuits = tuits.filter(t => t._id !== tuitdIdToDelete);
    res.sendStatus(200);
}

export default (app) => {
    app.post('/api/tuits', createTuit);
    app.get('/api/tuits', findTuits);
    app.put('/api/tuits/:tid', updateTuit);
    app.delete('/api/tuits/:tid', deleteTuit);
}
