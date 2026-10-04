import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { MLClientService } from '../services/mlClientService';

export class FinanceController {
  // 1. Get Expenses (with optional filters)
  static async getExpenses(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const { category, cropCycleId, startDate, endDate } = req.query;

      const whereClause: any = { farmerId };
      if (category) whereClause.category = String(category);
      if (cropCycleId) whereClause.cropCycleId = String(cropCycleId);
      if (startDate && endDate) {
        whereClause.expenseDate = {
          gte: new Date(String(startDate)),
          lte: new Date(String(endDate))
        };
      }

      const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: {
          cropCycle: {
            include: { crop: true }
          }
        },
        orderBy: { expenseDate: 'desc' }
      });

      // Backward compatible format
      const formatted = expenses.map(e => ({
        id: e.id,
        expenseType: e.category,
        category: e.category,
        amount: e.amount,
        description: e.description,
        expenseDate: e.expenseDate.toISOString().split('T')[0],
        cropId: e.cropCycleId,
        cropName: e.cropCycle?.crop.name || 'General Farm Cost'
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Summary by Category
  static async getExpenseSummary(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const expenses = await prisma.expense.findMany({ where: { farmerId } });

      const byCategory: Record<string, number> = {};
      let total = 0;

      for (const e of expenses) {
        byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        total += e.amount;
      }

      return res.json({
        byCategory,
        total,
        average: expenses.length > 0 ? total / expenses.length : 0,
        count: expenses.length
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Add Expense
  static async addExpense(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const { expenseType, category, amount, description, expenseDate, cropId, cropCycleId } = req.body;

      if (!amount) {
        return res.status(400).json({ success: false, message: 'Amount is required' });
      }

      const expense = await prisma.expense.create({
        data: {
          farmerId,
          cropCycleId: cropCycleId || cropId || null,
          category: category || expenseType || 'Other',
          amount: parseFloat(amount),
          description: description || null,
          expenseDate: expenseDate ? new Date(expenseDate) : new Date()
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Expense recorded successfully',
        data: expense
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Update Expense
  static async updateExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { expenseType, category, amount, description, expenseDate, cropId } = req.body;

      const updated = await prisma.expense.update({
        where: { id },
        data: {
          category: category || expenseType || undefined,
          amount: amount ? parseFloat(amount) : undefined,
          description: description !== undefined ? description : undefined,
          expenseDate: expenseDate ? new Date(expenseDate) : undefined,
          cropCycleId: cropId !== undefined ? cropId : undefined
        }
      });

      return res.json({ success: true, message: 'Expense updated successfully', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 5. Delete Expense
  static async deleteExpense(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.expense.delete({ where: { id } });
      return res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 6. Calculate Profit (Preserves and elevates /farmer/profit/calculate)
  static async calculateProfit(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;

      const cropCycles = await prisma.cropCycle.findMany({
        where: { field: { farm: { farmerId } } },
        include: {
          crop: true,
          expenses: true,
          revenues: true
        }
      });

      const allExpenses = await prisma.expense.findMany({ where: { farmerId } });

      let totalRevenue = 0;
      let totalCropExpenses = 0;

      const cropProfits = cropCycles.map(c => {
        const cropExpense = c.expenses.reduce((s, e) => s + e.amount, 0);
        const recordedRevenue = c.revenues.reduce((s, r) => s + r.totalAmount, 0);
        const projectedRevenue = c.targetYieldQuintals * c.expectedMarketPrice;
        const revenue = recordedRevenue > 0 ? recordedRevenue : projectedRevenue;

        const netProfit = revenue - cropExpense;
        const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        totalRevenue += revenue;
        totalCropExpenses += cropExpense;

        return {
          cropId: c.id,
          cropName: c.crop.name,
          variety: c.variety,
          totalRevenue: revenue,
          totalExpense: cropExpense,
          netProfit,
          profitMargin: parseFloat(profitMargin.toFixed(1)),
          recommendation: netProfit < 0
            ? 'Operating at a deficit. Recommend soil-test fertigation and direct-to-merchant marketing.'
            : profitMargin < 20
              ? 'Moderate margin. Consider cold-storage staging to avoid peak mandi price drops.'
              : 'Healthy profitability. Maintain current input ratios.'
        };
      });

      const generalExpenses = allExpenses
        .filter(e => !e.cropCycleId)
        .reduce((s, e) => s + e.amount, 0);

      const grandTotalExpenses = totalCropExpenses + generalExpenses;
      const grandTotalProfit = totalRevenue - grandTotalExpenses;
      const grandProfitMargin = totalRevenue > 0 ? (grandTotalProfit / totalRevenue) * 100 : 0;

      return res.json({
        cropProfits,
        totalRevenue,
        totalCropExpenses,
        generalExpenses,
        totalExpenses: grandTotalExpenses,
        totalProfit: grandTotalProfit,
        totalProfitMargin: parseFloat(grandProfitMargin.toFixed(1))
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 7. Loan Readiness Report
  static async getLoanReadinessReport(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const farmer = await prisma.user.findUnique({
        where: { id: farmerId },
        include: { farmerProfile: true }
      });

      const expenses = await prisma.expense.aggregate({
        where: { farmerId },
        _sum: { amount: true },
        _count: true
      });

      const cropCycles = await prisma.cropCycle.findMany({
        where: { field: { farm: { farmerId } } },
        include: { crop: true, expenses: true, revenues: true }
      });

      let totalProjectedRev = 0;
      for (const c of cropCycles) {
        totalProjectedRev += (c.targetYieldQuintals * c.expectedMarketPrice);
      }

      const totalExp = expenses._sum.amount || 0;
      const netEst = Math.max(0, totalProjectedRev - totalExp);
      const margin = totalProjectedRev > 0 ? (netEst / totalProjectedRev) * 100 : 0;

      // Transparent credit-readiness indicators (not a black-box fake score)
      const recordConsistency = expenses._count > 5 ? 'High (Regular digital bookkeeping)' : 'Moderate';
      const debtServiceCapacity = netEst > 100000 ? 'Strong (Estimated net cash flow > Rs. 1 Lakh)' : 'Adequate';
      const kccEligibility = 'Eligible for Kisan Credit Card (KCC) interest subvention @ 4% p.a.';

      return res.json({
        success: true,
        data: {
          farmerName: farmer?.name,
          farmSizeAcres: farmer?.farmerProfile?.totalAreaAcres || 5.0,
          state: farmer?.farmerProfile?.state || 'Punjab',
          totalAnnualEstimatedRevenue: totalProjectedRev,
          totalRecordedExpenses: totalExp,
          projectedNetIncome: netEst,
          operatingMarginPercent: parseFloat(margin.toFixed(1)),
          indicators: {
            recordConsistency,
            debtServiceCapacity,
            institutionalSchemeLinkage: kccEligibility,
            collateralFreeCeiling: 'Rs. 1.6 Lakhs (RBI Mandate for collateral-free agri loans)'
          },
          disclaimer: 'This institutional readiness summary is computed from farmer-logged operational records for presentation to licensed banking institutions (NABARD/SBI/Commercial Banks). Final approval rests solely with credit underwriters.'
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
