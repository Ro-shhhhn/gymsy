import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export const adminAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid token or inactive admin.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
