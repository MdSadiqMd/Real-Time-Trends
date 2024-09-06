import express, { Request, Response } from 'express';

import { logger, serverConfig } from './config';

const app = express();
app.use(express.static("public"));

const stocks: { [key: string]: number; } = {
    AAPL: 150.00,
    MSFT: 300.00,
    GOOGL: 2750.00,
};

const updateStockPrices = (): void => {
    Object.keys(stocks).forEach((stock: string) => {
        const change = (Math.random() * 2 - 1).toFixed(2);
        stocks[stock] = parseFloat((stocks[stock] + parseFloat(change)).toFixed(2));
    });
};

app.get("/stocks", (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const intervalId = setInterval(() => {
        updateStockPrices();
        const data = JSON.stringify(stocks);
        res.write(`data: ${data}\n\n`);
    }, 1000);

    req.on('close', () => {
        clearInterval(intervalId);
        res.end();
    });
});

app.listen(serverConfig.PORT, () => {
    logger.info(`Server is running on PORT: ${serverConfig.PORT}`);
});