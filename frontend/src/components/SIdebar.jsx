import { Users } from "lucide-react";

const Sidebar = () => {
  const contacts = [
    { id: 1, name: "Ananthakrishnan", lastActive: "2 min ago" },
    { id: 2, name: "Sandeep", lastActive: "Yesterday" },
    { id: 3, name: "Robin", lastActive: "5h ago" },
    { id: 4, name: "Shan", lastActive: "Just now" },
    { id: 5, name: "Aromal", lastActive: "3d ago" }
  ];

  return (
    <aside className="w-64 p-4 bg-gray-100 border-r">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Users size={20} />
        <span>Contacts</span>
      </div>
      <ul className="mt-4 space-y-3">
        {contacts.map(contact => (
          <li key={contact.id} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm">
            <img 
              src={`/api/placeholder/40/40`} 
              alt={contact.name} 
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-gray-700 font-medium">{contact.name}</span>
              <span className="text-xs text-gray-500">{contact.lastActive}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
