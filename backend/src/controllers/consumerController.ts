import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class ConsumerController {
  // 1. Browse farm-fresh direct produce
  static async getFreshProduce(req: AuthRequest, res: Response) {
    try {
      const listings = await prisma.marketListing.findMany({
        where: { status: 'ACTIVE' },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              role: true,
              farmerProfile: {
                select: { state: true, district: true, primarySoilType: true, irrigationMethod: true }
              },
              merchantProfile: {
                select: { businessName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Present safe provenance with accurate seller role
      const formatted = listings.map(l => ({
        id: l.id,
        cropName: l.cropName,
        variety: l.variety,
        availableQuantity: l.availableQuantity,
        unit: l.unit,
        pricePerUnit: l.askingPricePerUnit,
        qualityGrade: l.qualityGrade,
        harvestDate: l.harvestDate,
        sellerId: l.farmerId,
        sellerName: l.farmer.merchantProfile?.businessName || l.farmer.name,
        sellerRole: l.farmer.role,
        sellerType: l.farmer.role === 'MERCHANT' ? 'MERCHANT' : 'FARMER',
        origin: {
          region: `${l.farmer.farmerProfile?.district || 'Ludhiana'}, ${l.farmer.farmerProfile?.state || 'Punjab'}`,
          cultivationMethod: `${l.farmer.farmerProfile?.irrigationMethod || 'Drip'} Irrigated`,
          soilBase: l.farmer.farmerProfile?.primarySoilType || 'Alluvial'
        }
      }));

      return res.json({ success: true, count: formatted.length, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Direct Consumer Order
  static async placeDirectOrder(req: AuthRequest, res: Response) {
    try {
      const consumerId = req.user!.id;
      const { listingId, quantity, deliveryAddress, sellerRole, selectedTransporter } = req.body;

      const listing = await prisma.marketListing.findUnique({
        where: { id: listingId },
        include: { farmer: true }
      });
      if (!listing) return res.status(404).json({ success: false, message: 'Produce listing not found' });

      const qty = parseFloat(quantity);
      if (qty > listing.availableQuantity) {
        return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
      }

      const totalAmount = qty * listing.askingPricePerUnit;

      // Determine target seller ID based on selection or listing seller
      let targetSellerId = listing.farmerId;
      if (sellerRole === 'MERCHANT' && listing.farmer.role !== 'MERCHANT') {
        const merchantUser = await prisma.user.findFirst({
          where: { role: 'MERCHANT' }
        });
        if (merchantUser) {
          targetSellerId = merchantUser.id;
        }
      } else if (sellerRole === 'FARMER' && listing.farmer.role === 'MERCHANT') {
        const farmerUser = await prisma.user.findFirst({
          where: { role: 'FARMER' }
        });
        if (farmerUser) {
          targetSellerId = farmerUser.id;
        }
      }

      const order = await prisma.order.create({
        data: {
          listingId,
          buyerId: consumerId,
          sellerId: targetSellerId,
          cropName: listing.cropName,
          finalPrice: listing.askingPricePerUnit,
          quantity: qty,
          totalAmount,
          status: 'ACCEPTED',
          paymentStatus: 'PENDING',
          deliveryAddress: deliveryAddress || 'Urban Home Delivery'
        }
      });

      // Logistics & Transporter Selection Details
      let driverName = 'Harbhajan Logistics (Local Fleet)';
      let driverPhone = '9822334455';
      let vehicleRegNumber = 'PB-10-CZ-4482';
      let freightRate = 45.0;

      if (selectedTransporter === 'PUNJAB_AGRO') {
        driverName = 'Punjab Agro Heavy Freight';
        driverPhone = '9877112233';
        vehicleRegNumber = 'PB-11-AG-8890';
        freightRate = 35.0;
      } else if (selectedTransporter === 'BLUEDART') {
        driverName = 'BlueDart Agro Cold-Chain Express';
        driverPhone = '9811009988';
        vehicleRegNumber = 'DL-01-CC-9911';
        freightRate = 60.0;
      }

      const estimatedTransportCost = Math.max(300, Math.round(qty * freightRate));

      // Create transport logistics link automatically
      await prisma.transportRequest.create({
        data: {
          orderId: order.id,
          pickupAddress: listing.locationName || 'Farmer Farm Gate',
          dropoffAddress: deliveryAddress || 'Urban Home Delivery',
          cargoWeightTons: Math.max(0.1, (qty * 100) / 1000),
          pickupDate: new Date(),
          estimatedCost: estimatedTransportCost,
          status: 'IN_TRANSIT',
          driverName,
          driverPhone,
          vehicleRegNumber,
          deliveryUpdates: {
            create: {
              statusText: `Assigned to ${driverName}. Dispatch & packaging initialized.`,
              locationName: listing.locationName || 'Regional Distribution Center'
            }
          }
        }
      });

      // Deduct stock or update listing
      if (qty >= listing.availableQuantity) {
        await prisma.marketListing.update({ where: { id: listingId }, data: { status: 'SOLD' } });
      } else {
        await prisma.marketListing.update({
          where: { id: listingId },
          data: { availableQuantity: listing.availableQuantity - qty }
        });
      }

      // Notify the target seller about this purchase
      await prisma.notification.create({
        data: {
          userId: targetSellerId,
          title: sellerRole === 'MERCHANT' ? 'New Wholesale Order Received!' : 'Direct Consumer Purchase!',
          message: `New order placed for ${qty} ${listing.unit} of ${listing.cropName}. Total: Rs. ${totalAmount.toLocaleString()}`,
          category: 'COMMERCE'
        }
      });

      return res.status(201).json({
        success: true,
        message: sellerRole === 'MERCHANT'
          ? `Order placed successfully with Wholesale Merchant! Logistics assigned: ${driverName}.`
          : `Order placed successfully direct with Farmer! Logistics assigned: ${driverName}.`,
        data: order
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Get consumer's orders
  static async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const consumerId = req.user!.id;
      const orders = await prisma.order.findMany({
        where: { buyerId: consumerId },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              phone: true,
              role: true,
              merchantProfile: { select: { businessName: true } }
            }
          },
          transportRequest: {
            include: { deliveryUpdates: { orderBy: { timestamp: 'desc' } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: orders.length, data: orders });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
