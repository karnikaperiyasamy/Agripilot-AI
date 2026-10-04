import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AgriTwin AI database with extensive real-world agricultural datasets...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Clear existing dynamic tables to allow clean re-seeding
  await prisma.deliveryUpdate.deleteMany({});
  await prisma.transportRequest.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.negotiationMessage.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.marketListing.deleteMany({});
  await prisma.buyerRequirement.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.revenue.deleteMany({});
  await prisma.cropHealthObservation.deleteMany({});
  await prisma.expertCase.deleteMany({});
  await prisma.soilRecord.deleteMany({});
  await prisma.weatherRecord.deleteMany({});
  await prisma.irrigationRecord.deleteMany({});
  await prisma.cropCycle.deleteMany({});
  await prisma.field.deleteMany({});
  await prisma.farm.deleteMany({});

  // 2. Seed Multi-Role Accounts
  // Farmer 1: Gurpreet Singh (Punjab)
  const farmer = await prisma.user.upsert({
    where: { email: 'farmer@farmprofit.com' },
    update: {},
    create: {
      email: 'farmer@farmprofit.com',
      passwordHash,
      name: 'Demo Farmer (Gurpreet Singh)',
      role: 'FARMER',
      phone: '9876543210',
      languagePref: 'en',
      farmerProfile: {
        create: {
          farmName: 'Green Valley Farms',
          state: 'Punjab',
          district: 'Ludhiana',
          totalAreaAcres: 7.5,
          experienceYears: 14,
          primarySoilType: 'Alluvial',
          irrigationMethod: 'Drip'
        }
      }
    }
  });

  // Farmer 2: Rajesh Patil (Maharashtra)
  const farmerPatil = await prisma.user.upsert({
    where: { email: 'test@farmprofit.com' },
    update: {},
    create: {
      email: 'test@farmprofit.com',
      passwordHash,
      name: 'Test Farmer (Rajesh Patil)',
      role: 'FARMER',
      phone: '9876543211',
      languagePref: 'hi',
      farmerProfile: {
        create: {
          farmName: 'Sahyadri Agro Fields',
          state: 'Maharashtra',
          district: 'Nashik',
          totalAreaAcres: 5.0,
          experienceYears: 9,
          primarySoilType: 'Black',
          irrigationMethod: 'Sprinkler'
        }
      }
    }
  });

  // Merchant 1: Apex Agri Traders (Punjab)
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@agritwin.com' },
    update: {},
    create: {
      email: 'merchant@agritwin.com',
      passwordHash,
      name: 'Vikas Aggarwal (Apex Agri Traders)',
      role: 'MERCHANT',
      phone: '9811223344',
      merchantProfile: {
        create: {
          businessName: 'Apex Agri Commodities Pvt Ltd',
          gstNumber: '07AAAAA0000A1Z5',
          businessType: 'Wholesale Grain Merchant & Exporter',
          address: 'Khanna Grain Market, Punjab'
        }
      }
    }
  });

  // Transporter: Harbhajan Logistics
  const transporter = await prisma.user.upsert({
    where: { email: 'transporter@agritwin.com' },
    update: {},
    create: {
      email: 'transporter@agritwin.com',
      passwordHash,
      name: 'Harbhajan Logistics',
      role: 'TRANSPORTER',
      phone: '9822334455',
      transporterProfile: {
        create: {
          companyName: 'Kisan Cargo & Heavy Haul Fleet',
          vehicleCount: 6,
          serviceRegions: 'Punjab, Haryana, Delhi-NCR, Rajasthan, UP',
          permitType: 'All India Motor Vehicle Permit'
        }
      }
    }
  });

  // Agricultural Expert: Dr. Ramesh Sharma
  const expert = await prisma.user.upsert({
    where: { email: 'expert@agritwin.com' },
    update: {},
    create: {
      email: 'expert@agritwin.com',
      passwordHash,
      name: 'Dr. Ramesh Sharma',
      role: 'EXPERT',
      phone: '9833445566',
      expertProfile: {
        create: {
          qualification: 'Ph.D. in Agronomy, PAU Ludhiana',
          specialization: 'Crop Health, Fungal Diagnostics & Micro-Irrigation',
          licenseNumber: 'ICAR-EX-2024-8891',
          consultationFee: 0.0,
          rating: 4.95
        }
      }
    }
  });

  // Consumer: Anita Verma
  const consumer = await prisma.user.upsert({
    where: { email: 'consumer@agritwin.com' },
    update: {},
    create: {
      email: 'consumer@agritwin.com',
      passwordHash,
      name: 'Anita Verma',
      role: 'CONSUMER',
      phone: '9844556677',
      consumerProfile: {
        create: {
          deliveryAddress: 'Sector 42, Chandigarh',
          preferredCrops: 'Organic Rice, Farm Fresh Vegetables'
        }
      }
    }
  });

  // System Administrator User
  await prisma.user.upsert({
    where: { email: 'admin@agritwin.com' },
    update: {},
    create: {
      email: 'admin@agritwin.com',
      passwordHash,
      name: 'AgriTwin System Admin',
      role: 'ADMIN',
      phone: '9855667788'
    }
  });

  // 3. Reference Crops Catalog
  const cropsData = [
    { name: 'Basmati Rice', botanicalName: 'Oryza sativa', category: 'Cereal', defaultDurationDays: 135, season: 'Kharif', minTemp: 20, maxTemp: 35 },
    { name: 'Wheat', botanicalName: 'Triticum aestivum', category: 'Cereal', defaultDurationDays: 125, season: 'Rabi', minTemp: 12, maxTemp: 30 },
    { name: 'Maize', botanicalName: 'Zea mays', category: 'Cereal', defaultDurationDays: 110, season: 'Kharif/Rabi', minTemp: 18, maxTemp: 35 },
    { name: 'Sugarcane', botanicalName: 'Saccharum officinarum', category: 'Cash Crop', defaultDurationDays: 330, season: 'Annual', minTemp: 20, maxTemp: 38 },
    { name: 'Cotton', botanicalName: 'Gossypium hirsutum', category: 'Fiber', defaultDurationDays: 160, season: 'Kharif', minTemp: 22, maxTemp: 37 },
    { name: 'Tomato', botanicalName: 'Solanum lycopersicum', category: 'Horticulture', defaultDurationDays: 90, season: 'All-Year', minTemp: 18, maxTemp: 32 },
    { name: 'Potato', botanicalName: 'Solanum tuberosum', category: 'Tuber', defaultDurationDays: 100, season: 'Rabi', minTemp: 15, maxTemp: 28 }
  ];

  const cropMap: Record<string, string> = {};
  for (const c of cropsData) {
    const cropRecord = await prisma.crop.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        botanicalName: c.botanicalName,
        category: c.category,
        defaultDurationDays: c.defaultDurationDays,
        season: c.season,
        minTemperature: c.minTemp,
        maxTemperature: c.maxTemp
      }
    });
    cropMap[c.name] = cropRecord.id;
  }

  // 4. Farms & Fields for Demo Farmer (Gurpreet Singh)
  const farmPunjab = await prisma.farm.create({
    data: {
      farmerId: farmer.id,
      name: 'Green Valley Farm Estates',
      locationName: 'Ludhiana, Punjab',
      latitude: 30.9010,
      longitude: 75.8573,
      totalAreaAcres: 7.5
    }
  });

  const fieldA = await prisma.field.create({
    data: {
      farmId: farmPunjab.id,
      name: 'North Plot (Field 1 - Basmati)',
      areaAcres: 3.0,
      soilType: 'Alluvial',
      irrigationType: 'Drip'
    }
  });

  const fieldB = await prisma.field.create({
    data: {
      farmId: farmPunjab.id,
      name: 'South Plot (Field 2 - Wheat)',
      areaAcres: 2.5,
      soilType: 'Loamy',
      irrigationType: 'Sprinkler'
    }
  });

  const fieldC = await prisma.field.create({
    data: {
      farmId: farmPunjab.id,
      name: 'East Ridge (Field 3 - Hybrid Maize)',
      areaAcres: 2.0,
      soilType: 'Sandy Loam',
      irrigationType: 'Drip'
    }
  });

  // 5. Crop Cycles for Farmer
  const cycleRice = await prisma.cropCycle.create({
    data: {
      fieldId: fieldA.id,
      cropId: cropMap['Basmati Rice'],
      variety: 'Pusa Basmati 1121 Export Grade',
      sowingDate: new Date('2026-06-05'),
      expectedHarvestDate: new Date('2026-10-20'),
      status: 'GROWING',
      currentGrowthStage: 'Tillering/Branching',
      targetYieldQuintals: 28.0,
      expectedMarketPrice: 4350.0
    }
  });

  const cycleWheat = await prisma.cropCycle.create({
    data: {
      fieldId: fieldB.id,
      cropId: cropMap['Wheat'],
      variety: 'HD-2967 High Yield',
      sowingDate: new Date('2025-11-15'),
      expectedHarvestDate: new Date('2026-03-25'),
      actualHarvestDate: new Date('2026-03-22'),
      status: 'HARVESTED',
      currentGrowthStage: 'Maturity',
      targetYieldQuintals: 22.0,
      actualYieldQuintals: 23.5,
      expectedMarketPrice: 2650.0
    }
  });

  const cycleMaize = await prisma.cropCycle.create({
    data: {
      fieldId: fieldC.id,
      cropId: cropMap['Maize'],
      variety: 'Pioneer P3396 Hybrid',
      sowingDate: new Date('2026-07-10'),
      expectedHarvestDate: new Date('2026-10-30'),
      status: 'GROWING',
      currentGrowthStage: 'Tasseling',
      targetYieldQuintals: 24.0,
      expectedMarketPrice: 2250.0
    }
  });

  // 6. Expenses tracking
  const expenses = [
    { category: 'Seeds', amount: 5000.0, description: 'Certified Pusa Basmati 1121 Seeds (25 kg)', cropCycleId: cycleRice.id },
    { category: 'Fertilizers', amount: 3500.0, description: 'Neem-coated Urea (2 bags) + Zinc Sulphate', cropCycleId: cycleRice.id },
    { category: 'Labor', amount: 8000.0, description: 'Paddy Transplantation & Bund Leveling', cropCycleId: cycleRice.id },
    { category: 'Irrigation', amount: 2000.0, description: 'Solar tube well power & drip maintenance', cropCycleId: cycleRice.id },
    { category: 'Seeds', amount: 4200.0, description: 'HD-2967 Certified Wheat Seed Bags', cropCycleId: cycleWheat.id },
    { category: 'Fertilizers', amount: 3200.0, description: 'DAP and MOP Potash', cropCycleId: cycleWheat.id },
    { category: 'Seeds', amount: 3800.0, description: 'Pioneer Hybrid Maize Kernels', cropCycleId: cycleMaize.id }
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        farmerId: farmer.id,
        cropCycleId: exp.cropCycleId,
        category: exp.category,
        amount: exp.amount,
        description: exp.description,
        expenseDate: new Date()
      }
    });
  }

  // 7. Soil & Weather Records
  await prisma.soilRecord.create({
    data: {
      fieldId: fieldA.id,
      ph: 7.2,
      nitrogenKgHa: 135.0,
      phosphorusKgHa: 48.0,
      potassiumKgHa: 52.0,
      organicMatterPercent: 1.15,
      electricalConductivity: 0.38,
      notes: 'Soil health verified by KVK Ludhiana. Good organic carbon level.'
    }
  });

  await prisma.soilRecord.create({
    data: {
      fieldId: fieldB.id,
      ph: 6.9,
      nitrogenKgHa: 120.0,
      phosphorusKgHa: 42.0,
      potassiumKgHa: 58.0,
      organicMatterPercent: 1.05,
      electricalConductivity: 0.32,
      notes: 'Optimal for rabi wheat rotation.'
    }
  });

  await prisma.weatherRecord.create({
    data: {
      farmId: farmPunjab.id,
      tempMax: 33.5,
      tempMin: 23.5,
      humidity: 78.0,
      rainfallMm: 8.0,
      windSpeedKmh: 14.0,
      riskSummary: 'High humidity; moderate fungal leaf-blast risk. Preventive surveillance advised.'
    }
  });

  // 8. Government Schemes (Preserved & Verified)
  const schemes = [
    {
      schemeName: 'PM-KISAN',
      description: 'Income support of Rs 6,000 per year in three equal installments to all eligible farmer families across India.',
      eligibility: 'All landholding farmer families with cultivable land.',
      benefits: 'Rs. 6,000 per annum direct bank transfer in 3 tranches of Rs. 2,000.',
      applyUrl: 'https://pmkisan.gov.in',
      category: 'Financial Support'
    },
    {
      schemeName: 'Soil Health Card Scheme',
      description: 'Issue soil health cards to farmers with crop-wise nutrient recommendations to improve productivity without input wastage.',
      eligibility: 'All farmers across Indian states and union territories.',
      benefits: 'Customized soil status report and macro/micronutrient fertilizer recommendation card.',
      applyUrl: 'https://soilhealth.dac.gov.in',
      category: 'Soil Management'
    },
    {
      schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      description: 'Comprehensive risk insurance coverage from pre-sowing to post-harvest against non-preventable natural risks.',
      eligibility: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
      benefits: 'Low premium (1.5-2.0%) with full sum insured against drought, flood, pests, and unseasonal rains.',
      applyUrl: 'https://pmfby.gov.in',
      category: 'Insurance'
    },
    {
      schemeName: 'Kisan Credit Card (KCC)',
      description: 'Timely and adequate credit support to farmers for cultivation expenses, post-harvest costs, and maintenance of farm assets.',
      eligibility: 'Small and marginal farmers, sharecroppers, tenant farmers, self-help groups.',
      benefits: 'Subsidized loan up to Rs. 3 Lakhs at effective interest rate of 4% per annum upon prompt repayment.',
      applyUrl: 'https://www.kcc.nabard.org',
      category: 'Financial Support'
    },
    {
      schemeName: 'National Mission on Sustainable Agriculture',
      description: 'Enhances agricultural productivity especially in rainfed areas focusing on integrated farming and soil health management.',
      eligibility: 'All farmers practicing organic or integrated crop management.',
      benefits: 'Subsidies up to 50% for vermicompost units, bio-fertilizers, and green manuring.',
      applyUrl: 'https://nmsa.dac.gov.in',
      category: 'Soil Management'
    },
    {
      schemeName: 'Pradhan Mantri Krishi Sinchai Yojana (PMKSY)',
      description: 'Focuses on expanding cultivable area under assured irrigation and improving on-farm water use efficiency (More Crop Per Drop).',
      eligibility: 'Farmers of all categories with access to water source.',
      benefits: '45% to 55% subsidy on micro-irrigation systems (Drip and Sprinkler installations).',
      applyUrl: 'https://pmksy.gov.in',
      category: 'Irrigation'
    },
    {
      schemeName: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      description: 'Promotes farm mechanization for small and marginal farmers through Custom Hiring Centers and machinery subsidies.',
      eligibility: 'Individual farmers, farmer groups, cooperatives, and rural entrepreneurs.',
      benefits: '40% to 50% financial subsidy on tractors, power tillers, seed drills, and combine harvesters.',
      applyUrl: 'https://farmech.gov.in',
      category: 'Equipment'
    },
    {
      schemeName: 'Rashtriya Krishi Vikas Yojana (RKVY)',
      description: 'State-planned comprehensive agricultural development programs covering infrastructure, organic inputs, and post-harvest sheds.',
      eligibility: 'All farmers and Farmer Producer Organizations (FPOs).',
      benefits: 'Financial grants and cold storage subsidies for agri-entrepreneurs and farmer clusters.',
      applyUrl: 'https://rkvy.nic.in',
      category: 'Development'
    }
  ];

  for (const s of schemes) {
    await prisma.governmentScheme.upsert({
      where: { schemeName: s.schemeName },
      update: {},
      create: s
    });
  }

  // 9. Active Crop Market Listings (Direct Produce)
  const listingRice = await prisma.marketListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Basmati Rice',
      variety: 'Pusa Basmati 1121 Export Grade',
      availableQuantity: 70.0,
      unit: 'Quintals',
      askingPricePerUnit: 4350.0,
      qualityGrade: 'Grade A',
      harvestDate: new Date('2026-10-25'),
      locationName: 'Ludhiana Mandi Hub, Punjab',
      status: 'ACTIVE'
    }
  });

  const listingWheat = await prisma.marketListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Wheat',
      variety: 'HD-2967 High Yield',
      availableQuantity: 110.0,
      unit: 'Quintals',
      askingPricePerUnit: 2650.0,
      qualityGrade: 'Grade A',
      harvestDate: new Date('2026-03-22'),
      locationName: 'Khanna Central Silos, Punjab',
      status: 'ACTIVE'
    }
  });

  const listingMaize = await prisma.marketListing.create({
    data: {
      farmerId: farmer.id,
      cropName: 'Maize',
      variety: 'Pioneer Hybrid Golden Kernel',
      availableQuantity: 45.0,
      unit: 'Quintals',
      askingPricePerUnit: 2250.0,
      qualityGrade: 'Grade A',
      harvestDate: new Date('2026-10-30'),
      locationName: 'Jalandhar Terminal, Punjab',
      status: 'ACTIVE'
    }
  });

  const listingTomato = await prisma.marketListing.create({
    data: {
      farmerId: farmerPatil.id,
      cropName: 'Tomato',
      variety: 'Abhinav Hybrid Red',
      availableQuantity: 35.0,
      unit: 'Quintals',
      askingPricePerUnit: 1850.0,
      qualityGrade: 'Grade A',
      harvestDate: new Date(),
      locationName: 'Nashik APMC Hub, Maharashtra',
      status: 'ACTIVE'
    }
  });

  // 10. Buyer Requirements (Merchant Sourcing)
  await prisma.buyerRequirement.create({
    data: {
      merchantId: merchant.id,
      cropName: 'Basmati Rice',
      requiredQuantity: 100.0,
      unit: 'Quintals',
      targetPricePerUnit: 4250.0,
      minimumQuality: 'Grade A',
      deliveryLocation: 'Khanna Terminal Warehouse, Punjab',
      requiredByDate: new Date('2026-11-05'),
      status: 'OPEN'
    }
  });

  await prisma.buyerRequirement.create({
    data: {
      merchantId: merchant.id,
      cropName: 'Wheat',
      requiredQuantity: 150.0,
      unit: 'Quintals',
      targetPricePerUnit: 2600.0,
      minimumQuality: 'Grade A',
      deliveryLocation: 'Delhi-NCR Silos, Delhi',
      requiredByDate: new Date('2026-11-20'),
      status: 'OPEN'
    }
  });

  // 11. Commercial Offers (Merchant -> Farmer)
  await prisma.offer.create({
    data: {
      listingId: listingRice.id,
      senderUserId: merchant.id,
      receiverUserId: farmer.id,
      offeredPrice: 4250.0,
      quantity: 50.0,
      terms: 'Immediate RTGS payment within 24 hours of weighbridge QC at Khanna Mandi.',
      status: 'PENDING'
    }
  });

  // 12. Active Orders & Transport Dispatches
  // Order 1: Consumer Order (Anita Verma bought 5 Qtl Basmati Rice from Gurpreet Singh)
  const orderConsumer = await prisma.order.create({
    data: {
      listingId: listingRice.id,
      buyerId: consumer.id,
      sellerId: farmer.id,
      cropName: 'Basmati Rice',
      finalPrice: 4350.0,
      quantity: 5.0,
      totalAmount: 21750.0,
      status: 'ACCEPTED',
      paymentStatus: 'COMPLETED',
      deliveryAddress: 'Sector 42, Chandigarh'
    }
  });

  await prisma.transportRequest.create({
    data: {
      orderId: orderConsumer.id,
      pickupAddress: 'Green Valley Farms, Ludhiana',
      dropoffAddress: 'Sector 42, Chandigarh',
      cargoWeightTons: 0.5,
      pickupDate: new Date(),
      estimatedCost: 850.0,
      status: 'IN_TRANSIT',
      driverName: 'Harbhajan Singh',
      driverPhone: '9822334455',
      vehicleRegNumber: 'PB-10-CZ-4482',
      deliveryUpdates: {
        create: {
          statusText: 'Dispatched from Ludhiana hub, currently passing Ambala GT Road',
          locationName: 'Ambala National Highway 44'
        }
      }
    }
  });

  // Order 2: Merchant Commercial Order (Apex Traders bought 60 Qtl Wheat from Gurpreet Singh)
  const orderMerchant = await prisma.order.create({
    data: {
      listingId: listingWheat.id,
      buyerId: merchant.id,
      sellerId: farmer.id,
      cropName: 'Wheat',
      finalPrice: 2650.0,
      quantity: 60.0,
      totalAmount: 159000.0,
      status: 'ACCEPTED',
      paymentStatus: 'COMPLETED',
      deliveryAddress: 'Khanna Terminal Warehouse, Punjab'
    }
  });

  await prisma.transportRequest.create({
    data: {
      orderId: orderMerchant.id,
      pickupAddress: 'South Plot Silo, Ludhiana',
      dropoffAddress: 'Khanna Terminal Warehouse, Punjab',
      cargoWeightTons: 6.0,
      pickupDate: new Date(),
      estimatedCost: 3900.0,
      status: 'IN_TRANSIT',
      driverName: 'Balwinder Singh',
      driverPhone: '9822337788',
      vehicleRegNumber: 'PB-10-TX-9901',
      deliveryUpdates: {
        create: {
          statusText: 'Loaded at Ludhiana farm gate, in transit to Khanna grain terminal',
          locationName: 'Doraha Bypass'
        }
      }
    }
  });

  // 13. Expert Consultation Case
  const obs = await prisma.cropHealthObservation.create({
    data: {
      cropCycleId: cycleRice.id,
      fieldId: fieldA.id,
      observerId: farmer.id,
      symptomDescription: 'Yellowing of leaf tips with wavy margin lesions and bacterial ooze droplets in humid morning.',
      aiPredictionClass: 'Bacterial Leaf Blight',
      aiConfidence: 91.5,
      expertReviewStatus: 'REVIEWED'
    }
  });

  await prisma.expertCase.create({
    data: {
      observationId: obs.id,
      expertId: expert.id,
      diagnosisNotes: 'Verified Xanthomonas oryzae pv. oryzae infection accelerated by high relative humidity (78%).',
      prescription: 'Spray Copper Oxychloride 50% WP @ 2.5g/L mixed with Plantomycin/Streptocycline @ 6g per 60L water. Discontinue nitrogen top-dressing until lesion margins dry up.',
      reviewedAt: new Date()
    }
  });

  console.log('Seeding completed successfully with extensive agricultural datasets!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
