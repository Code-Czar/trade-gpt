"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const positionManager_1 = require("./positionManager");
const app = (0, express_1.default)();
const port = 3003;
const positionManager = new positionManager_1.PositionManager();
app.use(body_parser_1.default.json());
app.post('/position', (req, res) => {
    const positionProps = req.body;
    try {
        const position = positionManager.createPosition(positionProps);
        res.status(201).send({ message: 'Position created', position });
    }
    catch (error) {
        res.status(400).send({ message: `Failed to create position: ${error}` });
    }
});
app.patch('/position/:symbol', (req, res) => {
    const { symbol } = req.params;
    const { price } = req.body;
    try {
        const position = positionManager.closePosition(symbol, price);
        res.status(200).send({ message: 'Position closed', position });
    }
    catch (error) {
        res.status(400).send({ message: `Failed to close position: ${error}` });
    }
});
app.get('/position', (req, res) => {
    const positions = positionManager.getPositions();
    res.status(200).send(positions);
});
app.get('/position/open', (req, res) => {
    const openPositions = positionManager.getOpenPositions();
    res.status(200).send(openPositions);
});
app.get('/position/closed', (req, res) => {
    const closedPositions = positionManager.getClosedPositions();
    res.status(200).send(closedPositions);
});
app.listen(port, () => {
    console.log(`Position manager server is running at http://localhost:${port}`);
});
