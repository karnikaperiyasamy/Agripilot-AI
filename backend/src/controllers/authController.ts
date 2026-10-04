import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ENV } from '../config/env';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, name, role = 'FARMER', phone, languagePref = 'en', farmLocation, farmSize } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          role,
          phone,
          languagePref,
          farmerProfile: role === 'FARMER' ? {
            create: {
              farmName: `${name}'s Farm`,
              state: farmLocation ? farmLocation.split(',')[1]?.trim() || 'Punjab' : 'Punjab',
              district: farmLocation ? farmLocation.split(',')[0]?.trim() || 'Ludhiana' : 'Ludhiana',
              totalAreaAcres: farmSize ? parseFloat(farmSize) : 5.0
            }
          } : undefined,
          merchantProfile: role === 'MERCHANT' ? {
            create: { businessName: `${name} Trading Co.` }
          } : undefined,
          transporterProfile: role === 'TRANSPORTER' ? {
            create: { companyName: `${name} Transport` }
          } : undefined,
          expertProfile: role === 'EXPERT' ? {
            create: { qualification: 'Agronomist / Extension Specialist' }
          } : undefined,
          consumerProfile: role === 'CONSUMER' ? {
            create: { deliveryAddress: 'Home' }
          } : undefined
        }
      });

      // Automatically create default farm and field for new farmers
      if (role === 'FARMER') {
        const farm = await prisma.farm.create({
          data: {
            farmerId: user.id,
            name: `${name}'s Main Farm`,
            locationName: farmLocation || 'Ludhiana, Punjab',
            totalAreaAcres: farmSize ? parseFloat(farmSize) : 5.0
          }
        });

        await prisma.field.create({
          data: {
            farmId: farm.id,
            name: 'Primary Field (Plot 1)',
            areaAcres: farmSize ? parseFloat(farmSize) : 5.0,
            soilType: 'Alluvial',
            irrigationType: 'Drip'
          }
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: { id: user.id, email: user.email, name: user.name, role: user.role, languagePref: user.languagePref }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          farmerProfile: true,
          merchantProfile: true,
          transporterProfile: true,
          expertProfile: true,
          consumerProfile: true
        }
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            languagePref: user.languagePref,
            farmerProfile: user.farmerProfile,
            merchantProfile: user.merchantProfile,
            transporterProfile: user.transporterProfile,
            expertProfile: user.expertProfile,
            consumerProfile: user.consumerProfile
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          farmerProfile: true,
          merchantProfile: true,
          transporterProfile: true,
          expertProfile: true,
          consumerProfile: true
        }
      });

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      return res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          languagePref: user.languagePref,
          farmerProfile: user.farmerProfile,
          merchantProfile: user.merchantProfile,
          transporterProfile: user.transporterProfile,
          expertProfile: user.expertProfile,
          consumerProfile: user.consumerProfile
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateLanguage(req: AuthRequest, res: Response) {
    try {
      const { languagePref } = req.body;
      if (!['en', 'ta', 'hi'].includes(languagePref)) {
        return res.status(400).json({ success: false, message: 'Supported languages: en, ta, hi' });
      }

      const updated = await prisma.user.update({
        where: { id: req.user!.id },
        data: { languagePref }
      });

      return res.json({ success: true, message: 'Language preference saved', languagePref: updated.languagePref });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
