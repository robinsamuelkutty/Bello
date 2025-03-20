import { generateToken04 } from "../lib/zegoTokenGenerator.js";

const APP_ID = parseInt(process.env.ZEGO_APP_ID);
const SERVER_SECRET = process.env.ZEGO_SERVER_SECRET;

// Token expiration time (3600 seconds = 1 hour)
const TOKEN_EXPIRE_TIME = 3600;

/**
 * Generate a ZegoCloud token for a user
 */
const generateToken = (req, res) => {
  try {
    console.log("Generating ZegoCloud token...");
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Generate a token valid for 1 hour
    const token = generateToken04(
      
      APP_ID,                // App ID
      userId,                // User ID  
      SERVER_SECRET,         // Server Secret
      TOKEN_EXPIRE_TIME,     // Expiration time in seconds
      ''                     // Optional payload
    );
    console.log('Generated ZegoCloud token:', token);
    return res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Error generating ZegoCloud token:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to generate token',
      error: error.errorMessage || error.message
    });
  }
};

export { generateToken };