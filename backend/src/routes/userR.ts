import express from 'express';
import { getAllUsers, getUserById, addUser, updateUser, deleteUser, updatePromotedStatus, getUserByEmail } from '../controllers/userController';
import { User, AccountStatus } from '../models/user';
import { isAuthenticated, isAdmin } from '../middleware/authM';
import { changePassword } from '../controllers/authController';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user as User;
    if (currentUser.userId !== userId && !currentUser.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await getUserById(userId);
    if (user) {
      // The user object now includes payments, so we don't need to fetch them separately
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Add new user
router.post('/', async (req, res) => {
  try {
    const newUser: User = {
      ...req.body,
      phone_number: req.body.phone_number || null,
      billingAddress: req.body.billingAddress || null
    };
    await addUser(newUser);
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding user' });
  }
});

// Update user
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log('Received update request for user ID:', userId);
    console.log('Authenticated user:', req.user); 
    console.log('Request body:', req.body);

    const updatedFields: Partial<User> = {
      ...req.body,
      userId: userId
    };
    
    Object.keys(updatedFields).forEach(key => 
      updatedFields[key as keyof User] === undefined && delete updatedFields[key as keyof User]
    );

    console.log('Updated fields after processing:', updatedFields);

    await updateUser(updatedFields);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error in update route:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

//As an admin be able to make user an admin. (change isAdmin)
router.put('/:id/AdminStatus', isAuthenticated, isAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { isAdmin } = req.body;  
  
  try {
    await updateUser({userId, isAdmin});
    res.status(200).json({ message: 'User admin status updated successfully' });
  } catch (error) {
    console.error('Error updating user admin status: ', error);
    res.status(500).json({ message: 'Error updating user admin status' });
  }
});

// Update user's account status
router.put('/:id/status', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { accountStatus } = req.body;

    if (!Object.values(AccountStatus).includes(accountStatus)) {
      return res.status(400).json({ message: 'Invalid account status' });
    }

    await updateUser({ userId, accountStatus });
    res.json({ message: 'User account status updated successfully' });
  } catch (error) {
    console.error('Error updating user account status:', error);
    res.status(500).json({ message: 'Error updating user account status' });
  }
});

// Update user's promoted status
router.patch('/:id/promotion', async (req, res) => {
  try {
    const { isPromoted } = req.body;
    await updatePromotedStatus(parseInt(req.params.id), isPromoted);
    res.json({ message: 'User promotion status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user promotion status' });
  }
});

// Add the new route for changing password
router.post('/change-password', isAuthenticated, changePassword);

export default router;
