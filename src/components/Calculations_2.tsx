import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ThemeContext } from "../context/ThemeContext";

const Calculations_2 = () => {
    
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  return (
    <div
        className={`w-full min-h-screen font-sans transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          : "bg-gradient-to-br from-indigo-50 via-teal-50 to-pink-50"
      }`}
    >
      <Navbar level={"/Level-Three-Quiz"} questionnaire={"/Questionnaire"} live_generation={"/Live_Generation"} calculations={"/Calculations"}/>
      <div className="p-6 mt-10 ml-30 mr-30">
        <h2 className="text-2xl font-bold mt-6 text-blue-600">HOLIDAY ENTITLEMENT</h2>
        <p className="mt-2 text-blue-600">
          The Employee shall be entitled to [Holiday Entitlement] days of paid
          annual leave per year, inclusive of public holidays. Unused leave may
          not be carried forward without prior approval. Upon termination,
          unused leave shall be compensated on a pro-rata basis. For [Unused Holiday Days]
          unused days, the holiday pay is £[Holiday Pay].
        </p>
        
        <div className="mt-10 border rounded-lg p-4 w-1/2 mx-auto">
            <div className="border-b pb-2 font-semibold">Insert OpsCore</div>
            <div className="pt-2">Holiday Pay</div>
        </div>
        <div className="flex justify-center mt-10">
        <button 
            className="mt-15 px-6 py-3 bg-purple-500 text-white text-lg font-semibold rounded-lg hover:bg-purple-600 hover:scale-105 transition"
            onClick={() => navigate("/Calculations")}>
            Back
        </button>
      </div>
      </div>
    </div>
      
    );
  };
  
  export default Calculations_2;
  