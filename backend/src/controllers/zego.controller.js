import { generateToken04 } from "../lib/zegoTokenGenerator.js";

const APP_ID = parseInt(process.env.ZEGO_APP_ID);
const SERVER_SECRET = process.env.ZEGO_SERVER_SECRET;


const TOKEN_EXPIRE_TIME = 3600;


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
      
      APP_ID,                
      userId,                
      SERVER_SECRET,        
      TOKEN_EXPIRE_TIME,    
      ''                      
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
