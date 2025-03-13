import { useState, useEffect } from "react";
import { Check, X, Search } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ForwardMessageModal = ({ message, onClose }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch users to forward to
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/messages/users");
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (error) {
        toast.error("Failed to load users");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(user => 
      user.fullName.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  const handleForward = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    
    setIsSending(true);
    try {
      // Prepare the message data
      const messageData = {
        text: message.text || "",
        image: message.image || null,
        // If you need to preserve reply data
        replyTo: message.replyTo || null
      };
      
      // Forward to each selected user
      const promises = selectedUsers.map(userId => 
        axiosInstance.post(`/messages/send/${userId}`, messageData)
      );
      
      await Promise.all(promises);
      toast.success(`Message forwarded to ${selectedUsers.length} users`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-200 p-6 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Forward Message</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <X className="size-4" />
          </button>
        </div>
        
        {/* Message preview */}
        <div className="bg-base-300 p-3 rounded-lg mb-4 text-sm">
          <div className="font-medium text-xs mb-1 opacity-70">Message to forward:</div>
          {message.image && (
            <img 
              src={message.image} 
              alt="Attachment" 
              className="w-32 h-32 object-cover rounded-lg mb-2"
            />
          )}
          {message.text && <p>{message.text}</p>}
        </div>
        
        {/* Search input */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="size-4 text-base-content/50" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="input input-bordered w-full pl-10"
          />
          {searchQuery && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchQuery("")}
            >
              <X className="size-4 text-base-content/50" />
            </button>
          )}
        </div>
        
        <h4 className="text-sm font-medium mb-2">Select recipients:</h4>
        
        {/* User list with checkboxes */}
        <div className="overflow-y-auto flex-1 mb-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner"></span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-base-content/70">
              No users found matching "{searchQuery}"
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredUsers.map((user) => (
                <li 
                  key={user._id} 
                  className="flex items-center p-2 hover:bg-base-300 rounded-lg cursor-pointer"
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="w-8 h-8 mr-3 flex items-center justify-center">
                    {selectedUsers.includes(user._id) ? (
                      <div className="w-5 h-5 bg-primary text-white rounded-sm flex items-center justify-center">
                        <Check className="size-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 border border-base-content/30 rounded-sm"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full">
                        <img 
                          src={user.profilePic || "/default-avatar.png"} 
                          alt={user.fullName} 
                        />
                      </div>
                    </div>
                    <span>{user.fullName}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="btn btn-ghost"
            disabled={isSending}
          >
            Cancel
          </button>
          <button 
            onClick={handleForward} 
            className="btn btn-primary"
            disabled={selectedUsers.length === 0 || isSending}
          >
            {isSending ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Forwarding...
              </>
            ) : (
              `Forward (${selectedUsers.length})`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;