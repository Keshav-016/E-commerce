import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db.js';
import jwt, { type SignOptions } from 'jsonwebtoken';
import Env from '../utils/Env.js';

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, name, password } = req.body;

    const userExistence = await prisma.user.findUnique({
      where: { email },
    });

    console.log(userExistence);
    if (userExistence) throw new Error('User already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, password: hashed },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error('Invalid password');

    const token = jwt.sign({ userId: user.id, role: user.role }, Env.JWT_SECRET, {
      expiresIn: Env.TOKEN_EXPIRATION,
    } as SignOptions);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
