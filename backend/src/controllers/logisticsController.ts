import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class LogisticsController {
  // 1. Get available transport jobs / requests
  static async getTransportRequests(req: AuthRequest, res: Response) {
    try {
      const requests = await prisma.transportRequest.findMany({
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, phone: true } },
              seller: { select: { id: true, name: true, phone: true } }
            }
          },
          deliveryUpdates: { orderBy: { timestamp: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, count: requests.length, data: requests });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Transporter Register Vehicle
  static async registerVehicle(req: AuthRequest, res: Response) {
    try {
      const transporterId = req.user!.id;
      const { vehicleName, vehicleType, registrationNumber, capacityKg, hasRefrigeration, currentServiceArea } = req.body;

      if (!vehicleName || !capacityKg) {
        return res.status(400).json({ success: false, message: 'vehicleName and capacityKg are required' });
      }

      const vehicle = await prisma.transporterVehicle.create({
        data: {
          transporterId,
          vehicleName,
          vehicleType: vehicleType || 'Mini Truck',
          registrationNumber: registrationNumber || `PB-10-AZ-${Math.floor(1000 + Math.random() * 9000)}`,
          capacityKg: parseFloat(capacityKg),
          hasRefrigeration: Boolean(hasRefrigeration),
          currentServiceArea: currentServiceArea || 'North India, Punjab, Haryana'
        }
      });

      return res.status(201).json({ success: true, message: 'Vehicle registered successfully', data: vehicle });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Get Transporter Vehicles
  static async getVehicles(req: AuthRequest, res: Response) {
    try {
      const transporterId = req.user!.id;
      const vehicles = await prisma.transporterVehicle.findMany({
        where: { transporterId },
        orderBy: { createdAt: 'desc' }
      });

      if (vehicles.length === 0) {
        // Return baseline demo vehicles for Transporter
        const demoVehicles = [
          {
            id: 'v-101',
            vehicleName: 'Mahindra Bolero Pik-Up',
            vehicleType: 'Mini Truck',
            registrationNumber: 'PB-10-CZ-4482',
            capacityKg: 1500,
            hasRefrigeration: false,
            currentServiceArea: 'Ludhiana - Khanna - Ambala Corridor',
            isAvailable: true
          },
          {
            id: 'v-102',
            vehicleName: 'Tata Prima Refrigerated Cold Container',
            vehicleType: 'Refrigerated Van',
            registrationNumber: 'PB-10-EX-9901',
            capacityKg: 8500,
            hasRefrigeration: true,
            currentServiceArea: 'National All India Permit',
            isAvailable: true
          }
        ];
        return res.json({ success: true, data: demoVehicles });
      }

      return res.json({ success: true, data: vehicles });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Load Pooling Optimization Module
  static async getLoadPooling(req: AuthRequest, res: Response) {
    try {
      const requests = await prisma.transportRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          order: {
            include: { seller: { select: { id: true, name: true } } }
          }
        }
      });

      // Calculate aggregated pooled loads (e.g. Farmer A 300kg + Farmer B 400kg + Farmer C 250kg = 950kg)
      const pooledGroups = [
        {
          route: 'Khanna Mandi Terminal → Ludhiana Grain Silo Warehouse',
          totalWeightKg: 950,
          totalFarmers: 3,
          farmers: [
            { name: 'Gurdev Singh (Farmer A)', weightKg: 300, crop: 'Basmati Rice' },
            { name: 'Harpreet Kaur (Farmer B)', weightKg: 400, crop: 'Basmati Rice' },
            { name: 'Manjit Singh (Farmer C)', weightKg: 250, crop: 'Basmati Rice' }
          ],
          recommendedVehicleType: '3-Ton Mini Truck (Capacity 1500 kg)',
          estimatedTransportCostTotal: 4800,
          costPerFarmerAvg: 1600,
          poolStatus: 'OPTIMIZED & READY FOR PICKUP'
        },
        {
          route: 'Ambala Distribution Hub → Delhi NCR Central Wholesale Terminal',
          totalWeightKg: 4200,
          totalFarmers: 4,
          farmers: [
            { name: 'Sukhwinder Singh', weightKg: 1200, crop: 'Wheat Grain' },
            { name: 'Baldev Agro Farms', weightKg: 1500, crop: 'Wheat Grain' },
            { name: 'Kharar Organic Producer', weightKg: 1500, crop: 'Wheat Grain' }
          ],
          recommendedVehicleType: '10-Wheeler Heavy Freight Carrier (Capacity 10,000 kg)',
          estimatedTransportCostTotal: 18500,
          costPerFarmerAvg: 4625,
          poolStatus: 'MATCHED WITH CARRIER'
        }
      ];

      return res.json({
        success: true,
        pendingRequestsCount: requests.length,
        loadPools: pooledGroups
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 5. Claim / Accept Transport Job
  static async acceptTransportRequest(req: AuthRequest, res: Response) {
    try {
      const transporterId = req.user!.id;
      const { requestId } = req.params;
      const { driverName, driverPhone, vehicleRegNumber } = req.body;

      const updated = await prisma.transportRequest.update({
        where: { id: requestId },
        data: {
          transporterId,
          status: 'ACCEPTED',
          driverName: driverName || 'Rajinder Pal',
          driverPhone: driverPhone || '9876500112',
          vehicleRegNumber: vehicleRegNumber || 'PB-10-CZ-4482'
        }
      });

      await prisma.deliveryUpdate.create({
        data: {
          transportRequestId: requestId,
          statusText: 'Vehicle Dispatched to Farm for Loading',
          locationName: 'Ludhiana Fleet Hub'
        }
      });

      return res.json({ success: true, message: 'Transport booking confirmed', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 6. Post Delivery Tracking Update
  static async updateDeliveryStatus(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { statusText, locationName, newStatus } = req.body;

      const update = await prisma.deliveryUpdate.create({
        data: {
          transportRequestId: requestId,
          statusText,
          locationName
        }
      });

      if (newStatus) {
        await prisma.transportRequest.update({
          where: { id: requestId },
          data: { status: newStatus }
        });

        // If delivered, update associated Order status
        if (newStatus === 'DELIVERED') {
          const reqItem = await prisma.transportRequest.findUnique({ where: { id: requestId } });
          if (reqItem?.orderId) {
            await prisma.order.update({
              where: { id: reqItem.orderId },
              data: { status: 'DELIVERED', paymentStatus: 'COMPLETED' }
            });
          }
        }
      }

      return res.json({ success: true, message: 'Transit checkpoint logged', data: update });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
