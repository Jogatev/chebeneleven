import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./unified-storage";
import { User as SelectUser, insertUserSchema, users } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { eq } from 'drizzle-orm';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // If no SESSION_SECRET is set, create a random one
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Define the local strategy with explicit access to request
  passport.use(
    new LocalStrategy(
      { passReqToCallback: true },  // This is the key change
      async (req, username, password, done) => {
        try {
          let user;
          
          // Check if this request has a db object (PostgreSQL)
          if (req.db) {
            try {
              const result = await req.db.select().from(users).where(eq(users.username, username));
              user = result.length > 0 ? result[0] : null;
            } catch (err) {
              console.error('Error querying PostgreSQL:', err);
              // Fall back to in-memory storage if PostgreSQL query fails
              user = await storage.getUserByUsername(username);
            }
          } else {
            // Use in-memory storage
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
      // We don't have direct access to req here, so we need to handle both cases
      try {
        // First try to get from storage (in-memory)
        const user = await storage.getUser(id);
        if (user) {
          return done(null, user);
        }
      } catch (err) {
        // Ignore errors from in-memory storage and try DB next
        console.log('In-memory storage lookup failed:', err.message);
      }
      
      // If we're here, either in-memory failed or user wasn't found
      // The req.db check will happen in subsequent middleware
      return done(null, { id }); // Pass minimal user with ID for later PostgreSQL lookup
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error);
    }
  });

  // Middleware to fully load user from PostgreSQL if needed
  app.use(async (req, res, next) => {
    if (req.user && req.db && Object.keys(req.user).length === 1 && req.user.id) {
      try {
        // This is a partial user from deserializeUser, fetch complete user from PostgreSQL
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

  // Register a new franchisee
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate user data
      const parseResult = insertUserSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      let existingUser;
      let allUsers;
      
      // Check if using PostgreSQL
      if (req.db) {
        try {
          const result = await req.db.select().from(users).where(eq(users.username, parseResult.data.username));
          existingUser = result.length > 0 ? result[0] : null;
          allUsers = await req.db.select().from(users);
        } catch (error) {
          console.error('Error checking existing users in PostgreSQL:', error);
          // Fall back to in-memory
          existingUser = await storage.getUserByUsername(parseResult.data.username);
          allUsers = await storage.getUsers();
        }
      } else {
        // Fall back to in-memory storage
        existingUser = await storage.getUserByUsername(parseResult.data.username);
        allUsers = await storage.getUsers();
      }

      // Check if username already exists
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if franchiseeId already exists by checking all users
      const existingFranchiseeId = allUsers.find(
        (u: any) => u.franchiseeId === parseResult.data.franchiseeId
      );
      if (existingFranchiseeId) {
        return res.status(400).json({ error: "Franchisee ID already exists" });
      }

      // Prepare user data with hashed password
      const userData = {
        ...parseResult.data,
        password: await hashPassword(parseResult.data.password),
      };

      // Create user in appropriate storage
      let user;
      if (req.db) {
        try {
          const result = await req.db.insert(users).values(userData).returning();
          user = result.length > 0 ? result[0] : null;
        } catch (error) {
          console.error('Error creating user in PostgreSQL:', error);
          // Don't fall back to in-memory here - if PostgreSQL fails, we should return an error
          return res.status(500).json({ error: "Failed to create user in database" });
        }
      } else {
        user = await storage.createUser(userData);
      }

      if (!user) {
        throw new Error("Failed to create user");
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Return user without password
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}