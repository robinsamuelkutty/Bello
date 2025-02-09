<<<<<<< HEAD
import Sidebar from "../components/Sidebar";
=======
//import React from 'react'

>>>>>>> 10d5087b24128d66b286a4ae74e7141afdc999ca
const HomePage = () => {


  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;