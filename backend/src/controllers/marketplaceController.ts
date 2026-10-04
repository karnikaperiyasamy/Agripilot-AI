import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { MLClientService } from '../services/mlClientService';

export class MarketplaceController {
  // 1. Get all active crop listings
  static async getListings(req: AuthRequest, res: Response) {
    try {
      const { crop, minPrice, maxPrice, qualityGrade } = req.query;

      const whereClause: any = { status: 'ACTIVE' };
      if (crop) whereClause.cropName = { contains: String(crop) };
      if (qualityGrade) whereClause.qualityGrade = String(qualityGrade);
      if (minPrice || maxPrice) {
        whereClause.askingPricePerUnit = {};
        if (minPrice) whereClause.askingPricePerUnit.gte = parseFloat(String(minPrice));
        if (maxPrice) whereClause.askingPricePerUnit.lte = parseFloat(String(maxPrice));
      }

      const listings = await prisma.marketListing.findMany({
        where: whereClause,
        include: {
          farmer: {
            select: { id: true, name: true, phone: true, farmerProfile: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, count: listings.length, data: listings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Create Listing (Farmer)
  static async createListing(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const {
        cropName,
        variety,
        availableQuantity,
        unit = 'Quintals',
        askingPricePerUnit,
        qualityGrade = 'Grade A',
        harvestDate,
        locationName,
        imageUrl
      } = req.body;

      if (!cropName || !availableQuantity || !askingPricePerUnit) {
        return res.status(400).json({ success: false, message: 'Crop name, quantity, and asking price are required' });
      }

      const listing = await prisma.marketListing.create({
        data: {
          farmerId,
          cropName,
          variety,
          availableQuantity: parseFloat(availableQuantity),
          unit,
          askingPricePerUnit: parseFloat(askingPricePerUnit),
          qualityGrade,
          harvestDate: harvestDate ? new Date(harvestDate) : new Date(Date.now() + 15 * 86400000),
          locationName: locationName || 'Local Mandi Hub',
          imageUrl,
          status: 'ACTIVE'
        }
      });

      return res.status(201).json({ success: true, message: 'Crop listing published', data: listing });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Buyer Requirements (Merchant)
  static async getBuyerRequirements(req: AuthRequest, res: Response) {
    try {
      const requirements = await prisma.buyerRequirement.findMany({
        where: { status: 'OPEN' },
        include: {
          merchant: {
            select: { id: true, name: true, merchantProfile: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, data: requirements });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createBuyerRequirement(req: AuthRequest, res: Response) {
    try {
      const merchantId = req.user!.id;
      const {
        cropName,
        requiredQuantity,
        unit = 'Quintals',
        targetPricePerUnit,
        minimumQuality = 'Grade A',
        deliveryLocation,
        requiredByDate
      } = req.body;

      const requirement = await prisma.buyerRequirement.create({
        data: {
          merchantId,
          cropName,
          requiredQuantity: parseFloat(requiredQuantity),
          unit,
          targetPricePerUnit: parseFloat(targetPricePerUnit),
          minimumQuality,
          deliveryLocation: deliveryLocation || 'Khanna Terminal Warehouse',
          requiredByDate: requiredByDate ? new Date(requiredByDate) : new Date(Date.now() + 30 * 86400000),
          status: 'OPEN'
        }
      });

      return res.status(201).json({ success: true, message: 'Buyer demand requirement published', data: requirement });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. AI-Powered Matching (Matches Buyer Requirement against Active Farmer Listings)
  static async matchRequirementToListings(req: AuthRequest, res: Response) {
    try {
      const { requirementId } = req.params;
      const reqRecord = await prisma.buyerRequirement.findUnique({
        where: { id: requirementId }
      });

      if (!reqRecord) {
        return res.status(404).json({ success: false, message: 'Requirement not found' });
      }

      // Fetch active listings for this crop
      const candidateListings = await prisma.marketListing.findMany({
        where: {
          cropName: { contains: reqRecord.cropName },
          status: 'ACTIVE'
        },
        include: {
          farmer: {
            include: { farms: true }
          }
        }
      });

      const candidatesPayload = candidateListings.map(l => ({
        id: l.id,
        name: l.farmer.name,
        crop: l.cropName,
        quantity: l.availableQuantity,
        unit_price: l.askingPricePerUnit,
        latitude: l.farmer.farms[0]?.latitude || 30.9010,
        longitude: l.farmer.farms[0]?.longitude || 75.8573,
        quality_grade: l.qualityGrade
      }));

      const matchResult = await MLClientService.matchBuyerFarmer({
        target_crop: reqRecord.cropName,
        required_quantity: reqRecord.requiredQuantity,
        target_price: reqRecord.targetPricePerUnit,
        buyer_latitude: 28.7041,
        buyer_longitude: 77.1025,
        minimum_quality: reqRecord.minimumQuality,
        candidates: candidatesPayload
      });

      return res.json({ success: true, requirement: reqRecord, matchResult });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 5. Send Offer / Counter-Offer
  static async createOffer(req: AuthRequest, res: Response) {
    try {
      const senderUserId = req.user!.id;
      const { listingId, buyerRequirementId, receiverUserId, offeredPrice, quantity, terms } = req.body;

      if (!receiverUserId || !offeredPrice || !quantity) {
        return res.status(400).json({ success: false, message: 'Receiver, offered price, and quantity are required' });
      }

      const offer = await prisma.offer.create({
        data: {
          listingId: listingId || null,
          buyerRequirementId: buyerRequirementId || null,
          senderUserId,
          receiverUserId,
          offeredPrice: parseFloat(offeredPrice),
          quantity: parseFloat(quantity),
          terms: terms || null,
          status: 'PENDING'
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } }
        }
      });

      // In-app alert to recipient
      await prisma.notification.create({
        data: {
          userId: receiverUserId,
          title: 'New Commercial Offer Received',
          message: `${req.user!.name} submitted an offer of Rs. ${offeredPrice}/Qtl for ${quantity} Qtl.`,
          category: 'OFFER'
        }
      });

      return res.status(201).json({ success: true, message: 'Commercial offer sent', data: offer });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 6. Respond to Offer (Accept / Reject / Counter)
  static async respondToOffer(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { offerId } = req.params;
      const { action, counterPrice, counterQuantity, message } = req.body; // action: ACCEPT, REJECT, COUNTER

      const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        include: { listing: true }
      });

      if (!offer) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
      }

      if (action === 'ACCEPT') {
        const updatedOffer = await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'ACCEPTED' }
        });

        // Determine buyer and seller
        const buyerId = req.user!.role === 'MERCHANT' || req.user!.role === 'CONSUMER' ? userId : offer.senderUserId;
        const sellerId = buyerId === userId ? offer.senderUserId : userId;

        // Create verified Order
        const order = await prisma.order.create({
          data: {
            listingId: offer.listingId,
            buyerId,
            sellerId,
            cropName: offer.listing?.cropName || 'Farm Produce',
            finalPrice: offer.offeredPrice,
            quantity: offer.quantity,
            totalAmount: offer.offeredPrice * offer.quantity,
            status: 'ACCEPTED',
            paymentStatus: 'PENDING',
            deliveryAddress: 'Regional Mandi Terminal'
          }
        });

        // Create transport request
        await prisma.transportRequest.create({
          data: {
            orderId: order.id,
            pickupAddress: offer.listing?.locationName || 'Farmer Yard, Punjab',
            dropoffAddress: 'Khanna Terminal Warehouse',
            cargoWeightTons: (offer.quantity * 100) / 1000,
            pickupDate: new Date(Date.now() + 48 * 3600000),
            estimatedCost: Math.round(offer.quantity * 65.0),
            status: 'PENDING'
          }
        });

        return res.json({ success: true, message: 'Offer accepted and Order generated', data: { offer: updatedOffer, order } });
      } else if (action === 'REJECT') {
        const updated = await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'REJECTED' }
        });
        return res.json({ success: true, message: 'Offer declined', data: updated });
      } else if (action === 'COUNTER') {
        await prisma.offer.update({
          where: { id: offerId },
          data: { status: 'COUNTERED' }
        });

        const negMsg = await prisma.negotiationMessage.create({
          data: {
            offerId,
            senderUserId: userId,
            message: message || `Counter-proposal: Rs. ${counterPrice}/unit`,
            proposedPrice: counterPrice ? parseFloat(counterPrice) : null,
            proposedQuantity: counterQuantity ? parseFloat(counterQuantity) : null
          }
        });

        return res.json({ success: true, message: 'Counter-offer submitted', data: negMsg });
      }

      return res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 7. Get Orders for User
  static async getOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const orders = await prisma.order.findMany({
        where: {
          OR: [{ buyerId: userId }, { sellerId: userId }]
        },
        include: {
          buyer: { select: { id: true, name: true, email: true, role: true } },
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
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, data: orders });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 8. Get Offers for User
  static async getOffers(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const offers = await prisma.offer.findMany({
        where: {
          OR: [{ senderUserId: userId }, { receiverUserId: userId }]
        },
        include: {
          sender: { select: { id: true, name: true, role: true } },
          receiver: { select: { id: true, name: true, role: true } },
          listing: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: offers.length, data: offers });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 9. Process Order Payment (Razorpay / Gateway Integration)
  static async processOrderPayment(req: AuthRequest, res: Response) {
    try {
      const buyerId = req.user!.id;
      const { orderId } = req.params;
      const { paymentMethod = 'Razorpay UPI', gatewayTransactionId } = req.body;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          seller: { select: { id: true, name: true } },
          buyer: { select: { id: true, name: true } },
          transportRequest: true
        }
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      const transactionRef = gatewayTransactionId || `PAY-RZP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // Create Payment entry
      const payment = await prisma.payment.create({
        data: {
          orderId,
          amount: order.totalAmount,
          transactionRef,
          paymentMethod,
          paymentStatus: 'COMPLETED'
        }
      });

      // Update Order Status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'PACKING'
        }
      });

      // Update Transport Request if available
      if (order.transportRequest) {
        await prisma.transportRequest.update({
          where: { id: order.transportRequest.id },
          data: { status: 'ACCEPTED' }
        });
      }

      // Send Role Notifications
      // 1. To Buyer
      await prisma.notification.create({
        data: {
          userId: order.buyerId,
          title: 'Payment Successful 💳',
          message: `Your payment of Rs. ${order.totalAmount.toLocaleString('en-IN')} (Ref: ${transactionRef}) was confirmed! Crop harvest is now being prepared for shipping.`,
          category: 'PAYMENT'
        }
      });

      // 2. To Seller / Farmer
      await prisma.notification.create({
        data: {
          userId: order.sellerId,
          title: 'Payment Received! 🌾',
          message: `${order.buyer.name} completed payment of Rs. ${order.totalAmount.toLocaleString('en-IN')} for ${order.cropName}. Please package harvest for courier pickup.`,
          category: 'PAYMENT'
        }
      });

      return res.json({
        success: true,
        message: 'Payment completed successfully',
        data: { payment, order: updatedOrder }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 10. Update Delivery Transit Status (Transporter Action)
  static async updateShipmentStatus(req: AuthRequest, res: Response) {
    try {
      const { transportRequestId } = req.params;
      const { statusText, locationName = 'In Transit Checkpoint', isFinalDelivery = false } = req.body;

      const transportReq = await prisma.transportRequest.findUnique({
        where: { id: transportRequestId },
        include: { order: true }
      });

      if (!transportReq) {
        return res.status(404).json({ success: false, message: 'Transport request not found' });
      }

      const update = await prisma.deliveryUpdate.create({
        data: {
          transportRequestId,
          statusText,
          locationName
        }
      });

      let newStatus = transportReq.status;
      if (isFinalDelivery) {
        newStatus = 'DELIVERED';
        await prisma.transportRequest.update({
          where: { id: transportRequestId },
          data: { status: 'DELIVERED', deliveryDate: new Date() }
        });

        await prisma.order.update({
          where: { id: transportReq.orderId },
          data: { status: 'DELIVERED' }
        });

        // Notifications
        await prisma.notification.create({
          data: {
            userId: transportReq.order.buyerId,
            title: 'Package Delivered! 📦',
            message: `Your cargo of ${transportReq.order.cropName} was delivered successfully at ${locationName}. Escrow funds released to farmer.`,
            category: 'ORDER'
          }
        });

        await prisma.notification.create({
          data: {
            userId: transportReq.order.sellerId,
            title: 'Order Delivered & Funds Released 💰',
            message: `Order for ${transportReq.order.cropName} was verified delivered. Sale revenue credited to your account.`,
            category: 'PAYMENT'
          }
        });
      } else {
        await prisma.transportRequest.update({
          where: { id: transportRequestId },
          data: { status: 'IN_TRANSIT' }
        });
      }

      return res.json({ success: true, message: 'Transit checkpoint updated', data: update });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}


