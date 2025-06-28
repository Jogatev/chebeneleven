import { Express } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./unified-storage";
import { users } from "@shared/schema";
import { insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { eq } from "drizzle-orm";
import { getApiPath } from "./config";
import { API_ENDPOINTS } from "@shared/api-endpoints";
import type { SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return hash.toString("hex") + "." + salt;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { passReqToCallback: true },
      async (req, username, password, done) => {
        try {
          let user;
          
          if (req.db) {
            try {
              const result = await req.db.select().from(users).where(eq(users.username, username));
              user = result.length > 0 ? result[0] : null;
            } catch (err) {
              console.error('Error querying PostgreSQL:', err);
              user = await storage.getUserByUsername(username);
            }
          } else {
            user = await storage.getUserByUsername(username);
          }
          
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      try {
        const user = await storage.getUser(id);
        if (user) {
          return done(null, user);
        }
      } catch (err) {
        console.log('In-memory storage lookup failed:', (err as Error).message);
      }
      
      return done(null, null);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  app.use(async (req, res, next) => {
    if (req.user && req.db && Object.keys(req.user).length === 1 && req.user.id) {
      try {
        const result = await req.db.select().from(users).where(eq(users.id, req.user.id));
        if (result.length > 0) {
          req.user = result[0];
        }
      } catch (error) {
        console.error('Error fetching full user from PostgreSQL:', error);
      }
    }
    next();
  });

  app.post(getApiPath(API_ENDPOINTS.AUTH.REGISTER), async (req, res, next) => {
    try {
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      let existingUser;
      let allUsers;
      
      if (req.db) {
        try {
          const result = await req.db.select().from(users).where(eq(users.username, parseResult.data.username));
          existingUser = result.length > 0 ? result[0] : null;
          allUsers = await req.db.select().from(users);
        } catch (error) {
          console.error('Error checking existing users in PostgreSQL:', error);
          existingUser = await storage.getUserByUsername(parseResult.data.username);
          allUsers = await storage.getUsers();
        }
      } else {
        existingUser = await storage.getUserByUsername(parseResult.data.username);
        allUsers = await storage.getUsers();
      }

      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const existingFranchiseeId = allUsers.find(
        (u: any) => u.franchiseeId === parseResult.data.franchiseeId
      );
      if (existingFranchiseeId) {
        return res.status(400).json({ error: "Franchisee ID already exists" });
      }

      const userData = {
        ...parseResult.data,
        password: await hashPassword(parseResult.data.password),
      };

      let user;
      if (req.db) {
        try {
          const result = await req.db.insert(users).values(userData).returning();
          user = result.length > 0 ? result[0] : null;
        } catch (error) {
          console.error('Error creating user in PostgreSQL:', error);
          return res.status(500).json({ error: "Failed to create user in database" });
        }
      } else {
        user = await storage.createUser(userData);
      }

      if (!user) {
        throw new Error("Failed to create user");
      }

      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post(getApiPath(API_ENDPOINTS.AUTH.LOGIN), (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post(getApiPath(API_ENDPOINTS.AUTH.LOGOUT), (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(getApiPath(API_ENDPOINTS.AUTH.USER), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
} 