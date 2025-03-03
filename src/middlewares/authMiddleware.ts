import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface CustomJwtPayload extends JwtPayload {
    id: string;
    email: string;
    role: string;
  }
export interface AuthRequest extends Request {
    user?: CustomJwtPayload;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Bearer header

    if (!token) {
        next();
        return 
    }

    try {
        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is not defined in environment variables.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as CustomJwtPayload;
        (req as AuthRequest).user = decoded;
        next(); // Proceed to the next middleware or route
    } catch (error) {
        console.log(error);
        
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "Token expired, please login again" });
            return 
        } 
        else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Invalid Token, please login again" });
            return
        } 
        else {
            res.status(500).json({ message: "Internal Server Error" });
            return
        }    
    }
};

export default authMiddleware;
