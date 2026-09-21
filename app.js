import express from 'express';
import cors from 'cors';

import { rateLimiter } from "./controllers/rate-limiter.js";
import HelloController
    from "./controllers/hello-controller.js";
import UserController
    from "./controllers/users/users-controller.js";
import TuitsController
    from "./controllers/tuits/tuits-controller.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimiter({ windowMs: 60_000, maxRequests: 100 }));
HelloController(app);
UserController(app);
TuitsController(app);
app.listen(process.env.PORT || 4000);
