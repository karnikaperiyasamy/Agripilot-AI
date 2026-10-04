import { Router } from 'express';
import { FinanceController } from '../controllers/financeController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

// Expenses (Preserves legacy /farmer/expenses & /summary)
router.get('/expenses', FinanceController.getExpenses);
router.get('/expenses/summary', FinanceController.getExpenseSummary);
router.post('/expenses', requireRole(['FARMER']), FinanceController.addExpense);
router.put('/expenses/:id', requireRole(['FARMER']), FinanceController.updateExpense);
router.delete('/expenses/:id', requireRole(['FARMER']), FinanceController.deleteExpense);

// Profit & Financial Intelligence (Preserves legacy /farmer/profit/calculate)
router.get('/profit/calculate', FinanceController.calculateProfit);
router.get('/profit/history', FinanceController.calculateProfit);
router.get('/loan-readiness', FinanceController.getLoanReadinessReport);

export default router;
